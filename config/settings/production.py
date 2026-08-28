from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F401,F403

DEBUG = False

# Fail loudly instead of silently deploying with the insecure fallback key from base.py.
if SECRET_KEY == "django-insecure-change-me-in-env":  # noqa: F405
    raise ImproperlyConfigured(
        "SECRET_KEY is not set. Set a real, random SECRET_KEY in the environment "
        "before running with production settings."
    )

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Railway (like Render/Heroku) terminates TLS at its edge and forwards plain HTTP to
# the container, tagging the original scheme in this header. Without telling Django to
# trust it, SECURE_SSL_REDIRECT thinks every request is insecure and redirect-loops.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Needed for Django 4+ to accept POSTs (admin login, forms) once the site is only
# reachable over HTTPS. Comma-separated list of full origins, e.g.
# "https://your-app.up.railway.app,https://yourdomain.com".
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])  # noqa: F405

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

# Media files (CV, certification/case-study images, resource covers) must live somewhere
# that survives redeploys — Railway wipes the container filesystem on every deploy. Local
# dev keeps using base.py's filesystem MEDIA_ROOT; only production needs cloud storage.
#
# Credentials come from the CLOUDINARY_URL env var (cloudinary://key:secret@cloud_name),
# which the underlying cloudinary SDK reads from os.environ on its own — nothing to parse
# here. django-cloudinary-storage falls back to it whenever CLOUDINARY_STORAGE doesn't
# define CLOUD_NAME/API_KEY/API_SECRET itself, so this dict stays deliberately empty.
INSTALLED_APPS = ["cloudinary_storage", "cloudinary"] + INSTALLED_APPS  # noqa: F405

if not env("CLOUDINARY_URL", default=""):  # noqa: F405
    raise ImproperlyConfigured(
        "CLOUDINARY_URL is not set. Media storage requires it in production "
        "(get it from the Cloudinary dashboard: Settings > Access Keys)."
    )

CLOUDINARY_STORAGE = {}
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
