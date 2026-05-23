import { useEffect, useState } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { ChangePasswordFormType } from "../../hooks/useChangePasswordForm";
import password from "../../assets/icons/login/password.svg";
import repeatPasswordIcon from "../../assets/icons/login/repeat-password.svg";
import openEye from "../../assets/icons/login/opened-eye.svg";
import closeEye from "../../assets/icons/login/closed-eye.svg";

interface NewPasswordInputsProps {
  register: UseFormRegister<ChangePasswordFormType>;
  errors: FieldErrors;
  isOpen: boolean;
}

const NewPasswordInputs = ({ register, errors, isOpen }: NewPasswordInputsProps) => {
  const [isOpenEyeLeft, setIsOpenEyeLeft] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsOpenEyeLeft(true);
    }
  }, [isOpen]);

  return (
    <>
      <div className="w-[70%]">
        <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
          <img src={password} alt="New-Password" className="size-5.5" />
          <label htmlFor="newPassword" className="block text-left text-xl font-medium">
            Password
          </label>
        </div>
        <div className="relative">
          <input
            type={isOpenEyeLeft ? "password" : "text"}
            id="newPassword"
            name="newPassword"
            className="h-13 px-3 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
            placeholder="********"
            {...register("newPassword", {
              required: "New password is required!",
              minLength: {
                value: 8,
                message: "New password is too short!",
              },
              maxLength: {
                value: 64,
                message: "New password is too long!",
              },
              pattern: {
                value: /^(?=.*\d).+$/,
                message: "Password must contain at least one number!",
              },
              validate: (value) =>
                !/^\d+$/.test(value) || "This password is entirely numeric!",
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
              {errors.newPassword.message as string}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default NewPasswordInputs;
