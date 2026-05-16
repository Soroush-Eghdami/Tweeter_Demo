import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api-services/api";
import toast from "react-hot-toast";

const deleteTweetFunc = async (id: number) => {
  const response = await api.delete(`/tweets/${id}/`);
  return response.data;
};

export const useDeleteTweet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTweetFunc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTweet"] });
      toast.success("Tweet Deleted Successfully!");
    },
    onError: () => {
      toast.error("Deleting Tweet Failed!");
    },
  });
};
