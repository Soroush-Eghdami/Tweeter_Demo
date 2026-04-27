"""Service for reply/thread logic."""
from django.core.exceptions import ValidationError
from ..models import Tweet


class ReplyService:
    """Handle tweet reply validation and depth calculations."""
    
    # Constants
    MAX_REPLY_DEPTH = 10  # Maximum nesting depth for replies

    @staticmethod
    def validate_no_circular_reference(tweet: Tweet) -> None:
        """
        Validate that setting parent_tweet doesn't create a circular reference.
        Raises ValidationError if circular reference detected.
        """
        if not tweet.parent_tweet:
            return
        
        # Check if tweet would point to itself
        if tweet.parent_tweet.id == tweet.id:
            raise ValidationError("Cannot create circular reply chain. A tweet cannot be a reply to itself.")
        
        # Walk up the chain to check if tweet is already an ancestor
        current = tweet.parent_tweet
        visited = set()
        
        while current:
            if current.id == tweet.id:
                raise ValidationError("Cannot create circular reply chain. A tweet is already a reply to this tweet.")
            if current.id in visited:
                # Cycle detected in existing chain - shouldn't happen but catching it
                raise ValidationError("Circular reference detected in reply chain.")
            visited.add(current.id)
            current = current.parent_tweet

    @staticmethod
    def get_reply_depth(tweet: Tweet) -> int:
        """
        Calculate the depth of a tweet in the reply chain.
        Root tweets (no parent) have depth 0.
        """
        if not tweet.parent_tweet:
            return 0
        
        depth = 1
        current = tweet.parent_tweet
        visited = set()
        
        while current.parent_tweet:
            if current.id in visited:
                break  # Cycle detected, exit to avoid infinite loop
            visited.add(current.id)
            depth += 1
            current = current.parent_tweet
        
        return depth

    @staticmethod
    def validate_reply_depth(tweet: Tweet) -> None:
        """
        Validate that reply depth doesn't exceed MAX_REPLY_DEPTH.
        Raises ValidationError if depth limit exceeded.
        """
        if not tweet.parent_tweet:
            return  # Root tweets are always valid
        
        depth = ReplyService.get_reply_depth(tweet)
        if depth > ReplyService.MAX_REPLY_DEPTH:
            raise ValidationError(
                f"Reply chain cannot exceed {ReplyService.MAX_REPLY_DEPTH} levels deep. "
                f"This tweet would be at depth {depth}."
            )

    @staticmethod
    def validate_reply(tweet: Tweet) -> None:
        """
        Comprehensive validation for reply tweets.
        Checks for circular references and depth limits.
        Raises ValidationError if validation fails.
        """
        if not tweet.parent_tweet:
            return  # Not a reply, nothing to validate
        
        ReplyService.validate_no_circular_reference(tweet)
        ReplyService.validate_reply_depth(tweet)
