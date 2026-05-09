from django.test import TestCase
from tweets.models import Like, Tweet, ReTweet
from accounts.models import Follower
from accounts.models import User
from accounts.selectors.user import (
    get_followers_count,
    get_following_count,
    get_likes_received_count,
    get_tweets_count,
    get_retweets_made_count,
)


class TestUserProfileSelectors(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="u1", email="u1@a.com", password="p"
        )
        self.user2 = User.objects.create_user(
            username="u2", email="u2@a.com", password="p"
        )
        self.user3 = User.objects.create_user(
            username="u3", email="u3@a.com", password="p"
        )

        # user1 follows user2 and user3
        Follower.objects.create(follower=self.user1, followee=self.user2)
        Follower.objects.create(follower=self.user1, followee=self.user3)
        # user2 follows user1
        Follower.objects.create(follower=self.user2, followee=self.user1)

        # user1 has 2 tweets, and they receive likes
        self.tweet1 = Tweet.objects.create(user=self.user1, content="Hello")
        self.tweet2 = Tweet.objects.create(user=self.user1, content="World")
        Like.objects.create(user=self.user2, tweet=self.tweet1)
        Like.objects.create(user=self.user3, tweet=self.tweet1)
        Like.objects.create(user=self.user2, tweet=self.tweet2)

        # user1 retweets some tweets from user2 and user3
        tweet_by_user2 = Tweet.objects.create(user=self.user2, content='u2 tweet')
        tweet_by_user3 = Tweet.objects.create(user=self.user3, content='u3 tweet')
        ReTweet.objects.create(user=self.user1, original_tweet=tweet_by_user2)
        ReTweet.objects.create(user=self.user1, original_tweet=tweet_by_user3)

    def test_followers_count(self):
        self.assertEqual(get_followers_count(self.user1), 1)

    def test_following_count(self):
        self.assertEqual(get_following_count(self.user1), 2)

    def test_tweets_count(self):
        self.assertEqual(get_tweets_count(self.user1), 2)

    def test_likes_received_count(self):
        self.assertEqual(get_likes_received_count(self.user1), 3)

    def test_retweets_made_count(self):
        self.assertEqual(get_retweets_made_count(self.user1), 2)