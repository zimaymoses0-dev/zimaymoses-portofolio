from django.contrib import admin

from .models import Metric, PageContent, ProcessPhase, SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("Identity", {"fields": ("site_name", "owner_name", "headline", "subheadline")}),
        ("Availability", {"fields": ("available", "availability_text", "booking_url")}),
        ("CV", {"fields": ("cv_file",)}),
        ("Contact", {"fields": ("email", "phone", "whatsapp", "location")}),
        ("Social", {"fields": ("linkedin_url", "instagram_url", "twitter_url")}),
        ("Footer", {"fields": ("footer_description", "copyright_text")}),
    )

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(PageContent)
class PageContentAdmin(admin.ModelAdmin):
    list_display = ("page", "section_key", "title")
    list_filter = ("page",)
    search_fields = ("title", "subtitle", "body", "section_key")


@admin.register(Metric)
class MetricAdmin(admin.ModelAdmin):
    list_display = ("value", "label", "order", "is_active")
    list_editable = ("order", "is_active")
    ordering = ("order",)


@admin.register(ProcessPhase)
class ProcessPhaseAdmin(admin.ModelAdmin):
    list_display = ("number", "title", "week_label", "order", "is_active")
    list_editable = ("order", "is_active")
    ordering = ("order",)
