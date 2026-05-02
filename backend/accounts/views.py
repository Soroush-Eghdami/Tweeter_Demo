from typing import cast, Any
from django.contrib.auth import get_user_model
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from accounts.serializers import (
    UserSerializer, UserUpdateSerializer, FollowerSerializer,
    RegisterSerializer, LogoutSerializer, PasswordChangeSerializer
)
from accounts.services import UserService
from accounts.selectors import (
    get_user_by_id, search_users,
    get_public_timeline_queryset,
    get_private_timeline_queryset,
    get_user_tweets_queryset,
    get_user_followers_queryset,
    get_user_following_queryset,
)
from tweets.serializers import TweetSerializer

User = get_user_model()


class UserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),
            OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY, description='Items per page'),
        ],
        summary="List all users",
        description="Returns a paginated list of all users.",
        tags=["users"],
        responses={200: UserSerializer(many=True)},
    )
    def get(self, request: Request) -> Response:
        queryset = User.objects.all().order_by('-date_joined')
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = UserSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='pk', type=str, location=OpenApiParameter.PATH, description='UUID of the user'),
        ],
        summary="Get user details",
        description="Retrieve a specific user's profile by UUID.",
        tags=["users"],
        responses={200: UserSerializer},
    )
    def get(self, request: Request, pk: str) -> Response:
        user = get_user_by_id(pk)
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get own profile",
        description="Returns the authenticated user's profile.",
        tags=["profile"],
        responses={200: UserSerializer},
    )
    def get(self, request: Request) -> Response:
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update profile",
        description="Update own profile fields (email, name, bio, privacy, profile picture, banner).",
        tags=["profile"],
        request=UserUpdateSerializer,
        responses={200: UserSerializer},
    )
    def patch(self, request: Request) -> Response:
        input_ser = UserUpdateSerializer(data=request.data, context={'request': request})
        input_ser.is_valid(raise_exception=True)
        data = cast(dict[str, Any], input_ser.validated_data)
        updated_user = UserService.update_profile(request.user, **data)
        output_ser = UserSerializer(updated_user, context={'request': request})
        return Response(output_ser.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Delete account",
        description="Permanently delete the authenticated user's account.",
        tags=["profile"],
        responses={204: OpenApiResponse(description="Account deleted")},
    )
    def delete(self, request: Request) -> Response:
        UserService.delete_account(request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class FollowUserView(APIView):
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
    def post(self, request: Request) -> Response:
        followee_id = request.data.get('followee_id', '')
        try:
            follower_obj = UserService.follow_create(request.user, followee_id)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = FollowerSerializer(follower_obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UnfollowUserView(APIView):
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
    def delete(self, request: Request) -> Response:
        followee_id = request.data.get('followee_id', '')
        try:
            UserService.unfollow_delete(request.user, followee_id)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Unfollowed successfully'}, status=status.HTTP_200_OK)


class SearchUsersView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='q', type=str, location=OpenApiParameter.QUERY, description='Search query', required=True),
        ],
        summary="Search users",
        description="Search for users by username, first name, or last name.",
        tags=["search"],
        responses={200: UserSerializer(many=True)},
    )
    def get(self, request: Request) -> Response:
        query = request.GET.get('q', '')
        try:
            results = search_users(query)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = UserSerializer(results, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


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
def public_timeline(request: Request) -> Response:
    queryset = get_public_timeline_queryset(request.user)
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
def private_timeline(request: Request) -> Response:
    queryset = get_private_timeline_queryset(request.user)
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
def user_tweets(request: Request, user_id: str) -> Response:
    user = get_user_by_id(user_id)
    queryset = get_user_tweets_queryset(user)
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
def user_followers(request: Request, user_id: str) -> Response:
    user = get_user_by_id(user_id)
    queryset = get_user_followers_queryset(user)
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
def user_following(request: Request, user_id: str) -> Response:
    user = get_user_by_id(user_id)
    queryset = get_user_following_queryset(user)
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = FollowerSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Register new user",
        description="Create a new user account.",
        tags=["authentication"],
        request=RegisterSerializer,
        responses={201: UserSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = cast(dict[str, Any], serializer.validated_data)
        user = UserService.create_user(**data)
        output = UserSerializer(user, context={'request': request})
        return Response(output.data, status=status.HTTP_201_CREATED)


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
    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
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
    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().post(request, *args, **kwargs)


class LogoutView(APIView):
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
    def post(self, request: Request) -> Response:
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            data = cast(dict[str, Any], serializer.validated_data)
            refresh_token = data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Change password",
        description="Change the authenticated user's password. Requires old password and ensures new password meets complexity requirements and hasn't been used recently.",
        tags=["profile"],
        request=PasswordChangeSerializer,
        responses={200: OpenApiResponse(description="Password changed successfully")},
    )
    def post(self, request: Request) -> Response:
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        data = cast(dict[str, Any], serializer.validated_data)
        try:
            UserService.change_password(
                request.user,
                data['old_password'],
                data['new_password']
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)