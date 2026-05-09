// Home.tsx
import { useEffect, useState, useRef } from "react";
import { observerFunction, scrollFunction } from "../utils/scrollFunction";
import TweetCard from "../components/TweetCard";
import HomeSideProfileBox from "../components/homePage/HomeSideProfileBox";
import CreatePost from "../components/createPost/CreatePost";
import ForYouFollowing from "../components/homePage/ForYouFollowing";
import { useTweetsPrivate, useTweetsPublic } from "../hooks/useTweets";
import type { TweetCardInfoType } from "../types/TweetTypes";
import newTweet from "../assets/icons/new-tweet.svg";

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [iconBottom, setIconBottom] = useState(28);
  const [isCreatedPost, setIsCreatedPost] = useState(false);
  const [isSelected, setIsSelected] = useState<1 | 2>(1);
  const [popupVisible, setPopupVisible] = useState(false);

  // Infinite queries
  const {
    data: privateData,
    fetchNextPage: fetchNextPrivate,
    hasNextPage: hasNextPrivate,
    isFetchingNextPage: isFetchingNextPrivate,
    isLoading: privateLoading,
  } = useTweetsPrivate();

  const {
    data: publicData,
    fetchNextPage: fetchNextPublic,
    hasNextPage: hasNextPublic,
    isFetchingNextPage: isFetchingNextPublic,
    isLoading: publicLoading,
  } = useTweetsPublic();

  // Flatten all pages into one array of tweets
  const privateTweets = privateData?.pages.flatMap(page => page.results) ?? [];
  const publicTweets = publicData?.pages.flatMap(page => page.results) ?? [];

  const tweets = isSelected === 1 ? publicTweets : privateTweets;
  const hasNextPage = isSelected === 1 ? hasNextPublic : hasNextPrivate;
  const fetchNextPage = isSelected === 1 ? fetchNextPublic : fetchNextPrivate;
  const isFetchingNext = isSelected === 1 ? isFetchingNextPublic : isFetchingNextPrivate;

  // Existing scroll & footer observer for the floating button
  useEffect(() => {
    const handleScroll = scrollFunction(setIsScrolled);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const footer = document.querySelector("#footer");
    if (!footer) return;
    const observer = observerFunction(setIconBottom);
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // NEW: Observe footer to load more tweets when it becomes visible
  useEffect(() => {
    const footer = document.querySelector("#footer");
    if (!footer) return;

    const loadMoreOnIntersect = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      // When footer becomes visible AND there are more pages AND we are not already fetching
      if (entry.isIntersecting && hasNextPage && !isFetchingNext) {
        fetchNextPage();
      }
    };

    const observer = new IntersectionObserver(loadMoreOnIntersect, {
      threshold: 0.1, // Trigger when at least 10% of footer is visible
    });
    observer.observe(footer);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNext, fetchNextPage]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Popup animation for new post
  useEffect(() => {
    if (isCreatedPost) {
      setPopupVisible(true);
    } else {
      const timer = setTimeout(() => setPopupVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isCreatedPost]);

  const scrollBottomClass = isScrolled ? "bottom-60" : "bottom-10";

  if (privateLoading || publicLoading) return <div>Loading tweets...</div>;

  return (
    <>
      {popupVisible && (
        <CreatePost
          setIsCreatedPost={setIsCreatedPost}
          isCreatedPost={isCreatedPost}
        />
      )}
      <div className="relative flex gap-24 max-w-[92%] mx-auto my-16">
        <div className="flex-3">
          <ForYouFollowing
            isSelected={isSelected}
            setIsSelected={setIsSelected}
          />
          <div>
            {tweets.length === 0 ? (
              <div className="text-center text-gray-500 mt-50 text-lg">
                No tweets to display.
              </div>
            ) : (
              tweets.map((tweet: TweetCardInfoType) => (
                <TweetCard key={tweet.id} info={tweet} />
              ))
            )}
            {/* Optional: Show a loading indicator at the bottom */}
            {isFetchingNext && (
              <div className="text-center p-4 text-gray-500">
                Loading more tweets...
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 h-fit">
          <HomeSideProfileBox />
        </div>
        <div
          onClick={() => setIsCreatedPost((prev) => !prev)}
          className={`${scrollBottomClass} ${isCreatedPost ? "rotate-45" : "rotate-0"} fixed right-20 cursor-pointer hover:scale-95 transition-all duration-400 ease-in-out z-40`}
          style={{ bottom: `${iconBottom}px` }}
        >
          <img src={newTweet} alt="New-Tweet" className="size-21" />
        </div>
      </div>
    </>
  );
};

export default Home;