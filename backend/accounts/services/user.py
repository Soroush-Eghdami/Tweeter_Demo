import uuid
import logging
from typing import Tuple
from django.db import transaction
from django.contrib.auth.hashers import check_password
from accounts.models import User, Follower, PasswordHistory

logger = logging.getLogger(__name__)

class UserService:
    """Service class for user-related business logic."""

    @staticmethod
    def generate_custom_id() -> str:
        """Generate a unique 6-character custom ID."""
        return str(uuid.uuid4()).replace('-', '')[:6]

    @staticmethod
    def ensure_custom_id(user: User) -> str:
        if not user.custom_id:
            user.custom_id = UserService.generate_custom_id()
        return user.custom_id

    @staticmethod
    def validate_username(username: str, exclude_user_id: str = None) -> None:
        query = User.objects.filter(username=username)
        if exclude_user_id:
            query = query.exclude(id=exclude_user_id)
        if query.exists():
            raise ValueError("This username is already taken.")
        if ' ' in username:
            raise ValueError("Username cannot contain spaces.")

    @staticmethod
    def create_user(**validated_data) -> User:
        """Create a new user from validated registration data."""
        validated_data.pop('password2', None)
        return User.objects.create_user(**validated_data)

    @staticmethod
    def follow(follower: User, followee: User) -> Tuple[Follower, bool]:
        if follower == followee:
            raise ValueError("You cannot follow yourself.")
        follower_obj, created = Follower.objects.get_or_create(follower=follower, followee=followee)
        return follower_obj, created

    @staticmethod
    def unfollow(follower: User, followee: User) -> bool:
        deleted, _ = Follower.objects.filter(follower=follower, followee=followee).delete()
        return deleted > 0

    @staticmethod
    def change_password(user: User, old_password: str, new_password: str) -> None:
        if not user.check_password(old_password):
            raise ValueError("Old password is incorrect.")

        password_history = PasswordHistory.objects.filter(user=user).order_by('-created_at')[:5]
        for entry in password_history:
            if check_password(new_password, entry.password_hash):
                raise ValueError("You have used this password recently. Please choose a different one.")

        with transaction.atomic():
            PasswordHistory.objects.create(user=user, password_hash=user.password)
            user.set_password(new_password)
            user.save()

    @staticmethod
    def delete_account(user: User) -> None:
        user.delete()
        
    @staticmethod
    def update_profile(user, **data):
        if 'username' in data:
            username = data['username']
            if User.objects.exclude(pk=user.pk).filter(username=username).exists():
                raise ValueError("Username already taken.")
            if ' ' in username:
                raise ValueError("Username cannot contain spaces.")
        for field, value in data.items():
            setattr(user, field, value)
        user.save()
        return user