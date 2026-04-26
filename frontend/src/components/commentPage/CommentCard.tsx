import { useEffect, useRef, useState } from "react";
import TweetCard from "../TweetCard";

interface CommentCardPropsType {
  isLastCard?: boolean;
}

const CommentCard = ({ isLastCard }: CommentCardPropsType) => {
  const tweetCardRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);

  const updateTweetCardHeight = () => {
    if (tweetCardRef.current) {
      const newHeight = tweetCardRef.current.offsetHeight;
      setLineHeight((prev) => (prev === newHeight ? prev : newHeight));
    }
  };

  useEffect(() => {
    updateTweetCardHeight();

    window.addEventListener("resize", updateTweetCardHeight);

    return () => {
      window.removeEventListener("resize", updateTweetCardHeight);
    };
  }, []);

  return (
    <div className="flex gap-24">
      <div className="relative top-10 flex flex-col items-center justify-center">
        <div className="bg-white size-10 rounded-[50%]"></div>
        <div
          className={`${isLastCard && "relative -top-29"} bg-white w-px`}
          style={{ height: `${lineHeight}px` }}
        ></div>
      </div>
      <div ref={tweetCardRef}>
        <TweetCard />
      </div>
    </div>
  );
};

export default CommentCard;
