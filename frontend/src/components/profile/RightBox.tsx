import UserTweet from "./UserTweet";
import UserRetweet from "./UserRetweet";
import Loading from "../loading/Loading";
import type { TweetRetweetListType } from "../../types/TweetRetweetListType";

interface RightBoxProps {
  isLoggedIn: boolean;
  isPublic: boolean;
  isMyProfile: boolean;
  setIsTweetsOpen: (arg0: boolean) => void;
  isTweetsOpen: boolean;
  tweetIcon: string;
  tweetBlueIcon: string;
  retweetIcon: string;
  retweetGreenIcon: string;
  userIcon: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  tweetRetweetList: TweetRetweetListType;
  onUserIconClick: () => void;
}

const RightBox: React.FC<RightBoxProps> = ({
  isLoggedIn,
  isPublic,
  isMyProfile,
  setIsTweetsOpen,
  isTweetsOpen,
  tweetIcon,
  tweetBlueIcon,
  retweetIcon,
  retweetGreenIcon,
  userIcon,
  containerRef,
  tweetRetweetList,
  onUserIconClick,
}) => {
  const { tweet, retweet } = tweetRetweetList;

  return (
    <div className="min-h-150 flex-4 md:col-span-2 backdrop-filter-blur-[35px] backdrop-brightness-[1] rounded-2xl border-white border-2 min-w-0">
      <div className="px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-7">
          {/* Tweet Icon */}
          {isTweetsOpen ? (
            <img
              src={tweetBlueIcon}
              alt="tweet"
              className="ml-4 w-10 h-10 cursor-pointer hover:scale-115 duration-300"
              onClick={() => setIsTweetsOpen(true)}
            />
          ) : (
            <img
              src={tweetIcon}
              alt="tweet"
              className="ml-4 w-10 h-10 cursor-pointer hover:scale-115 duration-300"
              onClick={() => setIsTweetsOpen(true)}
            />
          )}
          {/* Retweet Icon */}
          <button
            type="button"
            disabled={!isLoggedIn}
            className="cursor-pointer disabled:cursor-not-allowed"
          >
            {isTweetsOpen ? (
              <img
                src={retweetIcon}
                alt="retweet"
                className="w-9 h-9 hover:scale-115 duration-300"
                onClick={() => setIsTweetsOpen(false)}
              />
            ) : (
              <img
                src={retweetGreenIcon}
                alt="retweet"
                className="w-9 h-9 hover:scale-115 duration-300"
                onClick={() => setIsTweetsOpen(false)}
              />
            )}
          </button>
        </div>
        <button
          type="button"
          disabled={!isLoggedIn}
          className="cursor-pointer hover:scale-115 duration-300 disabled:cursor-not-allowed"
          onClick={onUserIconClick}
        >
          <img src={userIcon} alt="profile" className="mr-4 w-8.5 h-8.5" />
        </button>
      </div>
      <div className="border-t border-white mx-0 mt-3"></div>

      <div className="overflow-hidden rounded-b-xl">
        <div
          ref={containerRef}
          className="px-6 pb-2 space-y-5 max-h-150 overflow-y-auto overflow-x-hidden
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-white/10
            [&::-webkit-scrollbar-thumb]:bg-white/30
            [&::-webkit-scrollbar-thumb]:rounded-t-none
            [&::-webkit-scrollbar-thumb]:hover:bg-white/50"
        >
          {isTweetsOpen ? (
            // Tweet List
            <div>
              {!isPublic ? (
                <p className="text-center font-medium text-lg text-[#666] my-52">
                  This Profile is Private.
                </p>
              ) : (
                <>
                  {/* Initial Loading */}
                  {tweet.isLoading && (
                    <div className="mt-54">
                      <Loading />
                    </div>
                  )}
                  {/* Mapping Through Tweet List */}
                  {!tweet.isLoading && tweet.infoList.length === 0 ? (
                    !isMyProfile || !isLoggedIn ? (
                      <p className="text-center font-medium text-lg text-[#666] my-52">
                        This User haven't tweet anything yet.
                      </p>
                    ) : (
                      <p className="text-center font-medium text-lg text-[#666] my-52">
                        You haven't tweet anything yet.
                      </p>
                    )
                  ) : (
                    <div className="pt-8">
                      {tweet.infoList.map((tweet) => (
                        <UserTweet
                          key={tweet.id}
                          info={tweet}
                          isMyProfile={isMyProfile}
                          isLoggedIn={isLoggedIn}
                        />
                      ))}
                    </div>
                  )}
                  {/* Simple Space Use for Observer to when fetch more data */}
                  {tweet.hasNextPage && (
                    <div ref={tweet.loadMoreRef} className="h-5" />
                  )}
                  {/* Loading when it's going to next page */}
                  {tweet.isFetchNextPage && (
                    <div className="flex justify-center pt-4 pb-10">
                      <Loading width="w-10" height="h-10" />
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            // Retweet List
            <div>
              {!isPublic ? (
                <p className="text-center font-medium text-lg text-[#666] my-52">
                  This Profile is Private.
                </p>
              ) : (
                <>
                  {/* Initial Loading */}
                  {retweet.isLoading && (
                    <div className="mt-54">
                      <Loading />
                    </div>
                  )}
                  {/* Mapping Through Retweet List */}
                  {!retweet.isLoading && retweet.infoList.length === 0 ? (
                    !isMyProfile || !isLoggedIn ? (
                      <p className="text-center font-medium text-lg text-[#666] my-52">
                        This User haven't Retweet anything yet.
                      </p>
                    ) : (
                      <p className="text-center font-medium text-lg text-[#666] my-52">
                        You haven't Retweet anything yet.
                      </p>
                    )
                  ) : (
                    <div className="pt-8">
                      {retweet.infoList.map((retweet) => (
                        <UserRetweet
                          key={retweet.id}
                          info={retweet}
                          isLoggedIn={isLoggedIn}
                        />
                      ))}
                    </div>
                  )}
                  {/* Simple Space Use for Observer to when fetch more data */}
                  {retweet.hasNextPage && (
                    <div ref={retweet.loadMoreRef} className="h-5" />
                  )}
                  {/* Loading when it's going to next page */}
                  {retweet.isFetchNextPage && (
                    <div className="flex justify-center pt-5 pb-10">
                      <Loading width="w-10" height="h-10" />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightBox;
