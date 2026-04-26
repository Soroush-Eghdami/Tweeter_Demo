import Yes from "../assets/icons/yes-check.svg";

interface WarningPopUpPropType {
  setIsOpenPopUp: (arg0: boolean) => void;  //soal daram
}

const YesButton = ({setIsOpenPopUp} : WarningPopUpPropType) => {
  return (
    <>
      <button onClick={() => setIsOpenPopUp(false)} className="flex items-center justify-center bg-white rounded-[50%] p-4.5 cursor-pointer transition-all hover:scale-105 duration-200 ease-in-out">
        <img src={Yes} alt="yes-button" className="size-9" />
      </button>
    </>
  );
};

export default YesButton;