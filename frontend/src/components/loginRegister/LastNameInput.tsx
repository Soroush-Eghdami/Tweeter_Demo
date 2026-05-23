import type { FieldError, UseFormRegister, FieldPath } from "react-hook-form";
import type { HasLastName } from "../../types/FormTypes";
import lastName from "../../assets/icons/login/name.svg";

interface LastNameInputProps<T extends HasLastName> {
  register: UseFormRegister<T>;
  error?: FieldError;
  isEditProfile?: boolean;
}

const LastNameInput = <T extends HasLastName>({
  register,
  error,
  isEditProfile,
}: LastNameInputProps<T>) => {
  return (
    <div className={isEditProfile ? "" : "w-[70%]"}>
      <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
        <img src={lastName} alt="lastName" className="size-4.25" />
        <label
          htmlFor="lastName"
          className="block text-left text-lg font-medium"
        >
          Last Name
        </label>
      </div>
      <input
        {...register("lastName" as FieldPath<T>, {
          required: "Last name is required!",
          minLength: { value: 3, message: "Last name is too short!" },
          maxLength: { value: 30, message: "Last name is too long!" },
          validate: (value: string) =>
            value.trim().length > 0 || "Last name cannot be only spaces",
        })}
        type="text"
        id="lastName"
        placeholder="Enter your Last Name"
        className={
          isEditProfile
            ? "h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
            : "h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
        }
      />
      {error && (
        <p className="pl-4 text-yellow-200 text-sm mb-1">{error.message}</p>
      )}
    </div>
  );
};

export default LastNameInput;
