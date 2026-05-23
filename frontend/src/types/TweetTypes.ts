export interface TweetCardInfoType {
  id: number;
  user?: {
    id: string;
    username?: string;
    custom_id: string;
    is_public: true;
    profile_picture?: string;
  };
  content: string;
  message: string;
  media?: string;
  parent_tweet: string;
  replies_count: number;
  retweet_count: number;
  like_count: number;
  is_liked: boolean;
  is_retweeted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type TweetCardInfoArrayType = PaginatedResponse<TweetCardInfoType>;
