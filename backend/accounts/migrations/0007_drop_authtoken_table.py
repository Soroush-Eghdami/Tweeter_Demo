from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_alter_follower_created_at_and_more'),   # ← replace with the actual last migration in your accounts app
    ]

    operations = [
        migrations.RunSQL('DROP TABLE IF EXISTS authtoken_token;'),
    ]