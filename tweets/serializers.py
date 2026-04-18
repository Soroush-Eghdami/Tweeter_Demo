from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tweet, ReTweet

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class TweetSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    message = serializers.CharField(source='content', read_only=True)
    retweet_count = serializers.SerializerMethodField()
    parent_tweet = serializers.SerializerMethodField()

    class Meta:
        model = Tweet
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_retweet_count(self, obj):
        return obj.get_retweet_count()

    def get_parent_tweet(self, obj):
        if obj.parent_tweet:
            return obj.parent_tweet.id
        return None


class ReTweetSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    original_tweet = TweetSerializer(read_only=True)

    class Meta:
        model = ReTweet
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']