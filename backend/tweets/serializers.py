from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tweet, ReTweet
from accounts.serializers import UserLiteSerializer
from .services.engagement import TweetEngagementService
from .services.visibility import TweetVisibilityService
from drf_spectacular.utils import extend_schema_field, OpenApiTypes

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
    # Explicit fields to control what Swagger UI shows
    media = serializers.FileField(required=False, allow_null=True, help_text="Optional image or video")
    parent_tweet = serializers.IntegerField(required=False, allow_null=True, help_text="ID of the tweet you are replying to")

    class Meta:
        model = Tweet
        fields = ['content', 'media', 'parent_tweet']
        extra_kwargs = {
            'content': {'required': True},
        }

    @extend_schema_field(OpenApiTypes.BINARY)
    def get_media(self, obj):
        pass

    def create(self, validated_data: dict) -> Tweet:
        # parent_tweet can be None or an ID; fetch the actual tweet instance if present
        parent_id = validated_data.pop('parent_tweet', None)
        if parent_id:
            from django.shortcuts import get_object_or_404
            from tweets.models import Tweet as TweetModel
            parent = get_object_or_404(TweetModel, pk=parent_id)
            validated_data['parent_tweet'] = parent
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