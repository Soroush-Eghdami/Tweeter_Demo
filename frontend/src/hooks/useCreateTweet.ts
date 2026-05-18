import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api-services/api";

interface CreateTweetVariables {
  content: string;
}

const createTweetApi = async (variables: CreateTweetVariables) => {
  const formData = new FormData();
  formData.append("content", variables.content);

  const response = await api.post("/tweets/", formData);
  return response.data;
};

export const useCreateTweet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTweetApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tweetsPrivate"] });
      queryClient.invalidateQueries({ queryKey: ["tweetsPublic"] });
    },
  });
};
