import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFollow, useUnfollow } from "../../hooks/useFollowUnfollow";
import Loading from "../loading/Loading";
import type { FollowingFollowerPropsType } from "../../types/FollowingFollowerType";
import userProfile from "../../assets/icons/profile-default.svg";
import {
  followHandler,
  unfollowHandler,
} from "../../utils/followUnfollowHandler";

const Following = ({
  info,
  isLast,
  isMyProfile,
}: FollowingFollowerPropsType) => {
  const { mutate: follow, isPending: isFollowPending } = useFollow();
  const { mutate: unfollow, isPending: isUnfollowPending } = useUnfollow();
  const [isFollowed, setIsFollowed] = useState(info.followee.is_following);
  const navigation = useNavigate();

  const userId = info.followee.id;

  useEffect(() => {
    setIsFollowed(info.followee.is_following);
  }, [info.followee.is_following]);

  return (
    <>
      <div>
        <div className="flex gap-5">
          <div className="flex gap-5 py-8 px-18">
            {/* Profile Picture */}
            {info.followee.profile_picture ? (
              <img
                src={info.followee.profile_picture}
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
                {info.followee.username}
              </button>
              <p className="text-sm">{info.followee.email}</p>
            </div>
          </div>
          {/* Follow / Unfollow Button */}
          {!isMyProfile && (
            <div className="ml-auto my-auto mr-18">
              {isFollowed ? (
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
              ) : (
                <button
                  className={`text-xl font-semibold px-12 py-3 rounded-3xl bg-white text-black hover:bg-[#ccc] disabled:cursor-not-allowed disabled:hover:bg-white transition-colors cursor-pointer duration-300`}
                  disabled={isFollowPending}
                  onClick={() => followHandler(follow, userId, setIsFollowed)}
                >
                  {isFollowPending ? (
                    <div className="w-14.75">
                      <Loading width="w-7" height="h-7" />
                    </div>
                  ) : (
                    "Follow"
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

export default Following;
