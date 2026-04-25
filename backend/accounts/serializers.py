from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from accounts.models import Follower, PasswordHistory
from accounts.services import UserService
from tweets.models import Tweet, ReTweet
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import check_password

User = get_user_model()


# =====================================================================
# User Output Serializers
# =====================================================================

class UserLiteSerializer(serializers.ModelSerializer):
    """Lightweight user representation for nested use (e.g., in Follower)."""
    is_public = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['id', 'username', 'custom_id', 'is_public', 'profile_picture']
        read_only_fields = fields


class UserSerializer(serializers.ModelSerializer):
    """Full user output serializer for detail/list views."""
    is_following = serializers.SerializerMethodField()
    is_public = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'custom_id',
            'bio', 'is_public_user', 'is_public', 'is_following',
            'profile_picture', 'profile_banner', 'date_joined'
        ]
        read_only_fields = [
            'id', 'custom_id', 'date_joined', 'is_public', 'is_following'
        ]

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follower.objects.filter(follower=request.user, followee=obj).exists()
        return False


# =====================================================================
# User Input Serializers
# =====================================================================

class UserUpdateSerializer(serializers.ModelSerializer):
    """Input serializer for user profile updates."""
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'bio', 'is_public_user', 'profile_picture', 'profile_banner']
        extra_kwargs = {field: {'required': False} for field in fields}

    def validate_username(self, value):
        try:
            user = self.context['request'].user
            UserService.validate_username(value, exclude_user_id=user.id)
        except ValueError as e:
            raise serializers.ValidationError(str(e))
        return value


class RegisterSerializer(serializers.ModelSerializer):
    """Input serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'bio')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class PasswordChangeSerializer(serializers.Serializer):
    """Input serializer for password change."""
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_new_password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "Passwords do not match."})
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate_new_password(self, value):
        user = self.context['request'].user
        # Check against password history
        password_history = PasswordHistory.objects.filter(user=user).order_by('-created_at')[:5]
        for entry in password_history:
            if check_password(value, entry.password_hash):
                raise serializers.ValidationError("You have used this password recently. Please choose a different one.")
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        old_password = self.validated_data['old_password']
        new_password = self.validated_data['new_password']
        UserService.change_password(user, old_password, new_password)
        return user


class LogoutSerializer(serializers.Serializer):
    """Input serializer for logout."""
    refresh = serializers.CharField(required=True, write_only=True)


# =====================================================================
# Follower Serializers
# =====================================================================

class FollowerSerializer(serializers.ModelSerializer):
    """Follower relationship output serializer."""
    follower = UserLiteSerializer(read_only=True)
    followee = UserLiteSerializer(read_only=True)

    class Meta:
        model = Follower
        fields = ['id', 'follower', 'followee', 'created_at']
        read_only_fields = fields
