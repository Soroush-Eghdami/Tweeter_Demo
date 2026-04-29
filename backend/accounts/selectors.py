from django.shortcuts import get_object_or_404
from django.db.models import Q, QuerySet
from accounts.models import User, Follower

def get_user_by_id(user_id):
    """Return user instance or raise Http404."""
    return get_object_or_404(User, id=user_id)

def get_user_by_username(username):
    """Return user instance or raise Http404."""
    return get_object_or_404(User, username=username)

def is_following(user, target_user) -> bool:
    """Return True if `user` follows `target_user`."""
    if not user.is_authenticated:
        return False
    return Follower.objects.filter(follower=user, followee=target_user).exists()

def search_users(query: str) -> QuerySet[User]:
    """Search users by username, first_name, last_name or custom_id (case insensitive)."""
    return  User.objects.filter(
        Q(username__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(custom_id__icontains=query)
        ).order_by('username')