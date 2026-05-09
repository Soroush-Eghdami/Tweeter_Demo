export interface followFuncType {
  followee_id: string;
}

export interface followObjType {
  follow: (arg0: followFuncType) => void;
  followLoading: boolean;
}

export interface unfollowObjType {
  unfollow: () => void;
  unfollowLoading: boolean;
}
