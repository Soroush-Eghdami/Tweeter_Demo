import TweetCard from "../TweetCard";
import type { TweetCardInfoType } from "../../types/TweetTypes";
import trash from "../../assets/icons/profile/delete-tweet.svg";

interface UserTweetPropsType {
  info: TweetCardInfoType;
  isMyProfile: boolean;
}

const UserTweet = ({ info, isMyProfile }: UserTweetPropsType) => {
  if (!info) return null;

  return (
    <>
      <div className="relative w-full">
        {isMyProfile && (
          <button className="absolute z-1 bottom-10 right-10 cursor-pointer hover:scale-90 duration-200">
            <img src={trash} alt="trash" className="size-9" />
          </button>
        )}
        <TweetCard info={info} />
      </div>
    </>
  );
};

export default UserTweet;
