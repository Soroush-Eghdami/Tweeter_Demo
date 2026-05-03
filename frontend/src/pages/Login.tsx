import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import username from "../assets/icons/login/username.svg";
import password from "../assets/icons/login/password.svg";
import openEye from "../assets/icons/login/opened-eye.svg";
import closeEye from "../assets/icons/login/closed-eye.svg";

const Login = () => {
  const [isOpenEye, setIsOpenEye] = useState(true);

  const navigation = useNavigate();

  return (
    <div className="bg-custom-login-gradient min-h-dvh">
      <div className="pt-32">
        <form className="container flex flex-col items-center justify-center gap-2 text-white max-w-[30%] mx-auto shadow-[0_0px_30px_rgba(0,0,0,0.4)] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] rounded-3xl">
          <div className="pt-12 pb-6 px-4 mt-4">
            <p className="text-center text-3xl font-semibold"> Welcome!</p>
          </div>
          <div className="w-[70%]">
            <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
              <img src={username} alt="username" className="size-5" />
              <label
                htmlFor="username"
                className="block text-left text-[14px] font-medium"
              >
                Username
              </label>
            </div>
            <input
              type="text"
              name="username"
              id="username"
              className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
              placeholder="Enter your Username ..."
            />
          </div>
          <div className="w-[70%]">
            <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
              <img src={password} alt="password" className="size-4.5" />

              <label
                htmlFor="password"
                className="block text-left text-[14px] font-medium"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={isOpenEye ? "password" : "text"}
                name="password"
                id="password"
                className="h-13 pb-1 px-3 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
                placeholder="Enter your Password ..."
              />
              {isOpenEye ? (
                <img
                  onClick={() => setIsOpenEye((prev) => !prev)}
                  src={closeEye}
                  alt="close-eye"
                  className="absolute right-4.5 top-4.5 cursor-pointer"
                />
              ) : (
                <img
                  onClick={() => setIsOpenEye((prev) => !prev)}
                  src={openEye}
                  alt="open-eye"
                  className="absolute right-4.5 top-5 cursor-pointer"
                />
              )}
            </div>
          </div>

          <button
            onClick={() => navigation("/")}
            className="w-[70%] rounded-xl font-bold px-16 py-3 bg-white text-black mt-14 cursor-pointer hover:bg-gray-200"
          >
            Login
          </button>

          <p className="mb-12">
            Don't have an account?{" "}
            <Link to="/register" className="underline hover:text-blue-400">
              Register Now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
