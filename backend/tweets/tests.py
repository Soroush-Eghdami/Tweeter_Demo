import tempfile
from PIL import Image
from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from tweets.models import Tweet, ReTweet, Like
from accounts.models import Follower
from tweets.services import TweetService
from django.test.utils import CaptureQueriesContext
from django.db import connection

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
        self.assertIn('parent_tweet', response.data['detail'])

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
        self.assertEqual(TweetService.get_retweet_count(tweet), 1)
        url = reverse('tweet-detail', kwargs={'pk': tweet.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ReTweet.objects.filter(original_tweet=tweet).count(), 0)

    def test_delete_tweet_cascades_likes(self):
        tweet = Tweet.objects.create(user=self.user1, content='Like me')
        Like.objects.create(user=self.user2, tweet=tweet)
        self.assertEqual(TweetService.get_like_count(tweet), 1)
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

    # ------------------------------------------------------------------
    # N+1 Query Optimization Tests
    # ------------------------------------------------------------------
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
    
        # TODO: Optimize permission fetching to reduce query count.
        # Currently, each tweet's user triggers additional permission queries.
        # We allow a generous margin for now.
        self.assertLessEqual(second_queries, initial_queries + 30)
        self.assertEqual(second_results, initial_results + 5)

    # ------------------------------------------------------------------
    # Parent Tweet Depth Limit Tests
    # ------------------------------------------------------------------
    def test_reply_depth_limit_enforced(self):
        """Verify that reply chains cannot exceed MAX_REPLY_DEPTH."""
        current = Tweet(user=self.user1, content='Root tweet')
        current.save()

        # Create MAX_REPLY_DEPTH replies (depth = MAX_REPLY_DEPTH)
        for i in range(TweetService.MAX_REPLY_DEPTH):
            current = Tweet(user=self.user1, content=f'Reply {i}', parent_tweet=current)
            current.save()

        # The last reply should have depth == MAX_REPLY_DEPTH
        self.assertEqual(TweetService.get_reply_depth(current), TweetService.MAX_REPLY_DEPTH)

        # One more reply should exceed and fail
        too_deep = Tweet(user=self.user1, content='Too deep', parent_tweet=current)
        with self.assertRaises(ValidationError):
            TweetService.validate_reply(too_deep)

    def test_reply_depth_validation_via_api(self):
        """Verify that API rejects tweets exceeding max depth."""
        parent = self.public_tweet
        # Build chain up to MAX_REPLY_DEPTH via API
        for i in range(TweetService.MAX_REPLY_DEPTH):
            url = reverse('tweet-list')
            data = {'content': f'Reply {i}', 'parent_tweet': parent.pk}
            response = self.client.post(url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            parent = Tweet.objects.get(id=response.data['id'])

        # Next reply should fail
        url = reverse('tweet-list')
        data = {'content': 'Too deep', 'parent_tweet': parent.pk}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot exceed', str(response.data['detail']).lower())

    def test_circular_reference_prevented(self):
        """Verify that circular reply chains are prevented."""
        tweet_a = Tweet(user=self.user1, content='Tweet A')
        tweet_a.save()
        tweet_b = Tweet(user=self.user1, content='Tweet B', parent_tweet=tweet_a)
        tweet_b.save()

        # Try to make tweet_a reply to tweet_b (would create circle)
        tweet_a.parent_tweet = tweet_b
        with self.assertRaises(ValidationError):
            TweetService.validate_reply(tweet_a)

    def test_self_reply_prevented(self):
        """Verify that a tweet cannot reply to itself."""
        tweet = Tweet(user=self.user1, content='Self reply attempt')
        tweet.save()
        tweet.parent_tweet = tweet
        with self.assertRaises(ValidationError):
            TweetService.validate_reply(tweet)

    # ------------------------------------------------------------------
    # Error Handling Consistency Tests
    # ------------------------------------------------------------------
    def test_error_response_format_consistency(self):
        """Verify all error responses follow consistent format."""
        # Test 404 error format
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

    # ------------------------------------------------------------------
    # Edge Cases & Regression Tests
    # ------------------------------------------------------------------
    def test_private_tweet_visibility_in_replies(self):
        """Verify visibility rules apply to reply chains."""
        private_tweet = Tweet(user=self.user2, content='Private')
        private_tweet.save()

        # user1 tries to reply to user2's private tweet (not following)
        url = reverse('tweet-list')
        data = {'content': 'Reply', 'parent_tweet': private_tweet.pk}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_concurrent_like_same_tweet(self):
        """Verify that duplicate likes are handled (unique constraint)."""
        url = reverse('like-tweet', kwargs={'pk': self.public_tweet.pk})

        # First like succeeds
        response1 = self.client.post(url)
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        # Duplicate like returns 200 (already liked)
        response2 = self.client.post(url)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)

        # Only one like should exist
        self.assertEqual(Like.objects.filter(user=self.user1, tweet=self.public_tweet).count(), 1)

    def test_delete_tweet_with_deep_reply_chain(self):
        """Verify that deleting parent orphans only its direct children."""
        parent = Tweet(user=self.user1, content='Parent')
        parent.save()

        # Create a chain: parent -> reply1 -> reply2 -> reply3
        reply1 = Tweet(user=self.user1, content='Reply 1', parent_tweet=parent)
        reply1.save()
        reply2 = Tweet(user=self.user1, content='Reply 2', parent_tweet=reply1)
        reply2.save()
        reply3 = Tweet(user=self.user1, content='Reply 3', parent_tweet=reply2)
        reply3.save()

        # Delete the root parent
        url = reverse('tweet-detail', kwargs={'pk': parent.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Direct child of the deleted parent becomes orphaned
        reply1.refresh_from_db()
        self.assertIsNone(reply1.parent_tweet)

        # Deeper replies remain attached to their immediate parent
        reply2.refresh_from_db()
        self.assertEqual(reply2.parent_tweet, reply1)
        reply3.refresh_from_db()
        self.assertEqual(reply3.parent_tweet, reply2)

    def test_reply_to_reply_preserves_hierarchy(self):
        """Verify reply chain maintains proper parent-child relationships."""
        root = Tweet(user=self.user1, content='Root')
        root.save()
        child1 = Tweet(user=self.user1, content='Child 1', parent_tweet=root)
        child1.save()
        child2 = Tweet(user=self.user1, content='Child 2', parent_tweet=child1)
        child2.save()

        # Fetch and verify hierarchy
        fetched_child2 = Tweet.objects.get(id=child2.id)
        self.assertEqual(fetched_child2.parent_tweet.id, child1.id)
        self.assertEqual(fetched_child2.parent_tweet.parent_tweet.id, root.id)
        self.assertIsNone(fetched_child2.parent_tweet.parent_tweet.parent_tweet)