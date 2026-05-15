import TweetCard from "../TweetCard";
import type { TweetCardInfoType } from "../../types/TweetTypes";

interface UserRetweetPropsType {
  info: TweetCardInfoType;
}

const UserRetweet = ({ info }: UserRetweetPropsType) => {
  if (!info) return null;

  return (
    <>
      <div className="w-full">
        <TweetCard info={info} defaultRetweeted={true} />
      </div>
    </>
  );
};

export default UserRetweet;
