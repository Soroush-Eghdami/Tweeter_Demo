from django.shortcuts import get_object_or_404
from django.db.models import QuerySet
from accounts.models import User
from tweets.models import Tweet, ReTweet
from tweets.services.visibility import TweetVisibilityService


def get_visible_tweets(user: User) -> QuerySet[Tweet]:
    """Return a queryset of tweets visible to the given user."""
    return TweetVisibilityService.get_visible_tweets_queryset(user)


def get_tweet_detail(pk: int, user: User) -> Tweet:
    """Fetch a single tweet if visible, otherwise raise Http404."""
    qs = get_visible_tweets(user)
    return get_object_or_404(qs, pk=pk)


def get_tweet_by_id(pk: int) -> Tweet:
    """Fetch a tweet by ID without visibility check. Raise 404 if not found."""
    return get_object_or_404(Tweet, pk=pk)


def get_reply_count(tweet: Tweet) -> int:
    """Number of direct replies (comments) to a tweet."""
    return Tweet.objects.filter(parent_tweet=tweet).count()  # type: ignore[union-attr]


def is_retweeted_by(tweet: Tweet, user: User) -> bool:
    """Whether the given user has retweeted the tweet."""
    if not user.is_authenticated:
        return False
    return ReTweet.objects.filter(user=user, original_tweet=tweet).exists()  # type: ignore[union-attr]