from django.shortcuts import get_object_or_404
from django.db.models import Q, Prefetch, QuerySet
from accounts.models import User, Follower
from tweets.models import Tweet, ReTweet


def _build_visible_tweets_queryset(user: User) -> QuerySet[Tweet]:
    """
    Return a QuerySet of tweets visible to the given user.
    - Authenticated: public tweets + followed users' tweets + own tweets
    - Anonymous:      public tweets only
    """
    if not user.is_authenticated:
        return (
            Tweet.objects.filter(user__is_public_user=True)
            .select_related('user', 'parent_tweet__user')
            .prefetch_related(
                Prefetch('retweet_set', queryset=ReTweet.objects.select_related('user')),
                'likes__user',
            )
            .order_by('-created_at')
        )

    followed_ids = Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
    return (
        Tweet.objects.filter(
            Q(user__is_public_user=True) | Q(user_id__in=followed_ids) | Q(user=user)
        )
        .select_related('user', 'parent_tweet__user')
        .prefetch_related(
            Prefetch('retweet_set', queryset=ReTweet.objects.select_related('user')),
            'likes__user',
        )
        .order_by('-created_at')
    )


def get_replies_queryset(tweet: Tweet, user: User) -> QuerySet[Tweet]:
    """
    Return visible replies to a tweet.
    For authenticated users, apply full visibility rules;
    for anonymous users, only public tweets.
    """
    if not user.is_authenticated:
        return (
            Tweet.objects.filter(parent_tweet=tweet, user__is_public_user=True)
            .select_related('user')
            .prefetch_related(
                Prefetch('retweet_set', queryset=ReTweet.objects.select_related('user')),
                'likes__user',
            )
            .order_by('created_at')
        )

    followed_ids = Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
    return (
        Tweet.objects.filter(
            Q(user__is_public_user=True) | Q(user_id__in=followed_ids) | Q(user=user),
            parent_tweet=tweet,
        )
        .select_related('user')
        .prefetch_related(
            Prefetch('retweet_set', queryset=ReTweet.objects.select_related('user')),
            'likes__user',
        )
        .order_by('created_at')
    )


def get_visible_tweets(user: User) -> QuerySet[Tweet]:
    """Return a queryset of tweets visible to the given user."""
    return _build_visible_tweets_queryset(user)


def get_tweet_detail(pk: int, user: User) -> Tweet:
    qs = get_visible_tweets(user)
    return get_object_or_404(qs, pk=pk)


def get_tweet_by_id(pk: int) -> Tweet:
    return get_object_or_404(Tweet, pk=pk)


def get_reply_count(tweet: Tweet) -> int:
    return Tweet.objects.filter(parent_tweet=tweet).count()


def is_retweeted_by(tweet: Tweet, user: User) -> bool:
    if not user.is_authenticated:
        return False
    return ReTweet.objects.filter(user=user, original_tweet=tweet).exists()