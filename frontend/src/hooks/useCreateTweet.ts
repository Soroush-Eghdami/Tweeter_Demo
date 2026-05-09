import { useMutation } from "@tanstack/react-query";
import api from "../api-services/api";

interface CreateTweetVariables {
  content: string;
  parent_tweet?: number;
}

const createTweetApi = async (variables: CreateTweetVariables) => {
  const formData = new FormData();
  formData.append("content", variables.content);

  if (variables.parent_tweet && variables.parent_tweet !== 0) {
    formData.append("parent_tweet", String(variables.parent_tweet));
  }

  const response = await api.post("/tweets/", formData);
  return response.data;
};

export const useCreateTweet = () => {
  return useMutation({
    mutationFn: createTweetApi,
  });
};