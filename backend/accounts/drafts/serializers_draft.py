"""
all serializers divided into 2 parts, input and output
(no changes needed)
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from accounts.models import Follower
from accounts.selectors import is_following, validate_username
from drf_spectacular.utils import extend_schema_field, OpenApiTypes

User = get_user_model()


# =====================================================================
# OUTPUT SERIALIZERS
# =====================================================================

class UserLiteSerializer(serializers.ModelSerializer):
    """Lightweight user representation for nested use."""
    is_public = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['id', 'username', 'custom_id', 'is_public', 'profile_picture']
        read_only_fields = fields


class UserSerializer(serializers.ModelSerializer):
    """Full user output for detail/list views."""
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


class FollowerSerializer(serializers.ModelSerializer):
    """Follower relationship output."""
    follower = UserLiteSerializer(read_only=True)
    followee = UserLiteSerializer(read_only=True)

    class Meta:
        model = Follower
        fields = ['id', 'follower', 'followee', 'created_at']
        read_only_fields = fields


# =====================================================================
# INPUT SERIALIZERS
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

    def validate_username(self, value):
        try:
            user = self.context['request'].user
            validate_username(value, exclude_user_id=user.id)
        except ValueError as e:
            raise serializers.ValidationError(str(e))
        return value


class RegisterSerializer(serializers.ModelSerializer):
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
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_new_password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "Passwords do not match."})
        return attrs


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True, write_only=True)