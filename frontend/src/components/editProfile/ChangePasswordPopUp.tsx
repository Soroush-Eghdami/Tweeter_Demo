import { useState } from "react";
import toast from "react-hot-toast";
import YesButton from "../YesButton";
import NoButton from "../NoButton";
import OldPasswordInput from "../../components/editProfile/OldPasswordInput";
import password from "../../assets/icons/login/password.svg";
import repeatPasswordIcon from "../../assets/icons/login/repeat-password.svg";
import openEye from "../../assets/icons/login/opened-eye.svg";
import closeEye from "../../assets/icons/login/closed-eye.svg";

interface ChangePasswordPopUpPropType {
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
}

const ChangePasswordPopUp = ({
  isOpen,
  setIsOpen,
}: ChangePasswordPopUpPropType) => {
  const [isOpenEyeLeft, setIsOpenEyeLeft] = useState(true);
  const [isOpenEyeRight, setIsOpenEyeRight] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [repeatError, setRepeatError] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState(""); 

  const handleYesClick = () => {

    if (!oldPassword) {
      setOldPasswordError("Old password is required");
      return;
    }
    setOldPasswordError("");
    if (!newPassword || !repeatPassword) {
      setRepeatError("Please fill both password fields");
      return;
    }
    if (newPassword !== repeatPassword) {
      setRepeatError("Password & repeatPassword must be the same!");
      return;
    }
    if (oldPassword && newPassword && repeatPassword && oldPassword === newPassword && newPassword === repeatPassword )
    {
      toast.error("All 3 passwords cannot be the same!")
    }
    return;
    setRepeatError("");
    setIsOpen(false);
  };
  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    setRepeatError("");
  };

  const handleRepeatPasswordChange = (e) => {
    setRepeatPassword(e.target.value);
    setRepeatError("");
  };

  return (
    <>
      <div
        className={`${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} fixed z-40 w-dvw min-h-screen top-0 right-0 pt-35 backdrop-blur-md bg-black/70 transition-opacity duration-200`}
      >
        <div className="z-50 max-w-[50%] mx-auto pt-10 pb-7 px-14 rounded-2xl bg-[#1c1c1c] shadow-[0_0px_30px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col gap-6">
            <OldPasswordInput 
            value={oldPassword} 
            onChange={setOldPassword}
            error={oldPasswordError}/>
            <div className="w-[70%]">
              <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
                <img src={password} alt="New-Password" className="size-5.5" />
                <label
                  htmlFor="newPassword"
                  className="block text-left text-xl font-medium"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={isOpenEyeLeft ? "password" : "text"}
                  name="newPassword"
                  id="newPassword"
                  className="h-13 px-3 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
                  placeholder="********"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                />
                {isOpenEyeLeft ? (
                  <img
                    onClick={() => setIsOpenEyeLeft((prev) => !prev)}
                    src={closeEye}
                    alt="close-eye"
                    className="absolute right-4.5 top-4.5 cursor-pointer"
                  />
                ) : (
                  <img
                    onClick={() => setIsOpenEyeLeft((prev) => !prev)}
                    src={openEye}
                    alt="open-eye"
                    className="absolute right-4.5 top-5 cursor-pointer"
                  />
                )}
              </div>
            </div>
            <div className="w-[70%]">
              <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
                <img
                  src={repeatPasswordIcon}
                  alt="repeat password"
                  className="size-4.5"
                />

                <label
                  htmlFor="repeatPassword"
                  className="block text-left text-xl font-medium"
                >
                  Repeat password
                </label>
              </div>
              <div className="relative">
                <input
                  type={isOpenEyeRight ? "password" : "text"}
                  name="repeatPassword"
                  id="repeatPassword"
                  className="h-13 px-3 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
                  placeholder="********"
                  value={repeatPassword}
                  onChange={handleRepeatPasswordChange}
                />
                {repeatError && (
                  <p className="pl-4 text-yellow-200 text-sm mt-1">
                    {repeatError}
                  </p>
                )}
                {isOpenEyeRight ? (
                  <img
                    onClick={() => setIsOpenEyeRight((prev) => !prev)}
                    src={closeEye}
                    alt="close-eye"
                    className="absolute right-4.5 top-4.5 cursor-pointer"
                  />
                ) : (
                  <img
                    onClick={() => setIsOpenEyeRight((prev) => !prev)}
                    src={openEye}
                    alt="open-eye"
                    className="absolute right-4.5 top-5 cursor-pointer"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex w-fit ml-auto gap-4 mt-12">
            <div>
              <NoButton setIsOpenPopUp={setIsOpen} />
            </div>
            <div onClick={handleYesClick}>
              <YesButton setIsOpenPopUp={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordPopUp;
