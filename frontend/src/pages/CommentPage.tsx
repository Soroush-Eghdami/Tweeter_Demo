import NewComment from "../components/commentPage/NewComment";
import HomeSideProfileBox from "../components/homePage/HomeSideProfileBox";
import TweetCard from "../components/TweetCard";
import CommentCard from "../components/commentPage/CommentCard";
import BackToPrev from "../components/BackToPrev";
import { useEffect, useState } from "react";

const CommentPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [iconBottom, setIconBottom] = useState(28);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsScrolled(true);
      } else if (window.scrollY < 200) {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const footer = document.querySelector("#footer");
    if (!footer) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const footerHeight = entry.boundingClientRect.height;
          setIconBottom(footerHeight + 100);
        } else {
          setIconBottom(28);
        }
      },
      { threshold: 0, rootMargin: "0px" },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const scrollBottomClass = isScrolled ? "bottom-60" : "bottom-10";

  return (
    <>
      {/* Pinned Tweet */}
      <div className="flex gap-24 max-w-[92%] mx-auto my-16">
        <div className="flex-3">
          <TweetCard isPinned={true} />
          {/* New Comment */}
          <NewComment />

          <CommentCard />
          <CommentCard isLastCard={true} />
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
