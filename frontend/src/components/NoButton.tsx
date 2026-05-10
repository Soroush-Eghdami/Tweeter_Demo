import No from "../assets/icons/no-cross.svg";

interface WarningPopUpPropType {
  setIsOpenPopUp: (arg0: boolean) => void;
  resetState?: () => void;
  size?: string;
  padding?: string;
}

const NoButton = ({
  setIsOpenPopUp,
  resetState,
  size = "size-9",
  padding = "p-4.5",
}: WarningPopUpPropType) => {
  const handleClick = () => {
    setIsOpenPopUp(false);
    setTimeout(() => {
      if (resetState) resetState();
    }, 500);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`${padding} flex items-center justify-center bg-black rounded-[50%] cursor-pointer transition-all hover:scale-105 duration-200 ease-in-out`}
      >
        <img src={No} alt="no-button" className={size} />
      </button>
    </>
  );
};

export default NoButton;
