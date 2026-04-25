"""Main tweet service with core operations and imports for backward compatibility."""
from django.db import transaction
from django.db.models import QuerySet

from .models import Tweet
from accounts.models import User
from .reply_service import ReplyService
from .visibility_service import TweetVisibilityService
from .engagement_service import TweetEngagementService

# Re-export for backward compatibility
__all__ = [
    'TweetService',
    'ReplyService',
    'TweetVisibilityService',
    'TweetEngagementService',
]


class TweetService:
    """Core tweet operations service."""

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

    # Delegate to specialized services for backward compatibility
    @staticmethod
    def validate_no_circular_reference(tweet: Tweet) -> None:
        """Delegate to ReplyService."""
        return ReplyService.validate_no_circular_reference(tweet)

    @staticmethod
    def get_reply_depth(tweet: Tweet) -> int:
        """Delegate to ReplyService."""
        return ReplyService.get_reply_depth(tweet)

    @staticmethod
    def validate_reply_depth(tweet: Tweet) -> None:
        """Delegate to ReplyService."""
        return ReplyService.validate_reply_depth(tweet)

    @staticmethod
    def validate_reply(tweet: Tweet) -> None:
        """Delegate to ReplyService."""
        return ReplyService.validate_reply(tweet)

    @staticmethod
    def is_visible_to(tweet: Tweet, user: User) -> bool:
        """Delegate to TweetVisibilityService."""
        return TweetVisibilityService.is_visible_to(tweet, user)

    @staticmethod
    def get_visible_tweets_queryset(user: User) -> QuerySet[Tweet]:
        """Delegate to TweetVisibilityService."""
        return TweetVisibilityService.get_visible_tweets_queryset(user)

    @staticmethod
    def retweet(tweet: Tweet, user: User):
        """Delegate to TweetEngagementService."""
        return TweetEngagementService.retweet(tweet, user)

    @staticmethod
    def unretweet(tweet: Tweet, user: User) -> bool:
        """Delegate to TweetEngagementService."""
        return TweetEngagementService.unretweet(tweet, user)

    @staticmethod
    def get_retweet_count(tweet: Tweet) -> int:
        """Delegate to TweetEngagementService."""
        return TweetEngagementService.get_retweet_count(tweet)

    @staticmethod
    def like(tweet: Tweet, user: User):
        """Delegate to TweetEngagementService."""
        return TweetEngagementService.like(tweet, user)

    @staticmethod
    def unlike(tweet: Tweet, user: User) -> bool:
        """Delegate to TweetEngagementService."""
        return TweetEngagementService.unlike(tweet, user)

    @staticmethod
    def get_like_count(tweet: Tweet) -> int:
        """Delegate to TweetEngagementService."""
        return TweetEngagementService.get_like_count(tweet)

    @staticmethod
    def is_liked_by(tweet: Tweet, user: User) -> bool:
        """Delegate to TweetEngagementService."""
        return TweetEngagementService.is_liked_by(tweet, user)

    # Reexport constants for backward compatibility
    MAX_REPLY_DEPTH = ReplyService.MAX_REPLY_DEPTH
