import type { FieldError, UseFormRegister } from "react-hook-form";
import type { RegisterFormType } from "../../types/FormTypes";
import firstName from "../../assets/icons/login/name.svg";

interface FirstNameInputPropsType {
  register: UseFormRegister<RegisterFormType>;
  error?: FieldError;
}

const FirstNameInput = ({ register, error }: FirstNameInputPropsType) => {
  return (
    <div className="w-[70%]">
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
        {...register("firstName", {
          required: "First name is required!",
          minLength: {
            value: 3,
            message: "First name is too short!",
          },
          maxLength: {
            value: 30,
            message: "First name is too long!",
          },
        })}
        type="text"
        name="firstName"
        id="firstName"
        placeholder="Enter your First Name"
        className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
      />
      {error && (
        <p className="pl-4 text-yellow-200 text-sm mb-1">{error.message}</p>
      )}
    </div>
  );
};

export default FirstNameInput;
