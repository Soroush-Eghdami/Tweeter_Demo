import Yes from "../assets/icons/yes-check.svg";
import Loading from "./loading/Loading";

interface WarningPopUpPropType {
  setIsOpenPopUp?: (arg0: boolean) => void;
  isLoading?: boolean;
  loadingWidth?: string;
  loadingHeight?: string;
  size?: string;
  padding?: string;
}

const YesButton = ({
  setIsOpenPopUp,
  isLoading,
  loadingWidth = "w-6.25",
  loadingHeight = "h-6.25",
  size = "size-9",
  padding = "p-4.5",
}: WarningPopUpPropType) => {
  const handleClick = () => {
    if (setIsOpenPopUp) setIsOpenPopUp(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`${padding} flex items-center justify-center bg-white rounded-[50%] cursor-pointer transition-all hover:scale-105 disabled:cursor-not-allowed disabled:bg-[#999] duration-200 ease-in-out`}
      >
        {isLoading ? (
          <Loading width={loadingWidth} height={loadingHeight} />
        ) : (
          <img src={Yes} alt="yes-button" className={size} />
        )}
      </button>
    </>
  );
};

export default YesButton;
