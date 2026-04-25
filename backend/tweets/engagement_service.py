"""Service for tweet engagement (retweets, likes)."""
from typing import Tuple
from .models import Tweet, ReTweet, Like
from accounts.models import User


class TweetEngagementService:
    """Handle tweet engagement: retweets and likes."""

    # Retweet operations
    @staticmethod
    def retweet(tweet: Tweet, user: User) -> Tuple[ReTweet, bool]:
        """
        Create a retweet.
        
        Args:
            tweet: The tweet to retweet
            user: The user creating the retweet
            
        Returns:
            Tuple of (ReTweet object, created flag)
            
        Raises:
            ValueError: If user tries to retweet their own tweet
        """
        if tweet.user == user:
            raise ValueError("You cannot retweet your own tweet.")
        retweet, created = ReTweet.objects.get_or_create(user=user, original_tweet=tweet)
        return retweet, created

    @staticmethod
    def unretweet(tweet: Tweet, user: User) -> bool:
        """
        Remove a retweet.
        
        Returns:
            True if deleted, False if not found
        """
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

    # Like operations
    @staticmethod
    def like(tweet: Tweet, user: User) -> Tuple[Like, bool]:
        """
        Like a tweet.
        
        Returns:
            Tuple of (Like object, created flag)
        """
        like, created = Like.objects.get_or_create(user=user, tweet=tweet)
        return like, created

    @staticmethod
    def unlike(tweet: Tweet, user: User) -> bool:
        """
        Remove a like.
        
        Returns:
            True if deleted, False if not found
        """
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
