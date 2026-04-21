from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tweet, ReTweet
from accounts.serializers import UserSerializer

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

    def get_retweet_count(self, obj):
        return obj.get_retweet_count()

    def get_like_count(self, obj):
        return obj.get_like_count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_liked_by(request.user)
        return False

    def get_parent_tweet(self, obj):
        if obj.parent_tweet:
            return obj.parent_tweet.id
        return None


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

    def validate_parent_tweet(self, value):
        if value is None:
            return value
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if not value.is_visible_to(request.user):
                raise serializers.ValidationError("You cannot reply to a tweet that is not visible to you.")
        return value

    def create(self, validated_data):
        # The user is set via serializer.save(user=request.user) in the view
        return Tweet.objects.create(**validated_data)


class ReTweetSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    original_tweet = TweetSerializer(read_only=True)

    class Meta:
        model = ReTweet
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']