import TweetCard from "../TweetCard";
import type { TweetCardInfoType } from "../../types/TweetTypes";

interface UserRetweetPropsType {
  info: TweetCardInfoType;
  isLoggedIn: boolean;
}

const UserRetweet = ({ info, isLoggedIn }: UserRetweetPropsType) => {
  if (!info) return null;

  return (
    <>
      <div className="w-full">
        <TweetCard info={info} isLoggedIn={isLoggedIn} />
      </div>
    </>
  );
};

export default UserRetweet;
