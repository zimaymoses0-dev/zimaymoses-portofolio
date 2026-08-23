from django.contrib import admin

from .models import CaseStudy, CaseStudySection


class CaseStudySectionInline(admin.TabularInline):
    model = CaseStudySection
    extra = 1


@admin.register(CaseStudy)
class CaseStudyAdmin(admin.ModelAdmin):
    list_display = ("title", "client", "category", "year", "primary_metric", "order", "published")
    list_editable = ("order", "published")
    list_filter = ("published", "featured", "category")
    search_fields = ("title", "client", "short_description")
    prepopulated_fields = {"slug": ("title",)}
    ordering = ("order",)
    fieldsets = (
        (None, {"fields": ("title", "slug", "client", "category", "year", "short_description")}),
        ("Editorial", {"fields": ("challenge", "strategy", "solution", "outcome")}),
        ("Metrics", {"fields": ("primary_metric", "secondary_metric")}),
        ("Media", {"fields": ("hero_image", "thumbnail")}),
        ("Publishing", {"fields": ("featured", "published", "order")}),
    )
    inlines = [CaseStudySectionInline]
