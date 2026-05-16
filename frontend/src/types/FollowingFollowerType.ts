interface FollowerType {
  id: string;
  username: string;
  email: string;
  is_public: boolean;
  profile_picture: string;
  is_following: boolean;
  is_following_you: boolean;
}

interface FolloweeType {
  id: string;
  username: string;
  email: string;
  is_public: boolean;
  profile_picture: string;
  is_following: boolean;
  is_following_you: boolean;
}

export interface FollowingFollowerListType {
  id: string;
  follower: FollowerType;
  followee: FolloweeType;
}

export interface FollowingFollowerPropsType {
  info: FollowingFollowerListType;
  isMyProfile: boolean;
  isLast: boolean;
}
