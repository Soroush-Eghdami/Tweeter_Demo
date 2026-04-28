from unittest.mock import patch, MagicMock
from django.test import TestCase
from tweets.services.visibility import TweetVisibilityService
from tweets.models import Tweet

class TestTweetVisibilityService(TestCase):
    def test_author_can_see_own_tweet(self):
        user = MagicMock()
        tweet = MagicMock()
        tweet.user = user
        result = TweetVisibilityService.is_visible_to(tweet, user)
        self.assertTrue(result)

    def test_public_tweet_visible_to_anyone(self):
        user = MagicMock()
        tweet = MagicMock()
        tweet.user = MagicMock()  # not the same user
        tweet.user.is_public_user = True
        result = TweetVisibilityService.is_visible_to(tweet, user)
        self.assertTrue(result)

    @patch('tweets.services.visibility.apps.get_model')
    def test_private_tweet_visible_to_follower(self, mock_get_model):
        user = MagicMock()
        tweet = MagicMock()
        tweet.user = MagicMock()
        tweet.user.is_public_user = False
        tweet.user.id = 1
        mock_follower_model = MagicMock()
        mock_follower_model.objects.filter.return_value.exists.return_value = True
        mock_get_model.return_value = mock_follower_model
        result = TweetVisibilityService.is_visible_to(tweet, user)
        self.assertTrue(result)

    @patch('tweets.services.visibility.apps.get_model')
    def test_private_tweet_not_visible_to_nonfollower(self, mock_get_model):
        user = MagicMock()
        tweet = MagicMock()
        tweet.user = MagicMock()
        tweet.user.is_public_user = False
        tweet.user.id = 1
        mock_follower_model = MagicMock()
        mock_follower_model.objects.filter.return_value.exists.return_value = False
        mock_get_model.return_value = mock_follower_model
        result = TweetVisibilityService.is_visible_to(tweet, user)
        self.assertFalse(result)