from django_filters import FilterSet, CharFilter
from django.shortcuts import get_object_or_404
from django.db.models import Q, QuerySet, Prefetch
from accounts.models import User, Follower
from tweets.models import Tweet, ReTweet


#* Defining Search Class

class UserSearchFilter(FilterSet):
    q = CharFilter(method='filter_search', label='search')

    class Meta:
        model = User
        fields = ['q']

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(username__icontains=value) |
            Q(first_name__icontains=value) |
            Q(last_name__icontains=value)
        )

#* Defining Functions 

def get_user_by_id(user_id):
    return get_object_or_404(User, id=user_id)

def get_user_by_username(username):
    return get_object_or_404(User, username=username)

def is_following(user, target_user) -> bool:
    if not user.is_authenticated:
        return False
    return Follower.objects.filter(follower=user, followee=target_user).exists()

def validate_username(username: str, exclude_user_id: str = None) -> None:
    query = User.objects.filter(username=username)
    if exclude_user_id:
        query = query.exclude(id=exclude_user_id)
    if query.exists():
        raise ValueError("This username is already taken.")
    if ' ' in username:
        raise ValueError("Username cannot contain spaces.")

def get_public_timeline_queryset(user: User) -> QuerySet[Tweet]:
    followed_user_ids = Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
    visible_user_ids = list(followed_user_ids) + [user.id]
    return Tweet.objects.filter(
        Q(user__is_public_user=True) | Q(user_id__in=visible_user_ids)
    ).select_related('user').prefetch_related(
        Prefetch('retweet_set', queryset=ReTweet.objects.select_related('user'))
    ).order_by('-created_at')

def get_private_timeline_queryset(user: User) -> QuerySet[Tweet]:
    followed_user_ids = Follower.objects.filter(follower=user).values_list('followee_id', flat=True)
    return Tweet.objects.filter(
        user_id__in=followed_user_ids
    ).select_related('user').prefetch_related(
        Prefetch('retweet_set', queryset=ReTweet.objects.select_related('user'))
    ).order_by('-created_at')

def get_user_tweets_queryset(user: User) -> QuerySet[Tweet]:
    return Tweet.objects.filter(
        user=user
    ).select_related('user').prefetch_related(
        Prefetch('retweet_set', queryset=ReTweet.objects.select_related('user'))
    ).order_by('-created_at')

def get_user_followers_queryset(user: User) -> QuerySet[Follower]:
    return Follower.objects.filter(followee=user).select_related('follower').order_by('-created_at')

def get_user_following_queryset(user: User) -> QuerySet[Follower]:
    return Follower.objects.filter(follower=user).select_related('followee').order_by('-created_at')

def search_users(query: str):
    filter_set = UserSearchFilter({'q':query}, queryset=User.objects.all())
    if not filter_set.is_valid():
        raise ValueError("Invalid search query")
    return filter_set.qs.order_by('username')