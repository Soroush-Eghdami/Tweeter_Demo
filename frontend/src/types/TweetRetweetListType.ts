import type { TweetCardInfoType } from "./TweetTypes";

export interface TweetRetweetListType {
  tweet: {
    isLoading: boolean;
    infoList: TweetCardInfoType[];
    hasNextPage: boolean;
    loadMoreRef: React.RefObject<HTMLDivElement | null>;
    isFetchNextPage: boolean;
  };
  retweet: {
    isLoading: boolean;
    infoList: TweetCardInfoType[];
    hasNextPage: boolean;
    loadMoreRef: React.RefObject<HTMLDivElement | null>;
    isFetchNextPage: boolean;
  };
}
