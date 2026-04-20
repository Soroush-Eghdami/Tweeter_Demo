from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import get_user_model
from accounts.models import Follower
from accounts.serializers import (
    UserSerializer, UserUpdateSerializer, FollowerSerializer,
    RegisterSerializer, LogoutSerializer
)
from accounts.services import TimelineService
from tweets.serializers import TweetSerializer
from tweets.models import Tweet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter

User = get_user_model()


# ------------------------------------------------------------------
# User CRUD
# ------------------------------------------------------------------
class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="List all users",
        description="Returns a paginated list of all users.",
        tags=["users"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get user details",
        description="Retrieve a specific user's profile by UUID.",
        tags=["users"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


# ------------------------------------------------------------------
# Profile Management
# ------------------------------------------------------------------
class UserProfileView(generics.RetrieveUpdateDestroyAPIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return UserUpdateSerializer
        return UserSerializer

    @extend_schema(
        summary="Get own profile",
        description="Returns the authenticated user's profile.",
        tags=["profile"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update profile",
        description="Update own profile fields (email, name, bio, privacy, profile picture, banner).",
        tags=["profile"]
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        summary="Delete account",
        description="Permanently delete the authenticated user's account.",
        tags=["profile"]
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.delete()
        return Response({"detail": "Account deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# ------------------------------------------------------------------
# Follow/Unfollow
# ------------------------------------------------------------------
class FollowUserView(generics.CreateAPIView):
    serializer_class = FollowerSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Follow a user",
        description="Follow a user by providing their UUID in the request body.",
        request={
            'application/json': {
                'type': 'object',
                'properties': {'followee_id': {'type': 'string', 'format': 'uuid'}},
                'required': ['followee_id']
            }
        },
        responses={
            201: FollowerSerializer,
            400: OpenApiResponse(description="Bad request (e.g., follow self or already following)"),
            404: OpenApiResponse(description="User not found")
        },
        tags=["follow"]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        follower = request.user
        followee_id = request.data.get('followee_id')
        if not followee_id:
            return Response({'error': 'followee_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            followee = User.objects.get(id=followee_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if follower == followee:
            return Response({'error': 'You cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)

        follower_obj, created = Follower.objects.get_or_create(follower=follower, followee=followee)
        if not created:
            return Response({'error': 'You are already following this user'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(follower_obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UnfollowUserView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Unfollow a user",
        description="Unfollow a user by providing their UUID in the request body.",
        request={
            'application/json': {
                'type': 'object',
                'properties': {'followee_id': {'type': 'string', 'format': 'uuid'}},
                'required': ['followee_id']
            }
        },
        responses={
            200: OpenApiResponse(description="Unfollowed successfully"),
            400: OpenApiResponse(description="Bad request (e.g., not following)"),
            404: OpenApiResponse(description="User not found")
        },
        tags=["follow"]
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        follower = request.user
        followee_id = request.data.get('followee_id')
        if not followee_id:
            return Response({'error': 'followee_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            followee = User.objects.get(id=followee_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        deleted, _ = Follower.objects.filter(follower=follower, followee=followee).delete()
        if not deleted:
            return Response({'error': 'You are not following this user'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Unfollowed successfully'}, status=status.HTTP_200_OK)


# ------------------------------------------------------------------
# Timelines
# ------------------------------------------------------------------
@extend_schema(
    parameters=[
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),
        OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY, description='Items per page'),
    ],
    summary="Public timeline",
    description="Returns a paginated list of tweets visible to the authenticated user (public tweets + tweets from followed private users).",
    tags=["timelines"]
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def public_timeline(request):
    queryset = TimelineService.get_public_timeline_queryset(request.user)
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = TweetSerializer(page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)


@extend_schema(
    parameters=[
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),
        OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY, description='Items per page'),
    ],
    summary="Private timeline",
    description="Returns a paginated list of tweets only from users the authenticated user follows.",
    tags=["timelines"]
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def private_timeline(request):
    queryset = TimelineService.get_private_timeline_queryset(request.user)
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = TweetSerializer(page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)


@extend_schema(
    parameters=[
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),
        OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY, description='Items per page'),
        OpenApiParameter(name='user_id', type=str, location=OpenApiParameter.PATH, description='UUID of the user'),
    ],
    summary="User tweets",
    description="Returns a paginated list of tweets by a specific user.",
    tags=["users"]
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_tweets(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    queryset = TimelineService.get_user_tweets_queryset(user)
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = TweetSerializer(page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)


@extend_schema(
    parameters=[
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),
        OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY, description='Items per page'),
        OpenApiParameter(name='user_id', type=str, location=OpenApiParameter.PATH, description='UUID of the user'),
    ],
    summary="User followers",
    description="Returns a paginated list of followers of a specific user.",
    tags=["users"]
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_followers(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    queryset = TimelineService.get_user_followers_queryset(user)
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = FollowerSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@extend_schema(
    parameters=[
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),
        OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY, description='Items per page'),
        OpenApiParameter(name='user_id', type=str, location=OpenApiParameter.PATH, description='UUID of the user'),
    ],
    summary="User following",
    description="Returns a paginated list of users that a specific user is following.",
    tags=["users"]
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_following(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    queryset = TimelineService.get_user_following_queryset(user)
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = FollowerSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


# ------------------------------------------------------------------
# Authentication (JWT)
# ------------------------------------------------------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    @extend_schema(
        summary="Register new user",
        description="Create a new user account.",
        tags=["authentication"]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


# Decorate the JWT views to improve documentation
class CustomTokenObtainPairView(TokenObtainPairView):
    @extend_schema(
        summary="Login (obtain JWT tokens)",
        description="Authenticate with username and password to receive access and refresh tokens.",
        tags=["authentication"],
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'access': {'type': 'string', 'description': 'JWT access token'},
                    'refresh': {'type': 'string', 'description': 'JWT refresh token'},
                }
            }
        }
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class CustomTokenRefreshView(TokenRefreshView):
    @extend_schema(
        summary="Refresh access token",
        description="Obtain a new access token using a valid refresh token.",
        tags=["authentication"],
        request={
            'application/json': {
                'type': 'object',
                'properties': {'refresh': {'type': 'string'}},
                'required': ['refresh']
            }
        },
        responses={
            200: {
                'type': 'object',
                'properties': {'access': {'type': 'string'}}
            }
        }
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class LogoutView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Logout",
        description="Blacklist the provided refresh token. The access token will remain valid until its expiry.",
        tags=["authentication"],
        request=LogoutSerializer,
        responses={
            205: OpenApiResponse(description="Successfully logged out"),
            400: OpenApiResponse(description="Invalid token"),
        }
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            refresh_token = serializer.validated_data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)