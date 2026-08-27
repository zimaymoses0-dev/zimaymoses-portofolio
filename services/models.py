from django.db import models

from core.validators import MaxFileSizeValidator


class Service(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    short_description = models.CharField(max_length=255, blank=True)
    long_description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=8, default="USD")
    duration = models.CharField(max_length=80, blank=True, help_text="e.g. '4-6 weeks'")
    badge = models.CharField(max_length=60, blank=True, help_text="e.g. 'MOST POPULAR'")
    availability_text = models.CharField(max_length=120, blank=True)
    order = models.PositiveIntegerField(default=0)
    featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    cta_label = models.CharField(max_length=60, default="Learn more")
    cta_url = models.CharField(max_length=255, blank=True)
    cover_image = models.ImageField(
        upload_to="services/", blank=True, null=True, validators=[MaxFileSizeValidator(8)]
    )

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name
