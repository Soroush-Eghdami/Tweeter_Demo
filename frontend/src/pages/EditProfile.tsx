import WarningPopUp from "../components/WarningPopUp";

import backToHome from "../assets/icons/left-arrow.svg";
import userProfile from "../assets/icons/profile-default.svg";
import name from "../assets/icons/login/name.svg";
import username from "../assets/icons/login/username.svg";
import password from "../assets/icons/login/password.svg";
import openeye from "../assets/icons/login/opened-eye.svg";
import closeeye from "../assets/icons/login/closed-eye.svg";
import repeatpassword from "../assets/icons/login/repeat-password.svg";
import email from "../assets/icons/login/email.svg";
import biography from "../assets/icons/profile/bio.svg";
import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import BackToPrev from "../components/BackToPrev";

const EditProfile = () => {
  const [isOpenPopUp, setIsOpenPopUp] = useState(false);

  const [isOpenEyeLeft, setIsOpenEyeLeft] = useState(true);
  const [isOpenEyeRight, setIsOpenEyeRight] = useState(true);
  const navigation = useNavigate();
  return (
    // <>
    //   <div className="mx-auto w-full max-w-[92%%]">
    //     <div className="flex flex-row mt-8">
    //       <div className="flex flex-row gap-5 ml-18">
    //         <img src={userProfile} alt="user-profile" className="size-28 " />
    //         <p className="font-bold text-4xl mt-8">Edit Profile</p>
    //       </div>
    //       <div className="mt-3 ml-auto mr-18">
    //         <Link to={"/profile"}>
    //           <img src={backToHome} alt="left-arrow" className="size-22 " />
    //         </Link>
    //       </div>
    //     </div>
    //   </div>
    //   <div className="flex flex-row gap-10 px-50 pt-8 pb-4">
    //     <div className="w-[50%]">
    //       <div className="flex flex-row items-center gap-1.5 pl-1 pb-2">
    //         <img src={name} alt="name" className="size-4.5" />
    //         <label
    //           htmlFor="Name"
    //           className="text-left text-xl font-medium block  "
    //         >
    //           Name
    //         </label>
    //       </div>
    //       <input
    //         type="text"
    //         className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] bg-[#333333] placeholder:text-[14px] w-full focus:outline-none"
    //         placeholder="Khargoosh"
    //       />
    //     </div>
    //     <div className="w-[50%]">
    //       <div className="flex flex-row items-center gap-1.5 pl-1 pb-2">
    //         <img src={username} alt="user-name" className="size-6" />
    //         <label
    //           htmlFor="UserName"
    //           className="text-left text-xl font-medium block  "
    //         >
    //           UserName
    //         </label>
    //       </div>
    //       <input
    //         type="text"
    //         className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838]  bg-[#333] placeholder:text-[14px] w-full focus:outline-none"
    //         placeholder="@khargoosh"
    //       />
    //     </div>
    //   </div>
    //   <div className="flex flex-row gap-10 px-50">
    //     <div className="w-[50%]">
    //       <div className="flex flex-row items-center gap-1.5 pl-1 pb-2">
    //         <img src={password} alt="password" className="size-5.5" />

    //         <label
    //           htmlFor="Password"
    //           className="text-left text-xl font-medium block"
    //         >
    //           Password
    //         </label>
    //       </div>
    //       <div className="relative ">
    //         <input
    //           type={isOpenEyeLeft ? "password" : "text"}
    //           className="h-13 px-3 rounded-xl border-[#383838] bg-[#333333] placeholder:text-[14px] w-full focus:outline-none"
    //           placeholder="********"
    //         />
    //         {isOpenEyeLeft ? (
    //           <img
    //             onClick={() => setIsOpenEyeLeft((prev) => !prev)}
    //             src={closeeye}
    //             alt="closeeye"
    //             className="absolute right-4.5 top-4.5 cursor-pointer"
    //           />
    //         ) : (
    //           <img
    //             onClick={() => setIsOpenEyeLeft((prev) => !prev)}
    //             src={openeye}
    //             alt="openeye"
    //             className="absolute right-4.5 top-5 cursor-pointer"
    //           />
    //         )}
    //       </div>
    //     </div>
    //     <div className="w-[50%]">
    //       <div className="flex flex-row items-center gap-1.5 pl-1 pb-2">
    //         <img
    //           src={repeatpassword}
    //           alt="repeat password"
    //           className="size-4.5"
    //         />

    //         <label
    //           htmlFor="Repeat Password"
    //           className="text-left text-xl font-medium block"
    //         >
    //           Repeat password
    //         </label>
    //       </div>
    //       <div className="relative ">
    //         <input
    //           type={isOpenEyeRight ? "password" : "text"}
    //           className="h-13 px-3 rounded-xl border-[#383838] bg-[#333333]  placeholder:text-[14px] w-full focus:outline-none"
    //           placeholder="********"
    //         />
    //         {isOpenEyeRight ? (
    //           <img
    //             onClick={() => setIsOpenEyeRight((prev) => !prev)}
    //             src={closeeye}
    //             alt="closeeye"
    //             className="absolute right-4.5 top-4.5 cursor-pointer"
    //           />
    //         ) : (
    //           <img
    //             onClick={() => setIsOpenEyeRight((prev) => !prev)}
    //             src={openeye}
    //             alt="openeye"
    //             className="absolute right-4.5 top-5 cursor-pointer"
    //           />
    //         )}
    //       </div>
    //     </div>
    //   </div>
    //   <div className="flex flex-row gap-10 px-50 pt-8 pb-4">
    //     <div className="w-[50%]">
    //       <div className="flex flex-row items-center gap-1.5 pl-1 pb-2">
    //         <img src={email} alt="email" className="size-4.5" />
    //         <label
    //           htmlFor="Email"
    //           className="text-left text-xl font-medium block  "
    //         >
    //           Email
    //         </label>
    //       </div>
    //       <input
    //         type="email"
    //         className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] bg-[#333333] placeholder:text-[14px] w-full focus:outline-none"
    //         placeholder="Khargoosh@gmail.com"
    //       />
    //     </div>
    //     <div className="w-[50%] flex-row gap-6 mt-9">
    //       <div className="flex gap-8">
    //         {" "}
    //         <button className="py-3 px-10 border rounded-xl hover:bg-white/20 cursor-pointer">
    //           Profile Banner
    //         </button>
    //         <button className="py-3 px-10 border bg-black rounded-xl hover:bg-black/20 cursor-pointer">
    //           Profile Picture
    //         </button>
    //       </div>
    //     </div>
    //   </div>
    // </>
    <>
      {isOpenPopUp && (
        <WarningPopUp
          setIsOpenPopUp={setIsOpenPopUp}
          title={"Do you want to Delete your profile?"}
          description={"if you proceed yor profile will be lost!!"}
        />
      )}
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

      <div className="flex flex-col w-[48%]  shadow-[0_0px_30px_rgba(0,0,0,0.4)]  backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[0.65]  mx-auto mt-10 rounded-3xl px-12 py-10 gap-4">
        <div className="flex items-center gap-6">
          <div className="w-[50%] ">
            <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
              <img src={name} alt="name" className="size-4.5" />
              <label
                htmlFor="Name"
                className="text-left text-xl font-medium block  "
              >
                Name
              </label>
            </div>
            <input
              type="text"
              className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] placeholder:text-[14px] w-full focus:outline-none bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5]"
              placeholder="Enter your Name ..."
            />
          </div>
          <div className="w-[50%] ">
            <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
              <img src={username} alt="user-name" className="size-5.5" />
              <label
                htmlFor="UserName"
                className="text-left text-xl font-medium block "
              >
                UserName
              </label>
            </div>
            <input
              type="text"
              className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
              placeholder="Enter your UserName ..."
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-[50%]">
            <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
              <img src={password} alt="password" className="size-5.5" />

              <label
                htmlFor="Password"
                className="text-left text-xl font-medium block"
              >
                Password
              </label>
            </div>
            <div className="relative ">
              <input
                type={isOpenEyeLeft ? "password" : "text"}
                className="h-13 px-3 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
                placeholder="********"
              />
              {isOpenEyeLeft ? (
                <img
                  onClick={() => setIsOpenEyeLeft((prev) => !prev)}
                  src={closeeye}
                  alt="closeeye"
                  className="absolute right-4.5 top-4.5 cursor-pointer "
                />
              ) : (
                <img
                  onClick={() => setIsOpenEyeLeft((prev) => !prev)}
                  src={openeye}
                  alt="openeye"
                  className="absolute right-4.5 top-5 cursor-pointer "
                />
              )}
            </div>
          </div>
          <div className="w-[50%]">
            <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
              <img
                src={repeatpassword}
                alt="repeat password"
                className="size-4.5"
              />

              <label
                htmlFor="Repeat Password"
                className="text-left text-xl font-medium block"
              >
                Repeat password
              </label>
            </div>
            <div className="relative ">
              <input
                type={isOpenEyeRight ? "password" : "text"}
                className="h-13 px-3 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5]  placeholder:text-[14px] w-full focus:outline-none"
                placeholder="********"
              />
              {isOpenEyeRight ? (
                <img
                  onClick={() => setIsOpenEyeRight((prev) => !prev)}
                  src={closeeye}
                  alt="closeeye"
                  className="absolute right-4.5 top-4.5 cursor-pointer "
                />
              ) : (
                <img
                  onClick={() => setIsOpenEyeRight((prev) => !prev)}
                  src={openeye}
                  alt="openeye"
                  className="absolute right-4.5 top-5 cursor-pointer "
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex h-fit gap-6">
          <div className="w-[50%] ">
            <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
              <img src={email} alt="Email" className="size-4.5" />
              <label
                htmlFor="Email"
                className="text-left text-xl font-medium block  "
              >
                Email
              </label>
            </div>
            <input
              type="email"
              className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
              placeholder="Enter your Email ..."
            />
          </div>
          <div className="w-[50%] flex-row mt-9">
            <div className="flex justify-center h-fit gap-8">
              <button className="px-3.5  text-sm border  rounded-xl hover:bg-white hover:text-black hover:border-black cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out">
                Profile Banner
              </button>
              <button className=" px-3.5 py-3 text-sm  border border-white rounded-xl hover:bg-black hover:border-black cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out">
                Profile Picture
              </button>
            </div>
          </div>
        </div>
        <div className="flex h-fit gap-6">
          <div className="w-full ">
            <div className="flex flex-row items-center gap-1.5 pl-1 pb-2">
              <img src={biography} alt="user-name" className="size-5.5" />
              <label
                htmlFor="Biography"
                className="text-left text-xl font-medium block "
              >
                Biography
              </label>
            </div>
            <textarea
              className="h-35 resize-none py-3 px-4 mb-2 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
              placeholder="Enter your Bio ..."
            />
          </div>
        </div>

        {/* checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="peer h-5 w-5 appearance-none rounded border border-gray-400  transition-all hover:scale-105 duration-200 ease-in-out"
          />
          <label className="text-white font-semibold">Private</label>

          {/* Custom checkmark */}
          <svg
            className=" absolute w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
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

        <div className="flex  items-center gap-6">
          <div className="w-full flex-row  mt-4">
            <div className="flex justify-between ">
              <button
                onClick={() => setIsOpenPopUp((prev) => !prev)}
                className="px-6  text-sm  rounded-xl bg-[#FF4949] text-black font-semibold hover:bg-red-500  cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out"
              >
                Delete Profile
              </button>
              <button
                onClick={() => navigation("/profile")}
                className=" px-8 py-3 text-sm  border bg-white text-black font-semibold rounded-xl hover:bg-[#ccc] cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out"
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
