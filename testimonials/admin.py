from django.contrib import admin

from .models import Testimonial, VideoTestimonial


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("author_name", "company", "country", "rating", "featured", "is_published", "order")
    list_editable = ("order", "is_published")
    list_filter = ("is_published", "featured", "country")
    search_fields = ("author_name", "company", "quote")
    ordering = ("order",)


@admin.register(VideoTestimonial)
class VideoTestimonialAdmin(admin.ModelAdmin):
    list_display = ("name", "company", "country", "is_published", "order")
    list_editable = ("order", "is_published")
    list_filter = ("is_published",)
    search_fields = ("name", "company")
    ordering = ("order",)
