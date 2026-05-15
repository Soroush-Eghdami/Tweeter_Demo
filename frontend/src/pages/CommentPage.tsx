import { useEffect, useRef, useState } from "react";
import NewComment from "../components/commentPage/NewComment";
import HomeSideProfileBox from "../components/homePage/HomeSideProfileBox";
import TweetCard from "../components/TweetCard";
import CommentCard from "../components/commentPage/CommentCard";
import BackToPrev from "../components/BackToPrev";
import LoadingPage from "../components/loading/LoadingPage";
import useIsLoggedIn from "../hooks/global-hooks/useIsLoggedIn";
import { updateButtonBottom } from "../utils/scrollFunction";
import { tweetInfo } from "../contents/tweetInfo";
import { commentInfo } from "../contents/commentInfo";

const CommentPage = () => {
  const { isLoading: isAuthLoading } = useIsLoggedIn();
  const [combinedBottom, setCombinedBottom] = useState(28);
  const sideBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const scrollNum = commentInfo.length !== 0 ? -150 : 110;

    const update = () => {
      if (sideBoxRef.current) {
        updateButtonBottom(sideBoxRef, setCombinedBottom, scrollNum);
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
        updateButtonBottom(sideBoxRef, setCombinedBottom, scrollNum);
      }
    });
    if (sideBoxRef.current) resizeObserver.observe(sideBoxRef.current);

    updateButtonBottom(sideBoxRef, setCombinedBottom, scrollNum); // initial call

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      resizeObserver.disconnect();
    };
  }, [updateButtonBottom]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (isAuthLoading) return <LoadingPage />;

  return (
    <>
      {/* Pinned Tweet */}
      <div className="flex gap-24 max-w-[92%] mx-auto min-h-[80dvh] my-16">
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
        <div className="flex-1" ref={sideBoxRef}>
          <HomeSideProfileBox />
        </div>
        <div
          className={`fixed right-20 cursor-pointer hover:scale-95 transition-all duration-400 ease-in-out z-40`}
          style={{ bottom: `${combinedBottom}px` }}
        >
          <BackToPrev url="/" />
        </div>
      </div>
    </>
  );
};

export default CommentPage;
