"""Selectors for fetching tweet data from the ORM."""
from django.shortcuts import get_object_or_404
from django.db.models import QuerySet
from tweets.models import Tweet
from tweets.services.visibility import TweetVisibilityService


def get_visible_tweets(user) -> QuerySet[Tweet]:
    """Return a queryset of tweets visible to the given user."""
    return TweetVisibilityService.get_visible_tweets_queryset(user)


def get_tweet_detail(pk: int, user) -> Tweet:
    """Fetch a single tweet if visible, otherwise raise Http404."""
    qs = get_visible_tweets(user)
    return get_object_or_404(qs, pk=pk)