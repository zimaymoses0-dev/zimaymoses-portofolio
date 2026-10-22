from django.conf import settings
from django.urls import translate_url

from services.models import Service

from . import profile
from .models import SiteSettings


def site_settings(request):
    return {"site_settings": SiteSettings.load()}


def footer_services(request):
    return {"footer_services": Service.objects.filter(is_active=True)}


def seo(request):
    """Canonical + hreflang URLs on the canonical domain, for every page in both languages."""
    path = request.path
    language_paths = {code: translate_url(path, code) for code, _ in settings.LANGUAGES}
    alternates = {code: settings.SITE_URL + p for code, p in language_paths.items()}
    return {
        # The language switcher posts the *target* language's URL as `next`: Django's
        # set_language can't translate /en/... back to the unprefixed French URL itself.
        "language_paths": language_paths,
        "SITE_URL": settings.SITE_URL,
        "canonical_url": settings.SITE_URL + path,
        "hreflang_alternates": alternates,
        "x_default_url": alternates.get(settings.LANGUAGE_CODE, settings.SITE_URL + path),
        "person": profile.get_profile(),
    }
