import TweetCard from "../TweetCard";
import type { userTweetInfoType } from "../../contents/userTweetInfo";
import trash from "../../assets/icons/profile/delete-tweet.svg";

interface UserTweetPropsType {
  info: userTweetInfoType;
}

const UserTweet = ({ info }: UserTweetPropsType) => {
  if (!info) return null;

  return (
    <>
      <div className="relative w-full">
        <button className="absolute z-1 bottom-10 right-10 cursor-pointer hover:scale-90 duration-200">
          <img src={trash} alt="trash" className="size-9" />
        </button>
        <TweetCard info={info} />
      </div>
    </>
  );
};

export default UserTweet;
