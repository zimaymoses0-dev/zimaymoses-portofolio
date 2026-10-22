from django.contrib import admin

from .models import Certification


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "issuer", "issue_date", "dark_card", "featured", "is_published", "order")
    list_editable = ("order", "is_published")
    list_filter = ("category", "is_published", "featured", "dark_card")
    search_fields = ("title", "issuer")
    ordering = ("order",)
    fieldsets = (
        (None, {"fields": ("title", "category", "issuer", "subtitle", "score", "issue_date", "credential_id")}),
        ("Content", {"fields": ("description", "skills_highlight")}),
        ("English", {"fields": ("subtitle_en", "description_en", "skills_highlight_en")}),
        ("Verification & media", {"fields": ("certificate_url", "image")}),
        ("Display", {"fields": ("dark_card", "featured", "is_published", "order")}),
    )
