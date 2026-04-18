from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from accounts.models import Follower
from accounts.serializers import (
    UserSerializer, UserUpdateSerializer, FollowerSerializer,
    RegisterSerializer
)
from accounts.services import TimelineService
from tweets.serializers import TweetSerializer
from tweets.models import Tweet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.utils import extend_schema, OpenApiParameter

User = get_user_model()


# User CRUD
class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserProfileView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve authenticated user's profile.
    PATCH: Update profile fields (email, name, bio, privacy).
    DELETE: Permanently delete account.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return UserUpdateSerializer
        return UserSerializer

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.delete()
        return Response({"detail": "Account deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# Follow/Unfollow
class FollowUserView(generics.CreateAPIView):
    serializer_class = FollowerSerializer
    permission_classes = [permissions.IsAuthenticated]

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


# Timelines
@extend_schema(
    parameters=[
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY),
        OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY),
    ]
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def public_timeline(request):
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))
    tweets = TimelineService.get_public_timeline(request.user, page=page, page_size=page_size)
    serializer = TweetSerializer(tweets, many=True, context={'request': request})
    return Response(serializer.data)


@extend_schema(
    parameters=[
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY),
        OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY),
    ]
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def private_timeline(request):
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))
    tweets = TimelineService.get_private_timeline(request.user, page=page, page_size=page_size)
    serializer = TweetSerializer(tweets, many=True, context={'request': request})
    return Response(serializer.data)


@extend_schema(
    parameters=[
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY),
        OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY),
    ]
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_tweets(request, user_id):
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    tweets = TimelineService.get_user_tweets(user, page=page, page_size=page_size)
    serializer = TweetSerializer(tweets, many=True, context={'request': request})
    return Response(serializer.data)


@extend_schema(
    parameters=[
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY),
        OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY),
    ]
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_followers(request, user_id):
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    followers = TimelineService.get_user_followers(user, page=page, page_size=page_size)
    serializer = FollowerSerializer(followers, many=True)
    return Response(serializer.data)


@extend_schema(
    parameters=[
        OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY),
        OpenApiParameter(name='page_size', type=int, location=OpenApiParameter.QUERY),
    ]
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_following(request, user_id):
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    following = TimelineService.get_user_following(user, page=page, page_size=page_size)
    serializer = FollowerSerializer(following, many=True)
    return Response(serializer.data)


# Authentication (JWT)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

# We'll use DRF SimpleJWT built-in views for login/token; no need to write custom ones.