from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

urlpatterns = [
    path("admin/", admin.site.urls),
    path("i18n/", include("django.conf.urls.i18n")),
    path("newsletter/", include("newsletter.urls")),
    path("work/", include("portfolio.urls")),
    path("certifications/", include("certifications.urls")),
    path("resources/", include("resources.urls")),
    path("", include("core.urls")),
]

# Serve uploaded media (CV, certificates, case study images, ...) directly via Django in
# every environment, since there's no separate media server/CDN in front of this app yet.
# django.conf.urls.static.static() only wires this up when DEBUG=True, which left every
# uploaded file 404ing outside local dev. django.views.static.serve is not the most
# efficient way to serve files at scale, but it's a correct, safe (path-traversal-guarded)
# fix until media is moved to object storage (S3, Cloudinary, etc.) or a real web server.
urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
