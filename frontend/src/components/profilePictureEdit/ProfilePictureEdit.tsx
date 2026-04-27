import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import NoButton from "../NoButton";
import YesButton from "../YesButton";
import { getCroppedImage } from "../../utils/imageCropper";

interface ProfilePictureEditPropsType {
  setIsOpen: (arg0: boolean) => void;
}

const ProfilePictureEdit = ({ setIsOpen }: ProfilePictureEditPropsType) => {
  const [pic, setPic] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInput = useRef(null);

  const handleClick = () => {
    fileInput.current.click();
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPic(URL.createObjectURL(file));
    }
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const flipImage = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.translate(img.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(URL.createObjectURL(blob));
          else reject("Failed to create flipped image");
        }, "image/jpeg");
      };
      img.onerror = reject;
      img.src = src;
    });
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
        const previewUrl = URL.createObjectURL(finalImageFile);
        window.open(previewUrl, "_blank");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    return () => {
      if (pic) URL.revokeObjectURL(pic);
    };
  }, [pic]);

  return (
    <>
      <div className="fixed z-40 w-dvw min-h-screen bg-[rgba(33,33,33,0.7)] top-0 right-0 pt-30">
        <div className="flex justify-between gap-16 z-50 max-w-[60%] mx-auto bg-black/50 shadow-[0_0px_30px_rgba(0,0,0,0.4)] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] rounded-2xl py-10 px-20">
          <div className={`relative w-125 h-110 rounded-2xl overflow-hidden`}>
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
              <div className="bg-[#999] w-full h-full"></div>
            )}
          </div>
          <div className="flex flex-col items-center gap-20">
            <div>
              <div
                className="border-2 border-white rounded-2xl w-36 text-center text-white font-semibold py-10 px-7 cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out"
                onClick={handleClick}
              >
                Choose File
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
              <button
                className="border-2 border-white rounded-xl text-white font-semibold py-2.5 px-10 cursor-pointer hover:scale-90 transition-all duration-200 ease-in-out"
                onClick={() => {
                  if (pic) setRotation((prev) => (prev + 90) % 360);
                }}
              >
                Rotate
              </button>
              <button
                className="border-2 border-white rounded-xl text-white font-semibold py-2.5 px-10 cursor-pointer hover:scale-90 transition-all duration-200 ease-in-out"
                onClick={async () => {
                  if (pic) {
                    const flippedUrl = await flipImage(pic);
                    // Revoke old URL to avoid memory leaks
                    URL.revokeObjectURL(pic);
                    setPic(flippedUrl);
                  }
                }}
              >
                Mirror
              </button>
            </div>
            <div className="flex gap-3">
              <NoButton
                setIsOpenPopUp={setIsOpen}
                size="size-7"
                padding="p-4"
              />
              <div onClick={handleSave}>
                <YesButton
                  setIsOpenPopUp={setIsOpen}
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
