from django.db import models


class Resource(models.Model):
    """A digital product: book, audiobook, or training (free or paid)."""

    TYPE_CHOICES = [
        ("book", "Livre"),
        ("audiobook", "Livre audio"),
        ("training", "Formation"),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    resource_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    is_free = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=8, default="USD")
    short_description = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="resources/covers/", blank=True, null=True)
    preview_url = models.URLField(
        blank=True, help_text="Link to a sample or preview — excerpt, trailer, free lesson, etc."
    )
    sample_file = models.FileField(
        upload_to="resources/samples/",
        blank=True,
        null=True,
        help_text="Downloadable preview file (sample chapter, audio snippet, syllabus...).",
    )
    purchase_url = models.URLField(
        blank=True, help_text="Where visitors buy or access this (Gumroad, Selar, WhatsApp, etc.)."
    )
    featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title
