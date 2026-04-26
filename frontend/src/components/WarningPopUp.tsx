import YesButton from "./YesButton";
import NoButton from "./NoButton";

interface WarningPopUpPropType {
  setIsOpenPopUp: (arg0: boolean) => void;
  title: string;
  description?: string;
}

const WarningPopUp = ({
  setIsOpenPopUp,
  title,
  description,
}: WarningPopUpPropType) => {
  return (
    <>
      <div className="fixed z-40 w-dvw min-h-screen  bg-[rgba(33,33,33,0.7)] top-0 right-0 pt-56">
        <div className="z-50 max-w-[30%] mx-auto bg-black/50 shadow-[0_0px_30px_rgba(0,0,0,0.4)] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] rounded-2xl pt-8 pb-10 px-4">
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
