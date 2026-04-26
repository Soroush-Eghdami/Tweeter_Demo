"""Test suite for tweet engagement (retweets, likes)."""
from django.test import TestCase
from django.urls import reverse
from django.test.utils import CaptureQueriesContext
from django.db import connection
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from tweets.models import Tweet, ReTweet, Like
from tweets.services.engagement import TweetEngagementService

User = get_user_model()


class TweetRetweetAPITestCase(TestCase):
    """Test cases for retweet functionality."""
    
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='tweeter1', password='pass', email='tweeter1@example.com', is_public_user=True
        )
        self.user2 = User.objects.create_user(
            username='tweeter2', password='pass', email='tweeter2@example.com', is_public_user=False
        )
        self.user3 = User.objects.create_user(
            username='tweeter3', password='pass', email='tweeter3@example.com', is_public_user=True
        )

        token_url = reverse('token_obtain_pair')
        resp = self.client.post(token_url, {'username': 'tweeter1', 'password': 'pass'})
        self.token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.public_tweet = Tweet.objects.create(user=self.user1, content='Public tweet')
        self.other_public_tweet = Tweet.objects.create(user=self.user3, content='Another public tweet')
        self.private_tweet = Tweet.objects.create(user=self.user2, content='Private tweet')

    def test_retweet_public_tweet(self):
        url = reverse('retweet', kwargs={'pk': self.other_public_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ReTweet.objects.filter(user=self.user1, original_tweet=self.other_public_tweet).exists())

    def test_retweet_private_tweet_fails_if_not_following(self):
        url = reverse('retweet', kwargs={'pk': self.private_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_retweet_own_tweet_fails(self):
        url = reverse('retweet', kwargs={'pk': self.public_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('own tweet', response.data['error'])

    def test_retweet_duplicate_returns_200(self):
        url = reverse('retweet', kwargs={'pk': self.other_public_tweet.pk})
        self.client.post(url)  # first time
        response = self.client.post(url)  # duplicate
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Already retweeted')

    def test_unretweet(self):
        ReTweet.objects.create(user=self.user1, original_tweet=self.other_public_tweet)
        url = reverse('unretweet', kwargs={'pk': self.other_public_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(ReTweet.objects.filter(user=self.user1, original_tweet=self.other_public_tweet).exists())

    def test_unretweet_not_retweeted_fails(self):
        url = reverse('unretweet', kwargs={'pk': self.public_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('not retweeted', response.data['error'])


class TweetLikeAPITestCase(TestCase):
    """Test cases for like functionality."""
    
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='tweeter1', password='pass', email='tweeter1@example.com', is_public_user=True
        )
        self.user2 = User.objects.create_user(
            username='tweeter2', password='pass', email='tweeter2@example.com', is_public_user=True
        )
        self.user3 = User.objects.create_user(
            username='tweeter3', password='pass', email='tweeter3@example.com', is_public_user=True
        )

        token_url = reverse('token_obtain_pair')
        resp = self.client.post(token_url, {'username': 'tweeter1', 'password': 'pass'})
        self.token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.public_tweet = Tweet.objects.create(user=self.user1, content='Public tweet')

    def test_like_tweet(self):
        url = reverse('like-tweet', kwargs={'pk': self.public_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Liked')
        self.assertEqual(response.data['like_count'], 1)
        self.assertTrue(Like.objects.filter(user=self.user1, tweet=self.public_tweet).exists())

    def test_like_tweet_duplicate_returns_200(self):
        url = reverse('like-tweet', kwargs={'pk': self.public_tweet.pk})
        self.client.post(url)  # first like
        response = self.client.post(url)  # duplicate
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Already liked')
        self.assertEqual(Like.objects.filter(user=self.user1, tweet=self.public_tweet).count(), 1)

    def test_unlike_tweet(self):
        Like.objects.create(user=self.user1, tweet=self.public_tweet)
        url = reverse('unlike-tweet', kwargs={'pk': self.public_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Unliked')
        self.assertEqual(response.data['like_count'], 0)
        self.assertFalse(Like.objects.filter(user=self.user1, tweet=self.public_tweet).exists())

    def test_unlike_not_liked_fails(self):
        url = reverse('unlike-tweet', kwargs={'pk': self.public_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('not liked', response.data['error'])

    def test_like_count_in_tweet_serializer(self):
        Like.objects.create(user=self.user1, tweet=self.public_tweet)
        Like.objects.create(user=self.user3, tweet=self.public_tweet)
        url = reverse('tweet-detail', kwargs={'pk': self.public_tweet.pk})
        response = self.client.get(url)
        self.assertEqual(response.data['like_count'], 2)
        self.assertTrue(response.data['is_liked'])

    def test_concurrent_like_same_tweet(self):
        """Verify that duplicate likes are handled (unique constraint)."""
        url = reverse('like-tweet', kwargs={'pk': self.public_tweet.pk})

        response1 = self.client.post(url)
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        response2 = self.client.post(url)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)

        self.assertEqual(Like.objects.filter(user=self.user1, tweet=self.public_tweet).count(), 1)


class TweetQueryOptimizationTestCase(TestCase):
    """Test cases for query optimization (N+1 prevention)."""
    
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='tweeter1', password='pass', email='tweeter1@example.com', is_public_user=True
        )
        self.user2 = User.objects.create_user(
            username='tweeter2', password='pass', email='tweeter2@example.com', is_public_user=True
        )
        self.user3 = User.objects.create_user(
            username='tweeter3', password='pass', email='tweeter3@example.com', is_public_user=True
        )

        token_url = reverse('token_obtain_pair')
        resp = self.client.post(token_url, {'username': 'tweeter1', 'password': 'pass'})
        self.token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.public_tweet = Tweet.objects.create(user=self.user1, content='Public tweet')

    def test_tweet_list_queries_optimized(self):
        """Verify that listing tweets query count does not explode with more tweets."""
        url = reverse('tweet-list')
    
        with CaptureQueriesContext(connection) as context1:
            response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        initial_queries = len(context1.captured_queries)
        initial_results = len(response.data['results'])
    
        # Create 5 more tweets
        for i in range(5):
            tweet = Tweet.objects.create(user=self.user1, content=f'Tweet {i}')
            Like.objects.create(user=self.user3, tweet=tweet)
            ReTweet.objects.create(user=self.user2, original_tweet=tweet)
    
        with CaptureQueriesContext(connection) as context2:
            response2 = self.client.get(url)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        second_queries = len(context2.captured_queries)
        second_results = len(response2.data['results'])
    
        # Allow a generous margin for permission fetching
        self.assertLessEqual(second_queries, initial_queries + 30)
        self.assertEqual(second_results, initial_results + 5)