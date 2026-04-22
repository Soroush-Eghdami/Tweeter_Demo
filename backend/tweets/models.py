from django.db import models
from django.conf import settings


class Tweet(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_index=True)
    content = models.TextField(max_length=280)
    media = models.FileField(upload_to='tweet_media/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    parent_tweet = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, db_index=True)

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}"


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