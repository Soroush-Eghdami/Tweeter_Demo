from django.db import models
from django.conf import settings
from django.apps import apps


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class Tweet(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_index=True)
    content = models.TextField(max_length=280)
    media = models.FileField(upload_to='tweet_media/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    parent_tweet = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
    is_deleted = models.BooleanField(default=False, db_index=True)

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}"

    def is_visible_to(self, user):
        if self.user == user:
            return True
        if self.user.is_public_user:
            return True
        Follower = apps.get_model('accounts', 'Follower')
        return Follower.objects.filter(follower=user, followee=self.user).exists()

    def retweet(self, user):
        if self.user == user:
            raise ValueError("You cannot retweet your own tweet.")
        retweet, created = ReTweet.objects.get_or_create(user=user, original_tweet=self)
        return retweet, created

    def unretweet(self, user):
        try:
            retweet = ReTweet.objects.get(user=user, original_tweet=self)
            retweet.delete()
            return True
        except ReTweet.DoesNotExist:
            return False

    def get_retweet_count(self):
        return ReTweet.objects.filter(original_tweet=self).count()

    def like(self, user):
        like, created = Like.objects.get_or_create(user=user, tweet=self)
        return like, created

    def unlike(self, user):
        deleted, _ = Like.objects.filter(user=user, tweet=self).delete()
        return deleted > 0

    def get_like_count(self):
        return self.likes.count()

    def is_liked_by(self, user):
        return self.likes.filter(user=user).exists()

    def delete(self, *args, **kwargs):
        """Soft delete: mark as deleted and clean up."""
        self.is_deleted = True
        # Orphan replies
        Tweet.objects.filter(parent_tweet=self).update(parent_tweet=None)
        # Hard delete retweets and likes
        self.retweet_set.all().delete()
        self.likes.all().delete()
        self.save(update_fields=['is_deleted'])


class ReTweet(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_index=True)
    original_tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        unique_together = ('user', 'original_tweet')

    def __str__(self):
        return f"{self.user.username} retweeted {self.original_tweet.id}"


class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_index=True)
    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE, related_name='likes', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        unique_together = ('user', 'tweet')

    def __str__(self):
        return f"{self.user.username} likes {self.tweet.id}"