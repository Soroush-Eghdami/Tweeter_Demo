from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class Tweet(models.Model):
    MAX_REPLY_DEPTH = 10  # Prevent deeply nested reply chains

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_index=True)
    content = models.TextField(max_length=280)
    media = models.FileField(upload_to='tweet_media/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    parent_tweet = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, db_index=True)

    def clean(self):
        """Validate that reply chains don't exceed MAX_REPLY_DEPTH and no circular references."""
        if self.parent_tweet:
            # Check for circular references FIRST
            if self._has_circular_reference():
                raise ValidationError("Cannot create circular reply chain. A tweet cannot be a reply to itself.")

            depth = self._get_reply_depth()
            if depth > self.MAX_REPLY_DEPTH:
                raise ValidationError(
                    f"Reply chain cannot exceed {self.MAX_REPLY_DEPTH} levels deep. "
                    f"This tweet would be at depth {depth}."
                )

    def _get_reply_depth(self) -> int:
        """Calculate the depth of this tweet in the reply chain (0 for root tweets)."""
        if not self.parent_tweet:
            return 0
        depth = 1
        current = self.parent_tweet
        visited = set()
        while current.parent_tweet:
            if current.id in visited:
                break
            visited.add(current.id)
            depth += 1
            current = current.parent_tweet
        return depth

    def _has_circular_reference(self) -> bool:
        """Check if setting this parent_tweet creates a circular reference."""
        if not self.parent_tweet:
            return False

        current = self.parent_tweet
        visited = set()

        while current:
            if current.id == self.id:
                return True
            if current.id in visited:
                return True
            visited.add(current.id)
            current = current.parent_tweet

        return False

    def save(self, *args, **kwargs):
        """Call full_clean before saving to validate constraints."""
        self.full_clean()
        super().save(*args, **kwargs)

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