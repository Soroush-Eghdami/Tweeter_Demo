from django.urls import path
from . import views
from .views import LoginView, RefreshAccessTokenView

urlpatterns = [
    # Users
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<uuid:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/change-password/', views.PasswordChangeView.as_view(), name='password-change'),

    # Follow/Unfollow
    path('follow/', views.FollowUserView.as_view(), name='follow-user'),
    path('unfollow/', views.UnfollowUserView.as_view(), name='unfollow-user'),
    
    # Search
    path('search/', views.SearchUsersView.as_view(), name='search-users'),

    # Timelines
    path('timeline/public/', views.PublicTimelineView.as_view(), name='public-timeline'),
    path('timeline/private/', views.PrivateTimelineView.as_view(), name='private-timeline'),
    path('users/<uuid:user_id>/tweets/', views.UserTweetsView.as_view(), name='user-tweets'),
    path('users/<uuid:user_id>/retweets/', views.UserRetweetsView.as_view(), name='user-retweets'),
    path('users/<uuid:user_id>/followers/', views.UserFollowersView.as_view(), name='user-followers'),
    path('users/<uuid:user_id>/following/', views.UserFollowingView.as_view(), name='user-following'),

    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('refresh/', RefreshAccessTokenView.as_view(), name='token_refresh'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]