import { useEffect, useState, useRef } from "react";
import YesButton from "../YesButton";
import NoButton from "../NoButton";
import avatar from "../../assets/icons/profile-default.svg";

interface EditBannerProps {
  isOpen: boolean;
  username: string;
  email: string;
  bio: string;
  onClose: () => void;
}

const EditBanner = ({
  isOpen,
  onClose,
  username,
  email,
  bio,
}: EditBannerProps) => {
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleChooseFile = () => {
    bannerInputRef.current?.click();
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }

    setBannerPreview(file ? URL.createObjectURL(file) : null);
  };

  useEffect(() => {
    return () => {
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [bannerPreview]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleYesClick = () => {
    onClose();
  };

  const handleNoClick = () => {
    onClose();
  };

  return (
    <div
      className={`${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-200`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col w-333.25 h-166.5 rounded-2xl bg-[#1c1c1c]/90 shadow-[0_0px_30px_rgba(0,0,0,0.4)] overflow-hidden">
        <div
          className="relative h-55 w-full rounded-t-2xl group shrink-0 overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: bannerPreview ? `url(${bannerPreview})` : "none",
          }}
        ></div>

        {/* Avatar  */}
        <div className="relative mt-0 mb-20 flex-1">
          <div className="border-t-2 border-white" />
          <div className="absolute -top-20 left-30 flex flex-col items-center group">
            <div className="relative group/avatar size-40 rounded-full border-2 border-white overflow-hidden bg-black">
              <img
                src={avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            <input
              id="banner-upload"
              name="banner-upload"
              type="file"
              accept="image/*"
              className="hidden"
              ref={bannerInputRef}
              onChange={handleBannerChange}
            />

            <div className="mt-4 relative left-5 top-2">
              <p className="text-white text-2xl mb-2 font-semibold">
                {username}
              </p>
              <p className="text-white opacity-80 mb-0.5">{email}</p>
              <p className="text-white max-w-50 truncate">{bio}</p>
            </div>
          </div>

          <button
            onClick={handleChooseFile}
            className="absolute bottom-33 right-9 px-8 py-6 text-white text-xl rounded-2xl border-2 border-white cursor-pointer hover:scale-110 transition-all duration-200 ease-in-out"
          >
            Choose file
          </button>
        </div>

        <div className="flex justify-end right-9 gap-4 p-6">
          <NoButton setIsOpenPopUp={() => handleNoClick()} />
          <YesButton setIsOpenPopUp={() => handleYesClick()} />
        </div>
      </div>
    </div>
  );
};

export default EditBanner;
