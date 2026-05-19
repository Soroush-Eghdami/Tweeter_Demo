import Loading from "./loading/Loading";
import Yes from "../assets/icons/yes-check.svg";

interface YesButtonPropType {
  setIsOpenPopUp?: (arg0: boolean) => void;
  isLoading?: boolean;
  loadingWidth?: string;
  loadingHeight?: string;
  size?: string;
  padding?: string;
  onClick?: () => void;
  closeOnClick?: boolean;   // new prop – defaults to true
  type?: "button" | "submit";
  disabled?: boolean;
}

const YesButton = ({
  setIsOpenPopUp,
  isLoading,
  loadingWidth = "w-6.25",
  loadingHeight = "h-6.25",
  size = "size-9",
  padding = "p-4.5",
  onClick,
  closeOnClick = true,   // default behavior unchanged
}: YesButtonPropType) => {
  const handleClick = () => {
    if (isLoading) return;
    onClick?.();
    // Only close the popup if closeOnClick is true
    if (closeOnClick && setIsOpenPopUp) {
      setIsOpenPopUp(false);
    }
  };

  return (
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
  );
};

export default YesButton;
