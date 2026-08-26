import re

from django.core import signing
from django.core.signing import BadSignature, SignatureExpired
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_POST

from .models import Subscriber

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
UNSUBSCRIBE_SALT = "newsletter-unsubscribe"
UNSUBSCRIBE_TOKEN_MAX_AGE = 60 * 60 * 24 * 365  # 1 year


def make_unsubscribe_token(email):
    """Signed, tamper-proof token proving control of `email` for unsubscribe links."""
    return signing.dumps({"email": email}, salt=UNSUBSCRIBE_SALT)


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


def unsubscribe(request, token):
    try:
        data = signing.loads(token, salt=UNSUBSCRIBE_SALT, max_age=UNSUBSCRIBE_TOKEN_MAX_AGE)
    except SignatureExpired:
        return JsonResponse({"ok": False, "error": "This unsubscribe link has expired."}, status=400)
    except BadSignature:
        return JsonResponse({"ok": False, "error": "Invalid unsubscribe link."}, status=400)

    email = data.get("email", "")
    updated = Subscriber.objects.filter(email=email, is_active=True).update(
        is_active=False, unsubscribed_at=timezone.now()
    )
    return JsonResponse({"ok": bool(updated)})
