import { useEffect, useState } from "react";
import password from "../../assets/icons/login/password.svg";
import repeatPasswordIcon from "../../assets/icons/login/repeat-password.svg";
import openEye from "../../assets/icons/login/opened-eye.svg";
import closeEye from "../../assets/icons/login/closed-eye.svg";
import type { FieldErrors, UseFormRegister } from "react-hook-form";


interface NewPasswordInputsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  isOpen: boolean;
}

const NewPasswordInputs = ({ register, errors, isOpen }: NewPasswordInputsProps) => {
  const [isOpenEyeLeft, setIsOpenEyeLeft] = useState(true);
  const [isOpenEyeRight, setIsOpenEyeRight] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsOpenEyeLeft(true);
      setIsOpenEyeRight(true);
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
              validate: (value) =>
                !/^\d+$/.test(value) || "This password is entirely numeric.",
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

      <div className="w-[70%]">
        <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
          <img src={repeatPasswordIcon} alt="repeat password" className="size-4.5" />
          <label htmlFor="repeatPassword" className="block text-left text-xl font-medium">
            Repeat password
          </label>
        </div>
        <div className="relative">
          <input
            type={isOpenEyeRight ? "password" : "text"}
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
              {errors.repeatPassword.message as string}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default NewPasswordInputs;