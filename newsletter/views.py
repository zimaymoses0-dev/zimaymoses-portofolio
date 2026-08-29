import re

from django.conf import settings
from django.core import signing
from django.core.cache import cache
from django.core.mail import send_mail
from django.core.signing import BadSignature, SignatureExpired
from django.http import JsonResponse
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.http import require_POST

from .models import Subscriber

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
UNSUBSCRIBE_SALT = "newsletter-unsubscribe"
UNSUBSCRIBE_TOKEN_MAX_AGE = 60 * 60 * 24 * 365  # 1 year
CONFIRM_SALT = "newsletter-confirm"
CONFIRM_TOKEN_MAX_AGE = 60 * 60 * 24 * 3  # 3 days

# Unauthenticated endpoint accepting an arbitrary email address: without a cap, it's a
# free tool for mail-bombing a third party's inbox with confirmation emails.
SUBSCRIBE_RATE_LIMIT = 5
SUBSCRIBE_RATE_WINDOW = 60 * 60  # 1 hour


def _client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def make_unsubscribe_token(email):
    """Signed, tamper-proof token proving control of `email` for unsubscribe links."""
    return signing.dumps({"email": email}, salt=UNSUBSCRIBE_SALT)


def make_confirm_token(email):
    """Signed, tamper-proof token proving control of `email` for the double opt-in link."""
    return signing.dumps({"email": email}, salt=CONFIRM_SALT)


def send_confirmation_email(request, email):
    token = make_confirm_token(email)
    confirm_url = request.build_absolute_uri(reverse("newsletter:confirm", args=[token]))
    send_mail(
        subject="Confirme ton inscription",
        message=(
            "Merci de vouloir suivre les prochains projets et disponibilités.\n\n"
            f"Confirme ton adresse en cliquant ici : {confirm_url}\n\n"
            "Si tu n'es pas à l'origine de cette inscription, ignore simplement cet email."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=True,
    )


@require_POST
def subscribe(request):
    cache_key = f"newsletter-subscribe-rate:{_client_ip(request)}"
    attempts = cache.get(cache_key, 0)
    if attempts >= SUBSCRIBE_RATE_LIMIT:
        return JsonResponse(
            {"ok": False, "error": "Too many attempts. Please try again later."}, status=429
        )
    cache.set(cache_key, attempts + 1, SUBSCRIBE_RATE_WINDOW)

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

    if not subscriber.is_confirmed:
        send_confirmation_email(request, email)

    return JsonResponse({"ok": True})


def confirm(request, token):
    try:
        data = signing.loads(token, salt=CONFIRM_SALT, max_age=CONFIRM_TOKEN_MAX_AGE)
    except SignatureExpired:
        return JsonResponse({"ok": False, "error": "This confirmation link has expired."}, status=400)
    except BadSignature:
        return JsonResponse({"ok": False, "error": "Invalid confirmation link."}, status=400)

    email = data.get("email", "")
    updated = Subscriber.objects.filter(email=email, is_active=True).update(
        is_confirmed=True, confirmed_at=timezone.now()
    )
    return JsonResponse({"ok": bool(updated)})


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
