from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q
from .models import Tweet, ReTweet, Like
from .serializers import TweetSerializer, CreateTweetSerializer, ReTweetSerializer
from accounts.models import Follower
from drf_spectacular.utils import extend_schema


class TweetListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateTweetSerializer
        return TweetSerializer

    def get_queryset(self):
        user = self.request.user
        followed = Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
        return Tweet.objects.filter(
            Q(user__is_public_user=True) | Q(user_id__in=followed) | Q(user=user)
        ).select_related('user').prefetch_related('retweet_set', 'likes').order_by('-created_at')

    def perform_create(self, serializer):
        return serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = self.perform_create(serializer)
        # Use TweetSerializer for the response
        output_serializer = TweetSerializer(instance, context={'request': request})
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class TweetDetailView(generics.RetrieveDestroyAPIView):
    """
    GET: Retrieve a tweet.
    DELETE: Delete own tweet.
    """
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        followed = Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
        return Tweet.objects.filter(
            Q(user__is_public_user=True) | Q(user_id__in=followed) | Q(user=user)
        ).select_related('user').prefetch_related('retweet_set', 'likes')

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            return Response({'error': 'You can only delete your own tweets.'}, status=status.HTTP_403_FORBIDDEN)
        instance.delete()


class RetweetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            tweet = Tweet.objects.get(pk=pk)
        except Tweet.DoesNotExist:
            return Response({'error': 'Tweet not found'}, status=status.HTTP_404_NOT_FOUND)

        if not tweet.is_visible_to(request.user):
            return Response({'error': 'Tweet not accessible'}, status=status.HTTP_403_FORBIDDEN)

        retweet = tweet.retweet(request.user)
        serializer = ReTweetSerializer(retweet)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UnretweetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            tweet = Tweet.objects.get(pk=pk)
        except Tweet.DoesNotExist:
            return Response({'error': 'Tweet not found'}, status=status.HTTP_404_NOT_FOUND)

        success = tweet.unretweet(request.user)
        if success:
            return Response({'message': 'Unretweeted successfully'})
        else:
            return Response({'error': 'You have not retweeted this tweet'}, status=status.HTTP_400_BAD_REQUEST)


class LikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            tweet = Tweet.objects.get(pk=pk)
        except Tweet.DoesNotExist:
            return Response({'error': 'Tweet not found'}, status=status.HTTP_404_NOT_FOUND)

        if not tweet.is_visible_to(request.user):
            return Response({'error': 'Tweet not accessible'}, status=status.HTTP_403_FORBIDDEN)

        like, created = tweet.like(request.user)
        if created:
            return Response({'message': 'Liked', 'like_count': tweet.get_like_count()}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Already liked', 'like_count': tweet.get_like_count()}, status=status.HTTP_200_OK)


class UnlikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            tweet = Tweet.objects.get(pk=pk)
        except Tweet.DoesNotExist:
            return Response({'error': 'Tweet not found'}, status=status.HTTP_404_NOT_FOUND)

        removed = tweet.unlike(request.user)
        if removed:
            return Response({'message': 'Unliked', 'like_count': tweet.get_like_count()}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'You have not liked this tweet'}, status=status.HTTP_400_BAD_REQUEST)