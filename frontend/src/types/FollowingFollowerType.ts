interface FollowerType {
  id: string;
  username: string;
  email: string;
  is_public: boolean;
  profile_picture: string;
}

interface FolloweeType {
  id: string;
  username: string;
  email: string;
  is_public: boolean;
  profile_picture: string;
}

export interface FollowingListType {
  id: string;
  follower: FollowerType;
  followee: FolloweeType;
}
