import { useNavigate } from "react-router-dom";
import HomeProfileFilled from "./HomeProfileFilled";
import Loading from "../loading/Loading";
import useIsLoggedIn from "../../hooks/global-hooks/useIsLoggedIn";
import type { ProfileType } from "../../types/ProfileType";
import profilePicture from "../../assets/icons/profile-default.svg";

interface HomeSideProfileBoxProps {
  profile: ProfileType;
  isLoading: boolean;
}

const HomeSideProfileBox = ({
  profile,
  isLoading,
}: HomeSideProfileBoxProps) => {
  const { isLoggedIn } = useIsLoggedIn();
  const navigation = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  // If logged in but profile is missing after loading (error or no data)
  if (isLoggedIn && !profile) {
    return null;
  }

  return (
    <div className="relative h-fit">
      {isLoggedIn ? (
        <div className="border-2 border-white bg-white/10 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] rounded-3xl py-7 h-fit">
          <div className="mb-11 px-26">
            <img
              src={profile?.profile_picture || profilePicture}
              alt="Profile"
              className="mx-auto mb-2 size-16 rounded-full object-cover"
            />
            <h2 className="font-bold text-lg text-center mb-2">
              {profile?.username}
            </h2>
            <h5 className="font-light text-sm text-center text-[#ccc]">
              Welcome!
            </h5>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-4 px-8">
            <HomeProfileFilled
              title="Followers"
              number={profile?.followers_count ?? 0}
              textColor="text-white"
              bgColor="bg-black"
            />
            <HomeProfileFilled
              title="Following"
              number={profile?.following_count ?? 0}
              textColor="text-[#333]"
              bgColor="bg-[#f4f4f4]"
            />
            <HomeProfileFilled
              title="Tweet"
              number={profile?.tweets_count ?? 0}
              textColor="text-white"
              bgColor="bg-black"
            />
            <HomeProfileFilled
              title="Retweet"
              number={profile?.retweets_made ?? 0}
              textColor="text-[#333]"
              bgColor="bg-[#f4f4f4]"
            />
          </div>
        </div>
      ) : (
        <div className="border-2 border-white bg-white/10 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] rounded-3xl py-10 px-10 h-fit">
          <h2 className="font-bold text-3xl mb-12">
            Haven't you made an account before?
          </h2>
          <div className="text-center">
            <button
              className="bg-white text-xl font-semibold text-black py-3 px-7 rounded-lg cursor-pointer hover:bg-[#ccc] transition-all duration-200 ease-in-out"
              onClick={() => navigation("/register")}
            >
              Register Now!!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeSideProfileBox;
