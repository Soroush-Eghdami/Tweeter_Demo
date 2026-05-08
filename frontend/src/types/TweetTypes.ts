export interface TweetCardType {
  id: number;
  user: {
    id: string;
    username: string;
    custom_id: string;
    is_public: true;
    profile_picture?: string;
  };
  content: string;
  message: string;
  media?: string;
  parent_tweet: string;
  retweet_count: number;
  like_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}
