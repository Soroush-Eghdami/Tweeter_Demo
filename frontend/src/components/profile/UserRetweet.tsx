import TweetCard from "../TweetCard";
import type { userRetweetInfoType } from "../../contents/userRetweetInfo";

interface UserRetweetPropsType {
  info: userRetweetInfoType;
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
