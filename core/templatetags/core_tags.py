from django import template

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
