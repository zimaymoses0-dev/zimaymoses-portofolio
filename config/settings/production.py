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
