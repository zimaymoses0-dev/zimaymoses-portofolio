from django.test import TestCase
from django.urls import reverse

from certifications.models import Certification
from core.models import Metric, PageContent, ProcessPhase, SiteSettings
from portfolio.models import CaseStudy
from services.models import Service
from testimonials.models import Testimonial


class SiteSettingsTests(TestCase):
    def test_singleton_always_uses_pk_one(self):
        first = SiteSettings.load()
        first.site_name = "First"
        first.save()

        second = SiteSettings.load()
        second.site_name = "Second"
        second.save()

        self.assertEqual(SiteSettings.objects.count(), 1)
        self.assertEqual(SiteSettings.objects.get().site_name, "Second")


class PageContentTests(TestCase):
    def test_unique_together_page_and_section_key(self):
        PageContent.objects.create(page="home", section_key="hero", title="A")
        with self.assertRaises(Exception):
            PageContent.objects.create(page="home", section_key="hero", title="B")


class HomeViewTests(TestCase):
    def test_home_returns_200(self):
        response = self.client.get(reverse("core:home"))
        self.assertEqual(response.status_code, 200)

    def test_home_renders_published_content_only(self):
        CaseStudy.objects.create(title="Published", slug="published", published=True)
        CaseStudy.objects.create(title="Unpublished", slug="unpublished", published=False)

        response = self.client.get(reverse("core:home"))

        self.assertContains(response, "Published")
        self.assertNotContains(response, "Unpublished")

    def test_home_renders_featured_testimonials_only(self):
        Testimonial.objects.create(
            author_name="Featured Person", quote="Great work", featured=True, is_published=True
        )
        Testimonial.objects.create(
            author_name="Unfeatured Person", quote="Also good", featured=False, is_published=True
        )

        response = self.client.get(reverse("core:home"))

        self.assertContains(response, "Featured Person")
        self.assertNotContains(response, "Unfeatured Person")

    def test_home_renders_active_services_and_published_certifications(self):
        Service.objects.create(name="Active Service", slug="active-service", is_active=True)
        Service.objects.create(name="Inactive Service", slug="inactive-service", is_active=False)
        Certification.objects.create(title="Published Cert", is_published=True)
        Certification.objects.create(title="Unpublished Cert", is_published=False)

        response = self.client.get(reverse("core:home"))

        self.assertContains(response, "Active Service")
        self.assertNotContains(response, "Inactive Service")
        self.assertContains(response, "Published Cert")
        self.assertNotContains(response, "Unpublished Cert")

    def test_metrics_ordered(self):
        Metric.objects.create(value="2nd", label="Second", order=2)
        Metric.objects.create(value="1st", label="First", order=1)

        response = self.client.get(reverse("core:home"))
        content = response.content.decode()

        self.assertLess(content.index("First"), content.index("Second"))


class ProcessViewTests(TestCase):
    def test_process_returns_200(self):
        response = self.client.get(reverse("core:process"))
        self.assertEqual(response.status_code, 200)

    def test_only_active_phases_shown_in_order(self):
        ProcessPhase.objects.create(number="02", title="Second Phase", order=2, is_active=True)
        ProcessPhase.objects.create(number="01", title="First Phase", order=1, is_active=True)
        ProcessPhase.objects.create(number="03", title="Hidden Phase", order=3, is_active=False)

        response = self.client.get(reverse("core:process"))
        content = response.content.decode()

        self.assertIn("First Phase", content)
        self.assertIn("Second Phase", content)
        self.assertNotIn("Hidden Phase", content)
        self.assertLess(content.index("First Phase"), content.index("Second Phase"))

    def test_calculator_markup_present(self):
        response = self.client.get(reverse("core:process"))
        self.assertContains(response, 'data-roi-calculator')
        self.assertContains(response, 'data-roi-input="conversionRate"')
