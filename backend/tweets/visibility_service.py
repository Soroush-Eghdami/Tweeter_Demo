"""Service for tweet visibility and timeline logic."""
from django.db.models import Q, QuerySet
from django.apps import apps
from .models import Tweet
from accounts.models import User


class TweetVisibilityService:
    """Handle tweet visibility checks and queryset optimization."""

    @staticmethod
    def is_visible_to(tweet: Tweet, user: User) -> bool:
        """
        Check if a tweet is visible to a given user.
        
        Visibility rules:
        - User can always see their own tweets
        - User can see all public tweets
        - User can see private tweets from followed users
        """
        if tweet.user == user:
            return True
        if tweet.user.is_public_user:
            return True
        Follower = apps.get_model('accounts', 'Follower')
        return Follower.objects.filter(follower=user, followee=tweet.user).exists()

    @staticmethod
    def get_visible_tweets_queryset(user: User) -> QuerySet[Tweet]:
        """
        Return a queryset of tweets visible to the user with optimized queries.
        
        Includes:
        - All public tweets
        - All tweets from followed users
        - User's own tweets
        
        Uses select_related and prefetch_related for N+1 optimization.
        """
        Follower = apps.get_model('accounts', 'Follower')
        followed = Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
        return Tweet.objects.filter(
            Q(user__is_public_user=True) | Q(user_id__in=followed) | Q(user=user)
        ).select_related('user', 'parent_tweet__user').prefetch_related(
            'retweet_set__user',
            'likes__user'
        ).order_by('-created_at')
