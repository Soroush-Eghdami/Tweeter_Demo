from typing import cast, Any
from django.contrib.auth import get_user_model
from rest_framework import status, permissions
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from accounts.serializers import (
    UserOutputSerializer, UserUpdateInputSerializer, FollowerOutputSerializer,
    RegisterInputSerializer, LogoutInputSerializer, PasswordChangeInputSerializer,
    FollowInputSerializer, UnfollowInputSerializer
)
from accounts.services import UserService
from accounts.auth_utils import set_token_cookies, clear_token_cookies, set_access_token_cookie, set_refresh_token_cookie
from accounts.selectors import (
    get_all_users,
    get_user_by_id, search_users,
    get_public_timeline_queryset,
    get_private_timeline_queryset,
    get_user_tweets_queryset,
    get_user_followers_queryset,
    get_user_following_queryset,
    get_user_retweets_queryset,
)
from tweets.serializers import TweetSerializer

User = get_user_model()


# =============================================================================
# User CRUD
# =============================================================================
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
        responses={200: UserOutputSerializer(many=True)},
    )
    def get(self, request: Request) -> Response:
        queryset = get_all_users()
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = UserOutputSerializer(page, many=True, context={'request': request})
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
        responses={200: UserOutputSerializer},
    )
    def get(self, request: Request, pk: str) -> Response:
        user = get_user_by_id(pk)
        serializer = UserOutputSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# =============================================================================
# Profile Management
# =============================================================================
class UserProfileView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get own profile",
        description="Returns the authenticated user's profile.",
        tags=["profile"],
        responses={200: UserOutputSerializer},
    )
    def get(self, request: Request) -> Response:
        serializer = UserOutputSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update profile",
        description="Update own profile fields (email, name, bio, privacy, profile picture, banner).",
        tags=["profile"],
        request=UserUpdateInputSerializer,
        responses={200: UserOutputSerializer},
    )
    def patch(self, request: Request) -> Response:
        input_ser = UserUpdateInputSerializer(data=request.data, context={'request': request})
        input_ser.is_valid(raise_exception=True)
        data = cast(dict[str, Any], input_ser.validated_data)
        updated_user = UserService.update_profile(request.user, **data)
        output_ser = UserOutputSerializer(updated_user, context={'request': request})
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


# =============================================================================
# Follow / Unfollow
# =============================================================================
class FollowUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Follow a user",
        description="Follow a user by providing their UUID in the request body.",
        request=FollowInputSerializer,
        responses={
            201: FollowerOutputSerializer,
            400: OpenApiResponse(description="Bad request (e.g., follow self or already following)"),
            404: OpenApiResponse(description="User not found")
        },
        tags=["follow"]
    )
    def post(self, request: Request) -> Response:
        serializer = FollowInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            follower_obj = UserService.follow_create(
                request.user,
                serializer.validated_data['followee_id']
            )
            output_serializer = FollowerOutputSerializer(follower_obj)
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UnfollowUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Unfollow a user",
        description="Unfollow a user by providing their UUID in the request body.",
        request=UnfollowInputSerializer,
        responses={
            200: OpenApiResponse(description="Unfollowed successfully"),
            400: OpenApiResponse(description="Bad request (e.g., not following)"),
            404: OpenApiResponse(description="User not found")
        },
        tags=["follow"]
    )
    def delete(self, request: Request) -> Response:
        serializer = UnfollowInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            UserService.unfollow_delete(
                request.user,
                serializer.validated_data['followee_id']
            )
            return Response({'message': 'Unfollowed successfully'}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# =============================================================================
# Search
# =============================================================================
class SearchUsersView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='q', type=str, location=OpenApiParameter.QUERY, description='Search query', required=True),
        ],
        summary="Search users",
        description="Search for users by username, first name, or last name.",
        tags=["search"],
        responses={200: UserOutputSerializer(many=True)},
    )
    def get(self, request: Request) -> Response:
        query = request.GET.get('q', '')
        try:
            results = search_users(query)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = UserOutputSerializer(results, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# =============================================================================
# Timelines (class‑based)
# =============================================================================
class PublicTimelineView(APIView):
    permission_classes = [permissions.IsAuthenticated]

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
    def get(self, request: Request) -> Response:
        queryset = get_public_timeline_queryset(request.user)
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = TweetSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class PrivateTimelineView(APIView):
    permission_classes = [permissions.IsAuthenticated]

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
    def get(self, request: Request) -> Response:
        queryset = get_private_timeline_queryset(request.user)
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = TweetSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class UserTweetsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

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
    def get(self, request: Request, user_id: str) -> Response:
        user = get_user_by_id(user_id)
        queryset = get_user_tweets_queryset(user)
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = TweetSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class UserRetweetsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),
            OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY, description='Items per page'),
            OpenApiParameter(name='user_id', type=str, location=OpenApiParameter.PATH, description='UUID of the user'),
        ],
        summary="User retweets",
        description="Returns a paginated list of tweets that a specific user has retweeted.",
        tags=["users"],
        responses={200: TweetSerializer(many=True)},
    )
    def get(self, request: Request, user_id: str) -> Response:
        user = get_user_by_id(user_id)
        queryset = get_user_retweets_queryset(user)
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = TweetSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class UserFollowersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),
            OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY, description='Items per page'),
            OpenApiParameter(name='user_id', type=str, location=OpenApiParameter.PATH, description='UUID of the user'),
        ],
        summary="User followers",
        description="Returns a paginated list of followers of a specific user.",
        tags=["users"],
        responses={200: FollowerOutputSerializer(many=True)},
    )
    def get(self, request: Request, user_id: str) -> Response:
        user = get_user_by_id(user_id)
        queryset = get_user_followers_queryset(user)
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = FollowerOutputSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class UserFollowingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, description='Page number'),
            OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY, description='Items per page'),
            OpenApiParameter(name='user_id', type=str, location=OpenApiParameter.PATH, description='UUID of the user'),
        ],
        summary="User following",
        description="Returns a paginated list of users that a specific user is following.",
        tags=["users"],
        responses={200: FollowerOutputSerializer(many=True)},
    )
    def get(self, request: Request, user_id: str) -> Response:
        user = get_user_by_id(user_id)
        queryset = get_user_following_queryset(user)
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = FollowerOutputSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


# =============================================================================
# Authentication (JWT)
# =============================================================================
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Register new user",
        description="Create a new user account. No authentication required.",
        tags=["authentication"],
        request=RegisterInputSerializer,
        responses={201: UserOutputSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = RegisterInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = cast(dict[str, Any], serializer.validated_data)
        user = UserService.create_user(**data)
        output = UserOutputSerializer(user, context={'request': request})
        return Response(output.data, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    @extend_schema(
        summary="Login (obtain JWT tokens)",
        description="Authenticate with username and password. Sets secure HttpOnly cookies with access and refresh tokens.",
        tags=["authentication"],
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'username': {'type': 'string', 'description': 'Username'},
                    'password': {'type': 'string', 'description': 'Password'}
                },
                'required': ['username', 'password']
            }
        },
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'detail': {'type': 'string', 'description': 'Success message'},
                },
                'description': 'Cookies set: access_token (HttpOnly, 1 day), refresh_token (HttpOnly, 7 days)'
            },
            401: {'type': 'object', 'description': 'Invalid credentials'}
        }
    )
    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        # Get tokens from parent class
        response = super().post(request, *args, **kwargs)
        
        # If authentication successful, set tokens as HttpOnly cookies
        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            
            # Create simple success response (frontend fetches user from /profile endpoint)
            new_response = Response(
                {'detail': 'Login successful'},
                status=status.HTTP_200_OK
            )
            
            # Set tokens in HttpOnly cookies
            new_response = set_token_cookies(new_response, access_token, refresh_token)
            return new_response
        
        return response


class RefreshAccessTokenView(TokenRefreshView):
    @extend_schema(
        summary="Refresh access token",
        description="Get new access token using refresh token from cookie (browser) or request body (API/mobile).",
        tags=["authentication"],
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'refresh': {'type': 'string', 'description': 'Refresh token - optional if using HttpOnly cookie'}
                },
                'required': []
            }
        },
        responses={
            200: {
                'type': 'object',
                'properties': {'detail': {'type': 'string', 'description': 'Success message'}},
                'description': 'New access_token cookie set (1 day lifetime)'
            },
            401: {'type': 'object', 'description': 'Invalid or expired refresh token'}
        }
    )
    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        # Try to get refresh token from request data first, then from cookies
        refresh_token = None
        
        # Check if refresh token is in request body
        if request.data and 'refresh' in request.data:
            refresh_token = request.data.get('refresh')
        
        # If not in body, try to get from HttpOnly cookie
        if not refresh_token:
            refresh_token = request.COOKIES.get('refresh_token')
        
        # If we found a refresh token from cookies, add it to request data
        if refresh_token and (not request.data or 'refresh' not in request.data):
            # Create a mutable copy of request data
            if hasattr(request.data, '_mutable'):
                # QueryDict - make mutable, add refresh token, make immutable
                request.data._mutable = True
                request.data['refresh'] = refresh_token
                request.data._mutable = False
            else:
                # Fallback for other dict-like objects
                request._full_data = dict(request.data or {}) if request.data else {}
                request._full_data['refresh'] = refresh_token
        
        # Get response from parent class
        response = super().post(request, *args, **kwargs)
        
        # If refresh successful, set new tokens as HttpOnly cookies
        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token_in_response = response.data.get('refresh')
            
            # Create new response
            new_response = Response(
                {'detail': 'Token refreshed successfully'},
                status=status.HTTP_200_OK
            )
            
            # Set access token in cookie
            new_response = set_access_token_cookie(new_response, access_token)
            
            # If refresh token was rotated, update it too
            if refresh_token_in_response:
                new_response = set_refresh_token_cookie(new_response, refresh_token_in_response)
            
            return new_response
        
        return response


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Logout",
        description="Logout: clear token cookies and blacklist refresh token. Browser automatically sends cookie; API clients send in body.",
        tags=["authentication"],
        request=LogoutInputSerializer,
        responses={
            205: OpenApiResponse(description="Successfully logged out. Cookies cleared and token blacklisted."),
            400: OpenApiResponse(description="Logout failed"),
        }
    )
    def post(self, request: Request) -> Response:
        serializer = LogoutInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Get refresh token from request body or cookies (cookies take precedence for auto-logout)
            data = cast(dict[str, Any], serializer.validated_data)
            refresh_token = data.get('refresh')
            
            # If not provided in body, get from HttpOnly cookie
            if not refresh_token:
                refresh_token = request.COOKIES.get('refresh_token')
            
            # Blacklist refresh token if available (for extra security)
            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except Exception:
                    # Token might already be invalid or already blacklisted, that's okay
                    pass
            
            # Create response and clear cookies
            response = Response(
                {"detail": "Successfully logged out."},
                status=status.HTTP_205_RESET_CONTENT
            )
            response = clear_token_cookies(response)
            return response
        except Exception as e:
            return Response(
                {"detail": "Logout failed."}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Change password",
        description="Change the authenticated user's password. Requires old password and ensures new password meets complexity requirements and hasn't been used recently.",
        tags=["profile"],
        request=PasswordChangeInputSerializer,
        responses={200: OpenApiResponse(description="Password changed successfully")},
    )
    def post(self, request: Request) -> Response:
        serializer = PasswordChangeInputSerializer(data=request.data, context={'request': request})
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


# Exported Views for Schema
__all__ = [
    # User Management
    'UserListView',
    'UserDetailView',
    'UserProfileView',
    # Follow/Unfollow
    'FollowUserView',
    'UnfollowUserView',
    # Search
    'SearchUsersView',
    # Timelines
    'PublicTimelineView',
    'PrivateTimelineView',
    'UserTweetsView',
    'UserFollowersView',
    'UserFollowingView',
    # Authentication
    'RegisterView',
    'LoginView',
    'RefreshAccessTokenView',
    'LogoutView',
    'PasswordChangeView',
]