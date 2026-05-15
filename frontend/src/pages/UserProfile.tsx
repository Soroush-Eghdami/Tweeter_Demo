import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserTweet from "../components/profile/UserTweet";
import UserRetweet from "../components/profile/UserRetweet";
import HeaderProfile from "../components/profile/HeaderProfile";
import RightBox from "../components/profile/RightBox";
import LeftBox from "../components/profile/LeftBox";
import FollowingFollower from "../components/followingFollowerPopUp/FollowingFollowerPopUp";
import LoadingPage from "../components/loading/LoadingPage";
import { useUserProfile } from "../hooks/useUserProfile";
import { useFollow, useUnfollow } from "../hooks/useFollowUnfollow";
import { useMyProfile } from "../hooks/useMyProfile";
import { userTweetInfo } from "../contents/userTweetInfo";
import { userRetweetInfo } from "../contents/userRetweetInfo";
import tweet from "../assets/icons/profile/tweet.svg";
import tweetBlue from "../assets/icons/profile/peace_pigeon.svg";
import avatar from "../assets/icons/profile-default.svg";
import edit from "../assets/icons/profile/edit-profile-pic.svg";
import user from "../assets/icons/user-profile.svg";
import username from "../assets/icons/profile/username.svg";
import email from "../assets/icons/profile/edit-email.svg";
import calender from "../assets/icons/profile/joined-date.svg";
import followerFollowing from "../assets/icons/profile/follower-following-counter.svg";
import bio from "../assets/icons/profile/bio.svg";
import retweet from "../assets/icons/profile/retweet.svg";
import retweetGreen from "../assets/icons/profile/repeat.svg";
import editUser from "../assets/icons/profile/edit-username.svg";

const UserProfile = () => {
  const { id } = useParams();
  const { data, isLoading } = useUserProfile(id || "");
  const { data: currentUser, isLoading: currentUserLoading } = useMyProfile();
  const { mutate: follow, isPending: followLoading } = useFollow();
  const { mutate: unfollow, isPending: unfollowLoading } = useUnfollow();
  const [isTweetsOpen, setIsTweetsOpen] = useState(true);
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const navigate = useNavigate();

  const isPublic = data?.is_public_user;

  useEffect(() => {
    if (currentUser?.id && id) {
      if (currentUser.id === id) {
        navigate("/profile", { replace: true });
      }
    }
  }, [currentUser, id, navigate, currentUserLoading, isLoading]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (isLoading || currentUserLoading) return <LoadingPage />;

  return (
    <div className="min-h-fit w-full bg-custom-dark-gradient">
      <div>
        <FollowingFollower
          isPublic={isPublic}
          userId={id || ""}
          myProfileId={currentUser?.id}
          setIsUserListOpen={setIsUserListOpen}
          isUserListOpen={isUserListOpen}
        />
      </div>
      <div className="w-full">
        <HeaderProfile
          isMyProfile={false}
          avatarSrc={data.profile_picture || avatar}
          bannerSrc={data.profile_banner}
          editIconSrc={edit}
          isFollowed={data.is_following}
          followObj={{
            follow,
            followLoading,
          }}
          unfollowObj={{
            unfollow,
            unfollowLoading,
          }}
        />
      </div>

      <div className="flex gap-6 transition-none sm:px-6 lg:px-8 mt-32">
        <LeftBox
          isPublic={isPublic}
          isMyProfile={false}
          profile={data}
          editUserIcon={editUser}
          usernameIcon={username}
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
    </div>
  );
};

export default UserProfile;
