import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useIsLoggedIn from "../hooks/global-hooks/useIsLoggedIn";
import Search from "./Search";
import logo from "../assets/icons/pigeon.svg";
import home from "../assets/icons/home.svg";
import profile from "../assets/icons/user-profile.svg";
import logout from "../assets/icons/logout.svg";
import login from "../assets/icons/login.svg";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLoggedIn } = useIsLoggedIn();
  const navigation = useNavigate();

  useEffect(() => {
    const handleScrolled = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScrolled();

    window.addEventListener("scroll", handleScrolled);
    return () => window.removeEventListener("scroll", handleScrolled);
  }, []);

  return (
    <div
      className={`${isScrolled ? "backdrop-blur-sm" : ""} fixed top-0 right-0 pt-6 w-full z-30 transition-all duration-50 ease-in-out`}
    >
      <div className="max-w-[92%] mx-auto">
        <div className="flex items-center justify-between px-6">
          <div>
            <img src={logo} alt="Logo" className="size-16" />
          </div>
          <Search />
          <div className="flex items-center justify-center gap-12 mb-4">
            <img
              src={home}
              alt="Home-Page"
              className="size-8.5 cursor-pointer hover:scale-115 transition-all duration-100 ease-in-out"
              onClick={() => navigation("/")}
            />
            <img
              src={profile}
              alt="Profile-Page"
              className="size-7.5 cursor-pointer hover:scale-115 transition-all duration-100 ease-in-out"
              onClick={() => navigation("/profile")}
            />
            {!isLoggedIn ? (
              <img
                src={login}
                alt="Login"
                className="size-7.5 cursor-pointer hover:scale-115 transition-all duration-100 ease-in-out"
                onClick={() => navigation("/login")}
              />
            ) : (
              <img
                src={logout}
                alt="Logout"
                className="size-7.5 cursor-pointer hover:scale-115 transition-all duration-100 ease-in-out"
                onClick={() => navigation("/login")}
              />
            )}
          </div>
        </div>
        <div className="h-0.5 w-full bg-white"></div>
      </div>
    </div>
  );
};

export default Navbar;
