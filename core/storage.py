"""
Storage for non-image FileFields (CV, resource sample files).

The project-wide DEFAULT_FILE_STORAGE (set in production.py) is Cloudinary's
image-resource storage, correct for ImageField uploads. PDFs and other downloadable
files aren't images, so they need Cloudinary's "raw" resource type instead — uploading
a PDF as an "image" resource fails validation on Cloudinary's side.

Deferred as a plain function (rather than imported at module load) so local dev, which
never sets CLOUDINARY_URL, doesn't fail importing cloudinary_storage at startup — it's
only resolved when a field actually needs to open/save a file.

Gated on the CLOUDINARY_URL env var directly rather than settings.DEBUG: Django's test
runner force-sets DEBUG=False for the duration of a test run (see
django.test.utils.setup_test_environment), which would otherwise make this pick the
Cloudinary branch during `manage.py test` even with no credentials configured.
"""

import os

from django.core.files.storage import default_storage


def get_raw_storage():
    if not os.environ.get("CLOUDINARY_URL"):
        return default_storage
    from cloudinary_storage.storage import RawMediaCloudinaryStorage

    return RawMediaCloudinaryStorage()
