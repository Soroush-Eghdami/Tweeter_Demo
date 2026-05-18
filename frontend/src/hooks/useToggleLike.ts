import { useRef } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api-services/api";
import type { PaginatedResponse, TweetCardInfoType } from "../types/TweetTypes";

type InfiniteTweets = {
  pages: PaginatedResponse<TweetCardInfoType>[];
  pageParams: number[];
};

type Snapshot = [readonly unknown[], InfiniteTweets | undefined][];

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
        { queryKey: ["myRetweet"], exact: false },
        updateCache,
      );
      queryClient.setQueriesData<InfiniteTweets>(
        { queryKey: ["comment"], exact: false },
        updateCache,
      );

      if (previousTweetDetail) {
        queryClient.setQueryData(tweetDetailKey, {
          ...previousTweetDetail,
          is_liked: shouldLike,
          like_count: shouldLike
            ? previousTweetDetail.like_count + 1
            : previousTweetDetail.like_count - 1,
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

    onError: (error, shouldLike, context) => {
      if (error.name === "AbortError") return;

      // Restore all previous caches
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

      // Show error toast
      toast.error(shouldLike ? "Failed to like" : "Failed to unlike", {
        id: toastIdRef.current || undefined,
      });
    },
  });
};
