"""Test suite for tweet reply validation (depth limits, circular references)."""
from django.test import TestCase
from django.urls import reverse
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from tweets.models import Tweet
from tweets.reply_service import ReplyService

User = get_user_model()


class TweetReplyDepthLimitTestCase(TestCase):
    """Test cases for reply depth limits."""
    
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

    def test_reply_depth_limit_enforced(self):
        """Verify that reply chains cannot exceed MAX_REPLY_DEPTH."""
        current = Tweet(user=self.user1, content='Root tweet')
        current.save()

        for i in range(ReplyService.MAX_REPLY_DEPTH):
            current = Tweet(user=self.user1, content=f'Reply {i}', parent_tweet=current)
            current.save()

        self.assertEqual(ReplyService.get_reply_depth(current), ReplyService.MAX_REPLY_DEPTH)

        too_deep = Tweet(user=self.user1, content='Too deep', parent_tweet=current)
        with self.assertRaises(ValidationError):
            ReplyService.validate_reply(too_deep)

    def test_reply_depth_validation_via_api(self):
        """Verify that API rejects tweets exceeding max depth."""
        parent = self.public_tweet
        for i in range(ReplyService.MAX_REPLY_DEPTH):
            url = reverse('tweet-list')
            data = {'content': f'Reply {i}', 'parent_tweet': parent.pk}
            response = self.client.post(url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            parent = Tweet.objects.get(id=response.data['id'])

        url = reverse('tweet-list')
        data = {'content': 'Too deep', 'parent_tweet': parent.pk}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot exceed', str(response.data['detail']).lower())


class TweetCircularReferenceTestCase(TestCase):
    """Test cases for circular reference prevention."""
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='tweeter1', password='pass', email='tweeter1@example.com', is_public_user=True
        )

    def test_circular_reference_prevented(self):
        """Verify that circular reply chains are prevented."""
        tweet_a = Tweet(user=self.user1, content='Tweet A')
        tweet_a.save()
        tweet_b = Tweet(user=self.user1, content='Tweet B', parent_tweet=tweet_a)
        tweet_b.save()

        tweet_a.parent_tweet = tweet_b
        with self.assertRaises(ValidationError):
            ReplyService.validate_reply(tweet_a)

    def test_self_reply_prevented(self):
        """Verify that a tweet cannot reply to itself."""
        tweet = Tweet(user=self.user1, content='Self reply attempt')
        tweet.save()
        tweet.parent_tweet = tweet
        with self.assertRaises(ValidationError):
            ReplyService.validate_reply(tweet)


class TweetReplyHierarchyTestCase(TestCase):
    """Test cases for reply hierarchy and relationships."""
    
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='tweeter1', password='pass', email='tweeter1@example.com', is_public_user=True
        )

        token_url = reverse('token_obtain_pair')
        resp = self.client.post(token_url, {'username': 'tweeter1', 'password': 'pass'})
        self.token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_reply_to_reply_preserves_hierarchy(self):
        """Verify reply chain maintains proper parent-child relationships."""
        root = Tweet(user=self.user1, content='Root')
        root.save()
        child1 = Tweet(user=self.user1, content='Child 1', parent_tweet=root)
        child1.save()
        child2 = Tweet(user=self.user1, content='Child 2', parent_tweet=child1)
        child2.save()

        fetched_child2 = Tweet.objects.get(id=child2.id)
        self.assertEqual(fetched_child2.parent_tweet.id, child1.id)
        self.assertEqual(fetched_child2.parent_tweet.parent_tweet.id, root.id)