"""Pull visits recorded by middleware.js (in an Upstash Redis list) into the local database.

middleware.js LPUSHes one JSON record per request, so the newest visits sit at the head
of the list and the oldest at the tail. We read a batch from the tail, save it locally,
and only then LTRIM those exact items off — new visits arriving meanwhile are pushed to
the head and are never touched, and nothing is deleted from Upstash unless it was saved.
"""

import json
import urllib.request
from datetime import datetime, timedelta, timezone

from django.conf import settings
from django.db import transaction
from django.utils import timezone as dj_timezone

from .classify import classify
from .models import Visit

LIST_KEY = "visits"


class SyncError(Exception):
    pass


def is_configured():
    return bool(settings.UPSTASH_REDIS_REST_URL and settings.UPSTASH_REDIS_REST_TOKEN)


def _command(*args):
    request = urllib.request.Request(
        settings.UPSTASH_REDIS_REST_URL.rstrip("/"),
        data=json.dumps([str(a) for a in args]).encode(),
        headers={
            "Authorization": f"Bearer {settings.UPSTASH_REDIS_REST_TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.loads(response.read())
    except Exception as exc:  # network error, bad credentials, …
        raise SyncError(f"Upstash injoignable : {exc}") from exc
    if "error" in payload:
        raise SyncError(f"Upstash : {payload['error']}")
    return payload.get("result")


def _check_write_access():
    """Refuse to import with a read-only token.

    Imported visits must be trimmed off the Upstash list afterwards; with a read-only
    token that step fails, and the next sync would import the same visits again.
    `LTRIM visits 0 -1` keeps every item, so it changes nothing but needs write access.
    """
    try:
        _command("LTRIM", LIST_KEY, 0, -1)
    except SyncError as exc:
        if "403" in str(exc) or "NOPERM" in str(exc):
            raise SyncError(
                "La clé Upstash de .env est en lecture seule (KV_REST_API_READ_ONLY_TOKEN). "
                "Remplace UPSTASH_REDIS_REST_TOKEN par la valeur de KV_REST_API_TOKEN : "
                "aucune visite n'a été importée."
            ) from exc
        raise


def _parse_time(value):
    try:
        moment = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)
    except ValueError:
        return dj_timezone.now()


def visit_from_record(raw):
    data = json.loads(raw)
    path = str(data.get("path") or "/")[:500]
    query = str(data.get("query") or "")[:500]
    referrer = str(data.get("ref") or "")[:1000]
    user_agent = str(data.get("ua") or "")[:600]
    return Visit(
        timestamp=_parse_time(data.get("t")),
        ip=(data.get("ip") or None),
        country=str(data.get("country") or "")[:2],
        region=str(data.get("region") or "")[:80],
        city=str(data.get("city") or "")[:120],
        method=str(data.get("method") or "GET")[:10],
        host=str(data.get("host") or "")[:120],
        path=path,
        query=query,
        referrer=referrer,
        user_agent=user_agent,
        language=str(data.get("lang") or "")[:40],
        **classify(path, query, referrer, user_agent),
    )


def sync(batch_size=500, max_batches=400):
    """Import every pending visit. Returns (imported, skipped_malformed)."""
    if not is_configured():
        raise SyncError(
            "Upstash n'est pas configuré : ajoute UPSTASH_REDIS_REST_URL et "
            "UPSTASH_REDIS_REST_TOKEN dans le fichier .env."
        )
    _check_write_access()
    imported = skipped = 0
    for _ in range(max_batches):
        raw_items = _command("LRANGE", LIST_KEY, -batch_size, -1) or []
        if not raw_items:
            break
        visits = []
        for raw in raw_items:
            try:
                visits.append(visit_from_record(raw))
            except (ValueError, TypeError):
                skipped += 1
        with transaction.atomic():
            Visit.objects.bulk_create(visits)
        # Saved locally: now drop exactly those items from the tail of the list.
        _command("LTRIM", LIST_KEY, 0, -(len(raw_items) + 1))
        imported += len(visits)
        if len(raw_items) < batch_size:
            break
    purge_old()
    return imported, skipped


def purge_old():
    """Keep visits for the retention period announced in the privacy policy."""
    cutoff = dj_timezone.now() - timedelta(days=settings.VISIT_RETENTION_DAYS)
    Visit.objects.filter(timestamp__lt=cutoff).delete()
