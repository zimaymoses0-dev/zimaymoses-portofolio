from django.shortcuts import render

from core import profile, seo

from .models import Certification


def certification_list(request):
    certifications = list(Certification.objects.filter(is_published=True))
    # One group per category, in the order defined on the model; empty groups skipped.
    groups = [
        {"key": key, "label": label, "items": [c for c in certifications if c.category == key]}
        for key, label in Certification.CATEGORY_CHOICES
    ]
    groups = [g for g in groups if g["items"]]
    context = {
        "certifications": certifications,
        "certification_groups": groups,
        "education": profile.get_profile()["education"],
        "jsonld": [
            seo.certifications_page_jsonld(request, certifications),
            seo.breadcrumbs_jsonld(request, ("Certifications", request.path)),
        ],
    }
    return render(request, "pages/certifications.html", context)
