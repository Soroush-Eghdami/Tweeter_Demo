import type {
  UseFormRegister,
  FieldPath,
  FieldError,
  RegisterOptions,
  FieldValues,
} from "react-hook-form";
import type { HasBio } from "../../types/FormTypes";
import biographyIcon from "../../assets/icons/profile/bio.svg";

interface BiographyInputProps<T extends HasBio & FieldValues> {
  register: UseFormRegister<T>;
  isEditProfile?: boolean;
  error?: FieldError;
  validation?: RegisterOptions<T>;
}

const BiographyInput = <T extends HasBio & FieldValues>({
  register,
  isEditProfile,
  error,
  validation,
}: BiographyInputProps<T>) => {
  return (
    <div className="w-full">
      <div className="flex flex-row items-center gap-1.5 pl-1 pb-2">
        <img src={biographyIcon} alt="biography" className="size-5.5" />
        <label htmlFor="bio" className="text-left text-xl font-medium block">
          Biography
        </label>
      </div>
      <textarea
        {...(register("bio" as FieldPath<T>, validation),
        {
          validate: (value: string) =>
            value.trim().length > 0 || "Bio cannot be only spaces",
        })}
        id="bio"
        name="bio"
        placeholder="Enter your Bio ..."
        className={
          isEditProfile
            ? "h-35 resize-none py-3 px-4 mb-2 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
            : "h-35 resize-none py-3 px-4 mb-2 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none"
        }
      />
      {error && (
        <p className="pl-1 text-yellow-200 text-sm mb-1">{error.message}</p>
      )}
    </div>
  );
};

export default BiographyInput;
