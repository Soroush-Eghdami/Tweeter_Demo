from django.db import transaction
from django.db.models import Prefetch, Q
from tweets.models import Tweet, ReTweet
from accounts.models import User, Follower
import logging

logger = logging.getLogger(__name__)


class TimelineService:
    @staticmethod
    def get_public_timeline_queryset(user):
        """
        Return a queryset of tweets for the public timeline.
        Includes tweets from public users and private users the current user follows.
        """
        followed_user_ids = list(
            Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
        )
        # Include own tweets as well
        visible_user_ids = followed_user_ids + [user.id]

        return Tweet.objects.filter(
            Q(user__is_public_user=True) | Q(user_id__in=visible_user_ids)
        ).select_related('user').prefetch_related(
            Prefetch(
                'retweet_set',
                queryset=ReTweet.objects.select_related('user'),
                to_attr='prefetched_retweets'
            )
        ).order_by('-created_at')

    @staticmethod
    def get_private_timeline_queryset(user):
        """
        Return a queryset of tweets from users the current user follows.
        """
        followed_user_ids = list(
            Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
        )
        return Tweet.objects.filter(
            user_id__in=followed_user_ids
        ).select_related('user').prefetch_related(
            Prefetch(
                'retweet_set',
                queryset=ReTweet.objects.select_related('user'),
                to_attr='prefetched_retweets'
            )
        ).order_by('-created_at')

    @staticmethod
    def get_user_tweets_queryset(user):
        """
        Return a queryset of tweets by a specific user.
        """
        return Tweet.objects.filter(
            user=user
        ).select_related('user').prefetch_related(
            Prefetch(
                'retweet_set',
                queryset=ReTweet.objects.select_related('user'),
                to_attr='prefetched_retweets'
            )
        ).order_by('-created_at')

    @staticmethod
    def get_user_followers_queryset(user):
        """
        Return a queryset of followers of a user.
        """
        return Follower.objects.filter(followee=user).select_related('follower').order_by('-created_at')

    @staticmethod
    def get_user_following_queryset(user):
        """
        Return a queryset of users that a user is following.
        """
        return Follower.objects.filter(follower=user).select_related('followee').order_by('-created_at')