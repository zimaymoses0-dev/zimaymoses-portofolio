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
