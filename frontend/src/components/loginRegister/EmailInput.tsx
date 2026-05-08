import type { FieldError, UseFormRegister } from "react-hook-form";
import type { RegisterFormType } from "../../types/FormTypes";
import email from "../../assets/icons/login/email.svg";

interface EmailInputPropsType {
  register: UseFormRegister<RegisterFormType>;
  error?: FieldError;
}

const EmailInput = ({ register, error }: EmailInputPropsType) => {
  return (
    <div className="w-[70%]">
      <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
        <img src={email} alt="email" className="size-4" />
        <label htmlFor="email" className="block text-left text-lg font-medium">
          Email
        </label>
      </div>
      <input
        {...register("email", {
          required: "Email is required!",
          minLength: {
            value: 8,
            message: "Email is too short!",
          },
          pattern: {
            value: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
            message:
              "Please enter a valid email address (e.g., name@domain.com)",
          },
        })}
        type="email"
        name="email"
        id="email"
        className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
        placeholder="test@example.com"
      />
      {error && (
        <p className="pl-4 text-yellow-200 text-sm mb-1">{error.message}</p>
      )}
    </div>
  );
};

export default EmailInput;
