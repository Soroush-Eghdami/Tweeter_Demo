import HomeSideProfileBox from "../components/homePage/HomeSideProfileBox";
import TweetCard from "../components/TweetCard";
import newTweet from "../assets/icons/new-tweet.svg";
import CreatePost from "../components/createPost/CreatePost";
import { useEffect, useState } from "react";

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [iconBottom, setIconBottom] = useState(28); // default bottom margin (px)
  const [isCreatedPost, setIsCreatedPost] = useState(false);

  // 1. Scroll threshold for moving icon up/down (optional)
  useEffect(() => {
    const handleScrolled = () => {
      const y = window.scrollY;
      if (y > 250) {
        setIsScrolled(true);
      } else if (y < 200) {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScrolled);
    return () => window.removeEventListener("scroll", handleScrolled);
  }, []);

  // 2. Observe footer to avoid overlapping it
  useEffect(() => {
    const footer = document.querySelector("#footer"); // or use an id like "#main-footer"
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const footerHeight = entry.boundingClientRect.height;
          setIconBottom(footerHeight + 100); // move icon above footer + gap
        } else {
          setIconBottom(28); // normal bottom distance
        }
      },
      { threshold: 0, rootMargin: "0px" },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // 3. Dynamic bottom class (your original scroll‑based movement)
  const scrollBottomClass = isScrolled ? "bottom-60" : "bottom-10";

  return (
    <>
      {isCreatedPost && <CreatePost setIsCreatedPost={setIsCreatedPost} />}
      <div className="relative flex gap-24 max-w-[92%] mx-auto my-16">
        <div className="flex-3">
          <TweetCard />
          <TweetCard />
          <TweetCard />
          <TweetCard />
        </div>
        <div className="flex-1 h-fit">
          <HomeSideProfileBox />
        </div>

        <div
          onClick={() => setIsCreatedPost((prev) => !prev)}
          className={`fixed right-20 cursor-pointer hover:scale-95 transition-all duration-400 ease-in-out z-50 ${scrollBottomClass} ${isCreatedPost ? "rotate-45" : "rotate-0"} `}
          style={{ bottom: `${iconBottom}px` }}
        >
          <img src={newTweet} alt="New-Tweet" className="size-21" />
        </div>
      </div>
    </>
  );
};

export default Home;
