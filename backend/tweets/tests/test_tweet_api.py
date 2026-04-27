"""Test suite for tweet API endpoints."""
import tempfile
from PIL import Image
from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from tweets.models import Tweet, ReTweet, Like
from accounts.models import Follower

User = get_user_model()


def create_test_image(name='test.jpg', size=(100, 100), color='blue'):
    image = Image.new('RGB', size, color)
    tmp_file = tempfile.NamedTemporaryFile(suffix='.jpg')
    image.save(tmp_file, 'jpeg')
    tmp_file.seek(0)
    return SimpleUploadedFile(name, tmp_file.read(), content_type='image/jpeg')


class TweetListDetailAPITestCase(TestCase):
    """Test cases for tweet list and detail endpoints."""
    
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

        self.public_tweet = Tweet.objects.create(user=self.user1, content='Public tweet from user1')
        self.private_tweet = Tweet.objects.create(user=self.user2, content='Private tweet from user2')
        self.other_public_tweet = Tweet.objects.create(user=self.user3, content='Another public tweet')

    def test_list_tweets_shows_only_visible(self):
        Follower.objects.create(follower=self.user1, followee=self.user2)
        url = reverse('tweet-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        contents = [t['message'] for t in results]
        self.assertIn('Public tweet from user1', contents)
        self.assertIn('Private tweet from user2', contents)
        self.assertIn('Another public tweet', contents)

    def test_list_tweets_hides_private_if_not_following(self):
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
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TweetCreateAPITestCase(TestCase):
    """Test cases for creating tweets."""
    
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

        self.public_tweet = Tweet.objects.create(user=self.user1, content='Public tweet from user1')
        self.private_tweet = Tweet.objects.create(user=self.user2, content='Private tweet from user2')

    def test_create_tweet_text_only(self):
        url = reverse('tweet-list')
        data = {'content': 'A simple tweet'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tweet.objects.filter(user=self.user1).count(), 2)
        self.assertEqual(response.data['message'], 'A simple tweet')

    def test_create_tweet_with_media(self):
        url = reverse('tweet-list')
        image = create_test_image('tweet_media.jpg')
        data = {'content': 'Media tweet', 'media': image}
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Tweet.objects.get(id=response.data['id']).media.name.startswith('tweet_media/'))

    def test_create_reply_to_visible_tweet(self):
        url = reverse('tweet-list')
        data = {'content': 'Replying', 'parent_tweet': self.public_tweet.pk}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        reply = Tweet.objects.get(id=response.data['id'])
        self.assertEqual(reply.parent_tweet, self.public_tweet)

    def test_create_reply_to_invisible_tweet_fails(self):
        url = reverse('tweet-list')
        data = {'content': 'Cannot reply', 'parent_tweet': self.private_tweet.pk}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('not visible', response.data['detail']['error'])


class TweetDeleteAPITestCase(TestCase):
    """Test cases for deleting tweets."""
    
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

    def test_delete_own_tweet(self):
        tweet = Tweet.objects.create(user=self.user1, content='To be deleted')
        url = reverse('tweet-detail', kwargs={'pk': tweet.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Tweet.objects.filter(pk=tweet.pk).exists())

    def test_delete_others_tweet_fails(self):
        tweet = Tweet.objects.create(user=self.user2, content='Cannot delete')
        url = reverse('tweet-detail', kwargs={'pk': tweet.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_tweet_orphans_replies(self):
        parent = Tweet.objects.create(user=self.user1, content='Parent')
        reply = Tweet.objects.create(user=self.user2, content='Reply', parent_tweet=parent)
        url = reverse('tweet-detail', kwargs={'pk': parent.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        reply.refresh_from_db()
        self.assertIsNone(reply.parent_tweet)

    def test_delete_tweet_cascades_retweets(self):
        from tweets.services.engagement import TweetEngagementService
        tweet = Tweet.objects.create(user=self.user1, content='RT me')
        ReTweet.objects.create(user=self.user2, original_tweet=tweet)
        self.assertEqual(TweetEngagementService.get_retweet_count(tweet), 1)
        url = reverse('tweet-detail', kwargs={'pk': tweet.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ReTweet.objects.filter(original_tweet=tweet).count(), 0)

    def test_delete_tweet_cascades_likes(self):
        from tweets.services.engagement import TweetEngagementService
        tweet = Tweet.objects.create(user=self.user1, content='Like me')
        Like.objects.create(user=self.user2, tweet=tweet)
        self.assertEqual(TweetEngagementService.get_like_count(tweet), 1)
        url = reverse('tweet-detail', kwargs={'pk': tweet.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Like.objects.filter(tweet=tweet).count(), 0)

    def test_delete_tweet_with_deep_reply_chain(self):
        parent = Tweet(user=self.user1, content='Parent')
        parent.save()

        reply1 = Tweet(user=self.user1, content='Reply 1', parent_tweet=parent)
        reply1.save()
        reply2 = Tweet(user=self.user1, content='Reply 2', parent_tweet=reply1)
        reply2.save()
        reply3 = Tweet(user=self.user1, content='Reply 3', parent_tweet=reply2)
        reply3.save()

        url = reverse('tweet-detail', kwargs={'pk': parent.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        reply1.refresh_from_db()
        self.assertIsNone(reply1.parent_tweet)

        reply2.refresh_from_db()
        self.assertEqual(reply2.parent_tweet, reply1)
        reply3.refresh_from_db()
        self.assertEqual(reply3.parent_tweet, reply2)