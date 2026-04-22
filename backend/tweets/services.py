from django.db import transaction
from django.db.models import Q, QuerySet
from django.apps import apps
from typing import Tuple, Optional

from .models import Tweet, ReTweet, Like
from accounts.models import User


class TweetService:
    """Service class for tweet-related business logic."""

    @staticmethod
    def is_visible_to(tweet: Tweet, user: User) -> bool:
        """Check if a tweet is visible to a given user."""
        if tweet.user == user:
            return True
        if tweet.user.is_public_user:
            return True
        Follower = apps.get_model('accounts', 'Follower')
        return Follower.objects.filter(follower=user, followee=tweet.user).exists()

    @staticmethod
    def retweet(tweet: Tweet, user: User) -> Tuple[ReTweet, bool]:
        """Create a retweet. Raises ValueError if user tries to retweet own tweet."""
        if tweet.user == user:
            raise ValueError("You cannot retweet your own tweet.")
        retweet, created = ReTweet.objects.get_or_create(user=user, original_tweet=tweet)
        return retweet, created

    @staticmethod
    def unretweet(tweet: Tweet, user: User) -> bool:
        """Remove a retweet. Returns True if deleted, False if not found."""
        try:
            retweet = ReTweet.objects.get(user=user, original_tweet=tweet)
            retweet.delete()
            return True
        except ReTweet.DoesNotExist:
            return False

    @staticmethod
    def get_retweet_count(tweet: Tweet) -> int:
        """Return the number of retweets for a tweet."""
        return ReTweet.objects.filter(original_tweet=tweet).count()

    @staticmethod
    def like(tweet: Tweet, user: User) -> Tuple[Like, bool]:
        """Like a tweet. Returns the Like object and a boolean indicating if created."""
        like, created = Like.objects.get_or_create(user=user, tweet=tweet)
        return like, created

    @staticmethod
    def unlike(tweet: Tweet, user: User) -> bool:
        """Remove a like. Returns True if deleted, False if not found."""
        deleted, _ = Like.objects.filter(user=user, tweet=tweet).delete()
        return deleted > 0

    @staticmethod
    def get_like_count(tweet: Tweet) -> int:
        """Return the number of likes for a tweet."""
        return tweet.likes.count()

    @staticmethod
    def is_liked_by(tweet: Tweet, user: User) -> bool:
        """Check if a tweet is liked by a user."""
        return tweet.likes.filter(user=user).exists()

    @staticmethod
    def delete_tweet(tweet: Tweet) -> None:
        """
        Hard delete a tweet. Replies are orphaned (parent_tweet set to NULL).
        Retweets and likes are cascade-deleted automatically.
        """
        with transaction.atomic():
            # Orphan replies
            Tweet.objects.filter(parent_tweet=tweet).update(parent_tweet=None)
            # Delete the tweet (cascades to retweets and likes)
            tweet.delete()

    @staticmethod
    def get_visible_tweets_queryset(user: User) -> QuerySet[Tweet]:
        """Return a queryset of tweets visible to the user."""
        Follower = apps.get_model('accounts', 'Follower')
        followed = Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
        return Tweet.objects.filter(
            Q(user__is_public_user=True) | Q(user_id__in=followed) | Q(user=user)
        ).select_related('user').prefetch_related('retweet_set', 'likes').order_by('-created_at')