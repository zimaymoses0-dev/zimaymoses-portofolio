from django.core import signing
from django.core.cache import cache
from django.test import TestCase
from django.urls import reverse

from django.core import mail

from .models import Subscriber
from .views import make_confirm_token, make_unsubscribe_token


class NewsletterSubscribeTests(TestCase):
    def setUp(self):
        # subscribe() is rate-limited per IP; without this, tests share Django's
        # test-client IP and trip each other's counters across test methods.
        cache.clear()

    def test_valid_email_creates_subscriber(self):
        response = self.client.post(reverse("newsletter:subscribe"), {"email": "person@example.com"})

        self.assertEqual(response.status_code, 200)
        self.assertTrue(Subscriber.objects.filter(email="person@example.com").exists())

    def test_invalid_email_rejected(self):
        response = self.client.post(reverse("newsletter:subscribe"), {"email": "not-an-email"})

        self.assertEqual(response.status_code, 400)
        self.assertFalse(Subscriber.objects.exists())

    def test_duplicate_email_does_not_create_second_row(self):
        Subscriber.objects.create(email="person@example.com")

        response = self.client.post(reverse("newsletter:subscribe"), {"email": "person@example.com"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Subscriber.objects.filter(email="person@example.com").count(), 1)

    def test_get_not_allowed(self):
        response = self.client.get(reverse("newsletter:subscribe"))
        self.assertEqual(response.status_code, 405)

    def test_resubscribe_reactivates_existing_subscriber(self):
        Subscriber.objects.create(email="person@example.com", is_active=False)

        self.client.post(reverse("newsletter:subscribe"), {"email": "person@example.com"})

        subscriber = Subscriber.objects.get(email="person@example.com")
        self.assertTrue(subscriber.is_active)

    def test_new_subscriber_is_not_confirmed_until_they_click_the_email_link(self):
        self.client.post(reverse("newsletter:subscribe"), {"email": "person@example.com"})

        subscriber = Subscriber.objects.get(email="person@example.com")
        self.assertFalse(subscriber.is_confirmed)

    def test_subscribing_sends_a_confirmation_email(self):
        self.client.post(reverse("newsletter:subscribe"), {"email": "person@example.com"})

        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("person@example.com", mail.outbox[0].to)

    def test_repeated_requests_from_same_ip_are_rate_limited(self):
        for _ in range(5):
            response = self.client.post(
                reverse("newsletter:subscribe"), {"email": "person@example.com"}
            )
            self.assertEqual(response.status_code, 200)

        response = self.client.post(reverse("newsletter:subscribe"), {"email": "victim@example.com"})

        self.assertEqual(response.status_code, 429)
        self.assertFalse(Subscriber.objects.filter(email="victim@example.com").exists())


class NewsletterConfirmTests(TestCase):
    def test_valid_token_confirms_subscriber(self):
        Subscriber.objects.create(email="person@example.com", is_active=True)
        token = make_confirm_token("person@example.com")

        response = self.client.get(reverse("newsletter:confirm", args=[token]))

        self.assertEqual(response.status_code, 200)
        subscriber = Subscriber.objects.get(email="person@example.com")
        self.assertTrue(subscriber.is_confirmed)
        self.assertIsNotNone(subscriber.confirmed_at)

    def test_tampered_confirm_token_rejected(self):
        Subscriber.objects.create(email="person@example.com", is_active=True)
        token = make_confirm_token("person@example.com")
        tampered = token[:-1] + ("a" if token[-1] != "a" else "b")

        response = self.client.get(reverse("newsletter:confirm", args=[tampered]))

        self.assertEqual(response.status_code, 400)
        self.assertFalse(Subscriber.objects.get(email="person@example.com").is_confirmed)


class NewsletterUnsubscribeTests(TestCase):
    def test_valid_token_unsubscribes(self):
        Subscriber.objects.create(email="person@example.com", is_active=True)
        token = make_unsubscribe_token("person@example.com")

        response = self.client.get(reverse("newsletter:unsubscribe", args=[token]))

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, {"ok": True})
        self.assertFalse(Subscriber.objects.get(email="person@example.com").is_active)

    def test_tampered_token_rejected(self):
        Subscriber.objects.create(email="victim@example.com", is_active=True)
        token = make_unsubscribe_token("someone-else@example.com")
        tampered = token[:-1] + ("a" if token[-1] != "a" else "b")

        response = self.client.get(reverse("newsletter:unsubscribe", args=[tampered]))

        self.assertEqual(response.status_code, 400)
        self.assertTrue(Subscriber.objects.get(email="victim@example.com").is_active)

    def test_token_for_one_email_cannot_unsubscribe_another(self):
        Subscriber.objects.create(email="victim@example.com", is_active=True)
        token = signing.dumps({"email": "victim@example.com"}, salt="wrong-salt")

        response = self.client.get(reverse("newsletter:unsubscribe", args=[token]))

        self.assertEqual(response.status_code, 400)
        self.assertTrue(Subscriber.objects.get(email="victim@example.com").is_active)

    def test_unrelated_subscriber_untouched(self):
        Subscriber.objects.create(email="person@example.com", is_active=True)
        Subscriber.objects.create(email="other@example.com", is_active=True)
        token = make_unsubscribe_token("person@example.com")

        self.client.get(reverse("newsletter:unsubscribe", args=[token]))

        self.assertTrue(Subscriber.objects.get(email="other@example.com").is_active)
