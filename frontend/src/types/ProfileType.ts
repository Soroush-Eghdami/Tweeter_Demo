export interface ProfileType {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  date_joined: string;
  bio: string;
  is_public_user: boolean;
  is_public: boolean;
  is_following: boolean;
  profile_picture: string;
  profile_banner: string;
  followers_count: number;
  following_count: number;
  tweets_count: number;
  retweets_made: number;
}
