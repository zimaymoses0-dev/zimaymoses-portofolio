from django.shortcuts import get_object_or_404, render

from .models import CaseStudy


def work_list(request):
    case_studies = CaseStudy.objects.filter(published=True)
    context = {
        "case_studies": case_studies,
        "featured_case_studies": case_studies.filter(featured=True),
    }
    return render(request, "pages/work.html", context)


def work_detail(request, slug):
    case_study = get_object_or_404(CaseStudy, slug=slug, published=True)
    published_qs = CaseStudy.objects.filter(published=True)

    next_case_study = published_qs.filter(order__gt=case_study.order).first()
    if next_case_study is None:
        next_case_study = published_qs.exclude(pk=case_study.pk).first()

    context = {
        "case_study": case_study,
        "sections": case_study.sections.all(),
        "testimonial": case_study.testimonials.filter(is_published=True).first(),
        "next_case_study": next_case_study,
    }
    return render(request, "pages/work_detail.html", context)
