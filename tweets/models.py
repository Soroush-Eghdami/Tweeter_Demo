from django.db import models
from django.conf import settings
from django.apps import apps

def get_user_model():
    return apps.get_model(settings.AUTH_USER_MODEL)

class Tweet(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField(max_length=280)
    media = models.FileField(upload_to='tweet_media/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    parent_tweet = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)

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
        retweet, created = ReTweet.objects.get_or_create(user=user, original_tweet=self)
        return retweet

    def unretweet(self, user):
        try:
            retweet = ReTweet.objects.get(user=user, original_tweet=self)
            retweet.delete()
            return True
        except ReTweet.DoesNotExist:
            return False

    def get_retweet_count(self):
        return ReTweet.objects.filter(original_tweet=self).count()


class ReTweet(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    original_tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'original_tweet')

    def __str__(self):
        return f"{self.user.username} retweeted {self.original_tweet.id}"