from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from .models import Tweet, ReTweet
from accounts.serializers import UserSerializer
from .services import TweetService

User = get_user_model()


class TweetSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    message = serializers.CharField(source='content', read_only=True)
    retweet_count = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    parent_tweet = serializers.SerializerMethodField()

    class Meta:
        model = Tweet
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_retweet_count(self, obj: Tweet) -> int:
        return TweetService.get_retweet_count(obj)

    def get_like_count(self, obj: Tweet) -> int:
        return TweetService.get_like_count(obj)

    def get_is_liked(self, obj: Tweet) -> bool:
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return TweetService.is_liked_by(obj, request.user)
        return False

    def get_parent_tweet(self, obj: Tweet) -> dict | None:
        """Return a lightweight representation of the parent tweet."""
        if obj.parent_tweet_id is None:
            return None
        # Use the already fetched parent_tweet from select_related
        parent = obj.parent_tweet
        return {
            'id': parent.id,
            'content': parent.content,
            'user': {
                'id': parent.user.id,
                'username': parent.user.username,
                'email': parent.user.email,
                'first_name': parent.user.first_name,
                'last_name': parent.user.last_name,
                'profile_picture': parent.user.profile_picture.url if parent.user.profile_picture else None,
                'profile_banner': parent.user.profile_banner.url if parent.user.profile_banner else None,
            },
            'created_at': parent.created_at,
        }


class CreateTweetSerializer(serializers.ModelSerializer):
    """Serializer for creating a new tweet."""
    class Meta:
        model = Tweet
        fields = ['content', 'media', 'parent_tweet']
        extra_kwargs = {
            'content': {'required': True},
            'media': {'required': False},
            'parent_tweet': {'required': False}
        }

    def validate_parent_tweet(self, value: Tweet | None) -> Tweet | None:
        if value is None:
            return value
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if not TweetService.is_visible_to(value, request.user):
                raise serializers.ValidationError("You cannot reply to a tweet that is not visible to you.")
        return value

    def create(self, validated_data: dict) -> Tweet:
        try:
            tweet = Tweet(**validated_data)
            tweet.full_clean()
            tweet.save()
            return tweet
        except ValidationError as e:
            if hasattr(e, 'message_dict'):
                raise serializers.ValidationError(e.message_dict)
            elif hasattr(e, 'messages'):
                raise serializers.ValidationError(e.messages)
            else:
                raise serializers.ValidationError(str(e))


class ReTweetSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    original_tweet = TweetSerializer(read_only=True)

    class Meta:
        model = ReTweet
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']