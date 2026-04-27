from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.core.exceptions import ValidationError
from .models import Tweet, ReTweet, Like
from .serializers import TweetSerializer, CreateTweetSerializer, ReTweetSerializer
from .services.engagement import TweetEngagementService
from .services.visibility import TweetVisibilityService
from .services.reply import ReplyService
from .selectors import get_visible_tweets, get_tweet_by_id
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter


class TweetListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateTweetSerializer
        return TweetSerializer

    def get_queryset(self):
        return get_visible_tweets(self.request.user)

    def perform_create(self, serializer):
        try:
            tweet = TweetEngagementService.create_tweet(
                user=self.request.user,
                **serializer.validated_data
            )
        except ValueError as e:
            raise serializers.ValidationError({"error": str(e)}) from e
        return tweet

    @extend_schema(
        summary="List tweets",
        description="Returns a paginated list of tweets visible to the authenticated user.",
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),
            OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY, description='Items per page'),
        ],
        tags=["tweets"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Create tweet",
        description="Create a new tweet. Supports multipart/form-data for media upload.",
        request=CreateTweetSerializer,
        responses={
            201: TweetSerializer,
            400: OpenApiResponse(description='Invalid input'),
        },
        tags=["tweets"]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = self.perform_create(serializer)
        output_serializer = TweetSerializer(instance, context={'request': request})
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class TweetDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return get_visible_tweets(self.request.user)

    @extend_schema(
        summary="Get tweet details",
        description="Retrieve a single tweet by ID. Returns 404 if not visible or not found.",
        tags=["tweets"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Delete tweet",
        description="Delete own tweet. Returns 204 on success.",
        responses={
            204: OpenApiResponse(description='Tweet deleted successfully'),
            403: OpenApiResponse(description='You can only delete your own tweets'),
            404: OpenApiResponse(description='Tweet not found'),
        },
        tags=["tweets"]
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            return Response({'error': 'You can only delete your own tweets.'}, status=status.HTTP_403_FORBIDDEN)
        TweetEngagementService.delete_tweet(instance)


class RetweetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Retweet",
        description="Retweet a tweet. The original tweet must be visible to the authenticated user.",
        request=None,
        responses={
            201: ReTweetSerializer,
            200: OpenApiResponse(description='Already retweeted'),
            400: OpenApiResponse(description='Cannot retweet own tweet'),
            403: OpenApiResponse(description='Tweet not accessible'),
            404: OpenApiResponse(description='Tweet not found'),
        },
        tags=["tweets"]
    )
    def post(self, request, pk):
        tweet = get_tweet_by_id(pk)      # selector

        if not TweetVisibilityService.is_visible_to(tweet, request.user):
            return Response({'error': 'Tweet not accessible'}, status=status.HTTP_403_FORBIDDEN)

        try:
            retweet, created = TweetEngagementService.retweet(tweet, request.user)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReTweetSerializer(retweet)
        if created:
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {'message': 'Already retweeted', 'retweet': serializer.data},
                status=status.HTTP_200_OK
            )


class UnretweetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Unretweet",
        description="Remove a retweet.",
        request=None,
        responses={
            200: OpenApiResponse(description='Unretweeted successfully'),
            400: OpenApiResponse(description='You have not retweeted this tweet'),
            404: OpenApiResponse(description='Tweet not found'),
        },
        tags=["tweets"]
    )
    def post(self, request, pk):
        tweet = get_tweet_by_id(pk)      # selector
        success = TweetEngagementService.unretweet(tweet, request.user)
        if success:
            return Response({'message': 'Unretweeted successfully'})
        else:
            return Response({'error': 'You have not retweeted this tweet'}, status=status.HTTP_400_BAD_REQUEST)


class LikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Like tweet",
        description="Like a tweet. If already liked, returns 200.",
        request=None,
        responses={
            201: OpenApiResponse(description='Liked'),
            200: OpenApiResponse(description='Already liked'),
            403: OpenApiResponse(description='Tweet not accessible'),
            404: OpenApiResponse(description='Tweet not found'),
        },
        tags=["tweets"]
    )
    def post(self, request, pk):
        tweet = get_tweet_by_id(pk)      # selector

        if not TweetVisibilityService.is_visible_to(tweet, request.user):
            return Response({'error': 'Tweet not accessible'}, status=status.HTTP_403_FORBIDDEN)

        like, created = TweetEngagementService.like(tweet, request.user)
        if created:
            return Response({'message': 'Liked', 'like_count': TweetEngagementService.get_like_count(tweet)}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Already liked', 'like_count': TweetEngagementService.get_like_count(tweet)}, status=status.HTTP_200_OK)


class UnlikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Unlike tweet",
        description="Remove a like from a tweet.",
        request=None,
        responses={
            200: OpenApiResponse(description='Unliked'),
            400: OpenApiResponse(description='You have not liked this tweet'),
            404: OpenApiResponse(description='Tweet not found'),
        },
        tags=["tweets"]
    )
    def post(self, request, pk):
        tweet = get_tweet_by_id(pk)      # selector
        removed = TweetEngagementService.unlike(tweet, request.user)
        if removed:
            return Response({'message': 'Unliked', 'like_count': TweetEngagementService.get_like_count(tweet)}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'You have not liked this tweet'}, status=status.HTTP_400_BAD_REQUEST)