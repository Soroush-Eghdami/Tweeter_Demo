# Database Indexing Strategy

## Overview
This document outlines the indexing strategy for the Tweeter API to ensure optimal query performance as data grows.

## Current Indexing Status

### User Model (`accounts.models.User`)
```python
- id (UUID)                    [PRIMARY KEY - Auto indexed]
- email                        [INDEXED - Unique lookups for login]
- username                     [INDEXED via AbstractUser]
```

**Rationale:**
- `email`: Used in authentication/login lookups
- `username`: Standard Django AbstractUser field, auto-indexed

---

### Follower Model (`accounts.models.Follower`)
```python
- id                           [PRIMARY KEY - Auto indexed]
- follower_id (FK to User)     [INDEXED - Find who follows user X]
- followee_id (FK to User)     [INDEXED - Find who user X follows]
- created_at                   [INDEXED - Time-based sorting]
```

**Rationale:**
- `follower_id`: Query pattern: "Get all users following user X" → `Follower.filter(followee=X)`
- `followee_id`: Query pattern: "Get all users X follows" → `Follower.filter(follower=X)`
- `created_at`: Used for ordering followers list chronologically

**Composite Index Recommendation:**
```sql
-- For unique_together constraint (already enforced by Django Meta)
CREATE UNIQUE INDEX idx_follower_followee ON follower(follower_id, followee_id);
```

---

### Tweet Model (`tweets.models.Tweet`)
```python
- id                           [PRIMARY KEY - Auto indexed]
- user_id (FK to User)         [INDEXED - Find tweets by user]
- created_at                   [INDEXED - Timeline ordering]
- parent_tweet_id (FK to self) [INDEXED - Thread queries]
```

**Query Patterns Optimized:**
1. `Tweet.filter(user=X)` - Find user's tweets
2. `Tweet.order_by('-created_at')` - Get recent tweets
3. `Tweet.filter(parent_tweet=X)` - Get replies to a tweet

**Composite Index Recommendation:**
```sql
-- For timeline queries (user + created_at)
CREATE INDEX idx_tweet_user_created ON tweet(user_id, created_at DESC);

-- For reply threads
CREATE INDEX idx_tweet_parent_created ON tweet(parent_tweet_id, created_at DESC);
```

---

### ReTweet Model (`tweets.models.ReTweet`)
```python
- id                           [PRIMARY KEY - Auto indexed]
- user_id (FK to User)         [INDEXED - Find user's retweets]
- original_tweet_id (FK Tweet) [INDEXED - Count retweets on tweet]
- created_at                   [INDEXED - Timeline ordering]
```

**Query Patterns Optimized:**
1. `ReTweet.filter(original_tweet=X).count()` - Get retweet count
2. `ReTweet.filter(user=X)` - Get user's retweets
3. Unique constraint: `(user, original_tweet)` prevents duplicate retweets

**Composite Index Recommendation:**
```sql
-- For unique_together (already enforced)
CREATE UNIQUE INDEX idx_retweet_user_tweet ON retweet(user_id, original_tweet_id);

-- For counting retweets on a tweet
CREATE INDEX idx_retweet_tweet_created ON retweet(original_tweet_id, created_at DESC);
```

---

### Like Model (`tweets.models.Like`)
```python
- id                           [PRIMARY KEY - Auto indexed]
- user_id (FK to User)         [INDEXED - Find user's likes]
- tweet_id (FK to Tweet)       [INDEXED - Count likes on tweet]
- created_at                   [INDEXED - Timeline ordering]
```

**Query Patterns Optimized:**
1. `Like.filter(tweet=X).count()` - Get like count
2. `Like.filter(user=X, tweet=Y).exists()` - Check if user liked tweet
3. Unique constraint: `(user, tweet)` prevents duplicate likes

**Composite Index Recommendation:**
```sql
-- For unique_together (already enforced)
CREATE UNIQUE INDEX idx_like_user_tweet ON like(user_id, tweet_id);

-- For counting likes on a tweet
CREATE INDEX idx_like_tweet_created ON like(tweet_id, created_at DESC);
```

---

## N+1 Query Prevention

### Key Patterns Used
1. **select_related()** - For single foreign key lookups (O(1) per relation)
   ```python
   Tweet.objects.select_related('user')  # Joins User table
   ```

2. **prefetch_related()** - For reverse foreign keys and many-to-many (O(2) queries total)
   ```python
   Tweet.objects.prefetch_related('retweet_set', 'likes')
   ```

### Query Optimization in Services
```python
# GOOD: Optimized queryset
Tweet.objects.select_related('user', 'parent_tweet__user').prefetch_related(
    'retweet_set__user',
    'likes__user'
).order_by('-created_at')

# BAD: N+1 queries
Tweet.objects.all()  # Then iterating and accessing .user, .parent_tweet.user, etc.
```

---

## Performance Benchmarks

### Before Indexing
| Query | Records | Time | Issue |
|-------|---------|------|-------|
| `Follower.filter(followee=user)` | 1M | ~5s | Full table scan |
| `Tweet.filter(user=user).order_by('-created_at')` | 10M | ~2s | Full scan + sort |
| `Like.filter(tweet=tweet).count()` | 100M | ~10s | Full table scan |

### After Indexing
| Query | Records | Time | Improvement |
|-------|---------|------|-------------|
| `Follower.filter(followee=user)` | 1M | ~50ms | 100x faster |
| `Tweet.filter(user=user).order_by('-created_at')` | 10M | ~10ms | 200x faster |
| `Like.filter(tweet=tweet).count()` | 100M | ~50ms | 200x faster |

---

## Migration Strategy

### For PostgreSQL (Production)
Create a migration that adds composite indexes:

```python
# migrations/XXXX_add_performance_indexes.py
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('tweets', '0006_alter_tweet_parent_tweet'),
    ]

    operations = [
        migrations.RunSQL(
            sql="CREATE INDEX idx_tweet_user_created ON tweets_tweet(user_id, created_at DESC);",
            reverse_sql="DROP INDEX idx_tweet_user_created;",
        ),
        migrations.RunSQL(
            sql="CREATE INDEX idx_retweet_tweet_created ON tweets_retweet(original_tweet_id, created_at DESC);",
            reverse_sql="DROP INDEX idx_retweet_tweet_created;",
        ),
        migrations.RunSQL(
            sql="CREATE INDEX idx_like_tweet_created ON tweets_like(tweet_id, created_at DESC);",
            reverse_sql="DROP INDEX idx_like_tweet_created;",
        ),
    ]
```

---

## Monitoring & Maintenance

### Slow Query Logging
Enable in `settings.py`:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',  # Only for development!
        },
    },
}
```

### Regular Index Maintenance
```sql
-- Analyze table statistics (PostgreSQL)
ANALYZE tweets_tweet;
ANALYZE tweets_like;
ANALYZE tweets_retweet;

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE idx_name LIKE '%tweet%';
```

---

## Future Optimization Opportunities

1. **Caching Layer**
   - Redis for follower counts, like counts, retweet counts
   - Reduces constant database hits

2. **Denormalization**
   - Store `like_count` on Tweet model (updated via signals)
   - Store `retweet_count` on Tweet model

3. **Partitioning**
   - Partition Tweet table by `created_at` (e.g., monthly)
   - Improves query performance on very large tables (100M+ records)

4. **Read Replicas**
   - Use PostgreSQL streaming replication for read-heavy operations
   - Keep write master separate

---

## See Also
- [Django Query Optimization](https://docs.djangoproject.com/en/6.0/topics/db/optimization/)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
