import rotate from "../../assets/icons/profile/rotate.svg";

interface RotateButtonPropsType {
  pic: string | null;
  setRotation: (value: number | ((prev: number) => number)) => void;
}

const RotateButton = ({ pic, setRotation }: RotateButtonPropsType) => {
  return (
    <div
      className="flex items-center gap-1.5 border-2 border-white rounded-xl text-white font-semibold py-2.75 px-10 cursor-pointer hover:scale-90 transition-all duration-200 ease-in-out"
      onClick={() => {
        if (pic) setRotation((prev) => (prev + 90) % 360);
      }}
    >
      <img src={rotate} alt="Rotation" className="size-4.5 mt-0.5" />
      <button className="text-lg cursor-pointer">Rotate</button>
    </div>
  );
};

export default RotateButton;
