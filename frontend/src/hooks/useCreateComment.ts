import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import api from "../api-services/api";

interface CreateCommentVariables {
  content: string;
  parentTweetId: number;
}

const createCommentApi = async ({
  content,
  parentTweetId,
}: CreateCommentVariables) => {
  const formData = new FormData();
  formData.append("content", content);
  formData.append("parent_tweet", String(parentTweetId));

  const response = await api.post("/tweets/", formData);
  return response.data;
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommentApi,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comment", variables.parentTweetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["tweetDetail", String(variables.parentTweetId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["myProf"],
      });

      toast.success("Comment posted successfully!");
    },
    onError: (error: AxiosError<{ detail?: Record<string, string[]> }>) => {
      // Convert the nested error object to a readable string
      const detail = error.response?.data?.detail;
      const message =
        (detail && typeof detail === "object"
          ? Object.values(detail).flat().join(" ")
          : undefined) ||
        error.message ||
        "Failed to post comment.";
      toast.error(message);
    },
  });
};