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

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
