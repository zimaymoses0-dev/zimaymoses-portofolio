import json

from django import template
from django.utils.safestring import mark_safe

from core.models import PageContent

register = template.Library()


class EmptyContent:
    """Safe stand-in so templates never crash when a CMS block hasn't been filled in yet."""

    eyebrow = title = subtitle = body = cta_label = cta_url = ""
    image = None


@register.simple_tag
def get_content(page, section_key):
    return (
        PageContent.objects.filter(page=page, section_key=section_key).first()
        or EmptyContent()
    )


@register.simple_tag
def jsonld(data):
    """Render a dict as a schema.org <script type="application/ld+json"> block.

    <, > and & are written as JSON unicode escapes so content from Admin can never
    close the script tag early.
    """
    payload = (
        json.dumps(data, ensure_ascii=False, separators=(",", ":"))
        .replace("<", "\\u003c")
        .replace(">", "\\u003e")
        .replace("&", "\\u0026")
    )
    return mark_safe(f'<script type="application/ld+json">{payload}</script>')


@register.simple_tag
def responsive_img(image, alt="", sizes="100vw", css_class="", loading="lazy", priority=False):
    """<picture> with right-sized WebP versions and the original upload as fallback.

    `sizes` tells the browser how wide the image is drawn so it can pick the smallest
    sufficient file; `priority` marks the main above-the-fold image (LCP) to load first.
    """
    from django.utils.html import format_html

    from core.images import webp_variants

    if not image:
        return ""
    variants, dimensions = webp_variants(image)
    attrs = format_html(
        'src="{}" alt="{}"{}{} decoding="{}"{}',
        image.url,
        alt,
        format_html(' class="{}"', css_class) if css_class else "",
        format_html(' width="{}" height="{}"', *dimensions) if dimensions else "",
        "sync" if priority else "async",
        mark_safe(' fetchpriority="high"') if priority else format_html(' loading="{}"', loading),
    )
    img = format_html("<img {}>", attrs)
    if not variants:
        return img
    srcset = ", ".join(f"{url} {width}w" for url, width in variants)
    return format_html(
        '<picture><source type="image/webp" srcset="{}" sizes="{}">{}</picture>', srcset, sizes, img
    )


# Pre-filled WhatsApp messages, in the language of the page the visitor is reading, so the
# owner knows at a glance which service a contact is about and which language to answer in.
WHATSAPP_MESSAGES = {
    "fr": {
        "intro": "Bonjour Moses, je vous contacte depuis votre site zimaymoses.com.",
        "service": "Je suis intéressé(e) par votre service « {subject} »{price}. Pouvons-nous en discuter ?",
        "price": " (à partir de {price})",
        "consultation": "J'aimerais réserver une consultation « {subject} »{price}.",
        "consultation_price": " ({price})",
        "call": "J'aimerais réserver un appel avec vous.",
        "advice": "J'hésite entre plusieurs offres et j'aimerais votre conseil.",
        "contact": "J'aimerais échanger avec vous au sujet d'un projet.",
    },
    "en": {
        "intro": "Hello Moses, I'm contacting you from your website zimaymoses.com.",
        "service": "I'm interested in your “{subject}” service{price}. Can we discuss it?",
        "price": " (starting at {price})",
        "consultation": "I'd like to book a consultation: “{subject}”{price}.",
        "consultation_price": " ({price})",
        "call": "I'd like to book a call with you.",
        "advice": "I'm hesitating between several offers and would like your advice.",
        "contact": "I'd like to talk with you about a project.",
    },
}


@register.simple_tag(takes_context=True)
def whatsapp_url(context, kind="contact", subject="", price=""):
    """wa.me link with a pre-filled message: `kind` is service | consultation | call | advice | contact.

    `subject` is the service name as written in the French templates/Admin; it is shown in
    English on /en/ pages through the site's translation table.
    """
    from urllib.parse import quote

    from django.utils.translation import get_language

    from core.templatetags.i18n_extra import t

    site = context.get("site_settings")
    number = "".join(ch for ch in (getattr(site, "whatsapp", "") or "") if ch.isdigit())
    if not number:
        return getattr(site, "booking_url", "") or "#"
    texts = WHATSAPP_MESSAGES["en" if (get_language() or "").startswith("en") else "fr"]
    if kind in ("service", "consultation") and subject:
        price_template = texts["price" if kind == "service" else "consultation_price"]
        detail = texts[kind].format(subject=t(subject), price=price_template.format(price=price) if price else "")
    else:
        detail = texts.get(kind, texts["contact"])
    return f"https://wa.me/{number}?text={quote(texts['intro'] + ' ' + detail, safe='')}"


@register.simple_tag
def og_image_url(image):
    """Absolute URL of the lightweight 1200x630 JPEG preview of an uploaded image."""
    from django.conf import settings

    from core.images import og_jpeg

    url, _ = og_jpeg(image) if image else (None, None)
    return settings.SITE_URL + url if url else ""
