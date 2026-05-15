import { useEffect, useRef, useState } from "react";
import Loading from "../components/loading/Loading";
import TweetCard from "../components/TweetCard";
import HomeSideProfileBox from "../components/homePage/HomeSideProfileBox";
import CreatePost from "../components/createPost/CreatePost";
import ForYouFollowing from "../components/homePage/ForYouFollowing";
import LoadingPage from "../components/loading/LoadingPage";
import useIsLoggedIn from "../hooks/global-hooks/useIsLoggedIn";
import { useTweetsPrivate, useTweetsPublic } from "../hooks/useTweets";
import type { TweetCardInfoType } from "../types/TweetTypes";
import newTweet from "../assets/icons/new-tweet.svg";
import { updateButtonBottom } from "../utils/scrollFunction";

const Home = () => {
  const { isLoggedIn, isLoading: isAuthLoading } = useIsLoggedIn();
  const [isCreatedPost, setIsCreatedPost] = useState(false);
  const [isSelected, setIsSelected] = useState<1 | 2>(1);
  const [popupVisible, setPopupVisible] = useState(false);
  const [combinedBottom, setCombinedBottom] = useState(28);
  const sideBoxRef = useRef<HTMLDivElement>(null);

  const {
    data: privateData,
    fetchNextPage: fetchNextPrivate,
    hasNextPage: hasNextPrivate,
    isFetchingNextPage: isFetchingNextPrivate,
    isLoading: isLoadingPrivate,
  } = useTweetsPrivate({
    enabled: isLoggedIn && isSelected === 2,
  });

  const {
    data: publicData,
    fetchNextPage: fetchNextPublic,
    hasNextPage: hasNextPublic,
    isFetchingNextPage: isFetchingNextPublic,
    isLoading: isLoadingPublic,
  } = useTweetsPublic({
    enabled: isSelected === 1,
  });

  const privateTweets =
    privateData?.pages.flatMap((page) => page.results) ?? [];
  const publicTweets = publicData?.pages.flatMap((page) => page.results) ?? [];

  const tweets = (isSelected === 1 ? publicTweets : privateTweets).filter(
    (tweet) => tweet?.user != null,
  );
  const hasNextPage = isSelected === 1 ? hasNextPublic : hasNextPrivate;
  const fetchNextPage = isSelected === 1 ? fetchNextPublic : fetchNextPrivate;
  const isFetchingNext =
    isSelected === 1 ? isFetchingNextPublic : isFetchingNextPrivate;

  // Determine if the current tab is loading its initial data
  const isTweetsLoading =
    (isSelected === 1 && isLoadingPublic) ||
    (isSelected === 2 && isLoadingPrivate);

  // Loading More Tweets on Scroll
  useEffect(() => {
    const footer = document.querySelector("#footer");
    if (!footer) return;

    const loadMoreOnIntersect = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNext) {
        fetchNextPage();
      }
    };

    const observer = new IntersectionObserver(loadMoreOnIntersect, {
      threshold: 0.1,
    });
    observer.observe(footer);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNext, fetchNextPage]);

  // Go Back Button Scroll Logic
  useEffect(() => {
    let ticking = false;

    const update = () => {
      if (sideBoxRef.current) {
        updateButtonBottom(sideBoxRef, setCombinedBottom, 270);
      }
      ticking = false;
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScrollOrResize);
    window.addEventListener("resize", onScrollOrResize);

    const resizeObserver = new ResizeObserver(() => {
      if (sideBoxRef.current) {
        updateButtonBottom(sideBoxRef, setCombinedBottom, 270);
      }
    });
    if (sideBoxRef.current) resizeObserver.observe(sideBoxRef.current);

    updateButtonBottom(sideBoxRef, setCombinedBottom, 270); // initial call

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      resizeObserver.disconnect();
    };
  }, [updateButtonBottom]);

  // Creating Post Animation Handling
  useEffect(() => {
    if (isCreatedPost) {
      setPopupVisible(true);
    } else {
      const timer = setTimeout(() => setPopupVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isCreatedPost]);

  // Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Loading
  if (isAuthLoading) return <LoadingPage />;

  return (
    <>
      {popupVisible && (
        <CreatePost
          setIsCreatedPost={setIsCreatedPost}
          isCreatedPost={isCreatedPost}
        />
      )}
      <div className="relative flex gap-24 max-w-[92%] mx-auto min-h-[80dvh] my-16">
        <div className="flex-3">
          <ForYouFollowing
            isSelected={isSelected}
            setIsSelected={setIsSelected}
          />
          <div>
            {/* Show loading indicator while fetching tweets for the current tab */}
            {isTweetsLoading ? (
              <div className="flex justify-center items-center mt-50">
                <Loading />
              </div>
            ) : tweets.length === 0 ? (
              <div className="text-center text-gray-500 mt-50 text-lg">
                No tweets to display.
              </div>
            ) : (
              tweets.map((tweet: TweetCardInfoType) => (
                <TweetCard key={tweet.id} info={tweet} />
              ))
            )}
            {/* Show loading indicator at the bottom when fetching more pages */}
            {isFetchingNext && (
              <div className="text-center p-4 text-gray-500">
                <Loading />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 h-fit" ref={sideBoxRef}>
          <HomeSideProfileBox />
        </div>
        {
          <div
            onClick={() => setIsCreatedPost((prev) => !prev)}
            className={`${isCreatedPost ? "rotate-45" : "rotate-0"} fixed right-20 cursor-pointer hover:scale-95 transition-all duration-400 ease-in-out z-40`}
            style={{ bottom: `${combinedBottom}px` }}
          >
            <img src={newTweet} alt="New-Tweet" className="size-21" />
          </div>
        }
      </div>
    </>
  );
};

export default Home;
