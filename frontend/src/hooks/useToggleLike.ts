import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api-services/api";

const likeTweet = async (tweetId: number) => {
  const response = await api.post(`/tweets/${tweetId}/like/`);
  return response.data; 
};

const unlikeTweet = async (tweetId: number) => {
  const response = await api.post(`/tweets/${tweetId}/unlike/`);
  return response.data; 
};

export const useLikeMutation = (tweetId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shouldLike: boolean) => {
      return shouldLike ? likeTweet(tweetId) : unlikeTweet(tweetId);
    },
    onSuccess: (_, shouldLike) => {
      queryClient.invalidateQueries({ queryKey: ["tweetsPrivate"] });
      queryClient.invalidateQueries({ queryKey: ["tweetsPublic"] });
      toast.success(shouldLike ? "Liked!" : "Unliked");
    },
    onError: (error, shouldLike) => {
      toast.error(shouldLike ? "Failed to like" : "Failed to unlike");
      console.error(error);
    },
  });
};