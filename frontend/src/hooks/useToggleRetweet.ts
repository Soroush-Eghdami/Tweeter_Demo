import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api-services/api";

const retweet = async (tweetId: number) => {
  const response = await api.post(`/tweets/${tweetId}/retweet/`);
  return response.data;
};

const unretweet = async (tweetId: number) => {
  const response = await api.post(`/tweets/${tweetId}/unretweet/`);
  return response.data;
};

export const useRetweetMutation = (tweetId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shouldRetweet: boolean) => {
      return shouldRetweet ? retweet(tweetId) : unretweet(tweetId);
    },

    onSuccess: (_, shouldRetweet) => {
      queryClient.invalidateQueries({ queryKey: ["tweetsPrivate"] });
      queryClient.invalidateQueries({ queryKey: ["tweetsPublic"] });
      toast.success(shouldRetweet ? "Retweeted!" : "Unretweeted");
    },

    onError: (_, shouldRetweet) => {
      toast.error(
        shouldRetweet ? "Failed to retweet" : "Failed to undo retweet",
      );
    },
  });
};
