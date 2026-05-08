import { useNavigate } from "react-router-dom";
import HomeProfileFilled from "./HomeProfileFilled";
import LoadingPage from "../loading/LoadingPage";
import useIsLoggedIn from "../../hooks/global-hooks/useIsLoggedIn";
import profilePicture from "../../assets/icons/profile-default.svg";

const HomeSideProfileBox = () => {
  const { isLoggedIn, isLoading } = useIsLoggedIn();
  const navigation = useNavigate();

  // if (isLoading) return <LoadingPage />;

  return (
    <div className="relative h-fit">
      {isLoading && <LoadingPage />}
      {isLoggedIn ? (
        <div className="border-2 border-white bg-white/10 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] rounded-3xl py-7 h-fit">
          <div className="mb-11 px-26">
            <img
              src={profilePicture}
              alt="Default-Profile"
              className="mx-auto mb-2"
            />
            <h2 className="font-bold text-lg text-center mb-2">Khargoosh</h2>
            <h5 className="font-light text-sm text-center text-[#ccc]">
              Welcome!
            </h5>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-4 px-8">
            <HomeProfileFilled
              title="Post"
              number={20}
              textColor="text-white"
              bgColor="bg-black"
            />
            <HomeProfileFilled
              title="Retweet"
              number={6}
              textColor="text-[#333]"
              bgColor="bg-[#f4f4f4]"
            />
            <HomeProfileFilled
              title="Followers"
              number={8}
              textColor="text-white"
              bgColor="bg-black"
            />
            <HomeProfileFilled
              title="Followings"
              number={12}
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
