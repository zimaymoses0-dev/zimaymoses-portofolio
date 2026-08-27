from django.db import models

from core.validators import MaxFileSizeValidator


class Certification(models.Model):
    title = models.CharField(max_length=150)
    issuer = models.CharField(max_length=150, blank=True)
    subtitle = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    skills_highlight = models.TextField(
        blank=True,
        help_text="Key skills or knowledge gained — one per line. Shown on the card for SEO and page richness.",
    )
    score = models.CharField(max_length=40, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    certificate_url = models.URLField(blank=True)
    credential_id = models.CharField(max_length=120, blank=True)
    image = models.ImageField(
        upload_to="certifications/", blank=True, null=True, validators=[MaxFileSizeValidator(8)]
    )
    dark_card = models.BooleanField(default=False, help_text="Render this card with a dark background.")
    is_published = models.BooleanField(default=True)
    featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title
