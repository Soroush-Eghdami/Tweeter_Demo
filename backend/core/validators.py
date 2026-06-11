import os
from django.core.exceptions import ValidationError
import re

ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
ALLOWED_MEDIA_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | {'mp4', 'mov', 'avi', 'webm'}
HTML_TAG_PATTERN = re.compile(r'<\s*/?\s*\w+[^>]*>', re.IGNORECASE)


def validate_safe_file(allowed_extensions=None):
    """
    Returns a validator that:
      - Rejects path traversal (e.g., ../../file.jpg)
      - Only permits the given *allowed_extensions* (case‑insensitive)
    """
    if allowed_extensions is None:
        allowed_extensions = ALLOWED_IMAGE_EXTENSIONS

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

    return validator

def validate_no_html(value: str) -> None:
    """Reject content that contains HTML tags."""
    if HTML_TAG_PATTERN.search(value):
        raise ValidationError("HTML tags are not allowed in tweet content.")