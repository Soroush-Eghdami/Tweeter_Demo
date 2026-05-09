import tempfile
from PIL import Image
from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import Follower, PasswordHistory
from tweets.models import Tweet, Like, ReTweet

User = get_user_model()


def create_test_image(name='test.jpg', size=(100, 100), color='red'):
    """Helper to create a simple in-memory image for upload tests."""
    image = Image.new('RGB', size, color)
    tmp_file = tempfile.NamedTemporaryFile(suffix='.jpg')
    image.save(tmp_file, 'jpeg')
    tmp_file.seek(0)
    return SimpleUploadedFile(name, tmp_file.read(), content_type='image/jpeg')


class AccountsAPITestCase(TestCase):
    """Integration tests for accounts API endpoints."""

    def setUp(self):
        self.client = APIClient()
        # Create users with UNIQUE emails
        self.user1 = User.objects.create_user(
            username='alice',
            password='alicepass',
            email='alice@example.com',
            first_name='Alice',
            last_name='Smith',
            bio='Hello world',
            is_public_user=True
        )
        self.user2 = User.objects.create_user(
            username='bob',
            password='bobpass',
            email='bob@example.com',
            is_public_user=False
        )
        self.user3 = User.objects.create_user(
            username='charlie',
            password='charliepass',
            email='charlie@example.com',
            is_public_user=True
        )

        # Obtain JWT token for user1 from cookies
        token_url = reverse('token_obtain_pair')
        response = self.client.post(token_url, {'username': 'alice', 'password': 'alicepass'}, format='json')
        self.token = response.cookies['access_token'].value
        self.refresh_token = response.cookies['refresh_token'].value
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Create some tweets
        self.tweet_public = Tweet.objects.create(user=self.user1, content='Public tweet from alice')
        self.tweet_private = Tweet.objects.create(user=self.user2, content='Private tweet from bob')

        # Add a like on user1's tweet so likes_received > 0
        Like.objects.create(user=self.user2, tweet=self.tweet_public)

        # user1 retweets user2's private tweet → retweets_made = 1
        ReTweet.objects.create(user=self.user1, original_tweet=self.tweet_private)

    # ------------------------------------------------------------------
    # Authentication (Register, Login, Logout, Refresh)
    # ------------------------------------------------------------------
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
        data = {'username': 'alice', 'password': 'alicepass'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.cookies)
        self.assertIn('refresh_token', response.cookies)
        self.assertIn('detail', response.data)

    def test_refresh_token(self):
        token_url = reverse('token_obtain_pair')
        resp = self.client.post(token_url, {'username': 'alice', 'password': 'alicepass'}, format='json')
        refresh_token = resp.cookies['refresh_token'].value

        refresh_url = reverse('token_refresh')
        response = self.client.post(refresh_url, {'refresh': refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.cookies)
        self.assertIn('detail', response.data)

    def test_logout(self):
        token_url = reverse('token_obtain_pair')
        resp = self.client.post(token_url, {'username': 'alice', 'password': 'alicepass'}, format='json')
        refresh_token = resp.cookies['refresh_token'].value

        logout_url = reverse('logout')
        response = self.client.post(logout_url, {'refresh': refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

        refresh_url = reverse('token_refresh')
        response = self.client.post(refresh_url, {'refresh': refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ------------------------------------------------------------------
    # Profile Endpoints (GET, PATCH, DELETE) with Media & Username Update
    # ------------------------------------------------------------------
    def test_get_own_profile(self):
        url = reverse('user-profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'alice')
        self.assertIn('profile_picture', response.data)
        self.assertIn('profile_banner', response.data)
        self.assertIn('is_following', response.data)
        # New fields
        self.assertIn('followers_count', response.data)
        self.assertIn('following_count', response.data)
        self.assertIn('tweets_count', response.data)
        self.assertIn('likes_received', response.data)
        self.assertIn('retweets_made', response.data)
        # user1 has one tweet, one like on it, and one retweet made
        self.assertEqual(response.data['tweets_count'], 1)
        self.assertEqual(response.data['likes_received'], 1)
        self.assertEqual(response.data['retweets_made'], 1)
        self.assertEqual(response.data['followers_count'], 0)
        self.assertEqual(response.data['following_count'], 0)

    def test_patch_profile_update_email_and_bio(self):
        url = reverse('user-profile')
        data = {'email': 'alice.new@example.com', 'bio': 'Updated bio'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.email, 'alice.new@example.com')
        self.assertEqual(self.user1.bio, 'Updated bio')

    def test_patch_profile_update_username(self):
        url = reverse('user-profile')
        data = {'username': 'alice_new'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.username, 'alice_new')

    def test_patch_profile_username_already_taken(self):
        url = reverse('user-profile')
        data = {'username': 'bob'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data['detail'])

    def test_patch_profile_username_with_spaces(self):
        url = reverse('user-profile')
        data = {'username': 'alice new'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data['detail'])

    def test_patch_profile_upload_profile_picture(self):
        url = reverse('user-profile')
        image = create_test_image('profile.jpg')
        data = {'profile_picture': image}
        response = self.client.patch(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user1.refresh_from_db()
        self.assertTrue(self.user1.profile_picture.name.startswith('profile_pics/profile'))

    def test_patch_profile_upload_banner(self):
        url = reverse('user-profile')
        image = create_test_image('banner.jpg', size=(800, 200))
        data = {'profile_banner': image}
        response = self.client.patch(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user1.refresh_from_db()
        self.assertTrue(self.user1.profile_banner.name.startswith('profile_banners/banner'))

    def test_delete_own_account(self):
        url = reverse('user-profile')
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username='alice').exists())

    # ------------------------------------------------------------------
    # Password Change with History
    # ------------------------------------------------------------------
    def test_change_password_success(self):
        url = reverse('password-change')
        data = {
            'old_password': 'alicepass',
            'new_password': 'NewSecurePass456!',
            'confirm_new_password': 'NewSecurePass456!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user1.refresh_from_db()
        self.assertTrue(self.user1.check_password('NewSecurePass456!'))
        self.assertEqual(PasswordHistory.objects.filter(user=self.user1).count(), 1)

    def test_change_password_wrong_old_password(self):
        url = reverse('password-change')
        data = {
            'old_password': 'wrongpass',
            'new_password': 'NewSecurePass456!',
            'confirm_new_password': 'NewSecurePass456!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Old password is incorrect.')

    def test_change_password_mismatch(self):
        url = reverse('password-change')
        data = {
            'old_password': 'alicepass',
            'new_password': 'NewSecurePass456!',
            'confirm_new_password': 'DifferentPass!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_new_password', response.data['detail'])

    def test_change_password_reuse_old(self):
        url = reverse('password-change')
        data = {
            'old_password': 'alicepass',
            'new_password': 'NewSecurePass456!',
            'confirm_new_password': 'NewSecurePass456!'
        }
        self.client.post(url, data, format='json')
        data = {
            'old_password': 'NewSecurePass456!',
            'new_password': 'alicepass',
            'confirm_new_password': 'alicepass'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('recently', response.data['error'])

    # ------------------------------------------------------------------
    # User List/Detail
    # ------------------------------------------------------------------
    def test_user_list(self):
        url = reverse('user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 3)

    def test_user_detail(self):
        url = reverse('user-detail', kwargs={'pk': self.user2.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'bob')
        self.assertIn('is_following', response.data)
        self.assertIn('profile_picture', response.data)
        # New fields present
        self.assertIn('followers_count', response.data)
        self.assertIn('following_count', response.data)
        self.assertIn('tweets_count', response.data)
        self.assertIn('likes_received', response.data)
        self.assertIn('retweets_made', response.data)

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
        url = reverse('public-timeline')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        contents = [t['message'] for t in response.data['results']]
        self.assertIn('Public tweet from alice', contents)
        self.assertNotIn('Private tweet from bob', contents)

    def test_public_timeline_includes_followed_private_tweets(self):
        Follower.objects.create(follower=self.user1, followee=self.user2)
        url = reverse('public-timeline')
        response = self.client.get(url)
        contents = [t['message'] for t in response.data['results']]
        self.assertIn('Private tweet from bob', contents)

    def test_private_timeline_shows_only_followed(self):
        Follower.objects.create(follower=self.user1, followee=self.user2)
        url = reverse('private-timeline')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        contents = [t['message'] for t in response.data['results']]
        self.assertIn('Private tweet from bob', contents)
        self.assertNotIn('Public tweet from alice', contents)

    def test_user_tweets_endpoint(self):
        url = reverse('user-tweets', kwargs={'user_id': self.user1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_user_followers_endpoint(self):
        Follower.objects.create(follower=self.user2, followee=self.user1)
        url = reverse('user-followers', kwargs={'user_id': self.user1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['follower']['username'], 'bob')

    def test_user_following_endpoint(self):
        Follower.objects.create(follower=self.user1, followee=self.user2)
        url = reverse('user-following', kwargs={'user_id': self.user1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['followee']['username'], 'bob')

    def test_user_retweets_endpoint(self):
        ReTweet.objects.get_or_create(user=self.user1, original_tweet=self.tweet_private)
        url = reverse('user-retweets', kwargs={'user_id': self.user1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['message'], 'Private tweet from bob')