import { useState } from "react";
import oldPassword from "../../assets/icons/profile/open-lock.svg";
import closeEye from "../../assets/icons/login/closed-eye.svg";
import openEye from "../../assets/icons/login/opened-eye.svg";


interface OldPasswordInputProps {
  value: string;
  onChange: (value: string) => void;
}

const OldPasswordInput = ({ value, onChange }: OldPasswordInputProps) => {
  const [isOpenEye, setIsOpenEye] = useState(true);

  return (
    <div className="w-[70%]">
      <div className="flex flex-row items-center gap-1.5 pl-1 pb-1">
        <img src={oldPassword} alt="Old-Password" className="size-5.5" />
        <label
          htmlFor="oldPassword"
          className="block text-left text-xl font-medium"
        >
          Old Password
        </label>
      </div>
      <div className="relative">
        <input
          type={isOpenEye ? "password" : "text"}
          id="oldPassword"
          name="oldPassword"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-13 px-3 rounded-xl border-[#383838] bg-white/8 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] placeholder:text-[14px] w-full focus:outline-none"
          placeholder="********"
        />
        {isOpenEye ? (
          <img
            onClick={() => setIsOpenEye(false)}
            src={closeEye}
            alt="close-eye"
            className="absolute right-4.5 top-4.5 cursor-pointer"
          />
        ) : (
          <img
            onClick={() => setIsOpenEye(true)}
            src={openEye}
            alt="open-eye"
            className="absolute right-4.5 top-5 cursor-pointer"
          />
        )}
      </div>
    </div>
  );
};

export default OldPasswordInput;
