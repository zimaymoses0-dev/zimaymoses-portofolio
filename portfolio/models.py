from django.db import models

from core.validators import MaxFileSizeValidator


class CaseStudy(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    client = models.CharField(max_length=120, blank=True)
    category = models.CharField(max_length=120, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    short_description = models.CharField(max_length=255, blank=True)
    live_url = models.URLField(blank=True, help_text="Link to the live site, if it's still online.")
    challenge = models.TextField(blank=True)
    strategy = models.TextField(blank=True)
    solution = models.TextField(blank=True)
    outcome = models.TextField(blank=True)
    primary_metric = models.CharField(max_length=80, blank=True, help_text="e.g. '+67% YoY revenue'")
    secondary_metric = models.CharField(max_length=80, blank=True)
    hero_image = models.ImageField(
        upload_to="case_studies/hero/", blank=True, null=True, validators=[MaxFileSizeValidator(8)]
    )
    thumbnail = models.ImageField(
        upload_to="case_studies/thumbnails/", blank=True, null=True, validators=[MaxFileSizeValidator(8)]
    )
    featured = models.BooleanField(default=False)
    published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
        verbose_name_plural = "Case studies"

    def __str__(self):
        return self.title


class CaseStudySection(models.Model):
    """A flexible editorial block (Context, Research, Insights, Lessons, ...) on a case study detail page."""

    case_study = models.ForeignKey(CaseStudy, on_delete=models.CASCADE, related_name="sections")
    title = models.CharField(max_length=150)
    content = models.TextField(blank=True)
    image = models.ImageField(
        upload_to="case_studies/sections/", blank=True, null=True, validators=[MaxFileSizeValidator(8)]
    )
    video_url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.case_study.title} — {self.title}"
