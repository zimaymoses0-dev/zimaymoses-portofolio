from datetime import timedelta

from django.contrib import admin, messages
from django.db.models import Count
from django.shortcuts import redirect
from django.urls import path, reverse
from django.utils import timezone
from django.utils.html import format_html
from django.views.decorators.http import require_POST

from .models import Visit
from .sync import SyncError, is_configured, sync


def _top(queryset, field, limit=8):
    return list(
        queryset.exclude(**{field: ""}).values(field).annotate(n=Count("id")).order_by("-n")[:limit]
    )


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "ip", "location", "kind", "source", "path", "device", "browser")
    list_filter = ("is_probe", "is_bot", "is_page", "source", "country", "device", "bot_name")
    search_fields = ("ip", "path", "referrer", "city", "country", "user_agent", "bot_name", "source")
    date_hierarchy = "timestamp"
    list_per_page = 100
    readonly_fields = [f.name for f in Visit._meta.fields]

    # Visits are recorded by the live site: they can be viewed and deleted (e.g. on a
    # visitor's request), never created or edited by hand.
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    @admin.display(description="Lieu")
    def location(self, obj):
        return obj.location

    @admin.display(description="Type")
    def kind(self, obj):
        if obj.is_probe:
            return format_html('<b style="color:#c0392b">Tentative admin / scan</b>')
        if obj.is_bot:
            return obj.bot_name
        return "Visiteur"

    def get_urls(self):
        return [
            # POST only (CSRF-protected form): a GET link could be triggered by another site.
            path("sync/", self.admin_site.admin_view(require_POST(self.sync_view)), name="analytics_visit_sync"),
        ] + super().get_urls()

    def sync_view(self, request):
        try:
            imported, skipped = sync()
            messages.success(request, f"{imported} nouvelle(s) visite(s) importée(s).")
            if skipped:
                messages.warning(request, f"{skipped} enregistrement(s) illisible(s) ignoré(s).")
        except SyncError as exc:
            messages.error(request, str(exc))
        return redirect(reverse("admin:analytics_visit_changelist"))

    def changelist_view(self, request, extra_context=None):
        now = timezone.now()
        last_30 = Visit.objects.filter(timestamp__gte=now - timedelta(days=30))
        humans = last_30.filter(is_bot=False, is_probe=False, is_page=True)
        probes = Visit.objects.filter(is_probe=True)
        extra_context = {
            **(extra_context or {}),
            "upstash_configured": is_configured(),
            "stats": {
                "views_today": humans.filter(timestamp__date=now.date()).count(),
                "views_7": humans.filter(timestamp__gte=now - timedelta(days=7)).count(),
                "views_30": humans.count(),
                "visitors_30": humans.exclude(ip=None).values("ip").distinct().count(),
                "bots_30": last_30.filter(is_bot=True).count(),
                "probes_30": last_30.filter(is_probe=True).count(),
                "last_visit": Visit.objects.order_by("-timestamp").first(),
            },
            "top_sources": _top(humans.exclude(source="Navigation interne"), "source"),
            "top_pages": _top(humans, "path"),
            "top_countries": _top(humans, "country"),
            "top_cities": _top(humans, "city"),
            "top_bots": _top(last_30.filter(is_bot=True), "bot_name"),
            "recent_probes": probes.order_by("-timestamp")[:10],
            "local_admin_failures": self._local_admin_failures(),
        }
        return super().changelist_view(request, extra_context=extra_context)

    @staticmethod
    def _local_admin_failures():
        """Failed logins on this computer's own admin, recorded by django-axes."""
        try:
            from axes.models import AccessFailureLog
        except ImportError:
            return []
        return list(AccessFailureLog.objects.order_by("-attempt_time")[:10])
