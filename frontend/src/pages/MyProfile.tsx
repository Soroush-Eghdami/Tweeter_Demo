import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserTweet from "../components/profile/UserTweet";
import UserRetweet from "../components/profile/UserRetweet";
import EditBanner from "../components/profileBannerEdit/EditBanner";
import HeaderProfile from "../components/profile/HeaderProfile";
import RightBox from "../components/profile/RightBox";
import LeftBox from "../components/profile/LeftBox";
import FollowingFollower from "../components/followingFollowerPopUp/FollowingFollowerPopUp";
import ProfilePictureEdit from "../components/profilePictureEdit/ProfilePictureEdit";
import { useMyProfile } from "../hooks/useMyProfile";
import { useUpdateProfilePicture } from "../hooks/useUpdateProfile";
import { userTweetInfo } from "../contents/userTweetInfo";
import { userRetweetInfo } from "../contents/userRetweetInfo";
import { userInfo } from "../contents/userInfo";
import tweet from "../assets/icons/profile/tweet.svg";
import tweetBlue from "../assets/icons/profile/peace_pigeon.svg";
import avatar from "../assets/icons/profile-default.svg";
import edit from "../assets/icons/profile/edit-profile-pic.svg";
import user from "../assets/icons/user-profile.svg";
import email from "../assets/icons/profile/edit-email.svg";
import calender from "../assets/icons/profile/joined-date.svg";
import followerFollowing from "../assets/icons/profile/follower-following-counter.svg";
import bio from "../assets/icons/profile/bio.svg";
import retweet from "../assets/icons/profile/retweet.svg";
import retweetGreen from "../assets/icons/profile/repeat.svg";
import editUser from "../assets/icons/profile/edit-username.svg";
import LoadingPage from "../components/loading/LoadingPage";

const MyProfile = () => {
  const { data, isLoading } = useMyProfile();
  const { mutateAsync: picUpdate, isPending: picUpdateLoading } =
    useUpdateProfilePicture();
  const [isTweetsOpen, setIsTweetsOpen] = useState(true);
  const [isProfilePicOpen, setIsProfilePicOpen] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-fit w-full bg-custom-dark-gradient">
      {isLoading && <LoadingPage />}
      <div>
        <FollowingFollower
          setIsUserListOpen={setIsUserListOpen}
          isUserListOpen={isUserListOpen}
        />
      </div>
      <div>
        <ProfilePictureEdit
          isOpen={isProfilePicOpen}
          setIsOpen={setIsProfilePicOpen}
          picUpdateObj={{
            picUpdate,
            picUpdateLoading,
          }}
        />
      </div>

      <div className="w-full">
        <HeaderProfile
          isMyProfile={true}
          avatarSrc={data.profile_picture || avatar}
          bannerSrc={data.profile_banner}
          editIconSrc={edit}
          onAvatarClick={() => setIsProfilePicOpen((prev) => !prev)}
          onBannerClick={() => setIsBannerOpen(true)}
        />
      </div>

      <div className="flex gap-6 transition-none sm:px-6 lg:px-8 mt-32">
        <LeftBox
          isMyProfile={true}
          profile={data}
          editUserIcon={editUser}
          emailIcon={email}
          calendarIcon={calender}
          bioIcon={bio}
          followerFollowingIcon={followerFollowing}
          tweetIcon={tweet}
          retweetIcon={retweet}
          onEditProfile={() => navigate("/edit-profile")}
        />
        <RightBox
          setIsTweetsOpen={setIsTweetsOpen}
          isTweetsOpen={isTweetsOpen}
          tweetIcon={tweet}
          tweetBlueIcon={tweetBlue}
          retweetIcon={retweet}
          retweetGreenIcon={retweetGreen}
          userIcon={user}
          onUserIconClick={() => setIsUserListOpen(true)}
        >
          {isTweetsOpen ? (
            <div className="pt-8">
              {userTweetInfo.map((userTweet, index) => (
                <UserTweet key={index} info={userTweet} />
              ))}
            </div>
          ) : (
            <div className="pt-8">
              {userRetweetInfo.map((userRetweet, index) => (
                <UserRetweet key={index} info={userRetweet} />
              ))}
            </div>
          )}
        </RightBox>
      </div>
      <div>
        <EditBanner
          isOpen={isBannerOpen}
          onClose={() => setIsBannerOpen(false)}
          username={userInfo.name}
          email={userInfo.email}
          bio={userInfo.bio}
        />
      </div>
    </div>
  );
};

export default MyProfile;
