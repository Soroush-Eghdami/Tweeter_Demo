import profilePicture from "../assets/icons/profile-default.svg";
import like from "../assets/icons/heart.svg";
import likeFilled from "../assets/icons/filled-heart.svg";
import retweet from "../assets/icons/retweet.svg";
import retweetFilled from "../assets/icons/retweet-filled.svg";
import comment from "../assets/icons/comment.svg";
import commentFilled from "../assets/icons/filled-comment.svg";
import pin from "../assets/icons/pin.svg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TweetCardPropsType {
  isPinned?: boolean;
}

const TweetCard = ({ isPinned }: TweetCardPropsType) => {
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const navigation = useNavigate();
  const year = new Date().toLocaleDateString();

  return (
    <div className="relative border-2 border-white px-12 py-8 rounded-3xl h-fit mb-7">
      {isPinned && (
        <div className="absolute right-10 top-10 size-6">
          <img src={pin} alt="Pin" />
        </div>
      )}
      <div className="flex items-center gap-3.5 mb-8">
        <img src={profilePicture} alt="User-Profile" />
        <h2
          className="font-semibold text-xl cursor-pointer hover:text-[#ddd] hover:underline"
          onClick={() => navigation("/profile")}
        >
          Khargoosh
        </h2>
        <h5 className="text-md text-[#ddd]">{year}</h5>
      </div>
      <p className="font-medium mb-9 pl-12">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio,
        necessitatibus deleniti adipisci unde ipsa quaerat soluta ipsum quasi
        sint amet vitae fugiat maiores. Quidem consequatur voluptatibus, quas
        error possimus excepturi eius molestias tenetur, libero necessitatibus
        quasi in commodi inventore nostrum?
      </p>
      <div className="flex items-center gap-9 pl-6">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => setLiked((prev) => !prev)}
        >
          {liked ? (
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
          <p className="text-[#ddd] text-sm">20</p>
        </div>
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

          <p className="text-[#ddd] text-sm">6</p>
        </div>
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
          <p className="text-[#ddd] text-sm">15</p>
        </div>
      </div>
    </div>
  );
};

export default TweetCard;
