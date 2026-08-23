from django.shortcuts import render

from certifications.models import Certification
from portfolio.models import CaseStudy
from services.models import Service
from testimonials.models import Testimonial, VideoTestimonial

from .models import Metric, ProcessPhase


def home(request):
    context = {
        "metrics": Metric.objects.filter(is_active=True),
        "services": Service.objects.filter(is_active=True),
        "case_studies": CaseStudy.objects.filter(published=True).order_by("order")[:4],
        "testimonials": Testimonial.objects.filter(is_published=True, featured=True)[:3],
        "video_testimonials": VideoTestimonial.objects.filter(is_published=True),
        "certifications": Certification.objects.filter(is_published=True),
    }
    return render(request, "pages/home.html", context)


def process(request):
    context = {
        "metrics": Metric.objects.filter(is_active=True),
        "phases": ProcessPhase.objects.filter(is_active=True),
        "calculator_services": Service.objects.filter(is_active=True),
    }
    return render(request, "pages/process.html", context)


def about(request):
    context = {
        "metrics": Metric.objects.filter(is_active=True),
        "certifications": Certification.objects.filter(is_published=True),
    }
    return render(request, "pages/about.html", context)
