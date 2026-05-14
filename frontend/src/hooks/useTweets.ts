import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../api-services/api";
import type { PaginatedResponse, TweetCardInfoType } from "../types/TweetTypes";

// private tweet
const TweetsInfoPrivate = async ({
  pageParam = 1,
}: {
  pageParam: number;
}): Promise<PaginatedResponse<TweetCardInfoType>> => {
  const response = await api.get(`accounts/timeline/private/?page=${pageParam}`);
  return response.data;
};

export const useTweetsPrivate = (options?: { enabled?: boolean }) => {
  return useInfiniteQuery({
    queryKey: ["tweetsPrivate"],
    queryFn: TweetsInfoPrivate,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        const page = url.searchParams.get("page");
        return page ? parseInt(page) : undefined;
      }
      return undefined;
    },
    enabled: options?.enabled ?? true,
  });
};

// public tweet
const TweetsInfoPublic = async ({
  pageParam = 1,
}: {
  pageParam: number;
}): Promise<PaginatedResponse<TweetCardInfoType>> => {
  const response = await api.get(`accounts/timeline/public/?page=${pageParam}`);
  return response.data;
};

export const useTweetsPublic = (options?: { enabled?: boolean }) => {
  return useInfiniteQuery({
    queryKey: ["tweetsPublic"],
    queryFn: TweetsInfoPublic,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        const page = url.searchParams.get("page");
        return page ? parseInt(page) : undefined;
      }
      return undefined;
    },
    enabled: options?.enabled ?? true,
  });
};