import type { UseFormRegister } from "react-hook-form";
import type { RegisterFormType } from "../../types/FormTypes";
import name from "../../assets/icons/login/name.svg";

interface NameInputPropsType {
  register: UseFormRegister<RegisterFormType>;
}

const NameInput = ({ register }: NameInputPropsType) => {
  return (
    <div className="w-[70%]">
      <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
        <img src={name} alt="name" className="size-4.25" />
        <label htmlFor="name" className="block text-left text-lg font-medium">
          Name
        </label>
      </div>
      <input
        {...register("name", {
          required: "Name is required!",
          minLength: {
            value: 3,
            message: "Name is too short!",
          },
          maxLength: {
            value: 30,
            message: "Name is too long!",
          },
        })}
        type="text"
        name="name"
        id="name"
        placeholder="Enter your Name"
        className="h-13 pb-1 px-3 mb-2 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
      />
    </div>
  );
};

export default NameInput;
