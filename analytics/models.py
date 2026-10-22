from django.db import models


class Visit(models.Model):
    """One request to the live site, recorded by middleware.js on Vercel and pulled in by
    `manage.py sync_visits`. Classification fields (source, bot, probe, device…) are derived
    at import time by analytics/classify.py, so they can be improved and re-run later."""

    timestamp = models.DateTimeField("Date", db_index=True)
    ip = models.GenericIPAddressField("Adresse IP", null=True, blank=True, db_index=True)
    country = models.CharField("Pays", max_length=2, blank=True)
    region = models.CharField("Région", max_length=80, blank=True)
    city = models.CharField("Ville", max_length=120, blank=True)
    method = models.CharField(max_length=10, default="GET")
    host = models.CharField(max_length=120, blank=True)
    path = models.CharField("Page", max_length=500)
    query = models.CharField(max_length=500, blank=True)
    referrer = models.CharField("Provenance (URL)", max_length=1000, blank=True)
    user_agent = models.CharField(max_length=600, blank=True)
    language = models.CharField("Langue du navigateur", max_length=40, blank=True)

    source = models.CharField("Source", max_length=80, blank=True, db_index=True)
    is_bot = models.BooleanField("Robot ?", default=False, db_index=True)
    bot_name = models.CharField("Robot", max_length=80, blank=True)
    is_probe = models.BooleanField("Tentative admin / scan", default=False, db_index=True)
    is_page = models.BooleanField("Page HTML", default=True, db_index=True)
    device = models.CharField("Appareil", max_length=20, blank=True)
    browser = models.CharField("Navigateur", max_length=40, blank=True)
    os = models.CharField("Système", max_length=40, blank=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "Visite"
        verbose_name_plural = "Visites"
        indexes = [models.Index(fields=["is_bot", "is_probe", "is_page", "timestamp"])]

    def __str__(self):
        return f"{self.timestamp:%Y-%m-%d %H:%M} {self.ip or '?'} {self.path}"

    @property
    def location(self):
        return ", ".join(x for x in (self.city, self.region, self.country) if x)
