import type { FieldError, UseFormRegister, FieldPath } from "react-hook-form";
import type { HasUsername } from "../../types/FormTypes";
import username from "../../assets/icons/login/username.svg";

interface UsernameInputProps<T extends HasUsername> {
  register: UseFormRegister<T>;
  error?: FieldError;
  isEditProfile?: boolean;
  isLoginPage?: boolean;
}

const UsernameInput = <T extends HasUsername>({
  register,
  error,
  isEditProfile,
  isLoginPage,
}: UsernameInputProps<T>) => {
  const validationRules = !isLoginPage
    ? {
        required: "Username is required!",
        minLength: { value: 6, message: "Username is too short!" },
        maxLength: { value: 40, message: "Username is too long!" },
        validate: (value: string) =>
          value.trim().length > 0 || "Username cannot be only spaces",
      }
    : {
        required: "Username is required!",
      };

  return (
    <div className={isEditProfile ? "" : "w-[70%]"}>
      <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
        <img src={username} alt="username" className="size-5.5" />
        <label
          htmlFor="username"
          className="block text-left text-lg font-medium"
        >
          Username
        </label>
      </div>
      <input
        {...register("username" as FieldPath<T>, validationRules)}
        type="text"
        id="username"
        className={
          isEditProfile
            ? "h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
            : "h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
        }
        placeholder="Enter your Username"
      />
      {error && (
        <p className="pl-4 text-yellow-200 text-sm mb-1">{error.message}</p>
      )}
    </div>
  );
};

export default UsernameInput;
