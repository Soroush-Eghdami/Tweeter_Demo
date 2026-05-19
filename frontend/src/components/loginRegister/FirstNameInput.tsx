import type { FieldError, UseFormRegister, FieldPath } from "react-hook-form"; // CHANGED: added FieldPath
import type { HasFirstName } from "../../types/FormTypes";
import firstName from "../../assets/icons/login/name.svg";

interface FirstNameInputProps<T extends HasFirstName> {
  register: UseFormRegister<T>;
  error?: FieldError;
  isEditProfile?: boolean;
}

const FirstNameInput = <T extends HasFirstName>({
  register,
  error,
  isEditProfile,
}: FirstNameInputProps<T>) => {
  return (
    <div className={isEditProfile ? "" : "w-[70%]"}>
      <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
        <img src={firstName} alt="firstName" className="size-4.25" />
        <label
          htmlFor="firstName"
          className="block text-left text-lg font-medium"
        >
          First Name
        </label>
      </div>
      <input
        // CHANGED: cast field name to FieldPath<T> to satisfy TypeScript
        {...register("firstName" as FieldPath<T>, {
          required: "First name is required!",
          minLength: { value: 3, message: "First name is too short!" },
          maxLength: { value: 30, message: "First name is too long!" },
          validate: (value: string) =>
            value.trim().length > 0 || "First name cannot be only spaces",
        })}
        type="text"
        id="firstName"
        placeholder="Enter your First Name"
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

export default FirstNameInput;
