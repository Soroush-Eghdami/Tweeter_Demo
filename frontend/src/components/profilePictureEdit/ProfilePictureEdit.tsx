import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImage } from "../../utils/imageCropper";
import NoButton from "../NoButton";
import YesButton from "../YesButton";
import MirrorButton from "./MirrorButton";
import RotateButton from "./RotateButton";
import type { picUpdateObjType } from "../../types/UpdateProfileTypes";
import folder from "../../assets/icons/profile/folder.svg";

interface ProfilePictureEditPropsType {
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
  picUpdateObj?: picUpdateObjType;
}

const ProfilePictureEdit = ({
  isOpen,
  setIsOpen,
  picUpdateObj,
}: ProfilePictureEditPropsType) => {
  const [pic, setPic] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!fileInput.current) return;

    fileInput.current.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPic(URL.createObjectURL(file));
    }
  };

  const onCropComplete = useCallback(
    (_unknown: unknown, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const resetStates = () => {
    setPic(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const handleSave = async () => {
    if (!pic || !croppedAreaPixels) {
      console.warn("No image or crop area selected");
      return;
    }

    try {
      const finalImageFile = await getCroppedImage(
        pic,
        croppedAreaPixels,
        rotation,
        false,
      );

      if (finalImageFile) {
        const formData = new FormData();
        formData.append("profile_picture", finalImageFile);
        if (picUpdateObj) await picUpdateObj.picUpdate(formData);
        setIsOpen(false);
        setTimeout(() => resetStates(), 500);
      }
    } catch (error) {
      console.log("Upload Failed:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (pic) URL.revokeObjectURL(pic);
    };
  }, [pic]);

  return (
    <>
      <div
        className={`${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} fixed top-0 right-0 z-40 w-dvw min-h-screen bg-black/70 backdrop-blur-sm pt-22 transition-opacity duration-200`}
      >
        <div className="flex justify-between gap-16 z-50 max-w-[60%] mx-auto pt-16 pb-10 px-20 rounded-2xl bg-[#1c1c1c]/90 shadow-[0_0px_30px_rgba(0,0,0,0.4)]">
          <div className="relative w-125 h-110 rounded-2xl overflow-hidden">
            {pic ? (
              <Cropper
                image={pic}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                onRotationChange={setRotation}
              />
            ) : (
              <div className="w-full h-full bg-[#999]"></div>
            )}
          </div>
          <div className="flex flex-col items-center gap-20">
            <div>
              <div
                className="flex items-center gap-1.5 border-2 border-white rounded-2xl text-center text-white font-semibold py-12 px-7 cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out"
                onClick={handleClick}
              >
                <img src={folder} alt="Choose-File" className="size-5 mt-0.5" />
                <div className="text-lg cursor-pointer">Choose File</div>
              </div>
              <input
                type="file"
                name="file"
                id="file"
                ref={fileInput}
                onChange={handleFile}
                className="hidden"
              />
            </div>
            <div className="flex flex-col items-center gap-5 w-fit">
              <RotateButton pic={pic} setRotation={setRotation} />
              <MirrorButton pic={pic} setPic={setPic} />
            </div>
            <div className="flex gap-3">
              <NoButton
                setIsOpenPopUp={setIsOpen}
                resetState={resetStates}
                size="size-7"
                padding="p-4"
              />
              <div onClick={handleSave}>
                <YesButton
                  isLoading={picUpdateObj?.picUpdateLoading}
                  loadingWidth="w-7"
                  loadingHeight="h-7"
                  size="size-7"
                  padding="p-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePictureEdit;
