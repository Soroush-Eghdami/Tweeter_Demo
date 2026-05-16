import { useRef } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api-services/api";
import type { PaginatedResponse, TweetCardInfoType } from "../types/TweetTypes";

type InfiniteTweets = {
  pages: PaginatedResponse<TweetCardInfoType>[];
  pageParams: number[];
};

const likeTweet = (tweetId: number, signal?: AbortSignal) =>
  api.post(`/tweets/${tweetId}/like/`, { signal }).then((res) => res.data);
const unlikeTweet = (tweetId: number, signal?: AbortSignal) =>
  api.post(`/tweets/${tweetId}/unlike/`, { signal }).then((res) => res.data);

export const useLikeMutation = (tweetId: number) => {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const toastIdRef = useRef<string | null>(null);

  return useMutation({
    mutationFn: async (shouldLike: boolean) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const signal = controller.signal;

      try {
        const result = shouldLike
          ? await likeTweet(tweetId, signal)
          : await unlikeTweet(tweetId, signal);
        return result;
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },

    onMutate: async (shouldLike: boolean) => {
      await queryClient.cancelQueries({ queryKey: ["tweetsPrivate"] });
      await queryClient.cancelQueries({ queryKey: ["tweetsPublic"] });

      // ✅ Type the snapshots by providing the generic to getQueryData
      const previousPrivate = queryClient.getQueryData<InfiniteTweets>([
        "tweetsPrivate",
      ]);
      const previousPublic = queryClient.getQueryData<InfiniteTweets>([
        "tweetsPublic",
      ]);

      const updateCache = (
        old: InfiniteTweets | undefined,
      ): InfiniteTweets | undefined => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            results: page.results.map((tweet) =>
              tweet.id === tweetId
                ? {
                    ...tweet,
                    is_liked: shouldLike,
                    like_count: shouldLike
                      ? tweet.like_count + 1
                      : tweet.like_count - 1,
                  }
                : tweet,
            ),
          })),
        };
      };

      // ✅ setQueryData also receives the generic type
      queryClient.setQueryData<InfiniteTweets>(
        ["tweetsPrivate"],
        updateCache(previousPrivate),
      );
      queryClient.setQueryData<InfiniteTweets>(
        ["tweetsPublic"],
        updateCache(previousPublic),
      );
      queryClient.setQueriesData<InfiniteTweets>(
        { queryKey: ["myTweet"], exact: false },
        updateCache,
      );
      queryClient.setQueriesData<InfiniteTweets>(
        { queryKey: ["myRetweet"], exact: false },
        updateCache,
      );

      return { previousPrivate, previousPublic };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tweetsPrivate"] });
      queryClient.invalidateQueries({ queryKey: ["tweetsPublic"] });
      // toast.success(shouldLike ? "Liked!" : "Unliked", {
      //   id: toastIdRef.current || undefined,
      // });
      // if (!toastIdRef.current) toastIdRef.current = "like-toast";
    },

    onError: (
      error: Error,
      shouldLike: boolean,
      context?: {
        previousPrivate?: InfiniteTweets;
        previousPublic?: InfiniteTweets;
      },
    ) => {
      if (error.name !== "AbortError") {
        if (context?.previousPrivate) {
          queryClient.setQueryData(["tweetsPrivate"], context.previousPrivate);
        }
        if (context?.previousPublic) {
          queryClient.setQueryData(["tweetsPublic"], context.previousPublic);
        }

        queryClient.invalidateQueries({ queryKey: ["myTweet"], exact: false });
        queryClient.invalidateQueries({
          queryKey: ["myRetweet"],
          exact: false,
        });

        toast.error(shouldLike ? "Failed to like" : "Failed to unlike", {
          id: toastIdRef.current || undefined,
        });
      }
    },
  });
};
