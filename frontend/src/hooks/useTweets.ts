import { useQuery } from "@tanstack/react-query";
import api from "../api-services/api";
import type { TweetCardType } from "../types/TweetTypes";

const TweetsInfo = async (): Promise<TweetCardType> => {
  const response = await api.get("/api/tweets/");
  return response.data;
}

export const useTweets = () => {
    return useQuery({
        queryKey: ["Tweets"],
        queryFn: TweetsInfo
    })
}