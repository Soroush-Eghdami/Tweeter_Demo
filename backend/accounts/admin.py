from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Follower, PasswordHistory


class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'id', 'custom_id', 'is_public_status')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Profile Information', {
            'fields': ('bio', 'profile_picture', 'profile_banner'),
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Profile Information', {
            'fields': ('bio', 'profile_picture', 'profile_banner'),
        }),
    )
    
    def is_public_status(self, obj):
        return obj.is_public
    is_public_status.short_description = 'Public Status'
    is_public_status.boolean = True


admin.site.register(User, CustomUserAdmin)


@admin.register(Follower)
class FollowerAdmin(admin.ModelAdmin):
    list_display = ('follower', 'followee', 'created_at')
    list_filter = ('created_at', 'follower', 'followee')
    date_hierarchy = 'created_at'
    search_fields = ('follower__username', 'followee__username')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('follower', 'followee')
    


@admin.register(PasswordHistory)
class PasswordHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    list_filter = ('user', 'created_at')
    search_fields = ('user__username',)
    readonly_fields = ('user', 'password_hash', 'created_at')