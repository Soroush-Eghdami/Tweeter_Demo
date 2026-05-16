import TweetCard from "../TweetCard";
import { useDeleteTweet } from "../../hooks/useDeleteTweet";
import type { TweetCardInfoType } from "../../types/TweetTypes";
import trash from "../../assets/icons/profile/delete-tweet.svg";
import Loading from "../loading/Loading";

interface UserTweetPropsType {
  info: TweetCardInfoType;
  isMyProfile: boolean;
}

const UserTweet = ({ info, isMyProfile }: UserTweetPropsType) => {
  const { mutate: deleteTweet, isPending: deleteTweetIsPending } =
    useDeleteTweet();

  const handleDelete = () => {
    const tweetId = Number(info.id);
    deleteTweet(tweetId);
  };

  if (!info) return null;

  return (
    <>
      <div className="relative w-full">
        {isMyProfile && (
          <button
            className="absolute z-1 bottom-10 right-10 cursor-pointer hover:scale-90 duration-200"
            onClick={handleDelete}
          >
            {deleteTweetIsPending ? (
              <Loading width="w-9" height="h-9" />
            ) : (
              <img src={trash} alt="trash" className="size-9" />
            )}
          </button>
        )}
        <TweetCard info={info} />
      </div>
    </>
  );
};

export default UserTweet;
