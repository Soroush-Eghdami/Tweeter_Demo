import { useQuery } from "@tanstack/react-query";
import api from "../api-services/api";
import type { TweetCardInfoArrayType } from "../types/TweetTypes";

const TweetsInfoPrivate = async (): Promise<TweetCardInfoArrayType> => {
  const response = await api.get("accounts/timeline/private/");
  return response.data;
}

export const useTweetsPrivate = () => {
    return useQuery<TweetCardInfoArrayType>({
        queryKey: ["TweetsPrivate"],
        queryFn: TweetsInfoPrivate
    })
}



const TweetsInfoPublic = async (): Promise<TweetCardInfoArrayType> => {
  const response = await api.get("accounts/timeline/public/");
  return response.data;
}


export const useTweetsPublic = () => {
    return useQuery<TweetCardInfoArrayType>({
        queryKey: ["TweetsPublic"],
        queryFn: TweetsInfoPublic
    })
}