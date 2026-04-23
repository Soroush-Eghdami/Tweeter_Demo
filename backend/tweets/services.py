from django.db import transaction
from django.db.models import Q, QuerySet
from django.apps import apps
from django.core.exceptions import ValidationError
from typing import Tuple, Optional

from .models import Tweet, ReTweet, Like
from accounts.models import User


class TweetService:
    """Service class for tweet-related business logic."""
    
    # Constants
    MAX_REPLY_DEPTH = 10  # Maximum nesting depth for replies

    @staticmethod
    def validate_no_circular_reference(tweet: Tweet) -> None:
        """
        Validate that setting parent_tweet doesn't create a circular reference.
        Raises ValidationError if circular reference detected.
        """
        if not tweet.parent_tweet:
            return
        
        # Check if tweet would point to itself
        if tweet.parent_tweet.id == tweet.id:
            raise ValidationError("Cannot create circular reply chain. A tweet cannot be a reply to itself.")
        
        # Walk up the chain to check if tweet is already an ancestor
        current = tweet.parent_tweet
        visited = set()
        
        while current:
            if current.id == tweet.id:
                raise ValidationError("Cannot create circular reply chain. A tweet is already a reply to this tweet.")
            if current.id in visited:
                # Cycle detected in existing chain - shouldn't happen but catching it
                raise ValidationError("Circular reference detected in reply chain.")
            visited.add(current.id)
            current = current.parent_tweet

    @staticmethod
    def get_reply_depth(tweet: Tweet) -> int:
        """
        Calculate the depth of a tweet in the reply chain.
        Root tweets (no parent) have depth 0.
        """
        if not tweet.parent_tweet:
            return 0
        
        depth = 1
        current = tweet.parent_tweet
        visited = set()
        
        while current.parent_tweet:
            if current.id in visited:
                break  # Cycle detected, exit to avoid infinite loop
            visited.add(current.id)
            depth += 1
            current = current.parent_tweet
        
        return depth

    @staticmethod
    def validate_reply_depth(tweet: Tweet) -> None:
        """
        Validate that reply depth doesn't exceed MAX_REPLY_DEPTH.
        Raises ValidationError if depth limit exceeded.
        """
        if not tweet.parent_tweet:
            return  # Root tweets are always valid
        
        depth = TweetService.get_reply_depth(tweet)
        if depth > TweetService.MAX_REPLY_DEPTH:
            raise ValidationError(
                f"Reply chain cannot exceed {TweetService.MAX_REPLY_DEPTH} levels deep. "
                f"This tweet would be at depth {depth}."
            )

    @staticmethod
    def validate_reply(tweet: Tweet) -> None:
        """
        Comprehensive validation for reply tweets.
        Checks for circular references and depth limits.
        Raises ValidationError if validation fails.
        """
        if not tweet.parent_tweet:
            return  # Not a reply, nothing to validate
        
        TweetService.validate_no_circular_reference(tweet)
        TweetService.validate_reply_depth(tweet)

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
        """Return a queryset of tweets visible to the user with optimized queries."""
        Follower = apps.get_model('accounts', 'Follower')
        followed = Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
        return Tweet.objects.filter(
            Q(user__is_public_user=True) | Q(user_id__in=followed) | Q(user=user)
        ).select_related('user', 'parent_tweet__user').prefetch_related(
            'retweet_set__user',
            'likes__user'
        ).order_by('-created_at')