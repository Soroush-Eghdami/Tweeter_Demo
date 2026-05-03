import { useState } from "react";
import Follower from "./Follower";
import Following from "./Following";
import ExitButton from "./ExitButton";
import user from "../../assets/icons/profile/follower-following-counter.svg";

interface FollowingFollowerPropsType {
  setIsUserListOpen: (arg0: boolean) => void;
  isUserListOpen: boolean;
}

const FollowingFollower = ({
  setIsUserListOpen,
  isUserListOpen,
}: FollowingFollowerPropsType) => {
  const [isFollowing, setIsFollowing] = useState(true);

  return (
    <>
      <div
        className={`${isUserListOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} fixed z-40 w-dvw min-h-screen top-0 right-0 pt-23 backdrop-blur-md bg-black/70 transition-opacity duration-200`}
      >
        <div className="absolute top-10 right-23">
          <ExitButton setIsUserListOpen={setIsUserListOpen} />
        </div>
        <div className="z-50 max-w-[70%] bg-[#1c1c1c]/90 mx-auto max-h-[80vh] flex flex-col rounded-2xl shadow-[0_0px_30px_rgba(0,0,0,0.4)]">
          {/* Tab Switcher Container */}
          <div className="relative flex flex-row w-full rounded-t-2xl border-b border-[#707070] shrink-0">
            {/* Sliding Background */}
            <div
              className={`${isFollowing ? "rounded-tl-2xl" : "rounded-tr-2xl"} absolute top-0 bottom-0 w-[calc(50%-4px)] bg-[#333] shadow-sm transition-all duration-300`}
              style={{ left: isFollowing ? "0px" : "calc(50% + 4px)" }}
            />

            {/* Following Button */}
            <button
              className={`relative z-10 flex justify-center w-[50%] rounded-tl-2xl cursor-pointer py-8 transition-colors duration-300 ${
                isFollowing ? "text-white" : "text-[#bbb]"
              }`}
              onClick={() => setIsFollowing(true)}
            >
              <img src={user} alt="user" />
              <p className="mt-3 text-2xl font-semibold">Following</p>
            </button>

            {/* Follower Button */}
            <button
              className={`relative z-10 flex justify-center w-[50%] rounded-tr-2xl cursor-pointer py-8 transition-colors duration-300 ${
                !isFollowing ? "text-white" : "text-[#bbb]"
              }`}
              onClick={() => setIsFollowing(false)}
            >
              <img src={user} alt="user" />
              <p className="mt-3 text-2xl font-semibold">Follower</p>
            </button>
          </div>

          {/* <div className="rounded-b-2xl flex-1 min-h-0 overflow-hidden"> */}
          <div
            className="rounded-b-2xl flex-1 min-h-0 overflow-y-auto mb-1.5
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-track]:bg-white/10
                    [&::-webkit-scrollbar-track]:rounded-br-xl
                    [&::-webkit-scrollbar-thumb]:bg-white/30
                    [&::-webkit-scrollbar-thumb]:rounded-t-none
                    [&::-webkit-scrollbar-thumb]:rounded-br-xl
                    [&::-webkit-scrollbar-thumb]:hover:bg-white/50"
          >
            {isFollowing ? (
              <div>
                <Following />
                <Following />
                <Following />
                <Following />
                <Following />
                <Following />
                <Following />
                <Following />
                <Following />
              </div>
            ) : (
              <div>
                <Follower />
                <Follower />
                <Follower />
                <Follower />
                <Follower />
                <Follower />
                <Follower />
                <Follower />
                <Follower />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default FollowingFollower;
