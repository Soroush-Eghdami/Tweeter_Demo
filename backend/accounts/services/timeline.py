import logging
from django.db.models import QuerySet, Prefetch, Q
from tweets.models import Tweet, ReTweet
from accounts.models import User, Follower

logger = logging.getLogger(__name__)

class TimelineService:
    @staticmethod
    def get_public_timeline_queryset(user: User) -> QuerySet[Tweet]:
        followed_user_ids = Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
        visible_user_ids = list(followed_user_ids) + [user.id]

        return Tweet.objects.filter(
            Q(user__is_public_user=True) | Q(user_id__in=visible_user_ids)
        ).select_related('user').prefetch_related(
            Prefetch('retweet_set', queryset=ReTweet.objects.select_related('user'))
        ).order_by('-created_at')

    @staticmethod
    def get_private_timeline_queryset(user: User) -> QuerySet[Tweet]:
        followed_user_ids = Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
        return Tweet.objects.filter(
            user_id__in=followed_user_ids
        ).select_related('user').prefetch_related(
            Prefetch('retweet_set', queryset=ReTweet.objects.select_related('user'))
        ).order_by('-created_at')

    @staticmethod
    def get_user_tweets_queryset(user: User) -> QuerySet[Tweet]:
        return Tweet.objects.filter(
            user=user
        ).select_related('user').prefetch_related(
            Prefetch('retweet_set', queryset=ReTweet.objects.select_related('user'))
        ).order_by('-created_at')

    @staticmethod
    def get_user_followers_queryset(user: User) -> QuerySet[Follower]:
        return Follower.objects.filter(followee=user).select_related('follower').order_by('-created_at')

    @staticmethod
    def get_user_following_queryset(user: User) -> QuerySet[Follower]:
        return Follower.objects.filter(follower=user).select_related('followee').order_by('-created_at')