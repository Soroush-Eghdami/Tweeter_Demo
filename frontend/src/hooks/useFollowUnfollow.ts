import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api-services/api";
import type { followFuncType } from "../types/FollowTypes";

// Follow
const followFunc = async (id: followFuncType) => {
  const response = await api.post("/accounts/follow/", id);
  return response.data;
};

export const useFollow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: followFunc,
    onSuccess(_, variables) {
      queryClient.invalidateQueries({
        queryKey: ["user", variables.followee_id],
      });
    },
    onError: (error) => {
      console.log("Follow Failed:", error);
    },
  });
};

// Unfollow
const unfollowFunc = async () => {
  const response = await api.delete("/accounts/unfollow");
  return response.data;
};

export const useUnfollow = () => {
  // const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unfollowFunc,
    // onSuccess(_, variables) {
    //   queryClient.invalidateQueries({
    //     queryKey: ["user", variables.followee_id],
    //   });
    // },
    onError: (error) => {
      console.log("Unfollow Failed:", error);
    },
  });
};
