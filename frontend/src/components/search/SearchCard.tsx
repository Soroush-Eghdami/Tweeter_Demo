import { useNavigate } from "react-router-dom";
import type { SelectObjType } from "../../types/SearchType";
import defaultPic from "../../assets/icons/profile-default.svg";

interface SearchCardPropsType {
  userId: string;
  username: string;
  profilePic: string;
  selectObj: SelectObjType;
}

const SearchCard = ({
  userId,
  username,
  profilePic,
  selectObj,
}: SearchCardPropsType) => {
  const navigation = useNavigate();

  const { inputRef, reset, setDebouncedTerm, setIsOpen } = selectObj;

  const handleNavigating = () => {
    setIsOpen(false);
    setDebouncedTerm("");
    reset();
    inputRef.current?.blur();
    navigation(`/profile/${userId}`);
  };

  return (
    <div
      className="flex flex-col w-full px-7 pt-1.25 cursor-pointer hover:scale-97 transition-all duration-150 ease-in-out"
      onClick={handleNavigating}
    >
      <div className="flex items-center gap-4 w-full px-3 py-5">
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile-Picture"
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <img src={defaultPic} alt="Profile-Default" className="size-16" />
        )}
        <h4 className="text-2xl font-medium text-white">{username}</h4>
      </div>
    </div>
  );
};

export default SearchCard;
