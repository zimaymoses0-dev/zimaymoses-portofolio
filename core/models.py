from django.db import models

from .validators import MaxFileSizeValidator, validate_pdf_content


class SiteSettings(models.Model):
    """Singleton: global settings editable from Django Admin."""

    site_name = models.CharField(max_length=120, default="Portfolio")
    owner_name = models.CharField(max_length=120, blank=True)
    headline = models.CharField(max_length=255, blank=True)
    subheadline = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    whatsapp = models.CharField(max_length=40, blank=True)
    location = models.CharField(max_length=120, blank=True)
    available = models.BooleanField(default=True)
    availability_text = models.CharField(
        max_length=120, blank=True, default="Available for new projects"
    )
    booking_url = models.URLField(blank=True)
    cv_file = models.FileField(
        upload_to="cv/",
        blank=True,
        null=True,
        verbose_name="CV / Resume (PDF)",
        validators=[MaxFileSizeValidator(10), validate_pdf_content],
    )
    linkedin_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    copyright_text = models.CharField(max_length=255, blank=True)
    footer_description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Site settings"
        verbose_name_plural = "Site settings"

    def __str__(self):
        return self.site_name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class PageContent(models.Model):
    """Generic CMS block for any major headline/body copy on a page section."""

    PAGE_CHOICES = [
        ("home", "Home"),
        ("work", "Work"),
        ("process", "Process"),
        ("pricing", "Pricing"),
        ("about", "About"),
        ("ask", "Ask"),
    ]

    page = models.CharField(max_length=40, choices=PAGE_CHOICES)
    section_key = models.SlugField(
        max_length=80,
        help_text="Must match the key the template looks up, e.g. 'hero', 'credibility', 'how-i-help'.",
    )
    eyebrow = models.CharField(max_length=120, blank=True)
    title = models.CharField(max_length=255, blank=True)
    subtitle = models.TextField(blank=True)
    body = models.TextField(blank=True)
    image = models.ImageField(
        upload_to="page_content/", blank=True, null=True, validators=[MaxFileSizeValidator(8)]
    )
    cta_label = models.CharField(max_length=60, blank=True)
    cta_url = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = "Page content block"
        unique_together = ("page", "section_key")
        ordering = ["page", "section_key"]

    def __str__(self):
        return f"{self.page} / {self.section_key}"


class Metric(models.Model):
    """A single stat used in the Credibility Metrics / Process Stats rows."""

    value = models.CharField(max_length=40, help_text="e.g. +67%, 19, $1B")
    label = models.CharField(max_length=120, help_text="e.g. YoY revenue")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.value} — {self.label}"


class ProcessPhase(models.Model):
    """One stage of the Process page's dark timeline."""

    number = models.CharField(max_length=10, help_text="e.g. '01'")
    week_label = models.CharField(max_length=60, blank=True, help_text="e.g. 'Week 1-2'")
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    ai_in_action = models.TextField(blank=True, help_text="How AI is used during this phase.")
    what_you_get = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.number} — {self.title}"
