import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../api-services/api";
import type {
  PaginatedResponse,
  TweetCardInfoType,
} from "../types/TweetTypes";

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

export const useTweetsPrivate = () => {
  return useInfiniteQuery<
    PaginatedResponse<TweetCardInfoType>, // TData
    Error, // TError
    PaginatedResponse<TweetCardInfoType>, // TData (again for infinite data)
    [string], // TQueryKey
    number // TPageParam
  >({
    queryKey: ["tweetsPrivate"],
    queryFn: TweetsInfoPrivate,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next)
        const page = url.searchParams.get("page");
        return page ? parseInt(page) : undefined;
      }
      return undefined;
    },
  });
};

const TweetsInfoPublic = async ({
  pageParam = 1,
}: {
  pageParam: number;
}): Promise<PaginatedResponse<TweetCardInfoType>> => {
  const response = await api.get(`accounts/timeline/public/?page=${pageParam}`);
  return response.data;
};

export const useTweetsPublic = () => {
  return useInfiniteQuery<
    PaginatedResponse<TweetCardInfoType>, // TData
    Error, // TError
    PaginatedResponse<TweetCardInfoType>, // TData (again for infinite data)
    [string], // TQueryKey
    number // TPageParam
  >({
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
  });
};
