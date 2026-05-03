import { useState } from "react";
import type { UseFormRegister } from "react-hook-form";
import type { LoginFormType, RegisterFormType } from "../../types/FormTypes";
import password from "../../assets/icons/login/password.svg";
import openEye from "../../assets/icons/login/opened-eye.svg";
import closeEye from "../../assets/icons/login/closed-eye.svg";

interface PasswordInputPropsType {
  register: UseFormRegister<RegisterFormType | LoginFormType>;
}

const PasswordInput = ({ register }: PasswordInputPropsType) => {
  const [isOpenEye, setIsOpenEye] = useState(true);

  return (
    <div className="w-full">
      <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
        <img src={password} alt="password" className="size-5.5" />

        <label
          htmlFor="password"
          className="block text-left text-lg font-medium"
        >
          Password
        </label>
      </div>
      <div className="relative">
        <input
          {...register("password", {
            required: "Password is required!",
            minLength: {
              value: 8,
              message: "Password is too short",
            },
            validate: (value: string) => {
              const hasNumber = /\d/;
              const hasLower = /[a-z]/;

              if (!hasNumber.test(value))
                return "Password must contain at least one number";
              if (!hasLower.test(value))
                return "Password must contain at least one lowercase letter";

              return true;
            },
          })}
          type={isOpenEye ? "password" : "text"}
          name="password"
          id="password"
          className="h-13 pb-1 pl-3 pr-12 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
          placeholder="********"
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
  );
};

export default PasswordInput;
