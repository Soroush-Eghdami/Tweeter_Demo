import { flipImage } from "../../utils/flipImage";
import mirror from "../../assets/icons/profile/mirror.svg";

interface MirrorButtonPropsType {
  pic: string | null;
  setPic: (arg0: string) => void;
}

const MirrorButton = ({ pic, setPic }: MirrorButtonPropsType) => {
  return (
    <div
      className="flex items-center gap-1.5 border-2 border-white rounded-xl font-semibold text-white py-2.5 px-10 cursor-pointer hover:scale-90 transition-all duration-200 ease-in-out"
      onClick={async () => {
        if (pic) {
          const flippedUrl = await flipImage(pic);
          // Revoke old URL to avoid memory leaks
          URL.revokeObjectURL(pic);
          setPic(flippedUrl);
        }
      }}
    >
      <img src={mirror} alt="Mirror" className="size-5 mt-0.5" />
      <button className="text-lg cursor-pointer">Mirror</button>
    </div>
  );
};

export default MirrorButton;
