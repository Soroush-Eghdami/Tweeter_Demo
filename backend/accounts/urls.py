from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Users
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<uuid:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),

    # Follow/Unfollow
    path('follow/', views.FollowUserView.as_view(), name='follow-user'),
    path('unfollow/', views.UnfollowUserView.as_view(), name='unfollow-user'),

    # Timelines
    path('timeline/public/', views.public_timeline, name='public-timeline'),
    path('timeline/private/', views.private_timeline, name='private-timeline'),
    path('users/<uuid:user_id>/tweets/', views.user_tweets, name='user-tweets'),
    path('users/<uuid:user_id>/followers/', views.user_followers, name='user-followers'),
    path('users/<uuid:user_id>/following/', views.user_following, name='user-following'),

    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]