import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLikeMutation } from "../hooks/useToggleLike";
import { useRetweetMutation } from "../hooks/useToggleRetweet";
import { joinedDate } from "../utils/joinedDate";
import type { TweetCardInfoType } from "../types/TweetTypes";
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

const TweetCard = ({ isPinned, info }: TweetCardPropsType) => {
  const likeMutation = useLikeMutation(info.id);
  const retweetMutation = useRetweetMutation(info.id);
  const formattedJoinDate = joinedDate(info.created_at);
  const navigation = useNavigate();
  const lastLikeClick = useRef(0);
  const lastRetweetClick = useRef(0);

  const handleLikeClick = () => {
    const now = Date.now();
    if (now - lastLikeClick.current < 300) return; // 300ms 
    lastLikeClick.current = now;
    likeMutation.mutate(!info.is_liked);
  };

  const handleRetweetClick = () => {
    const now = Date.now();
    if (now - lastRetweetClick.current < 300) return;
    lastRetweetClick.current = now;
    retweetMutation.mutate(!info.is_retweeted);
  };

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
        <img
          src={info.user?.profile_picture || profilePicture}
          alt="User-Profile"
          className="rounded-full w-14 h-14"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // prevent infinite loop
            target.src = profilePicture;
          }}
        />
        <h2
          className="font-semibold text-xl cursor-pointer hover:text-[#ddd] hover:underline"
          onClick={() => navigation(`/profile/${info.user?.id}`)}
        >
          {info.user?.username}
        </h2>
        <h5 className="text-md text-[#ddd]">{formattedJoinDate}</h5>
      </div>
      <p className="font-medium mb-9 pl-12">{info.content}</p>
      <div className="flex items-center gap-9 pl-6">
        {/* Like Button */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={handleLikeClick}
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
          onClick={() => navigation("/comment")}  // need to be changed later
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
          <p className="text-[#ddd] text-sm">{info.replies_count}</p>
        </div>
        {/* Retweet Button */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={handleRetweetClick}
        >
          {info.is_retweeted ? (
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
