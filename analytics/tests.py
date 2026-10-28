import json
from datetime import timedelta
from unittest import mock

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from . import sync as sync_module
from .classify import classify, source
from .models import Visit

CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36"
IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"


class ClassifyTests(TestCase):
    def test_sources(self):
        self.assertEqual(source("https://www.google.com/", ""), "Google")
        self.assertEqual(source("https://www.google.ci/search?q=moses", ""), "Google")
        self.assertEqual(source("https://chatgpt.com/", ""), "ChatGPT")
        self.assertEqual(source("https://gemini.google.com/app", ""), "Gemini")
        self.assertEqual(source("https://www.linkedin.com/feed/", ""), "LinkedIn")
        self.assertEqual(source("https://l.facebook.com/l.php", ""), "Facebook")
        self.assertEqual(source("", ""), "Direct / inconnu")
        self.assertEqual(source("https://zimaymoses.com/about/", ""), "Navigation interne")
        self.assertEqual(source("https://notzimaymoses.com/", ""), "notzimaymoses.com")
        self.assertEqual(source("", "utm_source=linkedin"), "LinkedIn")

    def test_people_bots_and_probes(self):
        person = classify("/about/", "", "", IPHONE)
        self.assertFalse(person["is_bot"])
        self.assertEqual((person["device"], person["browser"], person["os"]), ("Mobile", "Safari", "iOS"))
        self.assertEqual(classify("/", "", "", CHROME)["browser"], "Chrome")
        self.assertEqual(classify("/", "", "", "Mozilla/5.0 (compatible; GPTBot/1.1)")["bot_name"], "GPTBot (OpenAI)")
        self.assertEqual(classify("/", "", "", "Mozilla/5.0 (compatible; Googlebot/2.1)")["bot_name"], "Googlebot")
        self.assertTrue(classify("/", "", "", "curl/8.0")["is_bot"])
        for path in ("/admin/", "/wp-login.php", "/.env", "/phpmyadmin/", "/x.php"):
            self.assertTrue(classify(path, "", "", CHROME)["is_probe"], path)
        for path in ("/", "/about/", "/certifications/", "/robots.txt"):
            self.assertFalse(classify(path, "", "", CHROME)["is_probe"], path)
        self.assertFalse(classify("/robots.txt", "", "", CHROME)["is_page"])


def record(**overrides):
    data = {"t": "2026-10-23T10:00:00.000Z", "ip": "41.202.1.2", "country": "CI", "city": "Abidjan",
            "path": "/about/", "query": "", "ref": "https://www.google.com/", "ua": CHROME, "lang": "fr-FR"}
    data.update(overrides)
    return json.dumps(data)


class FakeUpstash:
    """In-memory stand-in for the Redis list, mimicking LRANGE / LTRIM semantics."""

    def __init__(self, items, fail_on_ltrim=False):
        self.items = list(items)  # index 0 = head (newest)
        self.fail_on_ltrim = fail_on_ltrim

    def __call__(self, *args):
        cmd = args[0]
        if cmd == "LRANGE":
            start, end = int(args[2]), int(args[3])
            n = len(self.items)
            start, end = max(n + start, 0) if start < 0 else start, n + end if end < 0 else end
            return self.items[start:end + 1]
        if cmd == "LTRIM":
            if self.fail_on_ltrim:
                raise sync_module.SyncError("network down")
            end = int(args[3])
            self.items = self.items[: len(self.items) + end + 1]
            return "OK"
        raise AssertionError(cmd)


@override_settings(UPSTASH_REDIS_REST_URL="https://u.io", UPSTASH_REDIS_REST_TOKEN="tok")
class SyncTests(TestCase):
    def test_imports_classifies_and_empties_the_list(self):
        fake = FakeUpstash([record(path="/wp-login.php"), record(ua="GPTBot/1.1"), record(), "not json"])
        with mock.patch.object(sync_module, "_command", fake):
            imported, skipped = sync_module.sync(batch_size=2)
        self.assertEqual((imported, skipped), (3, 1))
        self.assertEqual(fake.items, [])
        self.assertEqual(Visit.objects.filter(is_probe=True).count(), 1)
        self.assertEqual(Visit.objects.get(bot_name="GPTBot (OpenAI)").path, "/about/")
        human = Visit.objects.get(is_bot=False, is_probe=False)
        self.assertEqual((human.source, human.city, human.ip), ("Google", "Abidjan", "41.202.1.2"))

    def test_nothing_is_lost_if_upstash_fails_mid_sync(self):
        fake = FakeUpstash([record()], fail_on_ltrim=True)
        with mock.patch.object(sync_module, "_command", fake):
            with self.assertRaises(sync_module.SyncError):
                sync_module.sync()
        self.assertEqual(len(fake.items), 1)  # still in Upstash, will be retried

    def test_old_visits_are_purged(self):
        Visit.objects.create(timestamp=timezone.now() - timedelta(days=400), path="/")
        Visit.objects.create(timestamp=timezone.now(), path="/")
        with mock.patch.object(sync_module, "_command", FakeUpstash([])):
            sync_module.sync()
        self.assertEqual(Visit.objects.count(), 1)


class DashboardTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser("admin", "a@example.com", "pw-for-tests-only")
        self.client.force_login(self.user)
        now = timezone.now()
        Visit.objects.create(timestamp=now, ip="41.202.1.2", country="CI", city="Abidjan", path="/about/",
                             **classify("/about/", "", "https://www.linkedin.com/", CHROME))
        Visit.objects.create(timestamp=now, ip="185.1.1.1", path="/wp-login.php",
                             **classify("/wp-login.php", "", "", CHROME))

    def test_dashboard_shows_stats_sources_and_probes(self):
        response = self.client.get(reverse("admin:analytics_visit_changelist"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Comment ils t'ont trouvé")
        self.assertContains(response, "LinkedIn")
        self.assertContains(response, "/wp-login.php")
        self.assertContains(response, "41.202.1.2")
        self.assertContains(response, "Synchroniser les visites")

    @override_settings(UPSTASH_REDIS_REST_URL="", UPSTASH_REDIS_REST_TOKEN="")
    def test_sync_button_explains_missing_configuration(self):
        response = self.client.get(reverse("admin:analytics_visit_sync"), follow=True)
        self.assertContains(response, "Upstash n&#x27;est pas configuré")

    def test_visits_are_read_only(self):
        visit = Visit.objects.first()
        self.assertEqual(self.client.get(reverse("admin:analytics_visit_add")).status_code, 403)
        response = self.client.post(reverse("admin:analytics_visit_change", args=[visit.pk]), {"path": "/hacked/"})
        visit.refresh_from_db()
        self.assertNotEqual(visit.path, "/hacked/")

    def test_requires_login(self):
        self.client.logout()
        response = self.client.get(reverse("admin:analytics_visit_changelist"))
        self.assertEqual(response.status_code, 302)


class ReadOnlyTokenTests(TestCase):
    @override_settings(UPSTASH_REDIS_REST_URL="https://example.upstash.io", UPSTASH_REDIS_REST_TOKEN="ro")
    def test_read_only_token_imports_nothing(self):
        from unittest import mock

        from analytics import sync

        def fake(*args):
            if args[0] == "LTRIM":
                raise sync.SyncError("Upstash injoignable : HTTP Error 403: Forbidden")
            return ['{"t": "2026-10-28T10:00:00Z", "path": "/"}']

        with mock.patch.object(sync, "_command", side_effect=fake):
            with self.assertRaisesMessage(sync.SyncError, "lecture seule"):
                sync.sync()
        self.assertEqual(Visit.objects.count(), 0)
