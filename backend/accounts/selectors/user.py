from typing import Optional
from functools import reduce
import operator
from django.db.models import Q, QuerySet
from django.shortcuts import get_object_or_404
from django_filters import FilterSet, CharFilter
from accounts.models import User, Follower


class UserSearchFilter(FilterSet):
    q = CharFilter(method='filter_search', label='search')

    class Meta:
        model = User
        fields = ['q']

    def filter_search(self, queryset: QuerySet[User], name: str, value: str) -> QuerySet[User]:
        q_list = [
            Q(username__icontains=value),
            Q(first_name__icontains=value),
            Q(last_name__icontains=value)
        ]
        return queryset.filter(reduce(operator.or_, q_list))


def get_user_by_id(user_id: str) -> User:
    return get_object_or_404(User, id=user_id)


def get_user_by_username(username: str) -> User:
    return get_object_or_404(User, username=username)


def is_following(user: User, target_user: User) -> bool:
    if not user.is_authenticated:
        return False
    return Follower.objects.filter(follower=user, followee=target_user).exists() # type: ignore[union-attr]


def validate_username(username: str, exclude_user_id: Optional[str] = None) -> None:
    query = User.objects.filter(username=username)
    if exclude_user_id:
        query = query.exclude(id=exclude_user_id)
    if query.exists():
        raise ValueError("This username is already taken.")
    if ' ' in username:
        raise ValueError("Username cannot contain spaces.")


def get_all_users() -> QuerySet[User]:
    """Get all users ordered by date joined (newest first)."""
    return User.objects.all().order_by('-date_joined')


def search_users(query: str) -> QuerySet[User]:
    filter_set = UserSearchFilter({'q': query}, queryset=User.objects.all())
    if not filter_set.is_valid():
        raise ValueError("Invalid search query")
    return filter_set.qs.order_by('username')


def get_followers_count(user: User) -> int:
    return Follower.objects.filter(followee=user).count()  # type: ignore[union-attr]


def get_following_count(user: User) -> int:
    return Follower.objects.filter(follower=user).count()  # type: ignore[union-attr]


def get_tweets_count(user: User) -> int:
    from tweets.models import Tweet
    return Tweet.objects.filter(user=user).count()  # type: ignore[union-attr]


def get_likes_received_count(user: User) -> int:
    from tweets.models import Like
    return Like.objects.filter(tweet__user=user).count()  # type: ignore[union-attr]


def get_retweets_made_count(user: User) -> int:
    from tweets.models import ReTweet
    return ReTweet.objects.filter(user=user).count()  # type: ignore[union-attr]


def is_following_you(user: User, target_user: User) -> bool:
    """
    Check whether `target_user` follows `user`.
    Returns False for anonymous users.
    """
    if not user.is_authenticated:
        return False
    return Follower.objects.filter(follower=target_user, followee=user).exists()

def is_user_visible_to(target_user: User, requesting_user: User) -> bool:
    """
    Check whether `requesting_user` is allowed to view `target_user`'s profile.
    Public users are visible to everyone.
    Private users are visible only to themselves and their followers.
    """
    if target_user.is_public_user:
        return True
    if not requesting_user.is_authenticated:
        return False
    if target_user == requesting_user:
        return True
    return Follower.objects.filter(follower=requesting_user, followee=target_user).exists()