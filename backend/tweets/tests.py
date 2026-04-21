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


class TweetAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create users with UNIQUE emails
        self.user1 = User.objects.create_user(
            username='tweeter1', password='pass', email='tweeter1@example.com', is_public_user=True
        )
        self.user2 = User.objects.create_user(
            username='tweeter2', password='pass', email='tweeter2@example.com', is_public_user=False
        )
        self.user3 = User.objects.create_user(
            username='tweeter3', password='pass', email='tweeter3@example.com', is_public_user=True
        )

        # Get token for user1
        token_url = reverse('token_obtain_pair')
        resp = self.client.post(token_url, {'username': 'tweeter1', 'password': 'pass'})
        self.token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Create tweets
        self.public_tweet = Tweet.objects.create(user=self.user1, content='Public tweet from user1')
        self.private_tweet = Tweet.objects.create(user=self.user2, content='Private tweet from user2')
        self.other_public_tweet = Tweet.objects.create(user=self.user3, content='Another public tweet')

    # ------------------------------------------------------------------
    # Tweet List / Detail
    # ------------------------------------------------------------------
    def test_list_tweets_shows_only_visible(self):
        # user1 follows user2 to see their private tweet
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

    # ------------------------------------------------------------------
    # Create Tweet (text, media, reply, parent visibility)
    # ------------------------------------------------------------------
    def test_create_tweet_text_only(self):
        url = reverse('tweet-list')
        data = {'content': 'A simple tweet'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tweet.objects.count(), 4)
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
        self.assertIn('parent_tweet', response.data)

    # ------------------------------------------------------------------
    # Delete Tweet (hard delete, orphan replies, cascade retweets/likes)
    # ------------------------------------------------------------------
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
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)  # not visible, so 404

    def test_delete_tweet_orphans_replies(self):
        parent = Tweet.objects.create(user=self.user1, content='Parent')
        reply = Tweet.objects.create(user=self.user2, content='Reply', parent_tweet=parent)
        url = reverse('tweet-detail', kwargs={'pk': parent.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        reply.refresh_from_db()
        self.assertIsNone(reply.parent_tweet)  # orphaned

    def test_delete_tweet_cascades_retweets(self):
        tweet = Tweet.objects.create(user=self.user1, content='RT me')
        ReTweet.objects.create(user=self.user2, original_tweet=tweet)
        self.assertEqual(tweet.get_retweet_count(), 1)
        url = reverse('tweet-detail', kwargs={'pk': tweet.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ReTweet.objects.filter(original_tweet=tweet).count(), 0)

    def test_delete_tweet_cascades_likes(self):
        tweet = Tweet.objects.create(user=self.user1, content='Like me')
        Like.objects.create(user=self.user2, tweet=tweet)
        self.assertEqual(tweet.get_like_count(), 1)
        url = reverse('tweet-detail', kwargs={'pk': tweet.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Like.objects.filter(tweet=tweet).count(), 0)

    # ------------------------------------------------------------------
    # Retweet / Unretweet (including self-retweet prevention, duplicate)
    # ------------------------------------------------------------------
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
        url = reverse('retweet', kwargs={'pk': self.public_tweet.pk})  # user1's own tweet
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

    # ------------------------------------------------------------------
    # Like / Unlike (including duplicate handling)
    # ------------------------------------------------------------------
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
        self.assertTrue(response.data['is_liked'])  # user1 liked it