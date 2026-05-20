import re
from django.core.exceptions import ValidationError


class StrongPasswordValidator:
    """Enforce minimum 8 characters, at least one number and one symbol."""

    def validate(self, password, user=None):
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'\d', password):
            raise ValidationError("Password must contain at least one number.")
        
        """mamad goft nazaram be on gir bede"""
        
        # if not re.search(r'[!@#$%^&*(),.?\":{}|<>]', password):
            # raise ValidationError(
                # "Password must contain at least one symbol (e.g. !@#$%)."
            # )

    def get_help_text(self):
        return (
            "Your password must be at least 8 characters long and include "
            "at least one number and one symbol."
        )