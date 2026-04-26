from django.test import TestCase
from unittest.mock import MagicMock
from tweets.services.reply import ReplyService
from django.core.exceptions import ValidationError

class TestReplyService(TestCase):
    def test_depth_within_limit(self):
        tweet = MagicMock()
        tweet.parent_tweet = None  # root
        # should not raise an error
        ReplyService.validate_reply(tweet)

    def test_depth_exceeds_limit(self):
        parent = MagicMock()
        parent.parent_tweet = None
        for _ in range(10):
            new_parent = MagicMock()
            new_parent.parent_tweet = parent
            parent = new_parent
        tweet = MagicMock()
        tweet.parent_tweet = parent
        with self.assertRaises(ValidationError):
            ReplyService.validate_reply(tweet)
            
    def test_circular_reference_detected(self):
        tweet = MagicMock()
        parent = MagicMock()
        parent.id = 5
        parent.parent_tweet = tweet
        tweet.parent_tweet = parent
        tweet.id = 10
        with self.assertRaises(ValidationError):
            ReplyService.validate_reply(tweet)