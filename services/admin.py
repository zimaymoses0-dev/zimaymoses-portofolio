from django.contrib import admin

from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "currency", "duration", "badge", "order", "is_active")
    list_editable = ("order", "is_active")
    list_filter = ("is_active", "featured")
    search_fields = ("name", "short_description")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("order",)
