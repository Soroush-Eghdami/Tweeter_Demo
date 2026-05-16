import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api-services/api";
import type { PaginatedResponse, TweetCardInfoType } from "../types/TweetTypes";
import type { AxiosError } from "axios";

type InfiniteTweets = {
  pages: PaginatedResponse<TweetCardInfoType>[];
  pageParams: number[];
};

const retweet = async (tweetId: number, signal?: AbortSignal) => {
  const response = await api.post(`/tweets/${tweetId}/retweet/`, { signal });
  return response.data;
};

const unretweet = async (tweetId: number, signal?: AbortSignal) => {
  const response = await api.post(`/tweets/${tweetId}/unretweet/`, { signal });
  return response.data;
};

export const useRetweetMutation = (tweetId: number) => {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  return useMutation({
    mutationFn: async (shouldRetweet: boolean) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const signal = controller.signal;

      try {
        const result = shouldRetweet
          ? await retweet(tweetId, signal)
          : await unretweet(tweetId, signal);
        return result;
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },

    onMutate: async (shouldRetweet: boolean) => {
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
                    is_retweeted: shouldRetweet,
                    retweet_count: shouldRetweet
                      ? tweet.retweet_count + 1
                      : tweet.retweet_count - 1,
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

      if (!shouldRetweet) {
        // Unretweet: remove the tweet from all myRetweet caches
        queryClient.setQueriesData<InfiniteTweets>(
          { queryKey: ["myRetweet"], exact: false },
          (old) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                results: page.results.filter((tweet) => tweet.id !== tweetId),
              })),
            };
          },
        );
      }

      return { previousPrivate, previousPublic };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tweetsPrivate"] });
      queryClient.invalidateQueries({ queryKey: ["tweetsPublic"] });
      queryClient.invalidateQueries({ queryKey: ["myRetweet"] });
      // toast.success(shouldLike ? "Liked!" : "Unliked", {
      //   id: toastIdRef.current || undefined,
      // });
      // if (!toastIdRef.current) toastIdRef.current = "like-toast";
    },

    onError: (
      error: AxiosError<{ error?: string }>,
      shouldRetweet: boolean,
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

        const responseError = error.response?.data?.error;
        const isOwnTweetError =
          shouldRetweet &&
          error.response?.status === 400 &&
          responseError?.includes("own tweet"); // adjust key based on your API

        const message = isOwnTweetError
          ? "You can't retweet your own tweet."
          : shouldRetweet
            ? "Failed to Retweet"
            : "Failed to UnRetweet";

        toast.error(message);
      }
    },
  });
};
