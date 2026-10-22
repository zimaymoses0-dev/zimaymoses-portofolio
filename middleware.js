// Vercel Routing Middleware: records every request to the live (static) site so the
// local Admin can show who visits, from where, and how they found the site.
//
// Each request is pushed as one JSON record onto an Upstash Redis list; on the editing
// computer, `python manage.py sync_visits` (or Admin > Visites > Synchroniser) pulls them
// into the database. Classification (source, bot, admin probe…) happens there, in Python.
//
// Safety rules: tracking must never break or slow the site. Every failure is swallowed,
// the write happens after the response (waitUntil), and without Upstash credentials the
// middleware does nothing but let the request through.

export const config = {
  // Everything except static assets and uploaded files (images, CV): pages, robots.txt,
  // sitemap.xml, llms.txt, and the admin/login URLs that scanners probe.
  matcher: ["/((?!static/|media/).*)"],
};

const LIST_KEY = "visits";
const MAX_ITEMS = "49999"; // cap the list if the local sync isn't run for a long time

function header(request, name, max = 500) {
  return (request.headers.get(name) || "").slice(0, max);
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function visitRecord(request) {
  const url = new URL(request.url);
  const forwardedFor = header(request, "x-forwarded-for").split(",")[0].trim();
  return {
    t: new Date().toISOString(),
    ip: header(request, "x-real-ip", 64) || forwardedFor.slice(0, 64),
    country: header(request, "x-vercel-ip-country", 2),
    region: header(request, "x-vercel-ip-country-region", 80),
    city: safeDecode(header(request, "x-vercel-ip-city", 200)).slice(0, 120),
    method: request.method,
    host: url.host.slice(0, 120),
    path: url.pathname.slice(0, 500),
    query: url.search.slice(1, 501),
    ref: header(request, "referer", 1000),
    ua: header(request, "user-agent", 600),
    lang: header(request, "accept-language").split(",")[0].slice(0, 40),
  };
}

export function storageFrom(env) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export async function saveVisit(record, store, fetchImpl = fetch) {
  await fetchImpl(`${store.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${store.token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["LPUSH", LIST_KEY, JSON.stringify(record)],
      ["LTRIM", LIST_KEY, "0", MAX_ITEMS],
    ]),
  });
}

// Equivalent of `next()` from @vercel/functions, without adding a dependency:
// tells Vercel to continue and serve the static file as usual.
function continueRequest() {
  return new Response(null, { headers: { "x-middleware-next": "1" } });
}

export default function middleware(request, context) {
  try {
    const env = (typeof process !== "undefined" && process.env) || {};
    const store = storageFrom(env);
    if (new URL(request.url).pathname === "/__visit-tracker") {
      // Health check: lets us confirm the tracker is deployed (reveals no secrets).
      return Response.json(
        { tracker: "ok", storage: store ? "configured" : "missing" },
        { headers: { "cache-control": "no-store" } },
      );
    }
    if (store) {
      const pending = saveVisit(visitRecord(request), store).catch(() => {});
      if (context && typeof context.waitUntil === "function") context.waitUntil(pending);
    }
  } catch {
    // Never let tracking affect the visitor.
  }
  return continueRequest();
}
