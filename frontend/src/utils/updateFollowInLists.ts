import { QueryClient } from "@tanstack/react-query";

export const updateFollowInLists = (
  queryClient: QueryClient,
  userId: string,
  isFollowing: boolean,
) => {
  // Update all infinite "following" queries
  queryClient.setQueriesData(
    { queryKey: ["following"], exact: false },
    (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          results: page.results.map((item: any) => {
            // The followed user appears as `followee` in following lists
            if (item.followee?.id === userId) {
              return {
                ...item,
                followee: { ...item.followee, is_following: isFollowing },
              };
            }
            return item;
          }),
        })),
      };
    },
  );

  // Update all infinite "follower" queries
  queryClient.setQueriesData(
    { queryKey: ["follower"], exact: false },
    (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          results: page.results.map((item: any) => {
            // In the follower list, the user is `follower`
            if (item.follower?.id === userId) {
              return {
                ...item,
                follower: { ...item.follower, is_following: isFollowing },
              };
            }
            return item;
          }),
        })),
      };
    },
  );
};
