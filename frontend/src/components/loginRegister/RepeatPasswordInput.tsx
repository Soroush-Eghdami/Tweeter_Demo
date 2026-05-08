import { useState } from "react";
import type {
  FieldError,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import type { RegisterFormType } from "../../types/FormTypes";
import repeatPassword from "../../assets/icons/login/repeat-password.svg";
import openEye from "../../assets/icons/login/opened-eye.svg";
import closeEye from "../../assets/icons/login/closed-eye.svg";

interface RepeatPasswordInputPropsType {
  register: UseFormRegister<RegisterFormType>;
  watch: UseFormWatch<RegisterFormType>;
  error?: FieldError;
}

const RepeatPasswordInput = ({
  register,
  watch,
  error,
}: RepeatPasswordInputPropsType) => {
  const [isOpenEye, setIsOpenEye] = useState(true);

  return (
    <div className="w-full">
      <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
        <img src={repeatPassword} alt="repeat-password" className="size-4.5" />

        <label
          htmlFor="repeatPassword"
          className="block text-left text-lg font-medium"
        >
          Repeat password
        </label>
      </div>
      <div className="relative">
        <input
          {...register("repeatPassword", {
            required: "RepeatPassword is required!",
            validate: (value: string) =>
              value === watch("password") ||
              "Password & repeatPassword must be the same!",
          })}
          type={isOpenEye ? "password" : "text"}
          name="repeatPassword"
          id="repeatPassword"
          className="h-13 pb-1 pl-3 pr-12 mb-2 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
          placeholder="********"
        />
        {error && (
          <p className="pl-4 text-yellow-200 text-sm mb-1">{error.message}</p>
        )}
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

export default RepeatPasswordInput;
