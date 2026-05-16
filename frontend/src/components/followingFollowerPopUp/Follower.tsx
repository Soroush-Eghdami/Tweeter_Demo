import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useFollow,
  useRemoveFollower,
  useUnfollow,
} from "../../hooks/useFollowUnfollow";
import Loading from "../loading/Loading";
import type { FollowingFollowerPropsType } from "../../types/FollowingFollowerType";
import userProfile from "../../assets/icons/profile-default.svg";
import {
  followHandler,
  RemoveFollowerHandler,
  unfollowHandler,
} from "../../utils/followUnfollowHandler";
import remove from "../../assets/icons/no-cross.svg";
import removeRed from "../../assets/icons/no-cross-red.svg";

const Follower = ({
  info,
  isLast,
  isMyProfile,
  isUserProfile,
}: FollowingFollowerPropsType) => {
  const { mutate: follow, isPending: isFollowPending } = useFollow();
  const { mutate: unfollow, isPending: isUnfollowPending } = useUnfollow();
  const { mutate: removeFollower, isPending: isRemoveFollowerPending } =
    useRemoveFollower(info?.followee.id);
  const [isFollowed, setIsFollowed] = useState(info.follower.is_following);
  const [hover, setHover] = useState(false);
  const navigation = useNavigate();

  const userId = info.follower.id;

  useEffect(() => {
    setIsFollowed(info.follower.is_following);
  }, [info.follower.is_following]);

  return (
    <>
      <div>
        <div className="flex gap-5">
          <div className="flex gap-5 py-8 px-18">
            {/* Profile Picture */}
            {info.follower.profile_picture ? (
              <img
                src={info.follower.profile_picture}
                alt="profile-picture"
                className="size-22 rounded-[50%]"
              />
            ) : (
              <img
                src={userProfile}
                alt="profile-default"
                className="size-22"
              />
            )}
            <div className="flex flex-col gap-3">
              <button
                className="text-3xl text-left font-semibold mt-2 cursor-pointer hover:underline"
                onClick={() => navigation(`/profile/${userId}`)}
              >
                {info.follower.username}
              </button>
              <p className="text-sm">{info.follower.email}</p>
            </div>
          </div>
          {/* Follow / Unfollow Button */}
          {!isMyProfile && (
            <div className="flex items-center gap-7 ml-auto my-auto mr-18">
              {/* Follow Back Button */}
              {isUserProfile ? (
                !isFollowed ? (
                  <button
                    className={`${isUserProfile ? "px-12" : "px-8"} text-xl font-semibold py-3 rounded-3xl bg-white text-black hover:bg-[#ccc] disabled:cursor-not-allowed disabled:hover:bg-white transition-colors cursor-pointer duration-300`}
                    disabled={isFollowPending}
                    onClick={() => followHandler(follow, userId, setIsFollowed)}
                  >
                    {isFollowPending ? (
                      <div className="w-26.75">
                        <Loading width="w-7" height="h-7" />
                      </div>
                    ) : isUserProfile ? (
                      "Follow"
                    ) : (
                      "Follow Back"
                    )}
                  </button>
                ) : (
                  <button
                    className={`text-xl px-12 py-3 rounded-3xl text-white border-2 border-white hover:bg-[#333] disabled:cursor-not-allowed disabled:hover:bg-[#1c1c1c]/90 transition-colors cursor-pointer duration-300`}
                    disabled={isUnfollowPending}
                    onClick={() =>
                      unfollowHandler(unfollow, userId, setIsFollowed)
                    }
                  >
                    {isUnfollowPending ? (
                      <div className="w-19.75">
                        <Loading width="w-7" height="h-7" />
                      </div>
                    ) : (
                      "Unfollow"
                    )}
                  </button>
                )
              ) : (
                !isFollowed && (
                  <button
                    className={`${isUserProfile ? "px-12" : "px-8"} text-xl font-semibold py-3 rounded-3xl bg-white text-black hover:bg-[#ccc] disabled:cursor-not-allowed disabled:hover:bg-white transition-colors cursor-pointer duration-300`}
                    disabled={isFollowPending}
                    onClick={() => followHandler(follow, userId, setIsFollowed)}
                  >
                    {isFollowPending ? (
                      <div className="w-26.75">
                        <Loading width="w-7" height="h-7" />
                      </div>
                    ) : (
                      "Follow Back"
                    )}
                  </button>
                )
              )}

              {/* Remove Button */}
              {!isUserProfile && (
                <button
                  className={`p-4 rounded-full border-2 border-white hover:border-[#ff575b] disabled:cursor-not-allowed disabled:hover:border-white transition-colors cursor-pointer duration-100`}
                  disabled={isRemoveFollowerPending}
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  onClick={() => RemoveFollowerHandler(removeFollower, userId)}
                >
                  {isRemoveFollowerPending ? (
                    <Loading width="w-5" height="h-5" />
                  ) : (
                    <div>
                      {!hover ? (
                        <img
                          src={remove}
                          alt="Remove-Follower"
                          className="size-5"
                        />
                      ) : (
                        <img
                          src={removeRed}
                          alt="Remove-Follower"
                          className="size-5"
                        />
                      )}
                    </div>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        {/* Line */}
        {!isLast && (
          <div className="mx-auto w-[92%] border border-[#606060]"></div>
        )}
      </div>
    </>
  );
};

export default Follower;
