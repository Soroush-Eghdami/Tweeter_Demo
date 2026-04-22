from django.db.models import QuerySet, Prefetch, Q
from django.db import transaction
from django.contrib.auth.hashers import check_password
from typing import Tuple

from tweets.models import Tweet, ReTweet
from accounts.models import User, Follower, PasswordHistory
import logging

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


class UserService:
    @staticmethod
    def follow(follower: User, followee: User) -> Tuple[Follower, bool]:
        if follower == followee:
            raise ValueError("You cannot follow yourself.")
        follower_obj, created = Follower.objects.get_or_create(follower=follower, followee=followee)
        return follower_obj, created

    @staticmethod
    def unfollow(follower: User, followee: User) -> bool:
        deleted, _ = Follower.objects.filter(follower=follower, followee=followee).delete()
        return deleted > 0

    @staticmethod
    def change_password(user: User, old_password: str, new_password: str) -> None:
        if not user.check_password(old_password):
            raise ValueError("Old password is incorrect.")

        password_history = PasswordHistory.objects.filter(user=user).order_by('-created_at')[:5]
        for entry in password_history:
            if check_password(new_password, entry.password_hash):
                raise ValueError("You have used this password recently. Please choose a different one.")

        with transaction.atomic():
            PasswordHistory.objects.create(user=user, password_hash=user.password)
            user.set_password(new_password)
            user.save()

    @staticmethod
    def delete_account(user: User) -> None:
        user.delete()