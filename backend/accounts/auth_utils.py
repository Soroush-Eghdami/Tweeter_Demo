"""
Utilities for secure token cookie handling.
Handles setting/clearing HttpOnly, Secure, SameSite cookies for JWT tokens.
"""
from datetime import timedelta
from django.conf import settings
from rest_framework.response import Response


def set_token_cookies(response: Response, access_token: str, refresh_token: str) -> Response:
    """
    Set access and refresh tokens as HttpOnly, Secure, SameSite cookies.
    
    Args:
        response: DRF Response object
        access_token: JWT access token string
        refresh_token: JWT refresh token string
    
    Returns:
        Response with tokens set as cookies
    """
    # Configuration - only use Secure flag in production
    # For localhost development, Secure flag prevents cookies from being set
    from django.conf import settings
    secure = not settings.DEBUG and settings.CSRF_TRUSTED_ORIGINS and 'https' in settings.CSRF_TRUSTED_ORIGINS[0]
    same_site = 'Lax'  # CSRF protection
    
    # Access token cookie (short-lived, 1 day by default)
    response.set_cookie(
        key='access_token',
        value=access_token,
        max_age=int(timedelta(days=1).total_seconds()),  # Match ACCESS_TOKEN_LIFETIME
        path='/',
        secure=secure,
        httponly=True,
        samesite=same_site,
    )
    
    # Refresh token cookie (long-lived, 7 days by default)
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        max_age=int(timedelta(days=7).total_seconds()),  # Match REFRESH_TOKEN_LIFETIME
        path='/',
        secure=secure,
        httponly=True,
        samesite=same_site,
    )
    
    return response


def set_access_token_cookie(response: Response, access_token: str) -> Response:
    """
    Set access token as HttpOnly, Secure, SameSite cookie.
    Used for token refresh operations.
    
    Args:
        response: DRF Response object
        access_token: JWT access token string
    
    Returns:
        Response with access token set as cookie
    """
    from django.conf import settings
    secure = not settings.DEBUG and settings.CSRF_TRUSTED_ORIGINS and 'https' in settings.CSRF_TRUSTED_ORIGINS[0]
    same_site = 'Lax'
    
    response.set_cookie(
        key='access_token',
        value=access_token,
        max_age=int(timedelta(days=1).total_seconds()),
        path='/',
        secure=secure,
        httponly=True,
        samesite=same_site,
    )
    
    return response


def set_refresh_token_cookie(response: Response, refresh_token: str) -> Response:
    """
    Set refresh token as HttpOnly, Secure, SameSite cookie.
    Used when refresh token is rotated.
    
    Args:
        response: DRF Response object
        refresh_token: JWT refresh token string
    
    Returns:
        Response with refresh token set as cookie
    """
    from django.conf import settings
    secure = not settings.DEBUG and settings.CSRF_TRUSTED_ORIGINS and 'https' in settings.CSRF_TRUSTED_ORIGINS[0]
    same_site = 'Lax'
    
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        max_age=int(timedelta(days=7).total_seconds()),
        path='/',
        secure=secure,
        httponly=True,
        samesite=same_site,
    )
    
    return response



def clear_token_cookies(response: Response) -> Response:
    """
    Clear access and refresh token cookies by setting empty values.
    
    Args:
        response: DRF Response object
    
    Returns:
        Response with cookies cleared
    """
    response.delete_cookie(
        key='access_token',
        path='/',
        samesite='Lax',
    )
    response.delete_cookie(
        key='refresh_token',
        path='/',
        samesite='Lax',
    )
    
    return response
