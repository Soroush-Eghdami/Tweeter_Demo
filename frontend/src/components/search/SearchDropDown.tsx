import { forwardRef } from "react";
import { createPortal } from "react-dom";
import SearchCard from "./SearchCard";
import Loading from "../loading/Loading";
import type { SearchDataType, SelectObjType } from "../../types/SearchType";

interface SearchDropDownPropsType {
  isOpen: boolean;
  selectObj: SelectObjType;
  isLoading: boolean;
  dropdownPosition: {
    top: number;
    left: number;
    width: number;
  };
  data: SearchDataType[];
}

const SearchDropDown = forwardRef<HTMLDivElement, SearchDropDownPropsType>(
  ({ isOpen, selectObj, dropdownPosition, isLoading, data }, ref) => {
    if (!isOpen) return null;

    return createPortal(
      <div
        ref={ref} // ← attach forwarded ref here
        className={`${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} 
          fixed z-50 rounded-2xl overflow-y-auto backdrop-blur-md bg-[#1c1c1c]/70 
          transition-opacity duration-200 ease-in-out 
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-white/10
          [&::-webkit-scrollbar-track]:mt-1.5
          [&::-webkit-scrollbar-track]:mb-2.5
          [&::-webkit-scrollbar-track]:rounded-tr-xl
          [&::-webkit-scrollbar-track]:rounded-br-xl
          [&::-webkit-scrollbar-thumb]:bg-white/30
          [&::-webkit-scrollbar-thumb]:rounded-tr-xl
          [&::-webkit-scrollbar-thumb]:rounded-br-xl
          [&::-webkit-scrollbar-thumb]:hover:bg-white/50
          `}
        style={{
          top: dropdownPosition.top + 16,
          left: dropdownPosition.left - 52,
          width: dropdownPosition.width + 52,
          height: "330px",
        }}
      >
        {isLoading ? (
          <div className="pt-35">
            <Loading width="w-11" height="h-11" />
          </div>
        ) : (
          <>
            {data?.length === 0 ? (
              <p className="text-center text-lg font-medium text-[#666] pt-37">
                User Not Found!
              </p>
            ) : (
              data?.map((user) => (
                <SearchCard
                  key={user.id}
                  userId={user.id}
                  username={user.username}
                  profilePic={user.profile_picture}
                  selectObj={selectObj}
                />
              ))
            )}
          </>
        )}
      </div>,
      document.body,
    );
  },
);

export default SearchDropDown;
