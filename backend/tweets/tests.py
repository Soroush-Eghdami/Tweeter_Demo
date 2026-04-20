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
    # Retweet
    # ------------------------------------------------------------------
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

    # ------------------------------------------------------------------
    # Like / Unlike
    # ------------------------------------------------------------------
    def test_like_tweet(self):
        url = reverse('like-tweet', kwargs={'pk': self.public_tweet.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Liked')
        self.assertEqual(response.data['like_count'], 1)
        self.assertTrue(Like.objects.filter(user=self.user1, tweet=self.public_tweet).exists())

    def test_like_tweet_twice_is_idempotent(self):
        url = reverse('like-tweet', kwargs={'pk': self.public_tweet.pk})
        self.client.post(url)  # first like
        response = self.client.post(url)  # second like
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

    def test_unlike_not_liked_returns_400(self):
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

    # ------------------------------------------------------------------
    # Tweet with Media
    # ------------------------------------------------------------------
    def test_tweet_with_media_upload(self):
        # Note: You need a tweet creation endpoint to test this fully.
        # Assuming you'll add POST /tweets/ later.
        # For now, test via model.
        image = create_test_image('tweet_media.jpg')
        tweet = Tweet.objects.create(user=self.user1, content='Media tweet', media=image)
        self.assertTrue(tweet.media.name.startswith('tweet_media/tweet_media'))
        
    # ------------------------------------------------------------------
    # Tweet new API for create and delete
    # ------------------------------------------------------------------

    def test_create_tweet(self):
        url = reverse('tweet-list')
        data = {'content': 'A new tweet!'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tweet.objects.count(), 4)  # 3 from setUp + 1 new
        self.assertEqual(response.data['message'], 'A new tweet!')

    def test_create_tweet_with_media(self):
        url = reverse('tweet-list')
        image = create_test_image('tweet.jpg')
        data = {'content': 'Media tweet', 'media': image}
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Tweet.objects.get(id=response.data['id']).media.name.startswith('tweet_media/'))

    def test_create_tweet_unauthenticated(self):
        self.client.credentials()  # remove token
        url = reverse('tweet-list')
        data = {'content': 'Unauthorized tweet'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_own_tweet(self):
        tweet = Tweet.objects.create(user=self.user1, content='Delete me')
        url = reverse('tweet-detail', kwargs={'pk': tweet.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Tweet.objects.filter(pk=tweet.pk).exists())

    def test_delete_others_tweet_fails(self):
        tweet = Tweet.objects.create(user=self.user2, content='Cannot delete')
        url = reverse('tweet-detail', kwargs={'pk': tweet.pk})
        response = self.client.delete(url)
        # Private tweet not visible -> 404
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Tweet.objects.filter(pk=tweet.pk).exists())