from django.conf import settings
from django.urls import Resolver404, resolve, reverse, translate_url
from django.utils.translation import override

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
    try:
        resolve(path)
    except Resolver404:
        # Error pages: point language links and og:url at each language's home page
        # instead of back at the URL that doesn't exist.
        path = None
    if path is None:
        language_paths = {}
        for code, _ in settings.LANGUAGES:
            with override(code):
                language_paths[code] = reverse("core:home")
        path = language_paths[settings.LANGUAGE_CODE]
    else:
        language_paths = {code: translate_url(path, code) for code, _ in settings.LANGUAGES}
    alternates = {code: settings.SITE_URL + p for code, p in language_paths.items()}
    return {
        # The language switcher posts the *target* language's URL as `next`: Django's
        # set_language can't translate /en/... back to the unprefixed French URL itself.
        "language_paths": language_paths,
        "SITE_URL": settings.SITE_URL,
        "newsletter_enabled": settings.NEWSLETTER_ENABLED,
        "canonical_url": settings.SITE_URL + path,
        "hreflang_alternates": alternates,
        "x_default_url": alternates.get(settings.LANGUAGE_CODE, settings.SITE_URL + path),
        "person": profile.get_profile(),
    }
