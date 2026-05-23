import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../api-services/api";
import type { PaginatedResponse, TweetCardInfoType } from "../types/TweetTypes";

// private tweet
const TweetsInfoPrivate = async ({
  pageParam = 1,
}: {
  pageParam: number;
}): Promise<PaginatedResponse<TweetCardInfoType>> => {
  const response = await api.get(
    `accounts/timeline/private/?page=${pageParam}`,
  );
  return response.data;
};

export const useTweetsPrivate = (
  userId: number,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery({
    queryKey: ["tweetsPrivate", userId ?? "anonymous"],
    queryFn: TweetsInfoPrivate,
    initialPageParam: 1,
    refetchOnWindowFocus: false,

    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        const page = url.searchParams.get("page");
        return page ? parseInt(page) : undefined;
      }
      return undefined;
    },
    enabled: options?.enabled ?? !!userId,
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

export const useTweetsPublic = (
  userId: number,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery({
    queryKey: ["tweetsPublic", userId ?? "anonymous"],
    queryFn: TweetsInfoPublic,
    initialPageParam: 1,
    refetchOnWindowFocus: false,

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
