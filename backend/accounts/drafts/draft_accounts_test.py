"""
Draft file for accounts domain tests (not importet any where)
contaiuns : 
    1. all verified tests
    2. new tests added for :
        2.1 API interigation (3 new):
            2.1.1 for search API
        2.2 User_services (4 new):
            2.2.1 create
            2.2.2 update profile 
            2.2.3 validate username (its in selector)
            2.2.4 delete user
        2.3 selectors (3 new):
           2.3.1 user tweets queryset
           2.3.2 user followers queryset
           2.3.3 user following queryset
"""


import tempfile
from PIL import Image
from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from accounts.models import Follower, PasswordHistory
from tweets.models import Tweet, Like
from unittest.mock import patch, MagicMock
from django.contrib.auth.hashers import make_password

User = get_user_model()


def create_test_image(name='test.jpg', size=(100, 100), color='red'):
    image = Image.new('RGB', size, color)
    tmp_file = tempfile.NamedTemporaryFile(suffix='.jpg')
    image.save(tmp_file, 'jpeg')
    tmp_file.seek(0)
    return SimpleUploadedFile(name, tmp_file.read(), content_type='image/jpeg')


# =====================================================================
# 1. Accounts API Integration Tests
# =====================================================================
class AccountsAPIDraft(TestCase):
    """Integration tests for accounts API endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='alice', password='alicepass', email='alice@example.com',
            first_name='Alice', last_name='Smith', bio='Hello world', is_public_user=True
        )
        self.user2 = User.objects.create_user(
            username='bob', password='bobpass', email='bob@example.com', is_public_user=False
        )
        self.user3 = User.objects.create_user(
            username='charlie', password='charliepass', email='charlie@example.com', is_public_user=True
        )
        token_url = reverse('token_obtain_pair')
        resp = self.client.post(token_url, {'username': 'alice', 'password': 'alicepass'}, format='json')
        self.token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.tweet_public = Tweet.objects.create(user=self.user1, content='Public tweet from alice')
        self.tweet_private = Tweet.objects.create(user=self.user2, content='Private tweet from bob')

    # --- Authentication ---
    def test_register_user(self): ...
    def test_login_jwt(self): ...
    def test_refresh_token(self): ...
    def test_logout(self): ...

    # --- Profile ---
    def test_get_own_profile(self): ...
    def test_patch_profile_update_email_and_bio(self): ...
    def test_patch_profile_update_username(self): ...
    def test_patch_profile_username_already_taken(self): ...
    def test_patch_profile_username_with_spaces(self): ...
    def test_patch_profile_upload_profile_picture(self): ...
    def test_patch_profile_upload_banner(self): ...
    def test_delete_own_account(self): ...

    # --- Password ---
    def test_change_password_success(self): ...
    def test_change_password_wrong_old_password(self): ...
    def test_change_password_mismatch(self): ...
    def test_change_password_reuse_old(self): ...

    # --- User list/detail ---
    def test_user_list(self): ...
    def test_user_detail(self): ...

    # --- Follow/Unfollow ---
    def test_follow_user(self): ...
    def test_follow_self_fails(self): ...
    def test_unfollow_user(self): ...
    def test_unfollow_not_following_fails(self): ...

    # --- Timelines ---
    def test_public_timeline_includes_public_tweets(self): ...
    def test_public_timeline_includes_followed_private_tweets(self): ...
    def test_private_timeline_shows_only_followed(self): ...
    def test_user_tweets_endpoint(self): ...
    def test_user_followers_endpoint(self): ...
    def test_user_following_endpoint(self): ...

    # --- NEW: Search users ---
    def test_search_users_finds_by_username(self):
        url = reverse('search-users')
        response = self.client.get(f"{url}?q=alice")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        usernames = [u['username'] for u in results]
        self.assertIn('alice', usernames)

    def test_search_users_empty_query_returns_400(self):
        url = reverse('search-users')
        response = self.client.get(f"{url}?q=")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_search_users_no_results(self):
        url = reverse('search-users')
        response = self.client.get(f"{url}?q=zzz")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)


# =====================================================================
# 2. UserService Unit Tests
# =====================================================================
class UserServiceDraft(TestCase):
    """Unit tests for UserService (mocked)."""

    # Existing tests (abbreviated)
    def test_follow_creates_relationship(self): ...
    def test_follow_already_exists(self): ...
    def test_follow_self_raises_error(self): ...
    def test_unfollow_deletes_and_returns_true(self): ...
    def test_unfollow_not_exist_returns_false(self): ...
    def test_change_password_success(self): ...
    def test_change_password_wrong_old_password(self): ...
    def test_change_password_reused(self): ...
    def test_update_profile_username_taken(self): ...
    def test_update_profile_username_with_spaces(self): ...

    # --- NEW: create_user ---
    @patch('accounts.services.user.User.objects.create_user')
    def test_create_user_calls_create_user(self, mock_create):
        from accounts.services import UserService
        data = {'username': 'new', 'password': 'pass', 'email': 'new@e.com'}
        UserService.create_user(**data)
        mock_create.assert_called_once_with(username='new', password='pass', email='new@e.com')

    # --- NEW: update_profile success ---
    @patch('accounts.selectors.User.objects.exclude')
    def test_update_profile_success(self, mock_exclude):
        user = MagicMock()
        mock_exclude.return_value.filter.return_value.exists.return_value = False
        from accounts.services import UserService
        result = UserService.update_profile(user, email='new@e.com')
        self.assertEqual(result, user)
        user.save.assert_called_once()

    # --- NEW: validate_username (now a selector) ---
    @patch('accounts.selectors.User.objects.filter')
    def test_validate_username_success(self, mock_filter):
        from accounts.selectors import validate_username
        mock_filter.return_value.exists.return_value = False
        validate_username('unique_name')  # no exception raised

    # --- NEW: delete_account ---
    def test_delete_account_calls_delete(self):
        user = MagicMock()
        from accounts.services import UserService
        UserService.delete_account(user)
        user.delete.assert_called_once()


# =====================================================================
# 3. Selectors Unit Tests
# =====================================================================
class SelectorsDraft(TestCase):
    """Unit tests for account selectors (mocked)."""

    @patch('accounts.selectors.Tweet.objects.filter')
    def test_get_user_tweets_queryset(self, mock_filter):
        from accounts.selectors import get_user_tweets_queryset
        user = MagicMock()
        mock_filter.return_value.select_related.return_value.prefetch_related.return_value.order_by.return_value = 'qs'
        qs = get_user_tweets_queryset(user)
        self.assertEqual(qs, 'qs')

    @patch('accounts.selectors.Follower.objects.filter')
    def test_get_user_followers_queryset(self, mock_filter):
        from accounts.selectors import get_user_followers_queryset
        user = MagicMock()
        mock_filter.return_value.select_related.return_value.order_by.return_value = 'qs'
        qs = get_user_followers_queryset(user)
        self.assertEqual(qs, 'qs')

    @patch('accounts.selectors.Follower.objects.filter')
    def test_get_user_following_queryset(self, mock_filter):
        from accounts.selectors import get_user_following_queryset
        user = MagicMock()
        mock_filter.return_value.select_related.return_value.order_by.return_value = 'qs'
        qs = get_user_following_queryset(user)
        self.assertEqual(qs, 'qs')