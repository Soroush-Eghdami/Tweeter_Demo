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

type Snapshot = [readonly unknown[], InfiniteTweets | undefined][];

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
      // Cancel Queries
      await queryClient.cancelQueries({
        queryKey: ["tweetsPrivate"],
        exact: false,
      });
      await queryClient.cancelQueries({
        queryKey: ["tweetsPublic"],
        exact: false,
      });
      await queryClient.cancelQueries({ queryKey: ["myTweet"], exact: false });
      await queryClient.cancelQueries({
        queryKey: ["myRetweet"],
        exact: false,
      });
      await queryClient.cancelQueries({
        queryKey: ["tweetDetail"],
        exact: false,
      });
      await queryClient.cancelQueries({ queryKey: ["comment"], exact: false });

      // ✅ Type the snapshots by providing the generic to getQueryData
      const previousPrivate = queryClient.getQueriesData<InfiniteTweets>({
        queryKey: ["tweetsPrivate"],
        exact: false,
      });
      const previousPublic = queryClient.getQueriesData<InfiniteTweets>({
        queryKey: ["tweetsPublic"],
        exact: false,
      });
      const previousMyTweet = queryClient.getQueriesData<InfiniteTweets>({
        queryKey: ["myTweet"],
        exact: false,
      });
      const previousMyRetweet = queryClient.getQueriesData<InfiniteTweets>({
        queryKey: ["myRetweet"],
        exact: false,
      });
      const previousComment = queryClient.getQueriesData<InfiniteTweets>({
        queryKey: ["comment"],
        exact: false,
      });

      const tweetDetailKey = ["tweetDetail", String(tweetId)];
      const previousTweetDetail =
        queryClient.getQueryData<TweetCardInfoType>(tweetDetailKey);

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
      queryClient.setQueriesData<InfiniteTweets>(
        { queryKey: ["tweetsPrivate"], exact: false },
        updateCache,
      );
      queryClient.setQueriesData<InfiniteTweets>(
        { queryKey: ["tweetsPublic"], exact: false },
        updateCache,
      );
      queryClient.setQueriesData<InfiniteTweets>(
        { queryKey: ["myTweet"], exact: false },
        updateCache,
      );
      queryClient.setQueriesData<InfiniteTweets>(
        { queryKey: ["comment"], exact: false },
        updateCache,
      );

      queryClient.setQueriesData<InfiniteTweets>(
        { queryKey: ["myRetweet"], exact: false },
        (old) => {
          if (!old?.pages) return old;
          if (!shouldRetweet) {
            // Unretweet: remove the tweet from the list
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                results: page.results.filter((tweet) => tweet.id !== tweetId),
              })),
            };
          }
          return old;
        },
      );

      if (previousTweetDetail) {
        queryClient.setQueryData(tweetDetailKey, {
          ...previousTweetDetail,
          is_retweeted: shouldRetweet,
          retweet_count: shouldRetweet
            ? previousTweetDetail.retweet_count + 1
            : previousTweetDetail.retweet_count - 1,
        });
      }

      return {
        previousPrivate,
        previousPublic,
        previousMyTweet,
        previousMyRetweet,
        previousTweetDetail,
        previousComment,
        tweetDetailKey,
      };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myRetweet"] });
    },

    onError: (error, shouldRetweet, context) => {
      if (error.name === "AbortError") return;

      const restoreSnapshot = (snapshots: Snapshot | undefined) => {
        if (!snapshots) return;
        snapshots.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      };

      restoreSnapshot(context?.previousPrivate);
      restoreSnapshot(context?.previousPublic);
      restoreSnapshot(context?.previousMyTweet);
      restoreSnapshot(context?.previousMyRetweet);
      restoreSnapshot(context?.previousComment);

      if (context?.previousTweetDetail && context?.tweetDetailKey) {
        queryClient.setQueryData(
          context.tweetDetailKey,
          context.previousTweetDetail,
        );
      }

      const responseError = (error as AxiosError<{ error?: string }>)?.response
        ?.data?.error;
      const isOwnTweetError =
        shouldRetweet &&
        (error as AxiosError)?.response?.status === 400 &&
        responseError?.includes("own tweet");

      const message = isOwnTweetError
        ? "You can't retweet your own tweet."
        : shouldRetweet
          ? "Failed to Retweet"
          : "Failed to UnRetweet";

      toast.error(message);
    },
  });
};
