from django.contrib import admin

from .models import Certification


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ("title", "issuer", "issue_date", "dark_card", "featured", "is_published", "order")
    list_editable = ("order", "is_published")
    list_filter = ("is_published", "featured", "dark_card")
    search_fields = ("title", "issuer")
    ordering = ("order",)
    fieldsets = (
        (None, {"fields": ("title", "issuer", "subtitle", "score", "issue_date", "credential_id")}),
        ("Content", {"fields": ("description", "skills_highlight")}),
        ("Verification & media", {"fields": ("certificate_url", "image")}),
        ("Display", {"fields": ("dark_card", "featured", "is_published", "order")}),
    )
