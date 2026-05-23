export interface RegisterFormType {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  repeatPassword: string;
}

export interface LoginFormType {
  username: string;
  password: string;
}

export interface EditProfileFormType {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio: string;
  is_private: boolean;
}

export interface HasFirstName {
  firstName: string;
}
export interface HasLastName {
  lastName: string;
}
export interface HasUsername {
  username: string;
}
export interface HasEmail {
  email: string;
}
export interface HasBio {
  bio: string;
}
export interface HasPrivate {
  is_private: boolean;
}

export interface EditProfileResponse {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  custom_id: string;
  bio: string;
  is_public_user: boolean;
  is_public: boolean;
  is_following: boolean;
  profile_picture: string;
  profile_banner: string;
  date_joined: string;
  followers_count: number;
  following_count: number;
  tweets_count: number;
  likes_received: number;
  retweets_made: number;
}