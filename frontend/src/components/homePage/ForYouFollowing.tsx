interface ForYouFollowingPropsType {
  isSelected: 1 | 2;
  setIsSelected: (arg0: 1 | 2) => void;
}

const ForYouFollowing = ({
  isSelected,
  setIsSelected,
}: ForYouFollowingPropsType) => {
  return (
    <div className="relative">
      <div className="flex justify-around items-center gap-8 mb-16">
        {/* For You */}
        <div
          className="text-[#ddd] font-bold text-xl text-center w-[40%] cursor-pointer hover:scale-107 transition-all duration-250 ease-in-out"
          onClick={() => setIsSelected(1)}
        >
          For You
        </div>
        {/* Followings */}
        <div
          className="text-[#ddd] font-bold text-xl text-center w-[40%] cursor-pointer hover:scale-107 transition-all duration-250 ease-in-out"
          onClick={() => setIsSelected(2)}
        >
          Followings
        </div>
      </div>
      <div
        className={`${isSelected === 1 ? "left-[7%]" : "left-[58.25%]"} absolute -bottom-2.5 h-0.5 w-[35%] bg-[#ddd] cursor-pointer transition-all duration-500 ease-in-out`}
      ></div>
    </div>
  );
};

export default ForYouFollowing;
