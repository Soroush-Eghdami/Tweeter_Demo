import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api-services/api";
import type {
  followFuncType,
  RemoveFollowerFuncType,
} from "../types/FollowTypes";
import type { ProfileType } from "../types/ProfileType";
import toast from "react-hot-toast";

// Follow
const followFunc = async (id: followFuncType) => {
  const response = await api.post("/accounts/follow/", id);
  return response.data;
};

export const useFollow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: followFunc,
    onMutate: async ({ followee_id }) => {
      await queryClient.cancelQueries({ queryKey: ["user", followee_id] });
      const prevUser = queryClient.getQueryData<ProfileType>([
        "user",
        followee_id,
      ]);

      queryClient.setQueryData<ProfileType>(["user", followee_id], (old) => {
        if (!old) return old;
        return { ...old, is_following: true };
      });

      return { prevUser, followee_id };
    },

    onSuccess: (_, { followee_id }) => {
      queryClient.invalidateQueries({ queryKey: ["user", followee_id] });
    },

    onError: (err, _variables, context) => {
      if (context?.prevUser) {
        queryClient.setQueryData(
          ["user", context.followee_id],
          context.prevUser,
        );
      }
      console.log("Follow Failed:", err);
    },
  });
};

// Unfollow
const unfollowFunc = async (id: followFuncType) => {
  const response = await api.post("/accounts/unfollow/", id);
  return response.data;
};

export const useUnfollow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unfollowFunc,
    onMutate: async ({ followee_id }) => {
      await queryClient.cancelQueries({ queryKey: ["user", followee_id] });
      const prevUser = queryClient.getQueryData<ProfileType>([
        "user",
        followee_id,
      ]);

      queryClient.setQueryData<ProfileType>(["user", followee_id], (old) => {
        if (!old) return old;
        return { ...old, is_following: false }; // ✅ unfollow sets to false
      });

      return { prevUser, followee_id };
    },

    onSuccess: (_, { followee_id }) => {
      queryClient.invalidateQueries({ queryKey: ["user", followee_id] });
    },

    onError: (err, _variables, context) => {
      if (context?.prevUser) {
        queryClient.setQueryData(
          ["user", context.followee_id],
          context.prevUser,
        );
      }
      console.log("Unfollow Failed:", err);
    },
  });
};

//Remove Follower
const removeFollowerFunc = async (id: RemoveFollowerFuncType) => {
  const response = await api.post("/accounts/remove-follower/", id);
  return response.data;
};

export const useRemoveFollower = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFollowerFunc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follower", userId] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast.success("Follower Removed Successfully!");
    },
    onError: () => {
      toast.error("Removing Follower Failed!");
    },
  });
};
