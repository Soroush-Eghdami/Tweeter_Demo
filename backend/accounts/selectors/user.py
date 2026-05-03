from typing import Optional

from django.db.models import Q, QuerySet
from django.db.models.fields import return_None
from django.shortcuts import get_object_or_404
from django_filters import CharFilter, FilterSet

from backend.accounts.services import user

from ..models import Follower, User


# Search Class
class UserSearchFilter(FilterSet):
    q = CharFilter(method="filter_search", label="search")

    class Meta:
        model = User
        feilds = ["q"]

    def filter_search(
        self, queryset: QuerySet[User], name: str, value: str
    ) -> QuerySet[User]:
        return queryset.filter(
            Q(username_icontains=value)
            | Q(firstname_icontains=value)
            | Q(lastname_icontains=value)
        )


# Functions
def get_user_by_id(user_id: str) -> User:
    return get_object_or_404(User, id=user_id)


def get_user_by_username(username: str) -> User:
    return get_object_or_404(User, username=username)


def is_following(user: User, target_user: User) -> bool:
    if not user.is_authenticated:
        return False
    return Follower.objects.filter(follower=user, followee=target_user)


def validate_username(username: str, exclude_user_id: Optional[str] = None) -> None:
    query = User.objects.filter(username=username)
    if exclude_user_id:
        query = query.exclude(id=exclude_user_id)
    if query.exists():
        raise ValueError("This username is already taken")
    if " " in username:
        raise ValueError("Username cannot conatin spaces")


def search_users(query: str) -> QuerySet[User]:
    filter_set = UserSearchFilter({"q": query}, queryset=User.objects.all())
    if not filter_set.is_valid():
        raise ValueError("Invalid search query")
    return filter_set.qs.order_by("username")
