import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import WarningPopUp from "../components/WarningPopUp";
import BackToPrev from "../components/BackToPrev";
import ProfilePictureEdit from "../components/profilePictureEdit/ProfilePictureEdit";
import EditBanner from "../components/profileBannerEdit/EditBanner";
import ChangePasswordPopUp from "../components/editProfile/ChangePasswordPopUp";
import FirstNameInput from "../components/loginRegister/FirstNameInput";
import LastNameInput from "../components/loginRegister/LastNameInput";
import UsernameInput from "../components/loginRegister/UsernameInput";
import EmailInput from "../components/loginRegister/EmailInput";
import BiographyInput from "../components/editProfile/BiographyInput";
import PrivateCheckbox from "../components/editProfile/PrivateCheckbox";
import { useEditProfileForm } from "../hooks/global-hooks/useEditProfileForm";
import {
  useUpdateBannerPicture,
  useUpdateProfilePicture,
} from "../hooks/useUpdateProfile";
import type { EditProfileResponse } from "../types/FormTypes";
import userProfile from "../assets/icons/profile-default.svg";

const EditProfile = () => {
  const location = useLocation();
  const [profile, setProfile] = useState<EditProfileResponse | undefined>(
    location.state?.profile,
  );

  const { mutateAsync: picUpdate, isPending: picUpdateLoading } =
    useUpdateProfilePicture();
  const { mutateAsync: bannerUpdate, isPending: bannerUpdateLoading } =
    useUpdateBannerPicture();

  const { register, handleSubmit, errors, isPending, onSubmit } =
    useEditProfileForm({ profile });

  const [isOpenPopUp, setIsOpenPopUp] = useState(false);
  const [isProfilePicOpen, setIsProfilePicOpen] = useState(false);
  const [isProfileBannerOpen, setIsProfileBannerOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handlePictureUploaded = (updatedUser: EditProfileResponse) => {
    setProfile((prev) => ({ ...prev, ...updatedUser }) as EditProfileResponse);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <WarningPopUp
        isOpenPopUp={isOpenPopUp}
        setIsOpenPopUp={setIsOpenPopUp}
        title={"Do you want to Delete your profile?"}
        description={"if you proceed yor profile will be lost!!"}
      />
      <ProfilePictureEdit
        isOpen={isProfilePicOpen}
        setIsOpen={setIsProfilePicOpen}
        picUpdateObj={{ picUpdate, picUpdateLoading }}
        onUploadSuccess={handlePictureUploaded}
      />
      <EditBanner
        isOpen={isProfileBannerOpen}
        bannerUpdateObj={{ bannerUpdate, bannerUpdateLoading }}
        username={profile.username}
        email={profile.email}
        bio={profile.bio || ""}
        bannerPic={profile.profile_banner}
        onClose={() => setIsProfileBannerOpen(false)}
        onUploadSuccess={handlePictureUploaded}
      />
      <ChangePasswordPopUp
        isOpen={isChangePasswordOpen}
        setIsOpen={setIsChangePasswordOpen}
      />

      <div className="max-w-full mx-auto mt-10">
        <div className="absolute ml-40 mt-5 hover:scale-105 transition-all duration-200 ease-in-out">
          <BackToPrev url="/profile" />
        </div>
        <div className="flex flex-col mt-6">
          <img
            src={profile.profile_picture || userProfile}
            alt="user-profile"
            className="size-33 mx-auto rounded-full"
          />
          <p className="mx-auto text-4xl font-bold mt-6">Edit profile</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-[48%] shadow-[0_0px_30px_rgba(0,0,0,0.4)] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[0.65] mx-auto mt-10 rounded-3xl px-12 py-10 gap-4"
      >
        <div className="flex items-center gap-6">
          <div className="w-[50%]">
            <FirstNameInput
              register={register}
              error={errors.firstName}
              isEditProfile={true}
            />
          </div>
          <div className="w-[50%]">
            <LastNameInput
              register={register}
              error={errors.lastName}
              isEditProfile={true}
            />
          </div>
        </div>

        <div className="w-full">
          <UsernameInput
            register={register}
            error={errors.username}
            isEditProfile={true}
          />
        </div>

        <div className="w-full">
          <EmailInput
            register={register}
            error={errors.email}
            isEditProfile={true}
          />
        </div>

        <div className="flex justify-between items-center my-3">
          <div
            className="w-[50%]"
            onClick={() => setIsChangePasswordOpen(true)}
          >
            <button className="px-6 py-3 w-full border rounded-xl cursor-pointer hover:scale-95 hover:-rotate-1 transition-all duration-200 ease-in-out">
              Change Password
            </button>
          </div>
          <div className="flex h-fit gap-6">
            <button
              type="button"
              className="px-3.5 py-3 border rounded-xl cursor-pointer hover:bg-white hover:text-black hover:border-black hover:scale-105 transition-all duration-200 ease-in-out"
              onClick={() => setIsProfileBannerOpen(true)}
            >
              Profile Banner
            </button>
            <button
              type="button"
              className="px-3.5 py-3 border rounded-xl cursor-pointer border-white hover:bg-black hover:border-black hover:scale-105 transition-all duration-200 ease-in-out"
              onClick={() => setIsProfilePicOpen(true)}
            >
              Profile Picture
            </button>
          </div>
        </div>

        <BiographyInput
          register={register}
          isEditProfile={true}
          error={errors.bio}
          validation={{
            maxLength: {
              value: 250,
              message: "Bio must not exceed 250 characters",
            },
          }}
        />
        <PrivateCheckbox register={register} isEditProfile={true} />

        <div className="flex items-center gap-6">
          <div className="w-full flex-row mt-4">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setIsOpenPopUp((prev) => !prev)}
                className="px-6 text-sm rounded-xl bg-[#FF4949] text-black font-semibold hover:bg-red-500 cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out"
              >
                Delete Profile
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-8 py-3 text-sm border bg-white text-black font-semibold rounded-xl hover:bg-[#ccc] cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out disabled:cursor-not-allowed"
              >
                {isPending ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default EditProfile;
