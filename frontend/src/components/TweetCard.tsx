import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TweetCardInfoType } from "../types/TweetTypes"
import profilePicture from "../assets/icons/profile-default.svg";
import like from "../assets/icons/heart.svg";
import likeFilled from "../assets/icons/filled-heart.svg";
import retweet from "../assets/icons/retweet.svg";
import retweetFilled from "../assets/icons/retweet-filled.svg";
import comment from "../assets/icons/comment.svg";
import commentFilled from "../assets/icons/filled-comment.svg";
import pin from "../assets/icons/pin.svg";

interface TweetCardPropsType {
  isPinned?: boolean;
  info: TweetCardInfoType;
  defaultRetweeted?: boolean;
}

const TweetCard = ({ isPinned, info , defaultRetweeted = false}: TweetCardPropsType) => {
  const [retweeted, setRetweeted] = useState(defaultRetweeted);
  const navigation = useNavigate();

  if (!info) return null;

  return (
    <div className="relative border-2 border-white h-fit px-12 py-8 mb-7 rounded-3xl">
      {isPinned && (
        <div className="absolute top-10 right-10 size-6">
          <img src={pin} alt="Pin" />
        </div>
      )}
      {/* Tweet Info */}
      <div className="flex items-center gap-3.5 mb-8">
        <img src={profilePicture} alt="User-Profile" />
        <h2
          className="font-semibold text-xl cursor-pointer hover:text-[#ddd] hover:underline"
          onClick={() => navigation("/profile")}
        >
          {info.user.username}
        </h2>
        <h5 className="text-md text-[#ddd]">{info.created_at}</h5>
      </div>
      <p className="font-medium mb-9 pl-12">{info.content}</p>
      <div className="flex items-center gap-9 pl-6">
        {/* Like Button */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          // do the like request later
        >
          {info.is_liked ? (
            <img
              src={likeFilled}
              alt="Liked"
              className="size-10 hover:scale-105 transition-all duration-150 ease-in-out"
            />
          ) : (
            <img
              src={like}
              alt="Like"
              className="size-10 hover:scale-105 transition-all duration-150 ease-in-out"
            />
          )}
          <p className="text-[#ddd] text-sm">{info.like_count}</p>
        </div>
        {/* Comment Button */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => navigation("/comment")}
        >
          {isPinned ? (
            <img
              src={commentFilled}
              alt="CommentFilled"
              className="size-9 hover:scale-105 transition-all duration-150 ease-in-out"
            />
          ) : (
            <img
              src={comment}
              alt="Comment"
              className="size-9 hover:scale-105 transition-all duration-150 ease-in-out"
              onClick={() => navigation("/comment")}
            />
          )}
          <p className="text-[#ddd] text-sm">{info.is_liked}</p>  {/* {need to change this after} */}
        </div>
        {/* Retweet Button */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => setRetweeted((prev) => !prev)}
        >
          {retweeted ? (
            <img
              src={retweetFilled}
              alt="Retweeted"
              className="size-8.5 hover:scale-105 transition-all duration-150 ease-in-out"
            />
          ) : (
            <img
              src={retweet}
              alt="Retweet"
              className="size-8.5 hover:scale-105 transition-all duration-150 ease-in-out"
            />
          )}
          <p className="text-[#ddd] text-sm">{info.retweet_count}</p>
        </div>
      </div>
    </div>
  );
};

export default TweetCard;
