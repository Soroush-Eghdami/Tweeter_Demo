from accounts.models import Follower, User
from django.db.models import Prefetch, Q, QuerySet
from django.shortcuts import get_object_or_404
from tweets.models import ReTweet, Tweet


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
    return User.objects.filter(
        Q(username__icontains=query)
        | Q(first_name__icontains=query)
        | Q(last_name__icontains=query)
        | Q(custom_id__icontains=query)
    ).order_by("username")


def validate_username(username: str, exclude_user_id: str = None) -> None:
    query = User.objects.filter(username=username)
    if exclude_user_id:
        query = query.exclude(id=exclude_user_id)
    if query.exists():
        raise ValueError("This username is already taken.")
    if " " in username:
        raise ValueError("Username cannot contain spaces.")


def get_public_timeline_queryset(user: User) -> QuerySet[Tweet]:
    followed_user_ids = Follower.objects.filter(follower=user).values_list(
        "followee_id", flat=True
    )
    visible_user_ids = list(followed_user_ids) + [user.id]

    return (
        Tweet.objects.filter(
            Q(user__is_public_user=True) | Q(user_id__in=visible_user_ids)
        )
        .select_related("user")
        .prefetch_related(
            Prefetch("retweet_set", queryset=ReTweet.objects.select_related("user"))
        )
        .order_by("-created_at")
    )


def get_private_timeline_queryset(user: User) -> QuerySet[Tweet]:
    followed_user_ids = Follower.objects.filter(follower=user).values_list(
        "followee_id", flat=True
    )
    return (
        Tweet.objects.filter(user_id__in=followed_user_ids)
        .select_related("user")
        .prefetch_related(
            Prefetch("retweet_set", queryset=ReTweet.objects.select_related("user"))
        )
        .order_by("-created_at")
    )


def get_user_tweets_queryset(user: User) -> QuerySet[Tweet]:
    return (
        Tweet.objects.filter(user=user)
        .select_related("user")
        .prefetch_related(
            Prefetch("retweet_set", queryset=ReTweet.objects.select_related("user"))
        )
        .order_by("-created_at")
    )


def get_user_followers_queryset(user: User) -> QuerySet[Follower]:
    return (
        Follower.objects.filter(followee=user)
        .select_related("follower")
        .order_by("-created_at")
    )


def get_user_following_queryset(user: User) -> QuerySet[Follower]:
    return (
        Follower.objects.filter(follower=user)
        .select_related("followee")
        .order_by("-created_at")
    )
