"""Modern, right-sized versions of uploaded images.

Uploads stay untouched as the fallback. For each image a page shows, WebP copies are
generated at a few widths into MEDIA_ROOT/_resp/ (regenerated only when the original
changes), and `{% responsive_img %}` serves them through <picture>/srcset so each device
downloads the smallest file that looks sharp. build_static then exports whatever the
pages reference, like any other media file.
"""

from pathlib import Path
from urllib.parse import quote

from django.conf import settings
from PIL import Image, ImageOps

WIDTHS = (640, 1280, 1920)
QUALITY = 80
VARIANT_DIR = "_resp"


def _media_url(relative_path):
    return "/" + settings.MEDIA_URL.strip("/") + "/" + quote(relative_path.replace("\\", "/"))


def webp_variants(field_file):
    """[(url, width), …] smallest first, plus (width, height) of the original.

    Returns ([], None) when the file can't be read locally (e.g. cloud storage), so
    callers fall back to the plain image.
    """
    try:
        source = Path(field_file.path)
    except (NotImplementedError, ValueError):
        return [], None
    if not source.is_file():
        return [], None

    with Image.open(source) as original:
        original = ImageOps.exif_transpose(original)
        width, height = original.size
        stem = Path(field_file.name).with_suffix("")
        variants = []
        for target_width in sorted({min(w, width) for w in WIDTHS}):
            relative = Path(VARIANT_DIR) / f"{stem}-{target_width}.webp"
            destination = Path(settings.MEDIA_ROOT) / relative
            if not destination.exists() or destination.stat().st_mtime < source.stat().st_mtime:
                destination.parent.mkdir(parents=True, exist_ok=True)
                target_height = round(height * target_width / width)
                image = original if original.mode in ("RGB", "RGBA") else original.convert("RGBA")
                image.resize((target_width, target_height), Image.LANCZOS).save(
                    destination, "WEBP", quality=QUALITY, method=6
                )
            variants.append((_media_url(str(relative)), target_width))
    return variants, (width, height)
