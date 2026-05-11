from django.http.response import Http404
from rest_framework import permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from django.core.exceptions import PermissionDenied

from core.pagination import TweeterPagination
from .models import Tweet
from .serializers import (
    TweetOutputSerializer,
    CreateTweetInputSerializer,
    ReTweetOutputSerializer,
)
from .services.engagement import TweetEngagementService
from .services.visibility import TweetVisibilityService
from .selectors import get_visible_tweets, get_tweet_by_id


class TweetListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @extend_schema(
        summary="List tweets",
        description="Returns a paginated list of tweets visible to the authenticated user.",
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),
            OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY, description='Items per page'),
        ],
        tags=["tweets"],
        responses={200: TweetOutputSerializer(many=True)},
    )
    def get(self, request: Request) -> Response:
        queryset = get_visible_tweets(request.user)
        paginator = TweeterPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = TweetOutputSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(
        summary="Create tweet",
        description="Create a new tweet. Supports multipart/form-data for media upload.",
        request=CreateTweetInputSerializer,
        responses={
            201: TweetOutputSerializer,
            400: OpenApiResponse(description='Invalid input'),
        },
        tags=["tweets"],
    )
    def post(self, request: Request) -> Response:
        input_serializer = CreateTweetInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        try:
            tweet = TweetEngagementService.create_tweet(
                user=request.user,
                **input_serializer.validated_data
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        output_serializer = TweetOutputSerializer(tweet, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class TweetDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get tweet details",
        description="Retrieve a single tweet by ID. Returns 404 if not visible or not found.",
        tags=["tweets"],
        responses={200: TweetOutputSerializer},
    )
    def get(self, request: Request, pk) -> Response:
        tweet = get_tweet_by_id(pk)  # selector already raises Http404 if not found
        if not TweetVisibilityService.is_visible_to(tweet, request.user):
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TweetOutputSerializer(tweet, context={'request': request})
        return Response(serializer.data)

    @extend_schema(
        summary="Delete tweet",
        description="Delete own tweet. Returns 204 on success.",
        responses={
            204: OpenApiResponse(description='Tweet deleted successfully'),
            403: OpenApiResponse(description='You can only delete your own tweets'),
            404: OpenApiResponse(description='Tweet not found'),
        },
        tags=["tweets"],
    )
    def delete(self, request: Request, pk) -> Response:
        tweet = get_tweet_by_id(pk)
        if tweet.user != request.user:
            raise Http404("Tweet not found")  # Hide existence of the tweet if not owner
        TweetEngagementService.delete_tweet(tweet)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ------------------------------------------------------------
# The remaining views stay exactly the same
# ------------------------------------------------------------
class RetweetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Retweet",
        description="Retweet a tweet. The original tweet must be visible to the authenticated user.",
        request=None,
        responses={
            201: ReTweetOutputSerializer,
            200: OpenApiResponse(description='Already retweeted'),
            400: OpenApiResponse(description='Cannot retweet own tweet'),
            403: OpenApiResponse(description='Tweet not accessible'),
            404: OpenApiResponse(description='Tweet not found'),
        },
        tags=["tweets"]
    )
    def post(self, request, pk):
        tweet = get_tweet_by_id(pk)

        if not TweetVisibilityService.is_visible_to(tweet, request.user):
            return Response({'error': 'Tweet not accessible'}, status=status.HTTP_403_FORBIDDEN)

        try:
            retweet, created = TweetEngagementService.retweet(tweet, request.user)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReTweetOutputSerializer(retweet)
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
        tweet = get_tweet_by_id(pk)
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
        tweet = get_tweet_by_id(pk)

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
        tweet = get_tweet_by_id(pk)
        removed = TweetEngagementService.unlike(tweet, request.user)
        if removed:
            return Response({'message': 'Unliked', 'like_count': TweetEngagementService.get_like_count(tweet)}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'You have not liked this tweet'}, status=status.HTTP_400_BAD_REQUEST)