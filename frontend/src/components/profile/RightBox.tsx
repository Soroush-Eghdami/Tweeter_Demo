interface RightBoxProps {
  setIsTweetsOpen: (arg0: boolean) => void;
  isTweetsOpen: boolean;
  tweetIcon: string;
  tweetBlueIcon: string;
  retweetIcon: string;
  retweetGreenIcon: string;
  userIcon: string;
  onUserIconClick: () => void;
  children: React.ReactNode;
}

const RightBox: React.FC<RightBoxProps> = ({
  setIsTweetsOpen,
  isTweetsOpen,
  tweetIcon,
  tweetBlueIcon,
  retweetIcon,
  retweetGreenIcon,
  userIcon,
  onUserIconClick,
  children,
}) => {
  

  return (
    <div className="min-h-150 flex-4 md:col-span-2 backdrop-filter-blur-[35px] backdrop-brightness-[1] rounded-2xl border-white border-2">
      <div className="px-6 pt-6 flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-7">
          {isTweetsOpen ? (
            <img
              src={tweetBlueIcon}
              alt="tweet"
              className="ml-4 w-10 h-10 hover:scale-115 duration-300"
              onClick={() => setIsTweetsOpen(true)}
            />
          ) : (
            <img
              src={tweetIcon}
              alt="tweet"
              className="ml-4 w-10 h-10 hover:scale-115 duration-300"
              onClick={() => setIsTweetsOpen(true)}
            />
          )}
          {isTweetsOpen ? (
            <img
              src={retweetIcon}
              alt="retweet"
              className="w-9 h-9 hover:scale-115 duration-300"
              onClick={() => setIsTweetsOpen(false)}
            />
          ) : (
            <img
              src={retweetGreenIcon}
              alt="retweet"
              className="w-9 h-9 hover:scale-115 duration-300"
              onClick={() => setIsTweetsOpen(false)}
            />
          )}
        </div>
        <div className="hover:scale-115 duration-300" onClick={onUserIconClick}>
          <img src={userIcon} alt="profile" className="mr-4 w-8.5 h-8.5" />
        </div>
      </div>
      <div className="border-t border-white mx-0 mt-3"></div>

      <div className="overflow-hidden rounded-b-xl">
        <div
          className="px-6 pb-2 space-y-5 max-h-150 overflow-y-auto 
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-white/10
            [&::-webkit-scrollbar-thumb]:bg-white/30
            [&::-webkit-scrollbar-thumb]:rounded-t-none
            [&::-webkit-scrollbar-thumb]:hover:bg-white/50"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default RightBox;