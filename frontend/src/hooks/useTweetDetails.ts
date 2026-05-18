import { useQuery } from "@tanstack/react-query";
import api from "../api-services/api";

const getTweetDetail = async (id: string) => {
  const response = await api.get(`/tweets/${id}/`);
  return response.data;
};

export const useTweetDetails = (id: string) => {
  return useQuery({
    queryKey: ["tweetDetail", id],
    queryFn: () => getTweetDetail(id),
    refetchOnWindowFocus: false,
  });
};
