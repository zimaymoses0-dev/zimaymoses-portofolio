from django.db import models
from django.utils.translation import get_language

from core.validators import MaxFileSizeValidator


class Certification(models.Model):
    # Groups on the Certifications page, in display order.
    CATEGORY_CHOICES = [
        ("investigation", "Investigation & lutte anticorruption"),
        ("finance", "Finance & comptabilité"),
        ("cyber", "Cybersécurité"),
        ("management", "Gestion & management"),
        ("marketing_web", "Marketing & web"),
        ("other", "Autres formations"),
    ]

    title = models.CharField(max_length=150)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="other")
    issuer = models.CharField(max_length=150, blank=True)
    subtitle = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    skills_highlight = models.TextField(
        blank=True,
        help_text="Key skills or knowledge gained — one per line. Shown on the card for SEO and page richness.",
    )
    # English versions, shown on /en/ pages. Leave blank to fall back to the French text.
    subtitle_en = models.CharField(max_length=200, blank=True)
    description_en = models.TextField(blank=True)
    skills_highlight_en = models.TextField(blank=True, help_text="English version — one per line.")
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

    # Language-aware accessors for templates: English on /en/ pages when filled in.
    def _localized(self, field):
        english = getattr(self, f"{field}_en")
        return english if (get_language() or "").startswith("en") and english else getattr(self, field)

    @property
    def display_subtitle(self):
        return self._localized("subtitle")

    @property
    def display_description(self):
        return self._localized("description")

    @property
    def display_skills(self):
        return [line.strip() for line in self._localized("skills_highlight").splitlines() if line.strip()]

    @property
    def image_alt(self):
        word = "Certificate" if (get_language() or "").startswith("en") else "Certificat"
        issuer = f" — {self.issuer}" if self.issuer else ""
        return f"{word} « {self.title} »{issuer} — Moses Zegbah Zimay"

    @property
    def anchor(self):
        """Stable in-page id, so each credential has its own URL (#cert-<pk>)."""
        return f"cert-{self.pk}"
