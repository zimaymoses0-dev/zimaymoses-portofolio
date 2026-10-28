"""Tell IndexNow search engines (Bing, Yandex, Seznam, Naver…) which pages changed.

Run after a deploy is live: `python manage.py ping_indexnow` submits every URL in the
exported sitemap. The key file lives in site_root/ (published at the site root); it is a
public identifier, not a secret.
"""

import json
import re
import urllib.request
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Submit the site's URLs to IndexNow (Bing and partners) after publishing."

    def handle(self, *args, **options):
        keys = [p for p in (settings.BASE_DIR / "site_root").glob("*.txt") if re.fullmatch(r"[0-9a-f]{32}", p.stem)]
        if not keys:
            raise CommandError("No IndexNow key file (32 hex chars .txt) in site_root/.")
        key = keys[0].stem
        sitemap = Path(settings.BASE_DIR / "public" / "sitemap.xml")
        if not sitemap.exists():
            raise CommandError("public/sitemap.xml not found: run build_static first.")
        text = sitemap.read_text(encoding="utf-8")
        urls = sorted(set(re.findall(r"<loc>([^<]+)</loc>", text) + re.findall(r'hreflang="(?:fr|en)" href="([^"]+)"', text)))
        host = settings.SITE_URL.split("://", 1)[-1]
        body = json.dumps({"host": host, "key": key, "keyLocation": f"{settings.SITE_URL}/{key}.txt", "urlList": urls}).encode()
        request = urllib.request.Request("https://api.indexnow.org/indexnow", data=body, method="POST",
                                         headers={"Content-Type": "application/json; charset=utf-8"})
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                status = response.status
        except urllib.error.HTTPError as exc:
            raise CommandError(f"IndexNow refused the submission: HTTP {exc.code} {exc.read()[:200]!r}") from exc
        self.stdout.write(self.style.SUCCESS(f"IndexNow accepted {len(urls)} URL(s) (HTTP {status})."))
