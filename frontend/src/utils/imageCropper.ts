// utils/imageCropper.ts

export interface CroppedAreaPixels {
  width: number;
  height: number;
  x: number;
  y: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

export const getCroppedImage = async (
  imageSrc: string,
  croppedAreaPixels: CroppedAreaPixels,
  rotation: number,
  isFlipped: boolean,
): Promise<File | null> => {
  if (!imageSrc || !croppedAreaPixels) return null;

  const image = await createImage(imageSrc);

  // 1. Create canvas with rotated+flipped full image
  const rotRad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rotRad));
  const cos = Math.abs(Math.cos(rotRad));
  const boundWidth = image.width * cos + image.height * sin;
  const boundHeight = image.width * sin + image.height * cos;

  const rotCanvas = document.createElement("canvas");
  const rotCtx = rotCanvas.getContext("2d")!;
  rotCanvas.width = boundWidth;
  rotCanvas.height = boundHeight;

  rotCtx.translate(boundWidth / 2, boundHeight / 2);
  rotCtx.rotate(rotRad);
  rotCtx.scale(isFlipped ? -1 : 1, 1); // mirror horizontally
  rotCtx.drawImage(image, -image.width / 2, -image.height / 2);

  // 2. Adjust crop X coordinate if mirrored
  let cropX = croppedAreaPixels.x;
  let cropY = croppedAreaPixels.y;
  if (isFlipped) {
    // Mirror the X coordinate on the rotated canvas
    cropX = rotCanvas.width - croppedAreaPixels.x - croppedAreaPixels.width;
  }

  // 3. Create final cropped canvas
  const cropCanvas = document.createElement("canvas");
  const cropCtx = cropCanvas.getContext("2d")!;
  cropCanvas.width = croppedAreaPixels.width;
  cropCanvas.height = croppedAreaPixels.height;

  cropCtx.drawImage(
    rotCanvas,
    cropX,
    cropY,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  // 4. Convert to File
  return new Promise((resolve) => {
    cropCanvas.toBlob(
      (blob) => {
        if (!blob) resolve(null);
        else {
          resolve(
            new File([blob], "profile-picture.jpg", { type: "image/jpeg" }),
          );
        }
      },
      "image/jpeg",
      0.95,
    );
  });
};
