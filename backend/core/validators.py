import os
from django.core.exceptions import ValidationError
from PIL import Image, UnidentifiedImageError
import re

ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
ALLOWED_MEDIA_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | {'mp4', 'mov', 'avi', 'webm'}
HTML_TAG_PATTERN = re.compile(r'<\s*/?\s*\w+[^>]*>', re.IGNORECASE)

DEFAULT_MAX_UPLOAD_SIZE = 5 * 1024 * 1024    # 5 MB — profile pictures/banners
MAX_VIDEO_UPLOAD_SIZE = 25 * 1024 * 1024     # 25 MB — tweet media (allows video)


def validate_safe_file(allowed_extensions=None, max_size=None):
    """
    Returns a validator that:
      - Rejects path traversal (e.g., ../../file.jpg)
      - Only permits the given *allowed_extensions* (case‑insensitive)
      - Rejects files larger than *max_size* bytes
      - For image extensions, verifies the bytes are actually a valid image —
        catches a renamed non-image file (e.g. a script) wearing an image extension.
        Pillow can't inspect video containers, so mp4/mov/avi/webm skip this step;
        extension + size are still enforced for them.
    """
    if allowed_extensions is None:
        allowed_extensions = ALLOWED_IMAGE_EXTENSIONS
    if max_size is None:
        max_size = DEFAULT_MAX_UPLOAD_SIZE

    def validator(value):
        name = value.name

        # 1. Path traversal check
        if os.path.basename(name) != name:
            raise ValidationError("Invalid file name: path separators are not allowed.")

        # 2. Extension check
        ext = os.path.splitext(name)[1].lstrip('.').lower()
        if not ext:
            raise ValidationError("File must have an extension.")
        if ext not in allowed_extensions:
            raise ValidationError(
                f"File type '*.{ext}' is not allowed. "
                f"Allowed types: {', '.join(sorted(allowed_extensions))}."
            )

        # 3. Size check
        if value.size > max_size:
            raise ValidationError(
                f"File is too large ({value.size / (1024 * 1024):.1f} MB). "
                f"Maximum allowed size is {max_size / (1024 * 1024):.0f} MB."
            )

        # 4. Content check for images — makes sure the bytes are really an
        # image, not just a file with an image-looking extension.
        if ext in ALLOWED_IMAGE_EXTENSIONS:
            try:
                value.seek(0)
                Image.open(value).verify()
            except (UnidentifiedImageError, OSError, ValueError):
                raise ValidationError(
                    "This file is not a valid image, even though its extension looks like one."
                )
            finally:
                value.seek(0)

    return validator

def validate_no_html(value: str) -> None:
    """Reject content that contains HTML tags."""
    if HTML_TAG_PATTERN.search(value):
        raise ValidationError("HTML tags are not allowed in tweet content.")