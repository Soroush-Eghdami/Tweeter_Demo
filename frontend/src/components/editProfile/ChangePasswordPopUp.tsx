import { useEffect, useState } from "react";
import YesButton from "../YesButton";
import NoButton from "../NoButton";
import Loading from "../loading/Loading";
import NewPasswordInputs from "./NewPasswordInputs";
import OldPasswordInput from "../../components/editProfile/OldPasswordInput";
import { useChangePasswordForm } from "../../hooks/useChangePasswordForm";
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
  const [isOpenEyeOld, setIsOpenEyeOld] = useState(true);
  const [isOpenEyeRepeat, setIsOpenEyeRepeat] = useState(true);

  const { register, handleSubmit, errors, onSubmit, isPending, reset, watch } =
    useChangePasswordForm({
      setIsOpen,
    });

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <>
      <div
        className={`${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} fixed z-40 w-dvw min-h-screen top-0 right-0 pt-35 backdrop-blur-md bg-black/70 transition-opacity duration-200`}
      >
        <div className="z-50 max-w-[50%] mx-auto pt-10 pb-7 px-14 rounded-2xl bg-[#1c1c1c] shadow-[0_0px_30px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col gap-6">
            <OldPasswordInput
              register={register}
              error={errors.oldPassword?.message}
              isOpenEye={isOpenEyeOld}
              setIsOpenEye={setIsOpenEyeOld}
            />
            <NewPasswordInputs
              register={register}
              errors={errors}
              isOpen={isOpen}
            />
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
                  type={isOpenEyeRepeat ? "password" : "text"}
                  id="repeatPassword"
                  name="repeatPassword"
                  className="h-13 px-3 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
                  placeholder="********"
                  {...register("repeatPassword", {
                    required: "Repeat password is required!",
                    validate: (value) =>
                      value === watch("newPassword") ||
                      "Password & repeatPassword must be the same!",
                  })}
                />
                <img
                  onClick={() => setIsOpenEyeRepeat(!isOpenEyeRepeat)}
                  src={isOpenEyeRepeat ? closeEye : openEye}
                  alt="toggle-eye"
                  className="absolute right-4.5 top-4.5 cursor-pointer"
                />
                {errors.repeatPassword && (
                  <p className="pl-4 text-yellow-200 text-sm mt-1">
                    {errors.repeatPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-12">
            <NoButton setIsOpenPopUp={() => setIsOpen(false)} />
            <div className="relative">
              <div className={isPending ? "opacity-0" : ""}>
                <div onClick={handleSubmit(onSubmit)}>
                  <YesButton />
                </div>
              </div>
              {isPending && (
                <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center cursor-not-allowed">
                  <Loading width="w-8" height="h-8" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordPopUp;
