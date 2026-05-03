import YesButton from "./YesButton";
import NoButton from "./NoButton";

interface WarningPopUpPropType {
  isOpenPopUp: boolean;
  setIsOpenPopUp: (arg0: boolean) => void;
  title: string;
  description?: string;
}

const WarningPopUp = ({
  isOpenPopUp,
  setIsOpenPopUp,
  title,
  description,
}: WarningPopUpPropType) => {
  return (
    <>
      <div
        className={`${isOpenPopUp ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} fixed z-40 w-dvw min-h-screen top-0 right-0 pt-56 backdrop-blur-md bg-black/70 transition-opacity duration-200`}
      >
        <div className="z-50 max-w-[30%] mx-auto pt-8 pb-10 px-4 bg-[#1c1c1c] shadow-[0_0px_30px_rgba(0,0,0,0.4)] rounded-2xl">
          <div>
            <p className="text-white text-2xl text-center font-semibold">
              {title}
            </p>
            <p className="text-[#bbb] text-xl text-center font-semibold mt-3 mb-1">
              {description}
            </p>
          </div>
          <div className="flex justify-around mt-8">
            <YesButton setIsOpenPopUp={setIsOpenPopUp} />
            <NoButton setIsOpenPopUp={setIsOpenPopUp} />
          </div>
        </div>
      </div>
    </>
  );
};

export default WarningPopUp;
