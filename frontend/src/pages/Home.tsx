import { useEffect, useState } from "react";
import { observerFunction, scrollFunction } from "../utils/scrollFunction";
import TweetCard from "../components/TweetCard";
import HomeSideProfileBox from "../components/homePage/HomeSideProfileBox";
import CreatePost from "../components/createPost/CreatePost";
import ForYouFollowing from "../components/homePage/ForYouFollowing";
import { tweetInfo } from "../contents/tweetInfo";
import newTweet from "../assets/icons/new-tweet.svg";

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [iconBottom, setIconBottom] = useState(28); // default bottom margin (px)
  const [isCreatedPost, setIsCreatedPost] = useState(false);
  const [isSelected, setIsSelected] = useState<1 | 2>(1);
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    if (isCreatedPost) {
      setPopupVisible(true);
    } else {
      const timer = setTimeout(() => {
        setPopupVisible(false);
      }, 300); // must match animation duration (0.3s)
      return () => clearTimeout(timer);
    }
  }, [isCreatedPost]);

  // 1. Scroll threshold for moving icon up/down (optional)
  useEffect(() => {
    const handleScroll = scrollFunction(setIsScrolled);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Observe footer to avoid overlapping it
  useEffect(() => {
    const footer = document.querySelector("#footer"); // or use an id like "#main-footer"
    if (!footer) return;

    const observer = observerFunction(setIconBottom);

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // 3. Dynamic bottom class (your original scroll‑based movement)
  const scrollBottomClass = isScrolled ? "bottom-60" : "bottom-10";

  return (
    <>
      {popupVisible && (
        <CreatePost
          setIsCreatedPost={setIsCreatedPost}
          isCreatedPost={isCreatedPost}
        />
      )}
      <div className="relative flex gap-24 max-w-[92%] mx-auto my-16">
        {/* Tweet Boxes */}
        <div className="flex-3">
          {/* For You / Following */}
          <ForYouFollowing
            isSelected={isSelected}
            setIsSelected={setIsSelected}
          />
          <div>
            {(isSelected === 1
              ? tweetInfo.filter((tweet) => tweet.isPrivate)
              : tweetInfo.filter((tweet) => !tweet.isPrivate)
            ).map((tweet, index) => (
              <TweetCard key={index} info={tweet} />
            ))}
          </div>
        </div>
        {/* Home Sidebar */}
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
