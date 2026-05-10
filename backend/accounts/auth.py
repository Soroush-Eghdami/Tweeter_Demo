"""
Custom authentication class for JWT tokens stored in HttpOnly cookies.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.request import Request
from typing import Any, Tuple


class CookieJWTAuthentication(JWTAuthentication):
    """
    JWT authentication that reads tokens from HttpOnly cookies **without**
    raising an error if the token is missing or invalid.
    Falls back to the Authorization header if no valid cookie exists.
    """

    def authenticate(self, request: Request) -> Tuple[Any, str] | None:
        # Try the access_token cookie first
        raw_token = request.COOKIES.get('access_token')
        if raw_token:
            try:
                validated_token = self.get_validated_token(raw_token)
                user = self.get_user(validated_token)
                return (user, validated_token)
            except Exception:
                pass   # token invalid → ignore it, fall through

        # Fall back to the Authorization header (the default behaviour)
        return super().authenticate(request)