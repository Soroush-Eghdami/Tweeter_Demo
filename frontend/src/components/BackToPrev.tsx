import { useNavigate } from "react-router-dom";
import leftArrow from "../assets/icons/left-arrow.svg";

interface BackToPrevPropsType {
  url: string;
}

const BackToPrev = ({ url }: BackToPrevPropsType) => {
  const navigation = useNavigate();

  return (
    <div className="cursor-pointer" onClick={() => navigation(url)}>
      <img src={leftArrow} alt="left-arrow" className="size-26" />
    </div>
  );
};

export default BackToPrev;
