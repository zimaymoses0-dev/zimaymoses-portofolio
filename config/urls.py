from django.conf import settings
from django.conf.urls.i18n import i18n_patterns
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import include, path, re_path
from django.views.static import serve

from core import seo

urlpatterns = [
    path("admin/", admin.site.urls),
    path("i18n/", include("django.conf.urls.i18n")),
    path("newsletter/", include("newsletter.urls")),
    path("robots.txt", seo.robots_txt, name="robots_txt"),
    path("llms.txt", seo.llms_txt, name="llms_txt"),
    path("llms-full.txt", seo.llms_full_txt, name="llms_full_txt"),
    path("sitemap.xml", sitemap, {"sitemaps": seo.SITEMAPS}, name="django.contrib.sitemaps.views.sitemap"),
]

# Public pages: French at /, English at /en/. Giving each language its own URL is what
# lets search engines and AI crawlers (which don't keep the language cookie) index the
# English version at all — previously both languages shared one URL.
urlpatterns += i18n_patterns(
    path("work/", include("portfolio.urls")),
    path("certifications/", include("certifications.urls")),
    path("resources/", include("resources.urls")),
    path("", include("core.urls")),
    prefix_default_language=False,
)

# Serve uploaded media (CV, certificates, case study images, ...) directly via Django in
# every environment, since there's no separate media server/CDN in front of this app yet.
# django.conf.urls.static.static() only wires this up when DEBUG=True, which left every
# uploaded file 404ing outside local dev. django.views.static.serve is not the most
# efficient way to serve files at scale, but it's a correct, safe (path-traversal-guarded)
# fix until media is moved to object storage (S3, Cloudinary, etc.) or a real web server.
urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
