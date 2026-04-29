from django.contrib.auth import get_user_model
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from accounts.models import Follower
from accounts.serializers import (
    UserSerializer, UserUpdateSerializer, FollowerSerializer,
    RegisterSerializer, LogoutSerializer, PasswordChangeSerializer
)
from accounts.services import TimelineService, UserService
from accounts.selectors import get_user_by_id, search_users
from tweets.serializers import TweetSerializer
from tweets.models import Tweet

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
        tags=["users"],
        responses={200: UserSerializer(many=True)},
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
        tags=["users"],
        responses={200: UserSerializer},
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
        tags=["profile"],
        responses={200: UserSerializer},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update profile",
        description="Update own profile fields (email, name, bio, privacy, profile picture, banner).",
        tags=["profile"],
        responses={200: UserSerializer},
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        summary="Delete account",
        description="Permanently delete the authenticated user's account.",
        tags=["profile"],
        responses={204: OpenApiResponse(description="Account deleted")},
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

    def perform_update(self, serializer):
        return UserService.update_profile(self.request.user, **serializer.validated_data)

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        UserService.delete_account(user)
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

        followee = get_user_by_id(followee_id)

        try:
            follower_obj, created = UserService.follow(follower, followee)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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

        followee = get_user_by_id(followee_id)

        deleted = UserService.unfollow(follower, followee)
        if not deleted:
            return Response({'error': 'You are not following this user'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Unfollowed successfully'}, status=status.HTTP_200_OK)


# ------------------------------------------------------------------
# Search
# ------------------------------------------------------------------
@extend_schema(
    parameters=[
        OpenApiParameter(name='q', type=str, location=OpenApiParameter.QUERY, description='Search query', required=True),
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),
        OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY, description='Items per page'),
    ],
    summary="Search users",
    description="Search for users by username, first name, last name, or custom ID.",
    tags=["search"],
    responses={200: UserSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_users_view(request):
    query = request.GET.get('q', '').strip()
    if not query:
        return Response({'error': 'Search query is required.'}, status=status.HTTP_400_BAD_REQUEST)
    queryset = search_users(query)
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = UserSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


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
    tags=["timelines"],
    responses={200: TweetSerializer(many=True)},
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
    tags=["timelines"],
    responses={200: TweetSerializer(many=True)},
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
    tags=["users"],
    responses={200: TweetSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_tweets(request, user_id):
    user = get_user_by_id(user_id)
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
    tags=["users"],
    responses={200: FollowerSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_followers(request, user_id):
    user = get_user_by_id(user_id)
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
    tags=["users"],
    responses={200: FollowerSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_following(request, user_id):
    user = get_user_by_id(user_id)
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

    def perform_create(self, serializer):
        return UserService.create_user(**serializer.validated_data)

    @extend_schema(
        summary="Register new user",
        description="Create a new user account.",
        tags=["authentication"],
        responses={201: UserSerializer},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


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


class PasswordChangeView(generics.GenericAPIView):
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Change password",
        description="Change the authenticated user's password. Requires old password and ensures new password meets complexity requirements and hasn't been used recently.",
        tags=["profile"],
        responses={200: OpenApiResponse(description="Password changed successfully")},
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        try:
            UserService.change_password(
                request.user,
                serializer.validated_data['old_password'],
                serializer.validated_data['new_password']
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)