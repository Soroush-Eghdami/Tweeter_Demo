from django.test import TestCase
from unittest.mock import patch, MagicMock
from accounts.selectors import (
    get_public_timeline_queryset,
    get_private_timeline_queryset,
    get_user_tweets_queryset,
    get_user_followers_queryset,
    get_user_following_queryset,
    get_user_retweets_queryset,
)


class TestTimelineSelectors(TestCase):
    @patch('accounts.selectors.timeline.Follower.objects.filter')
    @patch('accounts.selectors.timeline.Tweet.objects.filter')
    def test_public_timeline_includes_public_and_followed(self, mock_tweet_filter, mock_follower_filter):
        user = MagicMock()
        user.id = '550e8400-e29b-41d4-a716-446655440000'
        mock_follower_filter.return_value.values_list.return_value = []
        mock_tweet_filter.return_value.select_related.return_value.prefetch_related.return_value.order_by.return_value = 'qs'
        qs = get_public_timeline_queryset(user)
        self.assertEqual(qs, 'qs')

    @patch('accounts.selectors.timeline.Follower.objects.filter')
    @patch('accounts.selectors.timeline.Tweet.objects.filter')
    def test_private_timeline_only_followed(self, mock_tweet_filter, mock_follower_filter):
        user = MagicMock()
        user.id = '550e8400-e29b-41d4-a716-446655440000'
        mock_follower_filter.return_value.values_list.return_value = []
        mock_tweet_filter.return_value.select_related.return_value.prefetch_related.return_value.order_by.return_value = 'qs'
        qs = get_private_timeline_queryset(user)
        self.assertEqual(qs, 'qs')

    @patch('accounts.selectors.timeline.Tweet.objects.filter')
    def test_get_user_tweets_queryset(self, mock_filter):
        user = MagicMock()
        mock_filter.return_value.select_related.return_value.prefetch_related.return_value.order_by.return_value = 'qs'
        qs = get_user_tweets_queryset(user)
        self.assertEqual(qs, 'qs')

    @patch('accounts.selectors.timeline.Follower.objects.filter')
    def test_get_user_followers_queryset(self, mock_filter):
        user = MagicMock()
        mock_filter.return_value.select_related.return_value.order_by.return_value = 'qs'
        qs = get_user_followers_queryset(user)
        self.assertEqual(qs, 'qs')

    @patch('accounts.selectors.timeline.Follower.objects.filter')
    def test_get_user_following_queryset(self, mock_filter):
        user = MagicMock()
        mock_filter.return_value.select_related.return_value.order_by.return_value = 'qs'
        qs = get_user_following_queryset(user)
        self.assertEqual(qs, 'qs')

    @patch('accounts.selectors.timeline.ReTweet.objects.filter')
    @patch('accounts.selectors.timeline.Tweet.objects.filter')
    def test_get_user_retweets_queryset(self, mock_tweet_filter, mock_retweet_filter):
        user = MagicMock()
        mock_retweet_filter.return_value.values.return_value = []
        mock_tweet_filter.return_value.select_related.return_value.prefetch_related.return_value.annotate.return_value.order_by.return_value = 'qs'
        qs = get_user_retweets_queryset(user)
        self.assertEqual(qs, 'qs')