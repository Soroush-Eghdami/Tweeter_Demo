from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tweet, ReTweet
from accounts.serializers import UserLiteSerializer
from .engagement_service import TweetEngagementService
from .visibility_service import TweetVisibilityService

User = get_user_model()


# =====================================================================
# Tweet Output Serializers
# =====================================================================

class TweetSerializer(serializers.ModelSerializer):
    """Full tweet output serializer with engagement counts and metadata."""
    user = UserLiteSerializer(read_only=True)
    message = serializers.CharField(source='content', read_only=True)
    retweet_count = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    parent_tweet = serializers.SerializerMethodField()

    class Meta:
        model = Tweet
        fields = [
            'id', 'user', 'content', 'message', 'media', 'parent_tweet',
            'retweet_count', 'like_count', 'is_liked',
            'created_at', 'updated_at'
        ]
        read_only_fields = fields

    def get_retweet_count(self, obj: Tweet) -> int:
        return TweetEngagementService.get_retweet_count(obj)

    def get_like_count(self, obj: Tweet) -> int:
        return TweetEngagementService.get_like_count(obj)

    def get_is_liked(self, obj: Tweet) -> bool:
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return TweetEngagementService.is_liked_by(obj, request.user)
        return False

    def get_parent_tweet(self, obj: Tweet) -> dict | None:
        """Return a lightweight representation of the parent tweet."""
        if obj.parent_tweet_id is None:
            return None
        parent = obj.parent_tweet
        return {
            'id': parent.id,
            'content': parent.content,
            'user': {
                'id': parent.user.id,
                'username': parent.user.username,
                'custom_id': parent.user.custom_id,
            },
            'created_at': parent.created_at,
        }


# =====================================================================
# Tweet Input Serializers
# =====================================================================

class CreateTweetSerializer(serializers.ModelSerializer):
    """Input serializer for creating a new tweet."""
    
    class Meta:
        model = Tweet
        fields = ['content', 'media', 'parent_tweet']
        extra_kwargs = {
            'content': {'required': True},
            'media': {'required': False},
            'parent_tweet': {'required': False}
        }

    def create(self, validated_data: dict) -> Tweet:
        # Business logic (reply validation) is performed in the view's perform_create()
        return Tweet.objects.create(**validated_data)


# =====================================================================
# ReTweet Serializers
# =====================================================================

class ReTweetSerializer(serializers.ModelSerializer):
    """ReTweet output serializer."""
    user = UserLiteSerializer(read_only=True)
    original_tweet = TweetSerializer(read_only=True)

    class Meta:
        model = ReTweet
        fields = ['id', 'user', 'original_tweet', 'created_at']
        read_only_fields = fields