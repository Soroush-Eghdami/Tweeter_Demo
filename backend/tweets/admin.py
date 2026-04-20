from django.contrib import admin
from .models import Tweet, ReTweet

@admin.register(Tweet)
class TweetAdmin(admin.ModelAdmin):
    list_display = ['user', 'content', 'created_at', 'parent_tweet']
    list_filter = ['created_at', 'user', 'parent_tweet']
    search_fields = ['content', 'user__username']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'parent_tweet')

@admin.register(ReTweet)
class ReTweetAdmin(admin.ModelAdmin):
    list_display = ['user', 'original_tweet', 'created_at']
    list_filter = ['created_at', 'user', 'original_tweet']
    search_fields = ['user__username', 'original_tweet__content']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'original_tweet')
