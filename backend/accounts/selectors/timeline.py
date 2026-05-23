from django.db import models
from django.db.models import Prefetch, Q, QuerySet, Max
from ..models import Follower, User
from tweets.models import ReTweet, Tweet



# Functions
def get_public_timeline_queryset(user: User) -> QuerySet[Tweet]:
    if not user.is_authenticated:
        return (
            Tweet.objects.filter(user__is_public_user=True)
            .select_related("user")
            .prefetch_related(
                Prefetch("retweet_set", queryset=ReTweet.objects.select_related("user"))
            )
            .order_by("-created_at")
        )

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
    followed_user_ids = Follower.objects.filter(follower=user).values_list( # type: ignore[union-attr]
        "followee_id", flat=True
    )
    return (
        Tweet.objects.filter(user_id__in=followed_user_ids) # type: ignore[union-attr]
        .select_related("user")
        .prefetch_related(
            Prefetch("retweet_set", queryset=ReTweet.objects.select_related("user")) # type: ignore[union-attr]
        )
        .order_by("-created_at")
    )


def get_user_tweets_queryset(user: User) -> QuerySet[Tweet]:
    return (
        Tweet.objects.filter(user=user) # type: ignore[union-attr]
        .select_related("user")
        .prefetch_related(
            Prefetch("retweet_set", queryset=ReTweet.objects.select_related("user")) # type: ignore[union-attr]
        )
        .order_by("-created_at")
    )


def get_user_followers_queryset(user: User) -> QuerySet[Follower]:
    return (
        Follower.objects.filter(followee=user) # type: ignore[union-attr]
        .select_related("follower")
        .order_by("-created_at")
    )


def get_user_following_queryset(user: User) -> QuerySet[Follower]:
    return (
        Follower.objects.filter(follower=user) # type: ignore[union-attr]
        .select_related("followee")
        .order_by("-created_at")
    )


def get_user_retweets_queryset(user: User) -> QuerySet[Tweet]:
    return Tweet.objects.filter(  # type: ignore[union-attr]
        id__in=ReTweet.objects.filter(user=user).values('original_tweet_id')  # type: ignore[union-attr]
    ).select_related('user').prefetch_related(
        Prefetch('retweet_set', queryset=ReTweet.objects.select_related('user'))
    ).annotate(
        retweet_date=Max('retweet__created_at', filter=models.Q(retweet__user=user))
    ).order_by('-retweet_date')