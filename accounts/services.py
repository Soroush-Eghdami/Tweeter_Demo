from django.db import transaction
from django.db.models import Prefetch, Q
from tweets.models import Tweet, ReTweet
from accounts.models import User, Follower
import logging

logger = logging.getLogger(__name__)

class TimelineService:
    @staticmethod
    def get_public_timeline(user, page=1, page_size=10):
        offset = (page - 1) * page_size
    
        followed_user_ids = list(
            Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
        )
        followed_user_ids.append(user.id)
        
        tweets = Tweet.objects.filter(
            Q(user__is_public_user=True) | Q(user_id__in=followed_user_ids)
        ).select_related('user').prefetch_related(
            Prefetch(
                'retweet_set',
                queryset=ReTweet.objects.select_related('user'),
                to_attr='prefetched_retweets'
            )
        ).order_by('-created_at')[offset:offset + page_size]
    
        return list(tweets)
    
    @staticmethod
    def get_private_timeline(user, page=1, page_size=10):
        offset = (page - 1) * page_size
    
        followed_user_ids = list(
            Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
        )
    
        tweets = Tweet.objects.filter(
            user_id__in=followed_user_ids
        ).select_related('user').prefetch_related(
            Prefetch(
                'retweet_set',
                queryset=ReTweet.objects.select_related('user'),
                to_attr='prefetched_retweets'
            )
        ).order_by('-created_at')[offset:offset + page_size]
    
        return list(tweets)
    
    @staticmethod
    def get_user_tweets(user, page=1, page_size=10):
        offset = (page - 1) * page_size
    
        tweets = Tweet.objects.filter(
            user=user
        ).select_related('user').prefetch_related(
            Prefetch(
                'retweet_set',
                queryset=ReTweet.objects.select_related('user'),
                to_attr='prefetched_retweets'
            )
        ).order_by('-created_at')[offset:offset + page_size]
    
        return list(tweets)
    
    @staticmethod
    def get_user_followers(user, page=1, page_size=10):
        offset = (page - 1) * page_size
    
        followers = Follower.objects.filter(followee=user).select_related(
            'follower'
        ).order_by('-created_at')[offset:offset + page_size]
    
        return list(followers)
    
    @staticmethod
    def get_user_following(user, page=1, page_size=10):
        offset = (page - 1) * page_size
    
        following = Follower.objects.filter(follower=user).select_related(
            'followee'
        ).order_by('-created_at')[offset:offset + page_size]
    
        return list(following)
    