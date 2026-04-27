"""Selectors for fetching user data."""
from django.shortcuts import get_object_or_404
from accounts.models import User

def get_user_by_id(user_id):
    """Return user instance or raise Http404."""
    return get_object_or_404(User, id=user_id)

def get_user_by_username(username):
    """Return user instance or raise Http404."""
    return get_object_or_404(User, username=username)