from unittest.mock import patch, MagicMock
from django.test import TestCase
from tweets.services.engagement import TweetEngagementService
from tweets.models import ReTweet, Like

class TestTweetEngagementService(TestCase):
    # ---- retweet ----
    def test_retweet_own_tweet_raises_error(self):
        user = MagicMock()
        tweet = MagicMock()
        tweet.user = user   # same user
        with self.assertRaises(ValueError):
            TweetEngagementService.retweet(tweet, user)

    @patch.object(ReTweet.objects, 'get_or_create')
    def test_retweet_creates_record(self, mock_get_or_create):
        user = MagicMock()
        other_user = MagicMock()
        tweet = MagicMock()
        tweet.user = other_user
        mock_get_or_create.return_value = (MagicMock(), True)
        _, created = TweetEngagementService.retweet(tweet, user)
        self.assertTrue(created)

    @patch.object(ReTweet.objects, 'get_or_create')
    def test_retweet_already_exists_returns_false(self, mock_get_or_create):
        user = MagicMock()
        tweet = MagicMock()
        tweet.user = MagicMock()   # different from user
        mock_get_or_create.return_value = (MagicMock(), False)
        _, created = TweetEngagementService.retweet(tweet, user)
        self.assertFalse(created)

    # ---- unretweet ----
    @patch.object(ReTweet.objects, 'get')
    def test_unretweet_deletes_and_returns_true(self, mock_get):
        user = MagicMock()
        tweet = MagicMock()
        mock_retweet = MagicMock()
        mock_get.return_value = mock_retweet
        result = TweetEngagementService.unretweet(tweet, user)
        self.assertTrue(result)
        mock_retweet.delete.assert_called_once()

    @patch.object(ReTweet.objects, 'get')
    def test_unretweet_does_not_exist_returns_false(self, mock_get):
        user = MagicMock()
        tweet = MagicMock()
        mock_get.side_effect = ReTweet.DoesNotExist
        result = TweetEngagementService.unretweet(tweet, user)
        self.assertFalse(result)

    # ---- like ----
    @patch.object(Like.objects, 'get_or_create')
    def test_like_creates_record(self, mock_get_or_create):
        user = MagicMock()
        tweet = MagicMock()
        mock_get_or_create.return_value = (MagicMock(), True)
        _, created = TweetEngagementService.like(tweet, user)
        self.assertTrue(created)

    @patch.object(Like.objects, 'get_or_create')
    def test_like_already_exists(self, mock_get_or_create):
        user = MagicMock()
        tweet = MagicMock()
        mock_get_or_create.return_value = (MagicMock(), False)
        _, created = TweetEngagementService.like(tweet, user)
        self.assertFalse(created)

    # ---- unlike ----
    @patch.object(Like.objects, 'filter')
    def test_unlike_deletes_and_returns_true(self, mock_filter):
        user = MagicMock()
        tweet = MagicMock()
        mock_qs = MagicMock()
        mock_qs.delete.return_value = (1, {})  # one deleted
        mock_filter.return_value = mock_qs
        result = TweetEngagementService.unlike(tweet, user)
        self.assertTrue(result)

    @patch.object(Like.objects, 'filter')
    def test_unlike_nothing_there_returns_false(self, mock_filter):
        user = MagicMock()
        tweet = MagicMock()
        mock_qs = MagicMock()
        mock_qs.delete.return_value = (0, {})
        mock_filter.return_value = mock_qs
        result = TweetEngagementService.unlike(tweet, user)
        self.assertFalse(result)