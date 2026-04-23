from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from accounts.models import Follower,PasswordHistory
from accounts.services import UserService
from tweets.models import Tweet, ReTweet
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import check_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()
    is_public = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = ['id', 'custom_id', 'is_superuser', 'is_staff', 'is_active', 'date_joined', 'last_login']
        extra_kwargs = {'password': {'write_only': True}}

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follower.objects.filter(follower=request.user, followee=obj).exists()
        return False


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'bio', 'is_public_user', 'profile_picture', 'profile_banner']
        extra_kwargs = {field: {'required': False} for field in fields}

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        # Optional: custom username rules (e.g., no spaces)
        if ' ' in value:
            raise serializers.ValidationError("Username cannot contain spaces.")
        return value

class FollowerSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    followee = UserSerializer(read_only=True)

    class Meta:
        model = Follower
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


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

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        UserService.ensure_custom_id(user)
        user.save()
        return user

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True, write_only=True)
    
    
class PasswordChangeSerializer(serializers.Serializer):
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
        new_password = self.validated_data['new_password']
        # Store old password hash in history before changing
        PasswordHistory.objects.create(user=user, password_hash=user.password)
        # Set new password
        user.set_password(new_password)
        user.save()
        return user