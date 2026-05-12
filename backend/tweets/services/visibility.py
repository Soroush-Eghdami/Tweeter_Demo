from ..models import Tweet
from accounts.models import User
from django.apps import apps

class TweetVisibilityService:
    """Handle tweet visibility checks."""

    @staticmethod
    def is_visible_to(tweet: Tweet, user: User) -> bool:
        """
        Check if a tweet is visible to a given user.
        """
        if tweet.user == user:
            return True
        if tweet.user.is_public_user:
            return True
        Follower = apps.get_model('accounts', 'Follower')
        return Follower.objects.filter(follower=user, followee=tweet.user).exists()