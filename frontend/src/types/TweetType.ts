export interface TweetUser {
  id: string;
  username: string;
  custom_id: string;
  is_public: boolean;
  profile_picture: string;
}

export interface Tweet {
  id: number;
  user: TweetUser;
  content: string;
  message: string;
  media: string;
  parent_tweet: Record<string, string> | null;
  retweet_count: number;
  like_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}
