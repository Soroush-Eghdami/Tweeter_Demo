import type { UseFormRegister } from "react-hook-form";

interface PrivateCheckboxProps {
  register: UseFormRegister<any>;
  isEditProfile?: boolean;
}

const PrivateCheckbox = ({ register }: PrivateCheckboxProps) => {
  return (
    <label
      className="flex items-center gap-2 cursor-pointer select-none"
      htmlFor="is_private"
    >
      <input
        type="checkbox"
        {...register("is_private")}
        id="is_private"
        className="peer h-5 w-5 appearance-none rounded border border-gray-400 transition-all hover:scale-105 duration-200 ease-in-out"
      />
      <label className="text-white font-semibold" htmlFor="is_private">
        Private
      </label>
      <svg
        className="absolute w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M5 10l3 3 7-7"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </label>
  );
};

export default PrivateCheckbox;