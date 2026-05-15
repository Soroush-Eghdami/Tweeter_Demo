import type { UseFormRegister } from "react-hook-form";
import biographyIcon from "../assets/icons/profile/bio.svg";

interface BiographyInputProps {
  register: UseFormRegister<any>;
  isEditProfile?: boolean;
}

const BiographyInput = ({ register, isEditProfile }: BiographyInputProps) => {
  return (
    <div className="w-full">
      <div className="flex flex-row items-center gap-1.5 pl-1 pb-2">
        <img src={biographyIcon} alt="biography" className="size-5.5" />
        <label
          htmlFor="bio"
          className="text-left text-xl font-medium block"
        >
          Biography
        </label>
      </div>
      <textarea
        {...register("bio")}
        id="bio"
        className={
          isEditProfile
            ? "h-35 resize-none py-3 px-4 mb-2 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
            : "h-35 resize-none py-3 px-4 mb-2 rounded-xl border-[#383838] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[6] bg-white/10 placeholder:text-[14px] w-full focus:outline-none" // fallback style if used elsewhere
        }
        placeholder="Enter your Bio ..."
      />
    </div>
  );
};

export default BiographyInput;