import { joinedDate } from "../../utils/joinedDate";
import type { ProfileType } from "../../types/ProfileType";

interface LeftBoxProps {
  isPublic: boolean;
  isMyProfile: boolean;
  profile: ProfileType;
  editUserIcon: string;
  usernameIcon: string;
  emailIcon: string;
  calendarIcon: string;
  bioIcon: string;
  followerFollowingIcon: string;
  tweetIcon: string;
  retweetIcon: string;
  onEditProfile: () => void;
}

const LeftBox: React.FC<LeftBoxProps> = ({
  isPublic,
  isMyProfile,
  profile,
  editUserIcon,
  usernameIcon,
  emailIcon,
  calendarIcon,
  bioIcon,
  followerFollowingIcon,
  tweetIcon,
  retweetIcon,
  onEditProfile,
}) => {
  return (
    <div className="bg-white/10 backdrop-filter-md h-fit flex-1 backdrop-filter backdrop-blur-[35px] backdrop-brightness-[0.6] rounded-2xl shadow-xl border-2 border-white p-7 space-y-4">
      {/* User Info */}
      <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
        <img src={editUserIcon} alt="User" className="w-6 h-6" />
        <span className="text-white">
          {profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : "----"}
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-800">
        <img src={usernameIcon} alt="Username" className="w-5 h-5" />
        <span className="text-white">{profile.username}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-800">
        <img src={emailIcon} alt="Email" className="w-5 h-5" />
        <span className="text-white">{isPublic ? profile.email : "----"}</span>
      </div>

      <div className="flex items-center gap-2 text-gray-800">
        <img src={calendarIcon} alt="Calendar" className="w-5 h-5" />
        <span className="text-white">
          {isPublic ? joinedDate(profile.date_joined) : "----"}
        </span>
      </div>

      <div className="flex items-start gap-2 text-gray-800">
        <img src={bioIcon} alt="Bio" className="w-5 h-5" />
        <p className="text-white">{profile.bio ? profile.bio : "----"}</p>
      </div>

      {/* Followers, Following, Tweet, Retweet Info */}
      <div className="flex-1 min-w-35 bg-white/15 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] rounded-xl p-3 border border-white/40">
        <div className="flex justify-around">
          <div className="flex items-center gap-2">
            <img
              src={followerFollowingIcon}
              alt="User"
              className="w-8 h-8 hover:scale-115 duration-300"
            />
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg text-white">
                {isPublic ? profile.followers_count : "-"}
              </span>
              <span className="text-xs text-white">Followers</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <img
              src={followerFollowingIcon}
              alt="user"
              className="w-8 h-8 hover:scale-115 duration-300"
            />
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg text-white">
                {isPublic ? profile.following_count : "-"}
              </span>
              <span className="text-xs text-white">Following</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-35 bg-white/15 rounded-xl p-3 mb-2 border border-white/40 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5]">
        <div className="flex justify-around">
          <div className="mr-4 flex items-center gap-1">
            <img
              src={tweetIcon}
              alt="tweet"
              className="mr-4.5 w-7 h-7 hover:scale-115 duration-300"
            />
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg text-white">
                {isPublic ? profile.tweets_count : "-"}
              </span>
              <span className="text-xs text-white">Tweet</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mr-1">
            <img
              src={retweetIcon}
              alt="retweet"
              className="w-6 h-6 hover:scale-115 duration-300"
            />
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg text-white">
                {isPublic ? profile.retweets_made : "-"}
              </span>
              <span className="text-xs text-white">Retweet</span>
            </div>
          </div>
        </div>
      </div>

      {isMyProfile && (
        <button
          onClick={onEditProfile}
          className="flex items-center justify-center rounded-2xl cursor-pointer w-full gap-2 mt-5 px-4 py-2 text-white hover:bg-white/40 hover:text-[#222] transition-colors duration-300 bg-white/10 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5]"
        >
          Edit Profile
        </button>
      )}
    </div>
  );
};

export default LeftBox;
