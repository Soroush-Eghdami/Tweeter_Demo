import cross from "../../assets/icons/no-cross.svg";

interface ExitButtonPropsType{
    setIsUserListOpen: (arg0: boolean) => void;
}
const ExitButton = ({setIsUserListOpen} :ExitButtonPropsType) => {
  return (
    <button className="flex items-center justify-center rounded-[50%] p-4.5 cursor-pointer transition-all hover:scale-105 duration-200 ease-in-out" onClick={() =>setIsUserListOpen(false) }>
      <img src={cross} alt="no-button" className="size-12" />
    </button>
  );
};

export default ExitButton;
