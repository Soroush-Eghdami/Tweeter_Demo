import type { FieldError, UseFormRegister, FieldPath } from "react-hook-form";
import type { HasEmail } from "../../types/FormTypes";
import email from "../../assets/icons/login/email.svg";

interface EmailInputProps<T extends HasEmail> {
  register: UseFormRegister<T>;
  error?: FieldError;
  isEditProfile?: boolean;
}

const EmailInput = <T extends HasEmail>({
  register,
  error,
  isEditProfile,
}: EmailInputProps<T>) => {
  return (
    <div className={isEditProfile ? "" : "w-[70%]"}>
      <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
        <img src={email} alt="email" className="size-4" />
        <label htmlFor="email" className="block text-left text-lg font-medium">
          Email
        </label>
      </div>
      <input
        {...register("email" as FieldPath<T>, {
          required: "Email is required!",
          minLength: { value: 8, message: "Email is too short!" },
          pattern: {
            value: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
            message:
              "Please enter a valid email address (e.g., name@domain.com)",
          },
          validate: (value: string) =>
            value.trim().length > 0 || "Email cannot be only spaces",
        })}
        type="email"
        id="email"
        className={
          isEditProfile
            ? "h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
            : "h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
        }
        placeholder="test@example.com"
      />
      {error && (
        <p className="pl-4 text-yellow-200 text-sm mb-1">{error.message}</p>
      )}
    </div>
  );
};

export default EmailInput;
