import { useState } from "react";
import userProfile from "../../assets/icons/profile-default.svg";

const Following = () => {
  const [isFollowed, setIsFollowed] = useState(true);

  return (
    <>
      <div>
        <div className="flex gap-5">
          <div className="flex gap-5 py-8 px-18">
            <img src={userProfile} alt="profile-default" className="size-22" />
            <div className="flex flex-col gap-3">
              <button className="text-3xl text-left font-semibold mt-2">
                Peyman
              </button>
              <p className="text-sm hover:underline cursor-pointer">
                peymanamirmahani@gmail.com
              </p>
            </div>
          </div>
          <div className="ml-auto my-auto mr-18">
            {isFollowed ? (
              <button
                className="text-xl px-12 py-3 rounded-3xl text-white border-2 border-white hover:bg-[#333] transition-colors cursor-pointer duration-300"
                onClick={() => setIsFollowed(false)}
              >
                Unfollow
              </button>
            ) : (
              <button
                className="text-xl font-semibold px-12 py-3 rounded-3xl bg-white text-black hover:bg-[#ccc] transition-colors cursor-pointer duration-300"
                onClick={() => setIsFollowed(true)}
              >
                Follow
              </button>
            )}
          </div>
        </div>
        <div className="mx-auto w-[92%] border border-[#606060]"></div>
      </div>
    </>
  );
};

export default Following;
