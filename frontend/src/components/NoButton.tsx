import No from "../assets/icons/no-cross.svg";

interface WarningPopUpPropType {
  setIsOpenPopUp: (arg0: boolean) => void;  
}

const NoButton = ({setIsOpenPopUp} : WarningPopUpPropType) => {
  return (
    <>
      <button onClick={() => setIsOpenPopUp(false)} className="flex items-center justify-center bg-black rounded-[50%] p-4.5 cursor-pointer transition-all hover:scale-105 duration-200 ease-in-out">
        <img src={No} alt="no-button" className="size-9" />
      </button>
    </>
  );
};

export default NoButton;