import { Link, useNavigate } from "react-router-dom";
import password from "../assets/icons/login/password.svg";
import openeye from "../assets/icons/login/opened-eye.svg";
import closeeye from "../assets/icons/login/closed-eye.svg";
import username from "../assets/icons/login/username.svg";
import name from "../assets/icons/login/name.svg";
import email from "../assets/icons/login/email.svg";
import repeatpassword from "../assets/icons/login/repeat-password.svg";
import { useState } from "react";

const Register = () => {
  const [isOpenEyeLeft, setIsOpenEyeLeft] = useState(true);
  const [isOpenEyeRight, setIsOpenEyeRight] = useState(true);
  const navigation = useNavigate();

  return (
    <>
      <div className="bg-custom-login-gradient min-h-dvh">
        <div className="py-25">
          <form className="container flex flex-col items-center justify-center gap-2 shadow-[0_0px_30px_rgba(0,0,0,0.4)] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] rounded-3xl text-white max-w-[38.5%] mx-auto">
            <div className="pt-12 pb-6 px-4 mt-4">
              <p className="text-center text-3xl font-semibold">
                {" "}
                Create your account
              </p>
            </div>
            <div className="w-[70%]">
              <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
                <img src={name} alt="name" className="size-3.5" />
                <label
                  htmlFor="Name"
                  className="text-left text-[14px] font-medium block  "
                >
                  Name
                </label>
              </div>
              <input
                type="text"
                className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
                placeholder="Enter your Name ..."
              />
            </div>
            <div className="w-[70%]">
              <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
                <img src={username} alt="username" className="size-5" />
                <label
                  htmlFor="UserName"
                  className="text-left text-[14px] font-medium block  "
                >
                  UserName
                </label>
              </div>
              <input
                type="text"
                className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
                placeholder="Enter your Username ..."
              />
            </div>
            <div className="w-[70%]">
              <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
                <img src={email} alt="email" className="size-3.5" />
                <label
                  htmlFor="Email"
                  className="text-left text-[14px] font-medium block  "
                >
                  Email
                </label>
              </div>
              <input
                type="email"
                className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
                placeholder="test@example.com "
              />
            </div>
            <div className="flex flex-wrap gap-6 justify-center items-center">
              <div className="w-48">
                <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
                  <img src={password} alt="password" className="size-4.5" />

                  <label
                    htmlFor="Password"
                    className="text-left text-[14px] font-medium block"
                  >
                    Password
                  </label>
                </div>
                <div className="relative ">
                  <input
                    type={isOpenEyeLeft ? "password" : "text"}
                    className="h-13 pb-1 px-3 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
                    placeholder="********"
                  />
                  {isOpenEyeLeft ? (
                    <img
                      onClick={() => setIsOpenEyeLeft((prev) => !prev)}
                      src={closeeye}
                      alt="closeeye"
                      className="absolute right-4.5 top-4.5 cursor-pointer"
                    />
                  ) : (
                    <img
                      onClick={() => setIsOpenEyeLeft((prev) => !prev)}
                      src={openeye}
                      alt="openeye"
                      className="absolute right-4.5 top-5 cursor-pointer"
                    />
                  )}
                </div>
              </div>
              <div className="w-48">
                <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
                  <img
                    src={repeatpassword}
                    alt="repeat password"
                    className="size-4"
                  />

                  <label
                    htmlFor="Repeat Password"
                    className="text-left text-[14px] font-medium block"
                  >
                    Repeat password
                  </label>
                </div>
                <div className="relative ">
                  <input
                    type={isOpenEyeRight ? "password" : "text"}
                    className="h-13 pb-1 px-3 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
                    placeholder="********"
                  />
                  {isOpenEyeRight ? (
                    <img
                      onClick={() => setIsOpenEyeRight((prev) => !prev)}
                      src={closeeye}
                      alt="closeeye"
                      className="absolute right-4.5 top-4.5 cursor-pointer"
                    />
                  ) : (
                    <img
                      onClick={() => setIsOpenEyeRight((prev) => !prev)}
                      src={openeye}
                      alt="openeye"
                      className="absolute right-4.5 top-5 cursor-pointer"
                    />
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigation("/login")}
              className="w-[70%] rounded-xl font-bold px-16 py-3 bg-white text-black mt-14 cursor-pointer hover:bg-gray-200"
            >
              Register
            </button>

            <p className="mb-12">
              Already have an account?{" "}
              <Link to="/login" className="underline hover:text-blue-400">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
