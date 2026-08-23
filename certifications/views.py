from django.shortcuts import render

from .models import Certification


def certification_list(request):
    context = {
        "certifications": Certification.objects.filter(is_published=True),
    }
    return render(request, "pages/certifications.html", context)
