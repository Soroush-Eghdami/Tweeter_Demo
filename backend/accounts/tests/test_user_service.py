from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth.hashers import make_password
from accounts.services import UserService
from accounts.models import Follower, PasswordHistory, User


class TestUserServiceFollow(TestCase):
    @patch('accounts.services.user.Follower.objects.get_or_create')
    def test_follow_creates_relationship(self, mock_get_or_create):
        follower = MagicMock()
        followee = MagicMock()
        mock_get_or_create.return_value = (MagicMock(), True)
        _, created = UserService.follow(follower, followee)
        self.assertTrue(created)

    @patch('accounts.services.user.Follower.objects.get_or_create')
    def test_follow_already_exists(self, mock_get_or_create):
        follower = MagicMock()
        followee = MagicMock()
        mock_get_or_create.return_value = (MagicMock(), False)
        _, created = UserService.follow(follower, followee)
        self.assertFalse(created)

    def test_follow_self_raises_error(self):
        user = MagicMock()
        with self.assertRaises(ValueError):
            UserService.follow(user, user)


class TestUserServiceUnfollow(TestCase):
    @patch('accounts.services.user.Follower.objects.filter')
    def test_unfollow_deletes_and_returns_true(self, mock_filter):
        follower = MagicMock()
        followee = MagicMock()
        mock_qs = MagicMock()
        mock_qs.delete.return_value = (1, {})
        mock_filter.return_value = mock_qs
        result = UserService.unfollow(follower, followee)
        self.assertTrue(result)

    @patch('accounts.services.user.Follower.objects.filter')
    def test_unfollow_not_exist_returns_false(self, mock_filter):
        follower = MagicMock()
        followee = MagicMock()
        mock_qs = MagicMock()
        mock_qs.delete.return_value = (0, {})
        mock_filter.return_value = mock_qs
        result = UserService.unfollow(follower, followee)
        self.assertFalse(result)


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
    @patch('accounts.services.user.User.objects.exclude')
    def test_update_profile_username_taken(self, mock_exclude):
        user = MagicMock()
        user.pk = 1
        mock_exclude.return_value.filter.return_value.exists.return_value = True
        with self.assertRaises(ValueError):
            UserService.update_profile(user, username='taken')

    @patch('accounts.services.user.User.objects.exclude')
    def test_update_profile_username_with_spaces(self, mock_exclude):
        user = MagicMock()
        user.pk = 1
        mock_exclude.return_value.filter.return_value.exists.return_value = False
        with self.assertRaises(ValueError):
            UserService.update_profile(user, username='has space')