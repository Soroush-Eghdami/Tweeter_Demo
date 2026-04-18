from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from tweets.models import Tweet, ReTweet
from accounts.models import Follower

User = get_user_model()


class TweetAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='tweeter1', password='pass', is_public_user=True)
        self.user2 = User.objects.create_user(username='tweeter2', password='pass', is_public_user=False)
        self.user3 = User.objects.create_user(username='tweeter3', password='pass', is_public_user=True)

        # Get token for user1
        token_url = reverse('token_obtain_pair')
        resp = self.client.post(token_url, {'username': 'tweeter1', 'password': 'pass'})
        self.token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Create tweets
        self.public_tweet = Tweet.objects.create(user=self.user1, content='Public tweet from user1')
        self.private_tweet = Tweet.objects.create(user=self.user2, content='Private tweet from user2')
        self.other_public_tweet = Tweet.objects.create(user=self.user3, content='Another public tweet')

    def test_list_tweets_shows_only_visible(self):
        # user1 follows user2 (private) to see their tweet
        Follower.objects.create(follower=self.user1, followee=self.user2)
        url = reverse('tweet-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Pagination: response.data is a dict with 'results'
        results = response.data['results']
        contents = [t['message'] for t in results]
        self.assertIn('Public tweet from user1', contents)
        self.assertIn('Private tweet from user2', contents)
        self.assertIn('Another public tweet', contents)

    def test_list_tweets_hides_private_if_not_following(self):
        # user1 does not follow user2
        url = reverse('tweet-list')
        response = self.client.get(url)
        results = response.data['results']
        contents = [t['message'] for t in results]
        self.assertNotIn('Private tweet from user2', contents)

    def test_tweet_detail_visible(self):
        url = reverse('tweet-detail', kwargs={'pk': self.public_tweet.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_tweet_detail_inaccessible_if_private_and_not_following(self):
        url = reverse('tweet-detail', kwargs={'pk': self.private_tweet.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)  # filtered out

    def test_retweet_public_tweet(self):
        url = reverse('retweet', kwargs={'pk': self.public_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ReTweet.objects.filter(user=self.user1, original_tweet=self.public_tweet).exists())

    def test_retweet_private_tweet_fails_if_not_following(self):
        url = reverse('retweet', kwargs={'pk': self.private_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unretweet(self):
        ReTweet.objects.create(user=self.user1, original_tweet=self.public_tweet)
        url = reverse('unretweet', kwargs={'pk': self.public_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(ReTweet.objects.filter(user=self.user1, original_tweet=self.public_tweet).exists())

    def test_unretweet_nonexistent_returns_400(self):
        url = reverse('unretweet', kwargs={'pk': self.public_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('not retweeted', response.data['error'])