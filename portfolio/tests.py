from django.test import TestCase
from django.urls import reverse

from .models import CaseStudy, CaseStudySection


class WorkListViewTests(TestCase):
    def test_returns_200(self):
        response = self.client.get(reverse("portfolio:list"))
        self.assertEqual(response.status_code, 200)

    def test_only_published_case_studies_shown(self):
        CaseStudy.objects.create(title="Published One", slug="published-one", published=True)
        CaseStudy.objects.create(title="Hidden One", slug="hidden-one", published=False)

        response = self.client.get(reverse("portfolio:list"))

        self.assertContains(response, "Published One")
        self.assertNotContains(response, "Hidden One")


class WorkDetailViewTests(TestCase):
    def test_published_case_study_returns_200(self):
        CaseStudy.objects.create(title="Visible", slug="visible", published=True)

        response = self.client.get(reverse("portfolio:detail", args=["visible"]))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Visible")

    def test_unpublished_case_study_returns_404(self):
        CaseStudy.objects.create(title="Hidden", slug="hidden", published=False)

        response = self.client.get(reverse("portfolio:detail", args=["hidden"]))

        self.assertEqual(response.status_code, 404)

    def test_nonexistent_slug_returns_404(self):
        response = self.client.get(reverse("portfolio:detail", args=["does-not-exist"]))
        self.assertEqual(response.status_code, 404)

    def test_sections_render_in_order(self):
        case_study = CaseStudy.objects.create(title="Ordered", slug="ordered", published=True)
        CaseStudySection.objects.create(case_study=case_study, title="Second Block", order=1)
        CaseStudySection.objects.create(case_study=case_study, title="First Block", order=0)

        response = self.client.get(reverse("portfolio:detail", args=["ordered"]))
        content = response.content.decode()

        self.assertLess(content.index("First Block"), content.index("Second Block"))

    def test_next_case_study_links_to_next_published_by_order(self):
        CaseStudy.objects.create(title="Alpha", slug="alpha", published=True, order=0)
        CaseStudy.objects.create(title="Beta", slug="beta", published=True, order=1)

        response = self.client.get(reverse("portfolio:detail", args=["alpha"]))

        self.assertContains(response, "Beta")

    def test_next_case_study_wraps_around_when_last(self):
        CaseStudy.objects.create(title="Alpha", slug="alpha", published=True, order=0)
        CaseStudy.objects.create(title="Beta", slug="beta", published=True, order=1)

        response = self.client.get(reverse("portfolio:detail", args=["beta"]))

        self.assertContains(response, "Alpha")
