from django.shortcuts import render

from .models import Resource


def resource_list(request):
    resources = Resource.objects.filter(is_published=True)
    context = {
        "resources": resources,
        "books": resources.filter(resource_type="book"),
        "audiobooks": resources.filter(resource_type="audiobook"),
        "trainings": resources.filter(resource_type="training"),
    }
    return render(request, "pages/resources.html", context)
