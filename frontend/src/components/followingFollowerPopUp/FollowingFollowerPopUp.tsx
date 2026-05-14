import { useEffect, useRef, useState } from "react";
import {
  useFollowerList,
  useFollowingList,
} from "../../hooks/useFollowingFollowerList";
import Follower from "./Follower";
import Following from "./Following";
import ExitButton from "./ExitButton";
import Loading from "../loading/Loading";
import type { FollowingFollowerListType } from "../../types/FollowingFollowerType";
import user from "../../assets/icons/profile/follower-following-counter.svg";

interface FollowingFollowerPropsType {
  isPublic: boolean;
  userId: string;
  setIsUserListOpen: (arg0: boolean) => void;
  isUserListOpen: boolean;
}

const FollowingFollower = ({
  isPublic,
  userId,
  setIsUserListOpen,
  isUserListOpen,
}: FollowingFollowerPropsType) => {
  const [isFollowing, setIsFollowing] = useState(true);
  const {
    data: followingData,
    fetchNextPage: followingFetchNextPage,
    hasNextPage: followingHasNextPage,
    isFetchingNextPage: followingIsFetchNextPage,
    isLoading: followingListLoading,
  } = useFollowingList(userId, 5, { enabled: isUserListOpen && isFollowing });
  const {
    data: followerData,
    fetchNextPage: followerFetchNextPage,
    hasNextPage: followerHasNextPage,
    isFetchingNextPage: followerIsFetchNextPage,
    isLoading: followerListLoading,
  } = useFollowerList(userId, 5, { enabled: isUserListOpen && !isFollowing });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRefFollowing = useRef<HTMLDivElement>(null);
  const loadMoreRefFollower = useRef<HTMLDivElement>(null);

  const followingList =
    followingData?.pages.flatMap((page) => page.results) ?? [];
  const followerList =
    followerData?.pages.flatMap((page) => page.results) ?? [];

  // Scroll Handling for fetching new data
  useEffect(() => {
    const container = scrollContainerRef.current;
    const loadMore = isFollowing
      ? loadMoreRefFollowing.current
      : loadMoreRefFollower.current;
    const hasNextPage = isFollowing
      ? followingHasNextPage
      : followerHasNextPage;
    const isFetching = isFollowing
      ? followingIsFetchNextPage
      : followerIsFetchNextPage;
    const fetchNext = isFollowing
      ? followingFetchNextPage
      : followerFetchNextPage;

    if (!container || !loadMore || !hasNextPage || isFetching) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchNext();
        }
      },
      { root: container, rootMargin: "0px 0px 100px 0px" },
    );

    observer.observe(loadMore);
    return () => observer.disconnect();
  }, [
    isFollowing,
    followingHasNextPage,
    followingIsFetchNextPage,
    followingFetchNextPage,
    followerHasNextPage,
    followerIsFetchNextPage,
    followerFetchNextPage,
  ]);

  // Track the last element
  const handleLast = (index: number) => {
    if (isFollowing) {
      if (!followingHasNextPage && index === followingList.length - 1) {
        return true;
      } else {
        return false;
      }
    } else {
      if (!followerHasNextPage && index === followerList.length - 1) {
        return true;
      } else {
        return false;
      }
    }
  };

  return (
    <>
      <div
        className={`${isUserListOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} fixed z-40 w-dvw min-h-screen top-0 right-0 pt-23 backdrop-blur-md bg-black/70 transition-opacity duration-200`}
      >
        <div className="absolute top-10 right-23">
          <ExitButton setIsUserListOpen={setIsUserListOpen} />
        </div>
        <div className="z-50 max-w-[70%] bg-[#1c1c1c]/90 mx-auto max-h-[80vh] flex flex-col rounded-2xl shadow-[0_0px_30px_rgba(0,0,0,0.4)]">
          {/* Tab Switcher Container */}
          <div className="relative flex flex-row w-full rounded-t-2xl border-b border-[#707070] shrink-0">
            {/* Sliding Background */}
            <div
              className={`${isFollowing ? "rounded-tl-2xl" : "rounded-tr-2xl"} absolute top-0 bottom-0 w-[calc(50%-4px)] bg-[#333] shadow-sm transition-all duration-300`}
              style={{ left: isFollowing ? "0px" : "calc(50% + 4px)" }}
            />

            {/* Following Button */}
            <button
              className={`relative z-10 flex justify-center w-[50%] rounded-tl-2xl cursor-pointer py-8 transition-colors duration-300 ${
                isFollowing ? "text-white" : "text-[#bbb]"
              }`}
              onClick={() => setIsFollowing(true)}
            >
              <img src={user} alt="user" />
              <p className="mt-3 text-2xl font-semibold">Following</p>
            </button>

            {/* Follower Button */}
            <button
              className={`relative z-10 flex justify-center w-[50%] rounded-tr-2xl cursor-pointer py-8 transition-colors duration-300 ${
                !isFollowing ? "text-white" : "text-[#bbb]"
              }`}
              onClick={() => setIsFollowing(false)}
            >
              <img src={user} alt="user" />
              <p className="mt-3 text-2xl font-semibold">Follower</p>
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            className="rounded-b-2xl flex-1 min-h-114.75 overflow-y-auto mb-1.5
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-track]:bg-white/10
                    [&::-webkit-scrollbar-track]:rounded-br-xl
                    [&::-webkit-scrollbar-thumb]:bg-white/30
                    [&::-webkit-scrollbar-thumb]:rounded-t-none
                    [&::-webkit-scrollbar-thumb]:rounded-br-xl
                    [&::-webkit-scrollbar-thumb]:hover:bg-white/50"
          >
            {isFollowing ? (
              // Following
              <div>
                {/* Initial Loading */}
                {followingListLoading && (
                  <div className="my-46">
                    <Loading />
                  </div>
                )}
                {/* Mapping Through Each Following */}
                {!isPublic && !followingListLoading ? (
                  <p className="text-center font-medium text-xl text-[#555] my-52">
                    This Profile is Private.
                  </p>
                ) : !followingListLoading && followingList.length === 0 ? (
                  <p className="text-center font-medium text-lg text-[#555] my-52">
                    You haven't follow anyone yet.
                  </p>
                ) : (
                  followingList.map(
                    (following: FollowingFollowerListType, index) => (
                      <Following
                        key={following.id}
                        info={following}
                        isLast={handleLast(index)}
                      />
                    ),
                  )
                )}
                {/* Simple Space Use for Observer to when fetch more data */}
                {followingHasNextPage && (
                  <div ref={loadMoreRefFollowing} className="h-5" />
                )}
                {/* Loading when it's going to next page */}
                {followingIsFetchNextPage && (
                  <div className="flex justify-center py-10">
                    <Loading width="w-10" height="h-10" />
                  </div>
                )}
              </div>
            ) : (
              // Follower
              <div>
                {/* Initial Loading */}
                {followerListLoading && (
                  <div className="my-46">
                    <Loading />
                  </div>
                )}
                {/* Mapping Through Each Follower */}
                {!isPublic && !followerListLoading ? (
                  <p className="text-center font-medium text-xl text-[#555] my-52">
                    This Profile is Private.
                  </p>
                ) : !followerListLoading && followerList.length === 0 ? (
                  <p className="text-center font-medium text-lg text-[#555] my-52">
                    No one has follow you yet.
                  </p>
                ) : (
                  followerList.map(
                    (follower: FollowingFollowerListType, index) => (
                      <Follower
                        key={follower.id}
                        info={follower}
                        isLast={handleLast(index)}
                      />
                    ),
                  )
                )}
                {/* Simple Space Use for Observer to when fetch more data */}
                {followerHasNextPage && (
                  <div ref={loadMoreRefFollower} className="h-5" />
                )}
                {/* Loading when it's going to next page */}
                {followerIsFetchNextPage && (
                  <div className="flex justify-center py-10">
                    <Loading width="w-10" height="h-10" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default FollowingFollower;
