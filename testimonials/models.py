from django.db import models

from core.validators import MaxFileSizeValidator


class Testimonial(models.Model):
    author_name = models.CharField(max_length=120)
    role = models.CharField(max_length=120, blank=True)
    company = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=80, blank=True)
    avatar = models.ImageField(
        upload_to="testimonials/avatars/", blank=True, null=True, validators=[MaxFileSizeValidator(8)]
    )
    quote = models.TextField()
    metric = models.CharField(max_length=80, blank=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=5.0)
    case_study = models.ForeignKey(
        "portfolio.CaseStudy",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="testimonials",
    )
    featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.author_name} — {self.company}"


class VideoTestimonial(models.Model):
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=120, blank=True)
    company = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=80, blank=True)
    video_url = models.URLField()
    thumbnail = models.ImageField(
        upload_to="testimonials/video_thumbs/", blank=True, null=True, validators=[MaxFileSizeValidator(8)]
    )
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name
