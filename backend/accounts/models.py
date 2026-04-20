from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    custom_id = models.CharField(max_length=6, unique=True, blank=True)
    bio = models.TextField(max_length=200, blank=True)
    is_public_user = models.BooleanField(default=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    profile_banner = models.ImageField(upload_to='profile_banners/', blank=True, null=True)

    @property
    def is_public(self):
        return self.is_public_user

    @property
    def is_private(self):
        return not self.is_public_user

    def save(self, *args, **kwargs):
        if not self.custom_id:
            self.custom_id = str(uuid.uuid4()).replace('-', '')[:6]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} | {self.custom_id}"

class Follower(models.Model):
    follower = models.ForeignKey(User, related_name="following", on_delete=models.CASCADE)
    followee = models.ForeignKey(User, related_name="followers", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'followee')

    def __str__(self):
        return f"{self.follower.username} follows {self.followee.username}"
    

class PasswordHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='password_history')
    password_hash = models.CharField(max_length=255)  # Store the hashed password
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Password histories'

    def __str__(self):
        return f"{self.user.username} - {self.created_at}"