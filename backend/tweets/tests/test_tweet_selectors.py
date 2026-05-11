from django.test import TestCase
from django.contrib.auth import get_user_model
from tweets.models import Tweet, ReTweet
from tweets.selectors import get_reply_count, is_retweeted_by


User = get_user_model()

class TestTweetSelectors(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='u1', email='u1@a.com', password='p')
        self.user2 = User.objects.create_user(username='u2', email='u2@a.com', password='p')
        self.parent_tweet = Tweet.objects.create(user=self.user1, content='Parent')
        Tweet.objects.create(user=self.user2, content='Reply', parent_tweet=self.parent_tweet)
        ReTweet.objects.create(user=self.user1, original_tweet=self.parent_tweet)

    def test_reply_count(self):
        self.assertEqual(get_reply_count(self.parent_tweet), 1)

    def test_is_retweeted_by_true(self):
        self.assertTrue(is_retweeted_by(self.parent_tweet, self.user1))

    def test_is_retweeted_by_false(self):
        self.assertFalse(is_retweeted_by(self.parent_tweet, self.user2))