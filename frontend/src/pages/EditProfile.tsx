import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WarningPopUp from "../components/WarningPopUp";
import BackToPrev from "../components/BackToPrev";
import ProfilePictureEdit from "../components/profilePictureEdit/ProfilePictureEdit";
import EditBanner from "../components/profileBannerEdit/EditBanner";
import ChangePasswordPopUp from "../components/editProfile/ChangePasswordPopUp";
import { userInfo } from "../contents/userInfo";
import userProfile from "../assets/icons/profile-default.svg";
import name from "../assets/icons/login/name.svg";
import email from "../assets/icons/login/email.svg";
import biography from "../assets/icons/profile/bio.svg";
import username from "../assets/icons/login/username.svg";

const EditProfile = () => {
  const [isOpenPopUp, setIsOpenPopUp] = useState(false);
  const [isProfilePicOpen, setIsProfilePicOpen] = useState(false);
  const [isProfileBannerOpen, setIsProfileBannerOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const navigation = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      {
        <WarningPopUp
          isOpenPopUp={isOpenPopUp}
          setIsOpenPopUp={setIsOpenPopUp}
          title={"Do you want to Delete your profile?"}
          description={"if you proceed yor profile will be lost!!"}
        />
      }
      {
        <ProfilePictureEdit
          setIsOpen={setIsProfilePicOpen}
          isOpen={isProfilePicOpen}
        />
      }
      {
        <EditBanner
          isOpen={isProfileBannerOpen}
          onClose={() => setIsProfileBannerOpen(false)}
          username={userInfo.name}
          email={userInfo.email}
          bio={userInfo.bio}
        />
      }
      {
        <ChangePasswordPopUp
          isOpen={isChangePasswordOpen}
          setIsOpen={setIsChangePasswordOpen}
        />
      }
      <div className="max-w-full mx-auto mt-10">
        <div className="absolute ml-40 mt-5 hover:scale-105 transition-all duration-200 ease-in-out">
          <BackToPrev url="/profile" />
        </div>
        <div className="flex flex-col mt-6">
          <img
            src={userProfile}
            alt="user-profile"
            className="size-33 mx-auto"
          />
          <p className="mx-auto text-4xl font-bold mt-6">Edit profile</p>
        </div>
      </div>

      <div className="flex flex-col w-[48%] shadow-[0_0px_30px_rgba(0,0,0,0.4)] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[0.65] mx-auto mt-10 rounded-3xl px-12 py-10 gap-4">
        <div className="flex items-center gap-6">
          <div className="w-[50%]">
            {/* Name */}
            <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
              <img src={name} alt="name" className="size-4.5" />
              <label
                htmlFor="name"
                className="text-left text-xl font-medium block"
              >
                Name
              </label>
            </div>
            <input
              type="text"
              name="name"
              id="name"
              className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] placeholder:text-[14px] w-full focus:outline-none bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5]"
              placeholder="Enter your Name ..."
            />
          </div>
          {/* Username */}
          <div className="w-[50%]">
            <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
              <img src={username} alt="username" className="size-5.5" />
              <label
                htmlFor="username"
                className="block text-left text-xl font-medium"
              >
                Username
              </label>
            </div>
            <input
              type="text"
              name="username"
              id="username"
              className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
              placeholder="Enter your Username ..."
            />
          </div>
        </div>
        {/* Email */}
        <div className="w-full">
          <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
            <img src={email} alt="Email" className="size-4.5" />
            <label
              htmlFor="email"
              className="block text-left text-xl font-medium"
            >
              Email
            </label>
          </div>
          <input
            type="email"
            name="email"
            id="email"
            className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
            placeholder="Enter your Email ..."
          />
        </div>
        {/* Change Password, Profile Banner & Profile Picture Button */}
        <div className="flex justify-between items-center my-3">
          <div
            className="w-[50%]"
            onClick={() => setIsChangePasswordOpen(true)}
          >
            <button className="px-6 py-3 w-full border rounded-xl cursor-pointer hover:scale-95 hover:-rotate-1 transition-all duration-200 ease-in-out">
              Change Password
            </button>
          </div>
          <div className="flex h-fit gap-6">
            <button
              className="px-3.5 py-3 border rounded-xl cursor-pointer hover:bg-white hover:text-black hover:border-black hover:scale-105 transition-all duration-200 ease-in-out"
              onClick={() => setIsProfileBannerOpen(true)}
            >
              Profile Banner
            </button>
            <button
              className="px-3.5 py-3 border rounded-xl cursor-pointer border-white hover:bg-black hover:border-black hover:scale-105 transition-all duration-200 ease-in-out"
              onClick={() => setIsProfilePicOpen(true)}
            >
              Profile Picture
            </button>
          </div>
        </div>
        <div className="flex h-fit gap-6">
          <div className="w-full">
            {/* Biography */}
            <div className="flex flex-row items-center gap-1.5 pl-1 pb-2">
              <img src={biography} alt="username" className="size-5.5" />
              <label
                htmlFor="biography"
                className="text-left text-xl font-medium block"
              >
                Biography
              </label>
            </div>
            <textarea
              name="biography"
              id="biography"
              className="h-35 resize-none py-3 px-4 mb-2 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
              placeholder="Enter your Bio ..."
            />
          </div>
        </div>

        {/* checkbox */}
        <label
          className="flex items-center gap-2 cursor-pointer select-none"
          htmlFor="checkbox"
        >
          <input
            type="checkbox"
            name="checkbox"
            id="checkbox"
            className="peer h-5 w-5 appearance-none rounded border border-gray-400 transition-all hover:scale-105 duration-200 ease-in-out"
          />
          <label className="text-white font-semibold" htmlFor="checkbox">
            Private
          </label>

          {/* Custom checkmark */}
          <svg
            className="absolute w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 10l3 3 7-7"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </label>
        {/* Delete Profile & Confirm Button */}
        <div className="flex items-center gap-6">
          <div className="w-full flex-row mt-4">
            <div className="flex justify-between">
              <button
                onClick={() => setIsOpenPopUp((prev) => !prev)}
                className="px-6 text-sm rounded-xl bg-[#FF4949] text-black font-semibold hover:bg-red-500 cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out"
              >
                Delete Profile
              </button>
              <button
                onClick={() => navigation("/profile")}
                className="px-8 py-3 text-sm border bg-white text-black font-semibold rounded-xl hover:bg-[#ccc] cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
