from services.models import Service

from .models import SiteSettings


def site_settings(request):
    return {"site_settings": SiteSettings.load()}


def footer_services(request):
    return {"footer_services": Service.objects.filter(is_active=True)}
