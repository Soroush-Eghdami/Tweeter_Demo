import { useState } from "react";
import YesButton from "../YesButton";
import NoButton from "../NoButton";
import OldPasswordInput from "../../components/editProfile/OldPasswordInput";
import password from "../../assets/icons/login/password.svg";
import repeatPasswordIcon from "../../assets/icons/login/repeat-password.svg";
import openEye from "../../assets/icons/login/opened-eye.svg";
import closeEye from "../../assets/icons/login/closed-eye.svg";
import { useChangePasswordForm } from "../../hooks/useChangePasswordForm";
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
    const {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isPending,
  } = useChangePasswordForm({
    setIsOpen,
  });

  
  return (
    <>
      <div
        className={`${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} fixed z-40 w-dvw min-h-screen top-0 right-0 pt-35 backdrop-blur-md bg-black/70 transition-opacity duration-200`}
      >
        <div className="z-50 max-w-[50%] mx-auto pt-10 pb-7 px-14 rounded-2xl bg-[#1c1c1c] shadow-[0_0px_30px_rgba(0,0,0,0.4)]">
          <form 
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <OldPasswordInput 
            register={register}
            error={errors.oldPassword?.message}/>
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
                  {...register("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters long",
                      },
                      maxLength: {
                        value: 64,
                        message: "Password cannot exceed 64 characters",
                      },
                      pattern: {
                        value: /^(?=.*\d).+$/,
                        message: "Password must contain at least one number",
                      },
                    })}
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
                {errors.newPassword && (
                <p className="pl-4 text-yellow-200 text-sm mt-1">
                  {errors.newPassword.message}
                </p>
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
                  {...register("repeatPassword", {
                  required: "Repeat password is required",
                })}
                />
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
                {errors.repeatPassword && (
                <p className="pl-4 text-yellow-200 text-sm mt-1">
                  {errors.repeatPassword.message}
                </p>
              )}
              </div>
            </div>
          </div>
          <div className="flex w-fit ml-auto gap-4 mt-12">
            <div>
              <NoButton setIsOpenPopUp={setIsOpen} />
            </div>
            <div >
              <YesButton
              setIsOpenPopUp={() => {}}
                disabled={isPending}
                type="submit" />
            </div>
          </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordPopUp;
