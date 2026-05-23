import type { UseFormRegister, FieldPath } from "react-hook-form";
import type { HasPrivate } from "../../types/FormTypes";

interface PrivateCheckboxProps<T extends HasPrivate> {
  register: UseFormRegister<T>;
  isEditProfile?: boolean;
}

const PrivateCheckbox = <T extends HasPrivate>({
  register,
}: PrivateCheckboxProps<T>) => {
  return (
    <label
      htmlFor="is_private"
      className="flex items-center gap-2 cursor-pointer select-none"
    >
      <input
        type="checkbox"
        {...register("is_private" as FieldPath<T>)}
        id="is_private"
        name="is_private"
        className="peer h-5 w-5 appearance-none rounded border border-gray-400 transition-all hover:scale-105 duration-200 ease-in-out"
      />
      <label htmlFor="is_private" className="text-white font-semibold">
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
