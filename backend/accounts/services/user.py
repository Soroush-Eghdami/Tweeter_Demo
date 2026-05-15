import uuid
import logging
from typing import Any
from django.db import transaction
from django.contrib.auth.hashers import check_password
from django.contrib.auth.backends import ModelBackend
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
    def create_user(**validated_data: Any) -> User:
        """Create a new user from validated registration data."""
        validated_data.pop('password2', None)
        return User.objects.create_user(**validated_data)

    @staticmethod
    def authenticate_user(request: Any, username: str, password: str) -> User | None:
        """Authenticate user with username and password."""
        return ModelBackend().authenticate(request, username=username, password=password)

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
    def update_profile(user: User, **data: Any) -> User:
        # Handle username separately with validation
        if 'username' in data:
            username = data['username']
            if isinstance(username, str) and username.strip() == '':
                del data['username']
            else:
                if User.objects.exclude(pk=user.pk).filter(username=username).exists():
                    raise ValueError("Username already taken.")
                if ' ' in username:
                    raise ValueError("Username cannot contain spaces.")
    
        # Fields that should not be cleared accidentally by empty uploads
        FILE_FIELDS = {'profile_picture', 'profile_banner'}
    
        for field, value in data.items():
            # Skip empty strings for all fields to preserve existing data
            if isinstance(value, str) and value.strip() == '':
                continue
            # For file/image fields, also skip if value is None (meaning no file was provided)
            if field in FILE_FIELDS and value is None:
                continue
            setattr(user, field, value)
    
        user.save()
        return user

    @staticmethod
    def follow_create(follower: User, followee_id: str) -> Follower:
        """Follow a user by their ID. Returns the Follower object or raises ValueError."""
        if not followee_id or not followee_id.strip():
            raise ValueError("followee_id is required")
        from accounts.selectors import get_user_by_id
        followee = get_user_by_id(followee_id)
        if follower == followee:
            raise ValueError("You cannot follow yourself.")
        follower_obj, created = Follower.objects.get_or_create(follower=follower, followee=followee)
        if not created:
            raise ValueError("You are already following this user.")
        return follower_obj

    @staticmethod
    def unfollow_delete(follower: User, followee_id: str) -> None:
        """Unfollow a user by their ID. Raises ValueError if not following."""
        if not followee_id or not followee_id.strip():
            raise ValueError("followee_id is required")
        from accounts.selectors import get_user_by_id
        followee = get_user_by_id(followee_id)
        deleted, _ = Follower.objects.filter(follower=follower, followee=followee).delete()
        if not deleted:
            raise ValueError("You are not following this user.")
        
    @staticmethod
    def remove_follower(followee: User, follower_id: str) -> None:
        """Remove a follower by their ID. Raises ValueError if they are not a follower."""
        if not follower_id or not follower_id.strip():
            raise ValueError("follower_id is required")
        from accounts.selectors import get_user_by_id
        follower = get_user_by_id(follower_id)
        deleted, _ = Follower.objects.filter(follower=follower, followee=followee).delete()
        if not deleted:
            raise ValueError("This user does not follow you.")