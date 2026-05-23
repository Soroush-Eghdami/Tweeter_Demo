import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../api-services/api";

const pageSize = 5;

const getCommentList = async ({ pageParam = 1 }, id: number, size: number) => {
  const response = await api.get(`/tweets/${id}/replies/`, {
    params: {
      page: pageParam,
      page_size: size,
    },
  });
  return response.data;
};

export const useCommentList = (tweetId: number, size: number = pageSize) => {
  return useInfiniteQuery({
    queryKey: ["comment", tweetId, size],
    queryFn: ({ pageParam }) => getCommentList({ pageParam }, tweetId, size),
    initialPageParam: 1,
    refetchOnWindowFocus: false,

    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      try {
        const url = new URL(lastPage.next);
        const pageParam = url.searchParams.get("page");
        return pageParam ? parseInt(pageParam, 10) : undefined;
      } catch (error) {
        return typeof lastPage.next === "number" ? lastPage : undefined;
      }
    },
  });
};
