"""Turn a raw request (referrer, user agent, path) into human-readable categories."""

import re
from urllib.parse import parse_qs, urlsplit

# Order matters: the first match wins (e.g. Gemini before Google).
REFERRER_SOURCES = [
    (r"(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$", "ChatGPT"),
    (r"(^|\.)perplexity\.ai$", "Perplexity"),
    (r"(^|\.)claude\.ai$", "Claude"),
    (r"(^|\.)gemini\.google\.com$", "Gemini"),
    (r"(^|\.)copilot\.microsoft\.com$", "Copilot"),
    (r"(^|\.)google\.[a-z.]+$", "Google"),
    (r"(^|\.)bing\.com$", "Bing"),
    (r"(^|\.)duckduckgo\.com$", "DuckDuckGo"),
    (r"(^|\.)yahoo\.[a-z.]+$", "Yahoo"),
    (r"(^|\.)yandex\.[a-z.]+$", "Yandex"),
    (r"(^|\.)linkedin\.com$|(^|\.)lnkd\.in$", "LinkedIn"),
    (r"(^|\.)facebook\.com$|(^|\.)fb\.(com|me)$", "Facebook"),
    (r"(^|\.)instagram\.com$", "Instagram"),
    (r"(^|\.)t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$", "X (Twitter)"),
    (r"(^|\.)whatsapp\.(com|net)$|(^|\.)wa\.me$", "WhatsApp"),
    (r"(^|\.)youtube\.com$|(^|\.)youtu\.be$", "YouTube"),
    (r"(^|\.)tiktok\.com$", "TikTok"),
    (r"(^|\.)github\.com$", "GitHub"),
    (r"(^|\.)udemy\.com$", "Udemy"),
]
UTM_SOURCES = {
    "chatgpt.com": "ChatGPT", "openai": "ChatGPT", "perplexity": "Perplexity", "linkedin": "LinkedIn",
    "facebook": "Facebook", "fb": "Facebook", "ig": "Instagram", "instagram": "Instagram",
    "whatsapp": "WhatsApp", "google": "Google", "bing": "Bing", "twitter": "X (Twitter)", "x": "X (Twitter)",
}

# (substring of the user agent, display name). Checked in order.
BOTS = [
    ("GPTBot", "GPTBot (OpenAI)"), ("OAI-SearchBot", "OAI-SearchBot (ChatGPT)"), ("ChatGPT-User", "ChatGPT-User"),
    ("ClaudeBot", "ClaudeBot (Anthropic)"), ("Claude-SearchBot", "Claude-SearchBot"), ("Claude-User", "Claude-User"),
    ("PerplexityBot", "PerplexityBot"), ("Perplexity-User", "Perplexity-User"),
    ("Google-InspectionTool", "Google Search Console"), ("Googlebot", "Googlebot"),
    ("bingbot", "Bingbot"), ("BingPreview", "Bing Preview"), ("DuckDuckBot", "DuckDuckBot"),
    ("DuckAssistBot", "DuckAssistBot"), ("YandexBot", "YandexBot"), ("Baiduspider", "Baidu"),
    ("Applebot", "Applebot"), ("meta-externalagent", "Meta AI"), ("facebookexternalhit", "Facebook (aperçu de lien)"),
    ("LinkedInBot", "LinkedIn (aperçu de lien)"), ("WhatsApp", "WhatsApp (aperçu de lien)"),
    ("Twitterbot", "X (aperçu de lien)"), ("Slackbot", "Slack"), ("TelegramBot", "Telegram"),
    ("CCBot", "Common Crawl"), ("AhrefsBot", "Ahrefs"), ("SemrushBot", "Semrush"), ("MJ12bot", "Majestic"),
    ("DotBot", "Moz"), ("PetalBot", "Petal (Huawei)"), ("Bytespider", "Bytespider (TikTok)"),
    ("Amazonbot", "Amazonbot"), ("vercel", "Vercel"),
]
GENERIC_BOT = re.compile(
    r"bot|crawl|spider|slurp|scan|curl|wget|python-requests|python-urllib|httpx|go-http|java/|headless|lighthouse",
    re.I,
)

# Paths nobody legitimately requests on this static site: admin logins, CMS installs, secrets.
PROBE = re.compile(
    r"^/(admin|wp-admin|wp-login|wp-content|wp-includes|xmlrpc|administrator|phpmyadmin|pma|login|user/login|"
    r"\.env|\.git|\.aws|\.ssh|config|backup|server-status|cgi-bin|vendor/phpunit|actuator|api/v1/admin)"
    r"|\.(php|asp|aspx|jsp|cgi|env|sql|bak|ini|yml|yaml)$",
    re.I,
)


def bot_name(user_agent):
    ua = (user_agent or "").lower()
    for needle, name in BOTS:
        if needle.lower() in ua:
            return name
    if not ua or GENERIC_BOT.search(ua):
        return "Autre robot / script"
    return ""


def source(referrer, query, own_host="zimaymoses.com"):
    utm = parse_qs(query or "").get("utm_source", [""])[0].lower()
    if utm:
        return UTM_SOURCES.get(utm, utm[:60])
    if not referrer:
        return "Direct / inconnu"
    host = (urlsplit(referrer).hostname or "").lower()
    if host == own_host or host.endswith("." + own_host):
        return "Navigation interne"
    for pattern, name in REFERRER_SOURCES:
        if re.search(pattern, host):
            return name
    return host.removeprefix("www.")[:80] or "Direct / inconnu"


def device_browser_os(ua):
    ua = ua or ""
    if re.search(r"iPad|Tablet", ua):
        device = "Tablette"
    elif re.search(r"Mobi|Android|iPhone", ua):
        device = "Mobile"
    else:
        device = "Ordinateur"
    browser = next(
        (name for pattern, name in [
            (r"Edg/", "Edge"), (r"OPR/|Opera", "Opera"), (r"SamsungBrowser", "Samsung Internet"),
            (r"Firefox/|FxiOS", "Firefox"), (r"Chrome/|CriOS", "Chrome"), (r"Safari/", "Safari"),
        ] if re.search(pattern, ua)),
        "Autre",
    )
    os_name = next(
        (name for pattern, name in [
            (r"Windows", "Windows"), (r"Android", "Android"), (r"iPhone|iPad|iOS", "iOS"),
            (r"Mac OS X|Macintosh", "macOS"), (r"Linux", "Linux"),
        ] if re.search(pattern, ua)),
        "Autre",
    )
    return device, browser, os_name


def classify(path, query, referrer, user_agent):
    name = bot_name(user_agent)
    device, browser, os_name = device_browser_os(user_agent)
    path = path or "/"
    return {
        "source": source(referrer, query),
        "is_bot": bool(name),
        "bot_name": name,
        "is_probe": bool(PROBE.search(path)),
        "is_page": path.endswith("/") or path.endswith(".html"),
        "device": "" if name else device,
        "browser": "" if name else browser,
        "os": "" if name else os_name,
    }
