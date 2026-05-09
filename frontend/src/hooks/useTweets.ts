import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../api-services/api";
import type {
  PaginatedResponse,
  TweetCardInfoArrayType,
} from "../types/TweetTypes";

const TweetsInfoPrivate = async ({
  pageParam = 1,
}: {
  pageParam: number;
}): Promise<PaginatedResponse<TweetCardInfoArrayType>> => {
  const response = await api.get(
    `accounts/timeline/private/?page=${pageParam}`,
  );
  return response.data;
};

export const useTweetsPrivate = () => {
  return useInfiniteQuery<
    PaginatedResponse<TweetCardInfoArrayType>, // TData
    Error, // TError
    PaginatedResponse<TweetCardInfoArrayType>, // TData (again for infinite data)
    [string], // TQueryKey
    number // TPageParam
  >({
    queryKey: ["TweetsPrivate"],
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
  });
};

const TweetsInfoPublic = async ({
  pageParam = 1,
}: {
  pageParam: number;
}): Promise<PaginatedResponse<TweetCardInfoArrayType>> => {
  const response = await api.get(`accounts/timeline/public/?page=${pageParam}`);
  return response.data;
};

export const useTweetsPublic = () => {
  return useInfiniteQuery<
    PaginatedResponse<TweetCardInfoArrayType>, // TData
    Error, // TError
    PaginatedResponse<TweetCardInfoArrayType>, // TData (again for infinite data)
    [string], // TQueryKey
    number // TPageParam
  >({
    queryKey: ["TweetsPublic"],
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
