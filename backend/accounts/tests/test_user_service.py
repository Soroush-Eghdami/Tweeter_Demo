from django.test import TestCase
from unittest.mock import patch, MagicMock
from accounts.services import UserService
from django.contrib.auth.hashers import make_password


class TestUserServiceFollow(TestCase):
    @patch('accounts.services.user.Follower.objects.get_or_create')
    def test_follow_creates_relationship(self, mock_get_or_create):
        follower = MagicMock()
        followee_id = '550e8400-e29b-41d4-a716-446655440000'
        mock_get_or_create.return_value = (MagicMock(), True)
        with patch('accounts.services.user.get_user_by_id') as mock_get_user:
            mock_get_user.return_value = MagicMock()
            created = UserService.follow_create(follower, followee_id)
            self.assertIsNotNone(created)

    @patch('accounts.services.user.Follower.objects.get_or_create')
    def test_follow_already_exists(self, mock_get_or_create):
        follower = MagicMock()
        followee_id = '550e8400-e29b-41d4-a716-446655440000'
        mock_get_or_create.return_value = (MagicMock(), False)
        with patch('accounts.services.user.get_user_by_id') as mock_get_user:
            mock_get_user.return_value = MagicMock()
            with self.assertRaises(ValueError):
                UserService.follow_create(follower, followee_id)

    def test_follow_self_raises_error(self):
        follower = MagicMock()
        followee_id = '550e8400-e29b-41d4-a716-446655440000'   # doesn't matter because self-check is first
        with patch('accounts.services.user.get_user_by_id') as mock_get_user:
            mock_get_user.return_value = follower   # same object as follower
            with self.assertRaises(ValueError):
                UserService.follow_create(follower, followee_id)


class TestUserServiceUnfollow(TestCase):
    @patch('accounts.services.user.get_user_by_id')
    def test_unfollow_deletes_and_returns_none(self, mock_get_user):
        follower = MagicMock()
        followee_id = '550e8400-e29b-41d4-a716-446655440000'
        mock_get_user.return_value = MagicMock()
        with patch('accounts.services.user.Follower.objects.filter') as mock_filter:
            mock_qs = MagicMock()
            mock_qs.delete.return_value = (1, {})
            mock_filter.return_value = mock_qs
            # should not raise
            UserService.unfollow_delete(follower, followee_id)

    @patch('accounts.services.user.get_user_by_id')
    def test_unfollow_not_exist_raises_error(self, mock_get_user):
        follower = MagicMock()
        followee_id = '550e8400-e29b-41d4-a716-446655440000'
        mock_get_user.return_value = MagicMock()
        with patch('accounts.services.user.Follower.objects.filter') as mock_filter:
            mock_qs = MagicMock()
            mock_qs.delete.return_value = (0, {})
            mock_filter.return_value = mock_qs
            with self.assertRaises(ValueError):
                UserService.unfollow_delete(follower, followee_id)


class TestUserServicePassword(TestCase):
    @patch('accounts.services.user.PasswordHistory.objects.filter')
    @patch('accounts.services.user.PasswordHistory.objects.create')
    def test_change_password_success(self, mock_create, mock_filter):
        user = MagicMock()
        user.check_password.return_value = True
        mock_filter.return_value.order_by.return_value = []
        UserService.change_password(user, 'old', 'new')
        self.assertTrue(user.set_password.called)
        self.assertTrue(user.save.called)

    def test_change_password_wrong_old_password(self):
        user = MagicMock()
        user.check_password.return_value = False
        with self.assertRaises(ValueError):
            UserService.change_password(user, 'wrong', 'new')

    @patch('accounts.services.user.PasswordHistory.objects.filter')
    def test_change_password_reused(self, mock_filter):
        user = MagicMock()
        user.check_password.return_value = True
        mock_entry = MagicMock()
        mock_entry.password_hash = make_password('new')
        mock_filter.return_value.order_by.return_value = [mock_entry]
        with self.assertRaises(ValueError):
            UserService.change_password(user, 'old', 'new')


class TestUserServiceProfile(TestCase):
    @patch('accounts.selectors.User.objects.exclude')
    def test_update_profile_username_taken(self, mock_exclude):
        user = MagicMock()
        user.pk = 1
        mock_exclude.return_value.filter.return_value.exists.return_value = True
        with self.assertRaises(ValueError):
            UserService.update_profile(user, username='taken')

    @patch('accounts.selectors.User.objects.exclude')
    def test_update_profile_username_with_spaces(self, mock_exclude):
        user = MagicMock()
        user.pk = 1
        mock_exclude.return_value.filter.return_value.exists.return_value = False
        with self.assertRaises(ValueError):
            UserService.update_profile(user, username='has space')