"""
Export the whole public site to plain files in public/, ready for a static host (Vercel).

Django + Admin stay a local editing tool: edit content in Admin, run this command, then
commit and push public/. Nothing Python runs in production.

Every page is rendered through Django's test client exactly as a visitor would get it,
in both languages, plus robots.txt, llms.txt, llms-full.txt, sitemap.xml and a 404 page.
Static files are copied as-is; media files (CV, images) are copied only when a page
actually links to them. The build fails if any page errors or any internal link, image
or file reference points at something that wasn't exported.
"""

import re
import shutil
import subprocess
from pathlib import Path
from urllib.parse import unquote, urlsplit

from django.conf import settings
from django.core.cache import cache
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.test import Client, override_settings
from django.urls import reverse
from django.utils.translation import override

from portfolio.models import CaseStudy

PAGES = [
    "core:home",
    "core:about",
    "core:process",
    "core:pricing",
    "portfolio:list",
    "certifications:list",
    "resources:list",
    "core:privacy",
    "core:legal",
]
ROOT_FILES = ["/robots.txt", "/llms.txt", "/llms-full.txt", "/sitemap.xml"]
NOT_FOUND_PROBE = "/__static-build-404__/"

# Internal references in HTML: href/src attributes, plus url(...) inside inline styles.
REFERENCE_RE = re.compile(r"""(?:href|src)=["'](/[^"'#?]*)|url\(\s*["']?(/[^"')?#]*)""")
MEDIA_RE = re.compile(r"/media/([^\"'\s)<>?#]+)")


class Command(BaseCommand):
    help = "Render the public site to static files in public/ for deployment."

    def add_arguments(self, parser):
        parser.add_argument("--output", default=str(settings.BASE_DIR / "public"))

    def handle(self, *args, **options):
        out = Path(options["output"]).resolve()
        if out == settings.BASE_DIR.resolve() or settings.BASE_DIR.resolve() not in out.parents:
            raise CommandError(f"Refusing to write to {out}: must be a subfolder of the project.")
        if out.exists():
            shutil.rmtree(out)
        out.mkdir(parents=True)

        # Render as production would: real 404 template, no debug pages. Static files are
        # collected first with content hashes in their names (base.3f9a1c2b7d4e.css), so
        # vercel.json can let browsers cache them for a year: a changed file gets a new name.
        static_root = out / settings.STATIC_URL.strip("/")
        with override_settings(
            DEBUG=False,
            ALLOWED_HOSTS=["*"],
            SECURE_SSL_REDIRECT=False,
            STATIC_ROOT=str(static_root),
            STORAGES={
                **settings.STORAGES,
                "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.ManifestStaticFilesStorage"},
            },
        ):
            # Admin's assets aren't needed: Admin is never exported.
            call_command("collectstatic", interactive=False, verbosity=0, ignore_patterns=["admin"])
            static_count = sum(1 for p in static_root.rglob("*") if p.is_file())
            cache.clear()
            written = self.render_pages(out)

        root_count = self.copy_site_root(out)
        media_count = self.copy_media(out, written)
        self.check_references(out, written)
        self.check_not_gitignored(out)

        self.stdout.write(
            self.style.SUCCESS(
                f"Built {len(written)} pages/files, {static_count} static assets, "
                f"{media_count} media files into {out}"
            )
        )

    def urls(self):
        urls = []
        for lang, _ in settings.LANGUAGES:
            with override(lang):
                urls += [reverse(name) for name in PAGES]
                urls += [
                    reverse("portfolio:detail", args=[slug])
                    for slug in CaseStudy.objects.filter(published=True).values_list("slug", flat=True)
                ]
        return urls + ROOT_FILES

    def render_pages(self, out):
        client = Client(HTTP_HOST=settings.SITE_URL.split("://", 1)[-1])
        written = {}
        for url in self.urls():
            response = client.get(url, secure=True)
            if response.status_code != 200:
                raise CommandError(f"{url} returned HTTP {response.status_code}")
            written[url] = self.write(out, url, response.content)

        response = client.get(NOT_FOUND_PROBE, secure=True)
        if response.status_code != 404:
            raise CommandError(f"404 probe returned HTTP {response.status_code}")
        (out / "404.html").write_bytes(response.content)
        written["/404.html"] = out / "404.html"
        return written

    @staticmethod
    def write(out, url, content):
        target = out / url.lstrip("/")
        if url.endswith("/"):
            target = target / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        return target

    def copy_site_root(self, out):
        """Files in site_root/ are published verbatim at the site root.

        For files that must live at an exact URL and never change, such as search-engine
        ownership checks (Google Search Console's googleXXXX.html, Bing's BingSiteAuth.xml).
        """
        source = settings.BASE_DIR / "site_root"
        count = 0
        if source.is_dir():
            for path in source.rglob("*"):
                if path.is_file():
                    target = out / path.relative_to(source)
                    if target.exists():
                        raise CommandError(f"site_root/{path.name} would overwrite a generated page.")
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(path, target)
                    count += 1
        return count

    def copy_media(self, out, written):
        media_root = Path(settings.MEDIA_ROOT).resolve()
        referenced = set()
        for path in written.values():
            referenced.update(MEDIA_RE.findall(path.read_text(encoding="utf-8", errors="ignore")))
        for rel in sorted(referenced):
            source = (media_root / unquote(rel)).resolve()
            if media_root not in source.parents or not source.is_file():
                raise CommandError(f"Page links to /media/{rel}, but that file doesn't exist.")
            target = out / "media" / unquote(rel)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
        return len(referenced)

    def check_references(self, out, written):
        missing = set()
        for page in written.values():
            if page.suffix != ".html":
                continue
            for href, css_url in REFERENCE_RE.findall(page.read_text(encoding="utf-8")):
                path = unquote(urlsplit(href or css_url).path)
                if path.startswith("//"):
                    continue  # protocol-relative external URL
                target = out / path.lstrip("/")
                if path.endswith("/"):
                    target = target / "index.html"
                if not target.is_file():
                    missing.add(f"{path}  (linked from {page.relative_to(out)})")
        if missing:
            raise CommandError("Broken internal links in the export:\n  " + "\n  ".join(sorted(missing)))

    def check_not_gitignored(self, out):
        """public/ is deployed from Git, so an ignored file would be missing online."""
        files = [p.relative_to(settings.BASE_DIR).as_posix() for p in out.rglob("*") if p.is_file()]
        try:
            result = subprocess.run(
                ["git", "check-ignore", "--stdin"],
                input="\n".join(files), capture_output=True, text=True, cwd=settings.BASE_DIR,
            )
        except FileNotFoundError:
            return  # git not installed: nothing to check
        ignored = result.stdout.splitlines()
        if ignored:
            raise CommandError(
                ".gitignore excludes exported files, so they would never reach the live site:\n  "
                + "\n  ".join(ignored[:20])
            )
