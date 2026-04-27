import No from "../assets/icons/no-cross.svg";

interface WarningPopUpPropType {
  setIsOpenPopUp: (arg0: boolean) => void;
  size?: string;
  padding?: string;
}

const NoButton = ({
  setIsOpenPopUp,
  size = "size-9",
  padding = "p-4.5",
}: WarningPopUpPropType) => {
  return (
    <>
      <button
        onClick={() => setIsOpenPopUp(false)}
        className={`${padding} flex items-center justify-center bg-black rounded-[50%] cursor-pointer transition-all hover:scale-105 duration-200 ease-in-out`}
      >
        <img src={No} alt="no-button" className={size} />
      </button>
    </>
  );
};

export default NoButton;
