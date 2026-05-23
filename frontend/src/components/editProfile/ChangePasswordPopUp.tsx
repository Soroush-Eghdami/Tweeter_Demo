import { useEffect, useState } from "react";
import YesButton from "../YesButton";
import NoButton from "../NoButton";
import OldPasswordInput from "../../components/editProfile/OldPasswordInput";
import { useChangePasswordForm } from "../../hooks/useChangePasswordForm";
import Loading from "../loading/Loading";
import NewPasswordInputs from "./NewPasswordInputs";
interface ChangePasswordPopUpPropType {
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
}

const ChangePasswordPopUp = ({
  isOpen,
  setIsOpen,
}: ChangePasswordPopUpPropType) => {
  const [isOpenEyeOld, setIsOpenEyeOld] = useState(true);
  const { register, handleSubmit, errors, onSubmit, isPending, reset } =
    useChangePasswordForm({
      setIsOpen,
    });

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <>
      <div
        className={`${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} fixed z-40 w-dvw min-h-screen top-0 right-0 pt-35 backdrop-blur-md bg-black/70 transition-opacity duration-200`}
      >
        <div className="z-50 max-w-[50%] mx-auto pt-10 pb-7 px-14 rounded-2xl bg-[#1c1c1c] shadow-[0_0px_30px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col gap-6">
            <OldPasswordInput
              register={register}
              error={errors.oldPassword?.message}
              isOpenEye={isOpenEyeOld}
              setIsOpenEye={setIsOpenEyeOld}
            />
            <NewPasswordInputs
              register={register}
              errors={errors}
              isOpen={isOpen}
            />
          </div>
          <div className="flex justify-end gap-4 mt-12">
            <NoButton setIsOpenPopUp={() => setIsOpen(false)} />
            <div className="relative">
              <div className={isPending ? "opacity-0" : ""}>
                <div onClick={handleSubmit(onSubmit)}>
                  <YesButton setIsOpenPopUp={() => {}} disabled={isPending} />
                </div>
              </div>
              {isPending && (
                <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center cursor-not-allowed">
                  <Loading width="w-8" height="h-8" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordPopUp;
