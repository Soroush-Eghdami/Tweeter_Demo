import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../api-services/api";

const pageSize = 4;

const getUserTweet = async ({ pageParam = 1 }, id: string, size: number) => {
  const response = await api.get(`/accounts/users/${id}/tweets/`, {
    params: { page: pageParam, page_size: size },
  });
  return response.data;
};

export const useUserTweets = (
  userId: string,
  size: number = pageSize,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery({
    queryKey: ["userTweet", userId, size],
    queryFn: ({ pageParam }) => getUserTweet({ pageParam }, userId, size),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;

      try {
        const url = new URL(lastPage.next);
        const pageParam = url.searchParams.get("page");
        return pageParam ? parseInt(pageParam, 10) : undefined;
      } catch (error) {
        return typeof lastPage.next === "number" ? lastPage.next : undefined;
      }
    },
    enabled: options?.enabled ?? true,
  });
};
