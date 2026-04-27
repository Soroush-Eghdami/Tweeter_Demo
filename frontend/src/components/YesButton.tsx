import Yes from "../assets/icons/yes-check.svg";

interface WarningPopUpPropType {
  setIsOpenPopUp: (arg0: boolean) => void;
  size?: string;
  padding?: string;
}

const YesButton = ({
  setIsOpenPopUp,
  size = "size-9",
  padding = "p-4.5",
}: WarningPopUpPropType) => {
  return (
    <>
      <button
        onClick={() => setIsOpenPopUp(false)}
        className={`${padding} flex items-center justify-center bg-white rounded-[50%] cursor-pointer transition-all hover:scale-105 duration-200 ease-in-out`}
      >
        <img src={Yes} alt="yes-button" className={size} />
      </button>
    </>
  );
};

export default YesButton;
