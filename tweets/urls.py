from django.urls import path
from . import views

urlpatterns = [
    path('tweets/', views.TweetListView.as_view(), name='tweet-list'),
    path('tweets/<int:pk>/', views.TweetDetailView.as_view(), name='tweet-detail'),
    path('tweets/<int:pk>/retweet/', views.RetweetView.as_view(), name='retweet'),
    path('tweets/<int:pk>/unretweet/', views.UnretweetView.as_view(), name='unretweet'),
]