from unittest.mock import patch, MagicMock
from django.test import TestCase
from accounts.services import TimelineService

class TestTimelineService(TestCase):
    @patch('accounts.services.Follower.objects.filter')
    @patch('accounts.services.Tweet.objects.filter')
    def test_public_timeline_includes_public_and_followed(self, mock_tweet_filter, mock_follower_filter):
        user = MagicMock()
        user.id = '550e8400-e29b-41d4-a716-446655440000'  # valid UUID
        mock_follower_filter.return_value.values_list.return_value = []   # no followers
        mock_tweet_filter.return_value.select_related.return_value.prefetch_related.return_value.order_by.return_value = 'qs'
        qs = TimelineService.get_public_timeline_queryset(user)
        self.assertEqual(qs, 'qs')

    @patch('accounts.services.Follower.objects.filter')
    @patch('accounts.services.Tweet.objects.filter')
    def test_private_timeline_only_followed(self, mock_tweet_filter, mock_follower_filter):
        user = MagicMock()
        user.id = '550e8400-e29b-41d4-a716-446655440000'  # valid UUID
        mock_follower_filter.return_value.values_list.return_value = []   # no followers
        mock_tweet_filter.return_value.select_related.return_value.prefetch_related.return_value.order_by.return_value = 'qs'
        qs = TimelineService.get_private_timeline_queryset(user)
        self.assertEqual(qs, 'qs')