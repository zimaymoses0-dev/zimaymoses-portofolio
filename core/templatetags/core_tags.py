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
