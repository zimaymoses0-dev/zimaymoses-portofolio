from django.contrib import admin

from .models import Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ("title", "resource_type", "is_free", "price", "featured", "is_published", "order")
    list_editable = ("order", "is_published")
    list_filter = ("resource_type", "is_free", "is_published", "featured")
    search_fields = ("title", "short_description")
    prepopulated_fields = {"slug": ("title",)}
    ordering = ("order",)
    fieldsets = (
        (None, {"fields": ("title", "slug", "resource_type", "short_description", "description")}),
        ("Pricing", {"fields": ("is_free", "price", "currency")}),
        ("Media & links", {"fields": ("cover_image", "preview_url", "sample_file", "purchase_url")}),
        ("Publishing", {"fields": ("featured", "is_published", "order")}),
    )
