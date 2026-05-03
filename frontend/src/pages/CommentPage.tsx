import { useEffect, useState } from "react";
import { observerFunction, scrollFunction } from "../utils/scrollFunction";
import NewComment from "../components/commentPage/NewComment";
import HomeSideProfileBox from "../components/homePage/HomeSideProfileBox";
import TweetCard from "../components/TweetCard";
import CommentCard from "../components/commentPage/CommentCard";
import BackToPrev from "../components/BackToPrev";
import { tweetInfo } from "../contents/tweetInfo";
import { commentInfo } from "../contents/commentInfo";

const CommentPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [iconBottom, setIconBottom] = useState(28);

  useEffect(() => {
    const handleScroll = scrollFunction(setIsScrolled);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const footer = document.querySelector("#footer");
    if (!footer) {
      return;
    }

    const observer = observerFunction(setIconBottom);

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollBottomClass = isScrolled ? "bottom-60" : "bottom-10";

  return (
    <>
      {/* Pinned Tweet */}
      <div className="flex gap-24 max-w-[92%] mx-auto my-16">
        <div className="flex-3">
          {tweetInfo.slice(0, 1).map((tweet, index) => (
            <TweetCard key={index} info={tweet} isPinned={true} />
          ))}
          {/* New Comment */}
          <NewComment />
          {/* Comment Cards */}
          {commentInfo.map((comment, index) => (
            <CommentCard
              key={index}
              info={comment}
              isLastComment={index === commentInfo.length - 1 ? true : false}
            />
          ))}
        </div>
        <div className="flex-1">
          <HomeSideProfileBox />
        </div>
        <div
          className={`fixed right-20 cursor-pointer hover:scale-95 transition-all duration-400 ease-in-out z-50 ${scrollBottomClass}`}
          style={{ bottom: `${iconBottom}px` }}
        >
          <BackToPrev url="/" />
        </div>
      </div>
    </>
  );
};

export default CommentPage;
