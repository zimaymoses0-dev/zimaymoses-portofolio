"""Shared upload validators: size caps and real content-type checks.

Used on FileField/ImageField uploads that aren't already protected by
Django's built-in ImageField validation (which uses Pillow to confirm the
upload is a genuine image). These are for FileField uploads like the CV
PDF or a resource's downloadable sample, where any file type would
otherwise be accepted.
"""

from django.core.exceptions import ValidationError
from django.template.defaultfilters import filesizeformat
from django.utils.deconstruct import deconstructible


@deconstructible
class MaxFileSizeValidator:
    """Class-based (not a closure) so it can be serialized into migrations."""

    def __init__(self, max_mb):
        self.max_mb = max_mb

    def __call__(self, file):
        max_bytes = self.max_mb * 1024 * 1024
        if file.size > max_bytes:
            raise ValidationError(
                f"File too large ({filesizeformat(file.size)}). Max size is {self.max_mb} MB."
            )

    def __eq__(self, other):
        return isinstance(other, MaxFileSizeValidator) and self.max_mb == other.max_mb


def validate_pdf_content(file):
    """Reject anything that isn't actually a PDF, regardless of its extension."""
    head = file.read(5)
    file.seek(0)
    if head != b"%PDF-":
        raise ValidationError("This file isn't a valid PDF.")


# Executable/script extensions we never want accepted as a "sample" or "CV" upload,
# even though the field otherwise allows a range of document/audio types.
DANGEROUS_EXTENSIONS = {
    "exe", "bat", "cmd", "sh", "php", "phtml", "asp", "aspx", "jsp",
    "js", "jar", "com", "scr", "msi", "ps1", "vbs", "html", "htm", "svg",
}


def validate_safe_extension(file):
    name = getattr(file, "name", "") or ""
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if ext in DANGEROUS_EXTENSIONS:
        raise ValidationError(f"'.{ext}' files aren't allowed here.")
