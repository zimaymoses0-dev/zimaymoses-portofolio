import os

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


class SeoTests(TestCase):
    """Search-engine / AI discoverability: structured data, crawl files, language URLs."""

    def setUp(self):
        from django.core.cache import cache
        from django.utils import translation

        cache.clear()  # robots/llms views are cached
        translation.activate("fr")  # a previous /en/ request leaves English active for reverse()

    def jsonld_blocks(self, response):
        import json
        import re

        html = response.content.decode()
        return [
            json.loads(block)
            for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
        ]

    def test_home_has_person_and_website_jsonld(self):
        Certification.objects.create(title="Xero <script>", issuer="Alison")
        response = self.client.get(reverse("core:home"))
        types = [b["@type"] for b in self.jsonld_blocks(response)]
        self.assertEqual(types, ["WebSite", "Person"])
        person = self.jsonld_blocks(response)[1]
        self.assertEqual(person["name"], "Moses Zegbah Zimay")
        self.assertIn("Moses Zimay", person["alternateName"])
        self.assertIn("Xero <script>", [c["name"] for c in person["hasCredential"]])
        # Admin-entered text must not be able to break out of the script tag.
        self.assertNotIn("Xero <script>", response.content.decode())

    def test_about_is_a_profile_page_listing_every_job(self):
        response = self.client.get(reverse("core:about"))
        profile_page = self.jsonld_blocks(response)[0]
        self.assertEqual(profile_page["@type"], "ProfilePage")
        self.assertEqual(profile_page["mainEntity"]["@type"], "Person")
        self.assertContains(response, "Organisation Interafricaine du Café")
        self.assertContains(response, "Children&#x27;s Fruit")
        self.assertContains(response, "Groupe CEFIAT Plateau")

    def test_english_pages_have_their_own_urls_and_hreflang(self):
        response = self.client.get("/en/about/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<html lang="en">')
        self.assertContains(response, "Inter-African Coffee Organization (IACO)")
        self.assertContains(response, 'hreflang="fr" href="https://zimaymoses.com/about/"')
        self.assertContains(response, 'rel="canonical" href="https://zimaymoses.com/en/about/"')

    def test_language_switch_goes_back_to_unprefixed_french(self):
        response = self.client.post("/i18n/setlang/", {"language": "fr", "next": "/about/"})
        self.assertEqual(response["Location"], "/about/")
        response = self.client.post("/i18n/setlang/", {"language": "en", "next": "/en/about/"})
        self.assertEqual(response["Location"], "/en/about/")

    def test_robots_welcomes_ai_crawlers_and_points_to_sitemap(self):
        body = self.client.get("/robots.txt").content.decode()
        for bot in ("GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"):
            self.assertIn(f"User-agent: {bot}", body)
        self.assertIn("Sitemap: https://zimaymoses.com/sitemap.xml", body)

    def test_llms_txt_describes_the_person(self):
        body = self.client.get("/llms.txt").content.decode()
        self.assertTrue(body.startswith("# Moses Zegbah Zimay"))
        self.assertIn("Inter-African Coffee Organization", body)
        full = self.client.get("/llms-full.txt").content.decode()
        self.assertIn("Expérience professionnelle", full)

    def test_sitemap_lists_both_languages_on_canonical_domain(self):
        CaseStudy.objects.create(title="Visible", slug="visible", published=True)
        CaseStudy.objects.create(title="Hidden", slug="hidden", published=False)
        body = self.client.get("/sitemap.xml").content.decode()
        self.assertIn("<loc>https://zimaymoses.com/en/about/</loc>", body)
        self.assertIn("https://zimaymoses.com/work/visible/", body)
        self.assertNotIn("hidden", body)


class BuildStaticTests(TestCase):
    def test_exports_every_page_in_both_languages(self):
        import shutil

        from django.conf import settings
        from django.core.management import call_command

        CaseStudy.objects.create(title="Visible", slug="visible", published=True)
        out = settings.BASE_DIR / "public-test-build"
        try:
            call_command("build_static", output=str(out), stdout=open(os.devnull, "w"))
            for path in ("index.html", "en/index.html", "about/index.html", "en/about/index.html",
                         "work/visible/index.html", "en/work/visible/index.html", "404.html",
                         "robots.txt", "llms.txt", "sitemap.xml", "static/css/base.css"):
                self.assertTrue((out / path).is_file(), path)
            self.assertFalse((out / "static" / "admin").exists())
            # Search-engine ownership files from site_root/ are published at the root.
            self.assertTrue((out / "google83c9d79746db2dc0.html").is_file())
            self.assertTrue((out / "BingSiteAuth.xml").is_file())
            # Static pages must not contain forms that need a server to post to.
            self.assertNotIn("csrfmiddlewaretoken", (out / "index.html").read_text(encoding="utf-8"))
        finally:
            shutil.rmtree(out, ignore_errors=True)


class CertificationsPageTests(TestCase):
    def setUp(self):
        from django.utils import translation

        translation.activate("fr")  # a previous /en/ request leaves English active for reverse()
        self.cert = Certification.objects.create(
            title="Xero Accounting", issuer="Alison", category="finance",
            description="Un cours sur Xero.", description_en="A course on Xero.",
            skills_highlight="Rapprochement bancaire", skills_highlight_en="Bank reconciliation",
            certificate_url="https://example.com/verify/123", credential_id="123",
        )
        Certification.objects.create(title="Hidden", category="cyber", is_published=False)

    def jsonld(self, response):
        import json
        import re

        return [json.loads(b) for b in re.findall(
            r'<script type="application/ld\+json">(.*?)</script>', response.content.decode(), re.S)]

    def test_groups_degrees_and_details_render(self):
        response = self.client.get(reverse("certifications:list"))
        self.assertContains(response, 'id="finance"')
        self.assertNotContains(response, 'id="cyber"')  # only unpublished there: group hidden
        self.assertContains(response, "Groupe CEFIAT Plateau")  # degrees section
        self.assertContains(response, "Alison")
        self.assertContains(response, f'id="{self.cert.anchor}"')
        self.assertContains(response, "Vérifier le certificat")

    def test_english_page_uses_english_texts(self):
        response = self.client.get("/en/certifications/")
        self.assertContains(response, "A course on Xero.")
        self.assertContains(response, "Bank reconciliation")
        self.assertNotContains(response, "Un cours sur Xero.")

    def test_collection_jsonld_lists_degrees_and_certificates(self):
        page = self.jsonld(self.client.get(reverse("certifications:list")))[0]
        self.assertEqual(page["@type"], "CollectionPage")
        items = [e["item"] for e in page["mainEntity"]["itemListElement"]]
        self.assertEqual(page["mainEntity"]["numberOfItems"], len(items))
        names = [i["name"] for i in items]
        self.assertIn("Xero Accounting", names)
        self.assertNotIn("Hidden", names)
        xero = items[names.index("Xero Accounting")]
        self.assertEqual(xero["url"], "https://example.com/verify/123")
        self.assertEqual(xero["identifier"], "123")
        self.assertTrue(xero["@id"].endswith(f"/certifications/#{self.cert.anchor}"))


class EnglishProjectPagesTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        from django.utils import translation

        cache.clear()
        translation.activate("fr")
        CaseStudy.objects.create(
            title="Boutique Mimo", title_en="Mimo store", slug="mimo", published=True,
            short_description="Une boutique.", short_description_en="A store.",
        )
        Certification.objects.create(title="Xero Accounting", issuer="Alison")

    def test_english_project_page_is_not_a_duplicate_of_the_french_one(self):
        fr = self.client.get("/work/mimo/").content.decode()
        en = self.client.get("/en/work/mimo/").content.decode()
        self.assertIn("<title>Boutique Mimo", fr)
        self.assertIn("<title>Mimo store", en)
        self.assertIn("A store.", en)
        self.assertNotIn("Une boutique.", en)

    def test_llms_txt_names_every_certification_and_project(self):
        body = self.client.get("/llms-full.txt").content.decode()
        self.assertIn("- Xero Accounting — Alison", body)
        self.assertIn("[Mimo store](", body)
        self.assertIn("[Boutique Mimo](", body)


class PrivacyPageTests(TestCase):
    def setUp(self):
        from django.utils import translation

        translation.activate("fr")

    def test_privacy_policy_in_both_languages_linked_and_in_sitemap(self):
        fr = self.client.get("/confidentialite/")
        en = self.client.get("/en/confidentialite/")
        self.assertContains(fr, "adresse IP")
        self.assertContains(fr, "12 mois")
        self.assertContains(en, "Privacy policy")
        self.assertContains(self.client.get("/"), 'href="/confidentialite/"')
        self.assertContains(self.client.get("/sitemap.xml"), "https://zimaymoses.com/confidentialite/")

    def test_legal_notice_names_publisher_and_host_and_is_linked(self):
        fr = self.client.get("/mentions-legales/")
        self.assertContains(fr, "Moses Zegbah Zimay")
        self.assertContains(fr, "Vercel Inc.")
        self.assertContains(fr, "Propriété intellectuelle")
        self.assertContains(self.client.get("/en/mentions-legales/"), "Terms of use")
        self.assertContains(self.client.get("/"), 'href="/mentions-legales/"')
        self.assertContains(self.client.get("/sitemap.xml"), "https://zimaymoses.com/mentions-legales/")


class YouTubeChannelTests(TestCase):
    def test_channel_linked_in_footer_jsonld_and_llms(self):
        import json
        import re

        from django.core.cache import cache
        from django.utils import translation

        translation.activate("fr")
        cache.clear()
        site = SiteSettings.load()
        site.youtube_url = "https://www.youtube.com/@ZAcademie"
        site.save()
        html = self.client.get("/").content.decode()
        self.assertIn('href="https://www.youtube.com/@ZAcademie" rel="me noopener">YouTube</a>', html)
        person = [json.loads(b) for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)][1]
        self.assertIn("https://www.youtube.com/@ZAcademie", person["sameAs"])
        self.assertIn("https://www.youtube.com/@ZAcademie", self.client.get("/llms.txt").content.decode())


class HeaderHomeLinkTests(TestCase):
    def test_name_in_header_links_to_home_in_each_language(self):
        from django.utils import translation

        translation.activate("fr")
        self.assertContains(self.client.get("/about/"), 'class="header-home" href="/"')
        self.assertContains(self.client.get("/en/about/"), 'class="header-home" href="/en/"')


class LanguageConsistencyTests(TestCase):
    def test_detector_flags_wrong_language_and_respects_exceptions(self):
        from core.lang_check import check_page

        en_page = '<html><body><p>Je suis assistant comptable et je construis des outils pour les équipes.</p></body></html>'
        self.assertEqual(len(check_page(en_page, "en")), 1)
        fr_page = '<html><body><p>I build web tools for the teams that keep the books.</p></body></html>'
        self.assertEqual(len(check_page(fr_page, "fr")), 1)
        # Certificate titles keep their original language; links written in another language
        # on purpose (lang attribute) and quoted titles are fine.
        ok = ('<article class="card certification-card"><h3>Executive Diploma in Finance Management</h3></article>'
              '<a lang="fr" aria-label="Passer en français pour lire la page">FR</a>'
              '<img alt="Cover of the book « Les 90 jours qui changent tout pour toi »">')
        self.assertEqual(check_page(ok, "en"), [])

    def test_english_about_page_has_no_french_story(self):
        from django.utils import translation

        translation.activate("fr")
        PageContent.objects.create(page="about", section_key="story", body="Je suis Assistant Comptable à l'Organisation Interafricaine du Café — rapprochements bancaires, préparation des audits, clôture des comptes. Sept ans de ce travail m'ont appris une chose qui est restée : les chiffres n'ont de sens que si le processus derrière eux est irréprochable.\n\nEn parallèle, je construis des applications web full-stack et j'automatise les systèmes sur lesquels tournent les petites entreprises — sites web, boutiques WordPress et Shopify, tableaux de bord financiers. Deux disciplines, une seule exigence : rien ne sort tant que ce n'est pas juste.")
        en = self.client.get("/en/about/").content.decode()
        self.assertIn("Seven years of this work", en)
        self.assertNotIn("Sept ans de ce travail", en)


class WhatsAppMessageTests(TestCase):
    """Every contact button opens WhatsApp with a message naming the service, in the page's language."""

    def setUp(self):
        from django.utils import translation

        translation.activate("fr")
        site = SiteSettings.load()
        site.whatsapp = "2250544822043"
        site.save()
        Service.objects.create(name="Préparation d'audit & pièces justificatives", slug="audit", is_active=True,
                               cta_label="En savoir plus", cta_url="https://wa.me/2250544822043?text=Hi")

    def messages(self, url):
        import html
        import re
        from urllib.parse import parse_qs, urlsplit

        page = self.client.get(url).content.decode()
        return [parse_qs(urlsplit(html.unescape(h)).query)["text"][0]
                for h in re.findall(r'href="(https://wa\.me/[^"]+)"', page)]

    def test_service_button_names_the_service_in_french(self):
        msgs = self.messages("/")
        self.assertTrue(all(m.startswith("Bonjour Moses, je vous contacte depuis votre site zimaymoses.com.") for m in msgs))
        self.assertIn("Je suis intéressé(e) par votre service « Préparation d'audit & pièces justificatives ». "
                      "Pouvons-nous en discuter ?", " ".join(msgs))

    def test_english_page_sends_english_message_with_translated_service(self):
        msgs = " ".join(self.messages("/en/"))
        self.assertIn("Hello Moses, I'm contacting you from your website zimaymoses.com.", msgs)
        self.assertIn("“Audit Preparation & Supporting Evidence” service", msgs)
        self.assertNotIn("Bonjour", msgs)

    def test_pricing_offers_include_name_and_price(self):
        msgs = " ".join(self.messages("/pricing/"))
        self.assertIn("« Boutiques Shopify » (à partir de 750 000 FCFA)", msgs)
        self.assertIn("J'hésite entre plusieurs offres", msgs)
        en = " ".join(self.messages("/en/pricing/"))
        self.assertIn("“Showcase & organizational websites” service (starting at 350 000 FCFA)", en)
