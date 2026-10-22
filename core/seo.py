"""
Search-engine and AI-assistant discoverability: schema.org JSON-LD, robots.txt,
llms.txt, and the XML sitemap.

Everything about the person comes from core/profile.py (career, education, skills) plus
the Certification model, so the visible About page, the JSON-LD Google reads, and the
llms.txt that AI assistants read all state the same facts.
"""

from django.conf import settings
from django.contrib.sitemaps import Sitemap
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.templatetags.static import static
from django.urls import reverse
from django.utils.translation import get_language, override
from django.views.decorators.cache import cache_page

from certifications.models import Certification
from portfolio.models import CaseStudy
from services.models import Service

from . import profile
from .models import SiteSettings


def absolute(path):
    return settings.SITE_URL.rstrip("/") + path


PERSON_ID = "/#person"
WEBSITE_ID = "/#website"


def person_jsonld(lang=None):
    """The full schema.org Person — the entity search engines and AI build a profile from."""
    lang = lang or (get_language() or "fr")[:2]
    p = profile.get_profile(lang)
    site = SiteSettings.load()

    def org(name, description=None):
        data = {"@type": "Organization", "name": name}
        if description:
            data["description"] = description
        return data

    current = [e for e in p["experience"] if not e["end"]]
    past = [e for e in p["experience"] if e["end"]]

    credentials = [education_credential_jsonld(e) for e in p["education"]]
    credentials += [credential_jsonld(cert) for cert in Certification.objects.filter(is_published=True)]

    knows_about = []
    for group in p["skills"]:
        for item in group["items"]:
            if item not in knows_about:
                knows_about.append(item)

    data = {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": absolute(PERSON_ID),
        "name": p["full_name"],
        "alternateName": p["alternate_names"],
        "givenName": profile.GIVEN_NAME,
        "additionalName": profile.ADDITIONAL_NAME,
        "familyName": profile.FAMILY_NAME,
        "jobTitle": p["job_titles"],
        "description": p["summary"],
        "url": absolute(reverse("core:home")),
        "image": absolute(static("images/og-image.png")),
        "address": {
            "@type": "PostalAddress",
            "addressLocality": p["location"]["locality"],
            "addressCountry": p["location"]["country_code"],
        },
        "homeLocation": {"@type": "Place", "name": f'{p["location"]["locality"]}, {p["location"]["country"]}'},
        "knowsLanguage": [
            {"@type": "Language", "name": lang_["name"], "alternateName": lang_["code"]}
            for lang_ in p["languages"]
        ],
        "knowsAbout": knows_about,
        "hasCredential": credentials,
        # schema.org "Role" pattern: the role object sits where the Organization would,
        # repeating the property name, so dates and job title attach to the relationship.
        "worksFor": [
            {
                "@type": "EmployeeRole",
                "roleName": e["title"],
                "startDate": e["start"],
                "description": " ".join(e["highlights"]),
                "worksFor": org(e["organization"], e["organization_description"]),
            }
            for e in current
        ],
        "alumniOf": [
            {
                "@type": "OrganizationRole",
                "roleName": e["title"],
                "startDate": e["start"],
                "endDate": e["end"],
                "description": " ".join(e["highlights"]),
                "alumniOf": org(e["organization"], e["organization_description"]),
            }
            for e in past
        ]
        + [
            {"@type": "EducationalOrganization", "name": e["school"], "address": e["location"]}
            for e in p["education"]
        ],
        "hasOccupation": [
            {
                "@type": "Occupation",
                "name": title,
                "occupationLocation": {"@type": "City", "name": p["location"]["locality"]},
                "skills": ", ".join(knows_about),
            }
            for title in p["job_titles"]
        ],
        "makesOffer": [
            {
                "@type": "Offer",
                "itemOffered": {"@type": "Service", "name": s.name, "description": s.short_description},
            }
            for s in Service.objects.filter(is_active=True)
        ],
        "sameAs": [u for u in (site.linkedin_url, site.instagram_url, site.twitter_url) if u],
    }
    if site.email:
        data["email"] = f"mailto:{site.email}"
    if site.phone:
        data["telephone"] = site.phone.replace(" ", "")
    return data


def credential_jsonld(cert):
    """One certification as a schema.org credential, with its own stable @id on the site."""
    data = {
        "@type": "EducationalOccupationalCredential",
        "@id": absolute(reverse("certifications:list")) + "#" + cert.anchor,
        "name": cert.title,
        "credentialCategory": "certificate",
        "inLanguage": "en",
    }
    if cert.display_description:
        data["description"] = cert.display_description
    if cert.issuer:
        data["recognizedBy"] = {"@type": "Organization", "name": cert.issuer}
    if cert.issue_date:
        data["dateCreated"] = cert.issue_date.isoformat()
    if cert.certificate_url:
        data["url"] = cert.certificate_url  # official verification page
    if cert.credential_id:
        data["identifier"] = cert.credential_id
    if cert.image:
        data["image"] = absolute(cert.image.url)
    if cert.display_skills:
        data["competencyRequired"] = cert.display_skills
    return data


def education_credential_jsonld(degree):
    return {
        "@type": "EducationalOccupationalCredential",
        "name": degree["degree"],
        "credentialCategory": degree["credential_category"],
        "recognizedBy": {"@type": "EducationalOrganization", "name": degree["school"], "address": degree["location"]},
        "temporalCoverage": degree["period"].replace(" — ", "/"),
    }


def certifications_page_jsonld(request, certifications):
    """Certifications page: a collection listing every degree and certificate the person holds."""
    p = profile.get_profile()
    items = [education_credential_jsonld(d) for d in p["education"]] + [
        credential_jsonld(c) for c in certifications
    ]
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "url": absolute(request.path),
        "name": f'Certifications — {p["full_name"]}',
        "inLanguage": (get_language() or "fr")[:2],
        "isPartOf": {"@id": absolute(WEBSITE_ID)},
        "about": {"@id": absolute(PERSON_ID), "@type": "Person", "name": p["full_name"]},
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": len(items),
            "itemListElement": [
                {"@type": "ListItem", "position": i, "item": item} for i, item in enumerate(items, start=1)
            ],
        },
    }


def website_jsonld():
    site = SiteSettings.load()
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": absolute(WEBSITE_ID),
        "url": absolute("/"),
        "name": site.site_name,
        "alternateName": profile.FULL_NAME,
        "inLanguage": ["fr", "en"],
        "publisher": {"@id": absolute(PERSON_ID)},
        "about": {"@id": absolute(PERSON_ID)},
    }


def profile_page_jsonld(request):
    """About page: tells Google this page *is* the person's profile (ProfilePage rich result)."""
    return {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "url": absolute(request.path),
        "inLanguage": (get_language() or "fr")[:2],
        "isPartOf": {"@id": absolute(WEBSITE_ID)},
        "mainEntity": person_jsonld(),
    }


def case_study_jsonld(request, case_study):
    data = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": case_study.display_title,
        "url": absolute(request.path),
        "description": case_study.display_short_description,
        "genre": case_study.display_category,
        "creator": {"@id": absolute(PERSON_ID), "@type": "Person", "name": profile.FULL_NAME},
        "inLanguage": (get_language() or "fr")[:2],
    }
    if case_study.client:
        data["sourceOrganization"] = {"@type": "Organization", "name": case_study.client}
    if case_study.year:
        data["dateCreated"] = str(case_study.year)
    if case_study.live_url:
        data["sameAs"] = case_study.live_url
    if case_study.hero_image:
        data["image"] = case_study.hero_image.url
    return data


def breadcrumbs_jsonld(request, *crumbs):
    """crumbs: (name, path) pairs after Home."""
    items = [("Moses Zimay", reverse("core:home"))] + list(crumbs)
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i, "name": name, "item": absolute(path)}
            for i, (name, path) in enumerate(items, start=1)
        ],
    }


# --- Plain-text endpoints --------------------------------------------------------------

# Search and AI crawlers explicitly welcomed (several AI bots only crawl when named).
AI_AND_SEARCH_BOTS = [
    "Googlebot", "Bingbot", "Google-Extended", "GPTBot", "OAI-SearchBot", "ChatGPT-User",
    "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User",
    "Applebot", "Applebot-Extended", "meta-externalagent", "CCBot", "DuckAssistBot",
]


@cache_page(60 * 60)
def robots_txt(request):
    lines = []
    for bot in AI_AND_SEARCH_BOTS + ["*"]:
        lines += [f"User-agent: {bot}", "Allow: /", "Disallow: /admin/", "Disallow: /newsletter/", ""]
    lines.append(f"Sitemap: {absolute('/sitemap.xml')}")
    return HttpResponse("\n".join(lines) + "\n", content_type="text/plain; charset=utf-8")


def _render_llms(lang, full=False):
    # Rendered inside override() so {% url %} picks the /en/ prefix and dates localize.
    with override(lang):
        return render_to_string(
            "seo/llms.txt",
            {
                "LANGUAGE_CODE": lang,
                "full": full,
                "p": profile.get_profile(lang),
                "site": SiteSettings.load(),
                "certifications": Certification.objects.filter(is_published=True),
                "case_studies": CaseStudy.objects.filter(published=True),
                "services": Service.objects.filter(is_active=True),
                "base": settings.SITE_URL.rstrip("/"),
            },
        )


@cache_page(60 * 60)
def llms_txt(request):
    """https://llmstxt.org — a Markdown briefing written for AI assistants."""
    return HttpResponse(_render_llms("en"), content_type="text/plain; charset=utf-8")


@cache_page(60 * 60)
def llms_full_txt(request):
    """Same briefing, in full detail and in both languages."""
    body = _render_llms("en", full=True) + "\n\n---\n\n" + _render_llms("fr", full=True)
    return HttpResponse(body, content_type="text/plain; charset=utf-8")


# --- Sitemap ---------------------------------------------------------------------------


class CanonicalDomainSitemap(Sitemap):
    """Always list the canonical domain, even when crawled via a *.vercel.app URL."""

    protocol = "https"
    i18n = True
    alternates = True
    x_default = True

    def get_domain(self, site=None):
        return settings.SITE_URL.split("://", 1)[-1].rstrip("/")


class StaticViewSitemap(CanonicalDomainSitemap):
    PRIORITIES = {"core:home": 1.0, "core:about": 0.9, "portfolio:list": 0.8, "certifications:list": 0.8}

    def items(self):
        return ["core:home", "core:about", "portfolio:list", "certifications:list",
                "core:process", "core:pricing", "resources:list"]

    def location(self, item):
        return reverse(item)

    def priority(self, item):
        return self.PRIORITIES.get(item, 0.6)

    changefreq = "monthly"


class CaseStudySitemap(CanonicalDomainSitemap):
    changefreq = "monthly"
    priority = 0.7

    def items(self):
        return CaseStudy.objects.filter(published=True).order_by("order")

    def location(self, obj):
        return reverse("portfolio:detail", args=[obj.slug])


SITEMAPS = {"pages": StaticViewSitemap, "work": CaseStudySitemap}
