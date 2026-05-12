import type { followFuncType } from "../types/FollowTypes";

export const followHandler = (
  follow: (variables: followFuncType) => void,
  userId: string,
  setIsFollowed?: (arg0: boolean) => void,
) => {
  follow({ followee_id: userId });
  setIsFollowed?.(true);
};

export const unfollowHandler = (
  unfollow: (variables: followFuncType) => void,
  userId: string,
  setIsFollowed?: (arg0: boolean) => void,
) => {
  unfollow({ followee_id: userId });
  setIsFollowed?.(false);
};
