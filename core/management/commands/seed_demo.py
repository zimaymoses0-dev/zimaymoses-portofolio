from django.core.management.base import BaseCommand

from certifications.models import Certification
from core.models import Metric, PageContent, ProcessPhase, SiteSettings
from portfolio.models import CaseStudy, CaseStudySection
from services.models import Service
from testimonials.models import Testimonial, VideoTestimonial

DEMO_TAG = "[DEMO]"


class Command(BaseCommand):
    help = "Populate the database with clearly-marked DEMO content so every section has something to render."

    def handle(self, *args, **options):
        self.seed_site_settings()
        self.seed_metrics()
        self.seed_process_phases()
        self.seed_page_content()
        self.seed_services()
        self.seed_case_studies()
        self.seed_testimonials()
        self.seed_video_testimonials()
        self.seed_certifications()
        self.stdout.write(self.style.SUCCESS("Demo data seeded. Replace it via /admin/ before going live."))

    def seed_site_settings(self):
        settings_obj = SiteSettings.load()
        settings_obj.site_name = settings_obj.site_name or f"{DEMO_TAG} Studio"
        settings_obj.owner_name = settings_obj.owner_name or "Demo Owner"
        settings_obj.headline = settings_obj.headline or "Working remotely with founders worldwide."
        settings_obj.subheadline = (
            settings_obj.subheadline
            or f"{DEMO_TAG} Placeholder subheadline — replace from Django Admin."
        )
        settings_obj.email = settings_obj.email or "hello@example.com"
        settings_obj.location = settings_obj.location or "Remote"
        settings_obj.available = True
        settings_obj.availability_text = settings_obj.availability_text or "Available for new projects"
        settings_obj.booking_url = settings_obj.booking_url or "#"
        settings_obj.copyright_text = settings_obj.copyright_text or f"{DEMO_TAG} © 2026"
        settings_obj.footer_description = (
            settings_obj.footer_description or f"{DEMO_TAG} Replace this footer description from Admin."
        )
        settings_obj.save()

    def seed_metrics(self):
        if Metric.objects.exists():
            return
        Metric.objects.bulk_create(
            [
                Metric(value="+00%", label=f"{DEMO_TAG} YoY revenue", order=0),
                Metric(value="00", label=f"{DEMO_TAG} Years of experience", order=1),
                Metric(value="$00", label=f"{DEMO_TAG} Brand value managed", order=2),
            ]
        )

    def seed_process_phases(self):
        if ProcessPhase.objects.exists():
            return
        phases = [
            ("01", "Week 1-2", "Deep Research", "Understand the problem, analyze the data, find where users drop off."),
            ("02", "Week 2-3", "Strategic Insights", "Turn research into prioritized hypotheses worth testing."),
            ("03", "Week 3-5", "Design Prototypes", "Wireframes, UI, and a working prototype grounded in the system."),
            ("04", "Week 5-6", "Testing & Validation", "Test with real users, observe, analyze, iterate."),
            ("05", "Ongoing", "Evaluation & Improvement", "Measure what shipped, learn from it, and keep optimizing."),
        ]
        for i, (number, week, title, description) in enumerate(phases):
            ProcessPhase.objects.create(
                number=number,
                week_label=week,
                title=title,
                description=f"{DEMO_TAG} {description}",
                ai_in_action=f"{DEMO_TAG} Placeholder — replace from Admin.",
                what_you_get=f"{DEMO_TAG} Placeholder — replace from Admin.",
                order=i,
            )

    def seed_page_content(self):
        blocks = [
            ("home", "hero", "Users leave.", f"{DEMO_TAG} I design the reasons they stay.", "See how I help"),
            ("home", "how-i-help", "How I help", f"{DEMO_TAG} Fixed-scope services, built for founders.", ""),
            ("home", "behavior", "Behavior", "Screens are easy. Behavior is hard.", ""),
            ("home", "case-studies", "Selected work", f"{DEMO_TAG} The work moves numbers, not just pixels.", ""),
            ("home", "cta", "", f"{DEMO_TAG} Want to see what I can do with it?", ""),
            ("process", "hero", "", "No guesswork.", ""),
            ("process", "can-they", "", "Can they?", ""),
            ("process", "will-they", "", "Will they?", ""),
        ]
        body_by_key = {
            "can-they": f"{DEMO_TAG} Usability friction — can people actually use what you built?",
            "will-they": f"{DEMO_TAG} Emotional friction — do people trust it enough to act?",
        }
        for page, key, eyebrow, title, cta_label in blocks:
            PageContent.objects.get_or_create(
                page=page,
                section_key=key,
                defaults={
                    "eyebrow": eyebrow,
                    "title": title,
                    "subtitle": "" if page != "home" or key != "hero" else f"{DEMO_TAG} Short subheadline about expertise and results.",
                    "body": body_by_key.get(key, ""),
                    "cta_label": cta_label,
                },
            )

    def seed_services(self):
        if Service.objects.exists():
            return
        Service.objects.bulk_create(
            [
                Service(
                    name=f"{DEMO_TAG} Product Design Sprint",
                    slug="product-design-sprint",
                    short_description="Fixed-scope end-to-end product design.",
                    price=0,
                    currency="USD",
                    duration="4-6 weeks",
                    order=0,
                ),
                Service(
                    name=f"{DEMO_TAG} Design System Audit",
                    slug="design-system-audit",
                    short_description="A structured review of your design system.",
                    price=0,
                    currency="USD",
                    duration="3-4 weeks",
                    badge="MOST POPULAR",
                    order=1,
                ),
                Service(
                    name=f"{DEMO_TAG} Conversion-Focused UX Review",
                    slug="conversion-ux-review",
                    short_description="Behavioral optimization for the buying journey.",
                    price=0,
                    currency="USD",
                    duration="3-4 weeks",
                    order=2,
                ),
            ]
        )

    def seed_case_studies(self):
        if CaseStudy.objects.exists():
            return
        for i in range(1, 5):
            case_study = CaseStudy.objects.create(
                title=f"{DEMO_TAG} Case Study {i}",
                slug=f"demo-case-study-{i}",
                client=f"Demo Client {i}",
                category="Product Design",
                year=2026,
                short_description="Placeholder case study — replace from Admin.",
                challenge=f"{DEMO_TAG} Placeholder problem statement — replace from Admin.",
                strategy=f"{DEMO_TAG} Placeholder strategy — replace from Admin.",
                solution=f"{DEMO_TAG} Placeholder solution — replace from Admin.",
                outcome=f"{DEMO_TAG} Placeholder outcome — replace from Admin.",
                primary_metric="+00% metric",
                secondary_metric="00% secondary metric",
                featured=(i == 1),
                order=i,
            )
            CaseStudySection.objects.create(
                case_study=case_study,
                title="Context",
                content=f"{DEMO_TAG} Placeholder context section — replace from Admin.",
                order=0,
            )
            CaseStudySection.objects.create(
                case_study=case_study,
                title="Key insights",
                content=f"{DEMO_TAG} Placeholder insights section — replace from Admin.",
                order=1,
            )

    def seed_testimonials(self):
        if Testimonial.objects.exists():
            return
        first_case_study = CaseStudy.objects.order_by("order").first()
        for i in range(1, 4):
            Testimonial.objects.create(
                author_name=f"Demo Founder {i}",
                role="Founder",
                company=f"Demo Co {i}",
                country="Remote",
                quote=f"{DEMO_TAG} Placeholder testimonial quote — replace from Admin.",
                metric="+00% result",
                rating=5.0,
                featured=True,
                case_study=first_case_study if i == 1 else None,
                order=i,
            )

    def seed_video_testimonials(self):
        if VideoTestimonial.objects.exists():
            return
        for i in range(1, 3):
            VideoTestimonial.objects.create(
                name=f"Demo Founder {i}",
                company=f"Demo Co {i}",
                video_url="about:blank",
                order=i,
            )

    def seed_certifications(self):
        if Certification.objects.exists():
            return
        for i in range(1, 5):
            Certification.objects.create(
                title=f"{DEMO_TAG} Certification {i}",
                issuer="Demo Institute",
                subtitle="Placeholder credential — replace from Admin.",
                certificate_url="https://example.com/demo-certificate",
                dark_card=(i % 2 == 0),
                order=i,
            )
