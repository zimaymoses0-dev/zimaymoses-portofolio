import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { getProjectRequests, getProfile, type ProjectRequest } from "../lib/api";

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Dashboard() {
  const session = useAppStore((s) => s.session);
  const [requests, setRequests] = useState<ProjectRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    getProjectRequests()
      .then(setRequests)
      .catch((err: Error) => setError(err.message));
    getProfile()
      .then((profile) => setFirstName(profile?.first_name ?? null))
      .catch(() => {});
  }, []);

  const greetingName = firstName || session?.user.email?.split("@")[0] || "there";

  return (
    <div>
      <h1 className="space-greeting">Hello, {greetingName}</h1>
      <p className="space-subgreeting">
        {requests ? `You have ${requests.length} project request${requests.length === 1 ? "" : "s"}.` : ""}
      </p>

      {error && <p className="space-error">Couldn't load your requests ({error}).</p>}
      {!error && requests === null && <p className="space-muted">Loading…</p>}
      {requests && requests.length === 0 && (
        <p className="space-muted">You have no project requests yet — start one from the "New Request" tab.</p>
      )}

      {requests && requests.length > 0 && (
        <ul className="request-list">
          {requests.map((r) => (
            <li key={r.id} className="request-card">
              <div className="request-card-top">
                <div>
                  <span className="request-type">{r.project_title || r.project_type}</span>
                  <span className="request-ref">{r.reference_number}</span>
                </div>
                <span className={`status-badge status-${r.status}`}>{formatStatus(r.status)}</span>
              </div>
              <p className="request-goals">{r.project_description}</p>
              {(r.budget_min || r.budget_max) && (
                <span className="request-budget">
                  {r.budget_min ?? "?"} – {r.budget_max ?? "?"} {r.currency}
                </span>
              )}
              <span className="request-date">
                {new Date(r.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
