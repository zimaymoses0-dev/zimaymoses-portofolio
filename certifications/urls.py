from django.urls import path

from . import views

app_name = "certifications"

urlpatterns = [
    path("", views.certification_list, name="list"),
]
