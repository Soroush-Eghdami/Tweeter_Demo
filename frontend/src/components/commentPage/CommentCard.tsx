import { useEffect, useRef, useState } from "react";
import TweetCard from "../TweetCard";
import type { TweetCardInfoType } from "../../types/TweetTypes";

interface CommentCardPropsType {
  info: TweetCardInfoType;
  isLastComment: boolean;
  isLoggedIn: boolean;
}

const CommentCard = ({
  info,
  isLastComment,
  isLoggedIn,
}: CommentCardPropsType) => {
  const [lineHeight, setLineHeight] = useState(0);
  const tweetCardRef = useRef<HTMLDivElement>(null);

  if (!info) return null;

  const updateTweetCardHeight = () => {
    if (tweetCardRef.current) {
      const newHeight = tweetCardRef.current.offsetHeight;
      setLineHeight((prev) => (prev === newHeight ? prev : newHeight));
    }
  };

  useEffect(() => {
    updateTweetCardHeight();

    window.addEventListener("resize", updateTweetCardHeight);
    return () => window.removeEventListener("resize", updateTweetCardHeight);
  }, []);

  return (
    <div className="flex gap-24">
      <div className="relative top-10 flex flex-col items-center justify-center">
        <div className="bg-white size-10 rounded-[50%]"></div>
        <div
          className={`${isLastComment && "relative -top-29"} bg-white w-px`}
          style={{ height: `${lineHeight}px` }}
        ></div>
      </div>
      <div ref={tweetCardRef} className="w-full">
        <TweetCard info={info} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
};

export default CommentCard;
