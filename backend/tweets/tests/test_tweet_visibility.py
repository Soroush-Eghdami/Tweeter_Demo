"""Test suite for tweet visibility and error handling."""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from tweets.models import Tweet
from accounts.models import Follower

User = get_user_model()


class TweetVisibilityTestCase(TestCase):
    """Test cases for tweet visibility rules."""
    
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='tweeter1', password='pass', email='tweeter1@example.com', is_public_user=True
        )
        self.user2 = User.objects.create_user(
            username='tweeter2', password='pass', email='tweeter2@example.com', is_public_user=False
        )

        token_url = reverse('token_obtain_pair')
        resp = self.client.post(token_url, {'username': 'tweeter1', 'password': 'pass'})
        self.token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_private_tweet_visibility_in_replies(self):
        """Verify visibility rules apply to reply chains."""
        private_tweet = Tweet(user=self.user2, content='Private')
        private_tweet.save()

        url = reverse('tweet-list')
        data = {'content': 'Reply', 'parent_tweet': private_tweet.pk}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TweetErrorHandlingTestCase(TestCase):
    """Test cases for consistent error handling."""
    
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='tweeter1', password='pass', email='tweeter1@example.com', is_public_user=True
        )

        token_url = reverse('token_obtain_pair')
        resp = self.client.post(token_url, {'username': 'tweeter1', 'password': 'pass'})
        self.token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.public_tweet = Tweet.objects.create(user=self.user1, content='Public tweet')

    def test_error_response_format_consistency(self):
        """Verify all error responses follow consistent format."""
        url = reverse('tweet-detail', kwargs={'pk': 99999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['status'], 404)

    def test_like_nonexistent_tweet_error(self):
        """Verify error format when liking nonexistent tweet."""
        url = reverse('like-tweet', kwargs={'pk': 99999})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

    def test_unlike_not_liked_error(self):
        """Verify error format when unliking a tweet that wasn't liked."""
        url = reverse('unlike-tweet', kwargs={'pk': self.public_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_retweet_own_tweet_error(self):
        """Verify error format when trying to retweet own tweet."""
        url = reverse('retweet', kwargs={'pk': self.public_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
