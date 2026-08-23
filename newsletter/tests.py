from django.test import TestCase
from django.urls import reverse

from .models import Subscriber


class NewsletterSubscribeTests(TestCase):
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
