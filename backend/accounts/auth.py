"""
Custom authentication class for JWT tokens stored in HttpOnly cookies.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.request import Request
from typing import Any, Tuple


class CookieJWTAuthentication(JWTAuthentication):
    """
    JWT authentication that reads tokens from HttpOnly cookies instead of headers.
    Falls back to Authorization header if no cookie is found.
    """
    
    def get_validated_token(self, raw_token: bytes) -> Any:
        """Validate token by attempting to sign it."""
        return super().get_validated_token(raw_token)
    
    def authenticate(self, request: Request) -> Tuple[Any, str] | None:
        """
        Extract JWT from cookies (access_token) or Authorization header.
        
        Args:
            request: DRF Request object
        
        Returns:
            Tuple of (user, token_string) or None if no token found
        
        Raises:
            AuthenticationFailed: If token is invalid
        """
        # Try to get access_token from cookies first
        access_token = request.COOKIES.get('access_token')
        
        if access_token:
            try:
                validated_token = self.get_validated_token(access_token)
                user = self.get_user(validated_token)
                return (user, validated_token)
            except Exception as e:
                raise AuthenticationFailed(f'Invalid token in cookie: {str(e)}')
        
        # Fall back to Authorization header (for testing, mobile apps, etc.)
        return super().authenticate(request)
