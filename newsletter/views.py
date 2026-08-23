import re

from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_POST

from .models import Subscriber

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@require_POST
def subscribe(request):
    email = (request.POST.get("email") or "").strip().lower()
    first_name = (request.POST.get("first_name") or "").strip()

    if not EMAIL_RE.match(email):
        return JsonResponse({"ok": False, "error": "Enter a valid email address."}, status=400)

    subscriber, created = Subscriber.objects.get_or_create(email=email)
    if not created and not subscriber.is_active:
        subscriber.is_active = True
        subscriber.unsubscribed_at = None
    if first_name:
        subscriber.first_name = first_name
    if not created or subscriber.unsubscribed_at:
        subscriber.save()

    return JsonResponse({"ok": True})


@require_POST
def unsubscribe(request):
    email = (request.POST.get("email") or "").strip().lower()
    updated = Subscriber.objects.filter(email=email, is_active=True).update(
        is_active=False, unsubscribed_at=timezone.now()
    )
    return JsonResponse({"ok": bool(updated)})
