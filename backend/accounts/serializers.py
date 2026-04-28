from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field, OpenApiTypes
from accounts.models import Follower
from accounts.services import UserService
from accounts.selectors import is_following

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
        if request:
            return is_following(request.user, obj)
        return False


# =====================================================================
# User Input Serializers
# =====================================================================

class UserUpdateSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False, allow_null=True, help_text="Optional profile picture")
    profile_banner = serializers.ImageField(required=False, allow_null=True, help_text="Optional profile banner")

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'bio', 'is_public_user', 'profile_picture', 'profile_banner']
        extra_kwargs = {field: {'required': False} for field in ['username', 'email', 'first_name', 'last_name', 'bio', 'is_public_user']}

    @extend_schema_field(OpenApiTypes.BINARY)
    def get_profile_picture(self, obj):
        pass

    @extend_schema_field(OpenApiTypes.BINARY)
    def get_profile_banner(self, obj):
        pass

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


class PasswordChangeSerializer(serializers.Serializer):
    """Input serializer for password change."""
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_new_password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "Passwords do not match."})
        return attrs


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