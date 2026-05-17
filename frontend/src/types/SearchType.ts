import type { RefObject } from "react";

export interface SearchDataType {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  custom_id: string;
  bio: string;
  is_public_user: boolean;
  is_following: boolean;
  is_following_you: boolean;
  profile_picture: string;
  profile_banner: string;
  date_joined: string;
  followers_count: number;
  following_count: number;
  tweets_count: number;
  likes_received: number;
  retweets_made: number;
}

export interface SelectObjType {
  setIsOpen: (arg0: boolean) => void;
  setDebouncedTerm: (arg0: string) => void;
  reset: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
}
