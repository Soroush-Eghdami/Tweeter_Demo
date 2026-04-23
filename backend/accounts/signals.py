from django.db.models.signals import post_save
from django.dispatch import receiver
from accounts.models import User
from accounts.services import UserService


@receiver(post_save, sender=User)
def ensure_user_custom_id(sender, instance, created, **kwargs):
    """
    Signal to ensure every user has a custom_id.
    Called after User is saved.
    """
    if not instance.custom_id:
        instance.custom_id = UserService.generate_custom_id()
        instance.save(update_fields=['custom_id'])
