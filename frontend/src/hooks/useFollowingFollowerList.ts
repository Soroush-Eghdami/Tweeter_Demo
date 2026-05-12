import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../api-services/api";

const pageSize = 5;

// Following List
const getFollowingList = async (
  { pageParam = 1 },
  id: string,
  size: number,
) => {
  const response = await api.get(`/accounts/users/${id}/following/`, {
    params: { page: pageParam, page_size: size },
  });
  return response.data;
};

export const useFollowingList = (
  userId: string,
  size: number = pageSize,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery({
    queryKey: ["following", userId, size],
    queryFn: ({ pageParam }) => getFollowingList({ pageParam }, userId, size),
    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      // Extract page number from URL
      try {
        const url = new URL(lastPage.next);
        const pageParam = url.searchParams.get("page");
        return pageParam ? parseInt(pageParam, 10) : undefined;
      } catch (e) {
        // If it's already a number, use it directly
        return typeof lastPage.next === "number" ? lastPage.next : undefined;
      }
    },
    enabled: options?.enabled ?? true,
  });
};

// Follower List
const getFollowerList = async ({ pageParam = 1 }, id: string, size: number) => {
  const response = await api.get(`/accounts/users/${id}/followers/`, {
    params: { page: pageParam, page_size: size },
  });
  return response.data;
};

export const useFollowerList = (
  userId: string,
  size: number = pageSize,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery({
    queryKey: ["follower", userId, size],
    queryFn: ({ pageParam }) => getFollowerList({ pageParam }, userId, size),
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
