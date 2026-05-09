import Yes from "../assets/icons/yes-check.svg";
import Loading from "./loading/Loading";

interface WarningPopUpPropType {
  setIsOpenPopUp?: (arg0: boolean) => void;
  isLoading?: boolean;
  size?: string;
  padding?: string;
}

const YesButton = ({
  setIsOpenPopUp,
  isLoading,
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
        className={`${padding} flex items-center justify-center bg-white rounded-[50%] cursor-pointer transition-all hover:scale-105 duration-200 ease-in-out`}
      >
        {isLoading ? (
          <Loading width="w-6.25" height="h-6.25" />
        ) : (
          <img src={Yes} alt="yes-button" className={size} />
        )}
      </button>
    </>
  );
};

export default YesButton;
