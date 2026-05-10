from typing import Any
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field, OpenApiTypes
from accounts.models import Follower
from accounts.selectors import is_following

User = get_user_model()


# =====================================================================
# User Output Serializers
# =====================================================================

class UserLiteOutputSerializer(serializers.ModelSerializer):
    """Lightweight user representation for nested use (e.g., in Follower)."""
    is_public = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'custom_id', 'is_public', 'profile_picture']
        read_only_fields = fields


class UserOutputSerializer(serializers.ModelSerializer):
    """Full user output serializer for detail/list views."""
    is_following = serializers.SerializerMethodField()
    is_public = serializers.ReadOnlyField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    tweets_count = serializers.SerializerMethodField()
    likes_received = serializers.SerializerMethodField()
    retweets_made = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'custom_id',
            'bio', 'is_public_user', 'is_public', 'is_following',
            'profile_picture', 'profile_banner', 'date_joined',
            'followers_count', 'following_count', 'tweets_count', 'likes_received', 'retweets_made'
        ]
        read_only_fields = fields

    def get_is_following(self, obj: User) -> bool:
        request = self.context.get('request')
        if request:
            return is_following(request.user, obj)
        return False

    def get_followers_count(self, obj: User) -> int:
        from accounts.selectors.user import get_followers_count
        return get_followers_count(obj)

    def get_following_count(self, obj: User) -> int:
        from accounts.selectors.user import get_following_count
        return get_following_count(obj)

    def get_tweets_count(self, obj: User) -> int:
        from accounts.selectors.user import get_tweets_count
        return get_tweets_count(obj)

    def get_likes_received(self, obj: User) -> int:
        from accounts.selectors.user import get_likes_received_count
        return get_likes_received_count(obj)

    def get_retweets_made(self, obj: User) -> int:
        from accounts.selectors.user import get_retweets_made_count
        return get_retweets_made_count(obj)


# =====================================================================
# User Input Serializers
# =====================================================================

class UserUpdateInputSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False, allow_null=True, help_text="Optional profile picture")
    profile_banner = serializers.ImageField(required=False, allow_null=True, help_text="Optional profile banner")

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'bio', 'is_public_user', 'profile_picture', 'profile_banner']
        extra_kwargs = {field: {'required': False} for field in ['username', 'email', 'first_name', 'last_name', 'bio', 'is_public_user']}

    @extend_schema_field(OpenApiTypes.BINARY)
    def get_profile_picture(self, obj: Any) -> None:
        pass

    @extend_schema_field(OpenApiTypes.BINARY)
    def get_profile_banner(self, obj: Any) -> None:
        pass


class RegisterInputSerializer(serializers.ModelSerializer):
    """Input serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'bio')

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs


class PasswordChangeInputSerializer(serializers.Serializer):
    """Input serializer for password change."""
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_new_password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "Passwords do not match."})
        return attrs


class LogoutInputSerializer(serializers.Serializer):
    """Input serializer for logout. Refresh token can come from cookies or body."""
    refresh = serializers.CharField(required=False, write_only=True, allow_blank=True)


class FollowInputSerializer(serializers.Serializer):
    """Input serializer for following a user."""
    followee_id = serializers.CharField(required=True, write_only=True)


class UnfollowInputSerializer(serializers.Serializer):
    """Input serializer for unfollowing a user."""
    followee_id = serializers.CharField(required=True, write_only=True)


# =====================================================================
# Follower Serializers
# =====================================================================

class FollowerOutputSerializer(serializers.ModelSerializer):
    """Follower relationship output serializer."""
    follower = UserLiteOutputSerializer(read_only=True)
    followee = UserLiteOutputSerializer(read_only=True)

    class Meta:
        model = Follower
        fields = ['id', 'follower', 'followee', 'created_at']
        read_only_fields = fields