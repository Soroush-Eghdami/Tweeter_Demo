from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from accounts.models import Follower
from tweets.models import Tweet

User = get_user_model()

class AccountsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create users
        self.user1 = User.objects.create_user(username='alice', password='alicepass', email='alice@example.com')
        self.user2 = User.objects.create_user(username='bob', password='bobpass', email='bob@example.com')
        self.user3 = User.objects.create_user(username='charlie', password='charliepass', email='charlie@example.com', is_public_user=False)

        # Obtain JWT token for user1
        token_url = reverse('token_obtain_pair')
        response = self.client.post(token_url, {'username': 'alice', 'password': 'alicepass'}, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    # ------------------------------------------------------------------
    # Profile Endpoints (GET, PATCH, DELETE)
    # ------------------------------------------------------------------
    def test_get_own_profile(self):
        url = reverse('user-profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'alice')

    def test_patch_profile_update_email(self):
        url = reverse('user-profile')
        data = {'email': 'alice.new@example.com', 'bio': 'Updated bio'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.email, 'alice.new@example.com')
        self.assertEqual(self.user1.bio, 'Updated bio')

    def test_delete_own_account(self):
        url = reverse('user-profile')
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username='alice').exists())

    # ------------------------------------------------------------------
    # User List/Detail
    # ------------------------------------------------------------------
    def test_user_list(self):
        url = reverse('user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 3)

    def test_user_detail(self):
        url = reverse('user-detail', kwargs={'pk': self.user2.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'bob')
        self.assertIn('is_following', response.data)

    # ------------------------------------------------------------------
    # Follow/Unfollow
    # ------------------------------------------------------------------
    def test_follow_user(self):
        url = reverse('follow-user')
        data = {'followee_id': str(self.user2.id)}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Follower.objects.filter(follower=self.user1, followee=self.user2).exists())

    def test_follow_self_fails(self):
        url = reverse('follow-user')
        data = {'followee_id': str(self.user1.id)}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('yourself', response.data['error'])

    def test_unfollow_user(self):
        # First follow
        Follower.objects.create(follower=self.user1, followee=self.user2)
        url = reverse('unfollow-user')
        data = {'followee_id': str(self.user2.id)}
        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Follower.objects.filter(follower=self.user1, followee=self.user2).exists())

    def test_unfollow_not_following_fails(self):
        url = reverse('unfollow-user')
        data = {'followee_id': str(self.user2.id)}
        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('not following', response.data['error'])

    # ------------------------------------------------------------------
    # Timelines
    # ------------------------------------------------------------------
    def test_public_timeline_includes_public_tweets(self):
        # user2 is public, user3 is private
        tweet_public = Tweet.objects.create(user=self.user2, content='Public tweet')
        tweet_private = Tweet.objects.create(user=self.user3, content='Private tweet')
        # user1 follows nobody yet, so only public tweets appear
        url = reverse('public-timeline')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        contents = [t['message'] for t in response.data]
        self.assertIn('Public tweet', contents)
        self.assertNotIn('Private tweet', contents)

    def test_private_timeline_shows_only_followed(self):
        # user1 follows user2
        Follower.objects.create(follower=self.user1, followee=self.user2)
        tweet_followed = Tweet.objects.create(user=self.user2, content='Followed tweet')
        tweet_not_followed = Tweet.objects.create(user=self.user3, content='Not followed tweet')
        url = reverse('private-timeline')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        contents = [t['message'] for t in response.data]
        self.assertIn('Followed tweet', contents)
        self.assertNotIn('Not followed tweet', contents)

    def test_user_tweets_endpoint(self):
        Tweet.objects.create(user=self.user2, content='Bob tweet 1')
        Tweet.objects.create(user=self.user2, content='Bob tweet 2')
        url = reverse('user-tweets', kwargs={'user_id': self.user2.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_user_followers_endpoint(self):
        Follower.objects.create(follower=self.user2, followee=self.user1)
        url = reverse('user-followers', kwargs={'user_id': self.user1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['follower']['username'], 'bob')

    def test_user_following_endpoint(self):
        Follower.objects.create(follower=self.user1, followee=self.user2)
        url = reverse('user-following', kwargs={'user_id': self.user1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['followee']['username'], 'bob')


class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123')

    def test_register_user(self):
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'ComplexPass123!',
            'password2': 'ComplexPass123!',
            'first_name': 'New',
            'last_name': 'User',
            'bio': 'Hello'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_login_jwt(self):
        url = reverse('token_obtain_pair')
        data = {'username': 'testuser', 'password': 'testpass123'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_refresh_token(self):
        # Get token first
        token_url = reverse('token_obtain_pair')
        response = self.client.post(token_url, {'username': 'testuser', 'password': 'testpass123'}, format='json')
        refresh = response.data['refresh']
        refresh_url = reverse('token_refresh')
        response = self.client.post(refresh_url, {'refresh': refresh}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)