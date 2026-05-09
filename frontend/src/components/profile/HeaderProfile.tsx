import { useParams } from "react-router-dom";
import Loading from "../loading/Loading";
import type { followObjType, unfollowObjType } from "../../types/FollowTypes";

interface HeaderProfileProps {
  isMyProfile: boolean;
  avatarSrc: string;
  bannerSrc: string;
  editIconSrc: string;
  isFollowed?: boolean;
  followObj?: followObjType;
  unfollowObj?: unfollowObjType;
  onAvatarClick: () => void;
  onBannerClick: () => void;
}

const HeaderProfile: React.FC<HeaderProfileProps> = ({
  isMyProfile,
  avatarSrc,
  bannerSrc,
  editIconSrc,
  isFollowed,
  followObj,
  unfollowObj,
  onAvatarClick,
  onBannerClick,
}) => {
  const { id } = useParams();

  const followHandler = () => {
    if (id)
      followObj?.follow({
        followee_id: id,
      });
  };

  const unfollowHandler = () => {
    unfollowObj?.unfollow();
  };

  return (
    <>
      {/* Banner */}
      <div
        className="relative h-36 w-full overflow-hidden group cursor-pointer"
        onClick={onBannerClick}
      >
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt="Profile-Banner"
            className="flex items-center justify-center h-full w-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full group-hover:bg-[#333] transition-colors duration-400"></div>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
          <img src={editIconSrc} alt="Edit" className="w-25 h-25" />
        </div>
      </div>

      <div className="relative mb-20">
        <div className="relative border-t-2 border-white">
          <div className="absolute -top-13 w-full">
            <div className="relative flex justify-between items-center">
              <div
                className="absolute -top-6 group ml-39 bg-black rounded-[50%] cursor-pointer"
                onClick={onAvatarClick}
              >
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="size-35 rounded-full border-2 border-white shadow-md transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <img src={editIconSrc} alt="Edit" className="w-20 h-20" />
                </div>
              </div>

              <div className="absolute top-3.5 right-20">
                {!isMyProfile &&
                  (isFollowed ? (
                    <button
                      className="w-50 h-19 text-3xl font-semibold rounded-[9999px] bg-black text-white border-2 border-white hover:bg-[#333] transition-colors cursor-pointer duration-300 text-center"
                      onClick={unfollowHandler}
                    >
                      {unfollowObj?.unfollowLoading ? (
                        <Loading width="w-10" height="h-10" />
                      ) : (
                        "Unfollow"
                      )}
                    </button>
                  ) : (
                    <button
                      className="w-50 h-19 text-3xl font-semibold rounded-[9999px] bg-white text-black hover:bg-[#ccc] transition-colors cursor-pointer duration-300 text-center"
                      onClick={followHandler}
                    >
                      {followObj?.followLoading ? (
                        <Loading width="w-10" height="h-10" />
                      ) : (
                        "Follow"
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderProfile;
