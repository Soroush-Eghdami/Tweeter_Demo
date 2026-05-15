import { useEffect, useState, useRef } from "react";
import YesButton from "../YesButton";
import NoButton from "../NoButton";
import type { bannerUpdateObjType } from "../../types/UpdateProfileTypes";
import avatar from "../../assets/icons/profile-default.svg";

interface EditBannerProps {
  isOpen: boolean;
  bannerUpdateObj?: bannerUpdateObjType;
  username: string;
  email: string;
  bio: string;
  bannerPic: string;
  onClose: () => void;
  // NEW: callback to update parent with new user data
  onUploadSuccess?: (updatedUser: any) => void;
}

const EditBanner = ({
  isOpen,
  bannerUpdateObj,
  username,
  email,
  bio,
  bannerPic,
  onClose,
  onUploadSuccess,   // NEW
}: EditBannerProps) => {
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleChooseFile = () => {
    bannerInputRef.current?.click();
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(file ? URL.createObjectURL(file) : null);
  };

  // CHANGED: await the upload and call onUploadSuccess
  const handleYesClick = async () => {
    if (!bannerFile || !bannerUpdateObj) return;

    const formData = new FormData();
    formData.append("profile_banner", bannerFile);
    try {
      const updatedUser = await bannerUpdateObj.bannerUpdate(formData);
      onUploadSuccess?.(updatedUser);   // update parent state
      onClose();
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleNoClick = () => {
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        if (bannerPreview) URL.revokeObjectURL(bannerPreview);
        setBannerFile(null);
        setBannerPreview(null);
        if (bannerInputRef.current) bannerInputRef.current.value = "";
      }, 500);
    }
  }, [isOpen, bannerPreview]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

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
        >
          {bannerPic && !bannerPreview && (
            <img
              src={bannerPic}
              alt="Banner-Picture"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="relative mt-0 mb-20 flex-1">
          <div className="border-t-2 border-white" />
          <div className="absolute -top-20 left-30 flex flex-col items-center group">
            <div className="relative group/avatar size-40 rounded-full border-2 border-white overflow-hidden bg-black">
              <img
                src={avatar}
                alt="Profile-Default"
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              id="banner-upload"
              name="banner-upload"
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
          <NoButton
            setIsOpenPopUp={handleNoClick}
            size="size-8"
            padding="p-6"
          />
          <YesButton
            setIsOpenPopUp={handleYesClick}
            isLoading={bannerUpdateObj?.bannerUpdateLoading}
            loadingWidth="w-8"
            loadingHeight="h-8"
            size="size-8"
            padding="p-6"
          />
        </div>
      </div>
    </div>
  );
};

export default EditBanner;