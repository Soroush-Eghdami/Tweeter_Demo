import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../api-services/api";

const pageSize = 4;

// My Tweet
const getMyTweet = async ({ pageParam = 1 }, id: string, size: number) => {
  const response = await api.get(`/accounts/users/${id}/tweets/`, {
    params: { page: pageParam, page_size: size },
  });
  return response.data;
};

export const useMyTweetList = (
  userId: string,
  size: number = pageSize,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery({
    queryKey: ["myTweet", userId, size],
    queryFn: ({ pageParam }) => getMyTweet({ pageParam }, userId, size),
    initialPageParam: 1,
    refetchOnWindowFocus: false,

    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      try {
        const url = new URL(lastPage.next);
        const pageParam = url.searchParams.get("page");
        return pageParam ? parseInt(pageParam, 10) : undefined;
      } catch (err) {
        return typeof lastPage.next === "number" ? lastPage.next : undefined;
      }
    },
    enabled: options?.enabled ?? true,
  });
};

// My Retweet
const getMyRetweet = async ({ pageParam = 1 }, id: string, size: number) => {
  const response = await api.get(`/accounts/users/${id}/retweets/`, {
    params: { page: pageParam, page_size: size },
  });
  return response.data;
};

export const useMyRetweetList = (
  userId: string,
  size: number = pageSize,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery({
    queryKey: ["myRetweet", userId, size],
    queryFn: ({ pageParam }) => getMyRetweet({ pageParam }, userId, size),
    initialPageParam: 1,
    refetchOnWindowFocus: false,

    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      try {
        const url = new URL(lastPage.next);
        const pageParam = url.searchParams.get("page");
        return pageParam ? parseInt(pageParam, 10) : undefined;
      } catch (err) {
        return typeof lastPage.next === "number" ? lastPage.next : undefined;
      }
    },
    enabled: options?.enabled ?? true,
  });
};
