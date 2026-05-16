import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderProfile from "../components/profile/HeaderProfile";
import RightBox from "../components/profile/RightBox";
import LeftBox from "../components/profile/LeftBox";
import FollowingFollower from "../components/followingFollowerPopUp/FollowingFollowerPopUp";
import LoadingPage from "../components/loading/LoadingPage";
import { useUserProfile } from "../hooks/useUserProfile";
import { useFollow, useUnfollow } from "../hooks/useFollowUnfollow";
import { useMyProfile } from "../hooks/useMyProfile";
import { useMyRetweetList, useMyTweetList } from "../hooks/useMyTweet";
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
  const {
    data: myTweet,
    fetchNextPage: myTweetFetchNextPage,
    hasNextPage: myTweetHasNextPage,
    isFetchingNextPage: myTweetIsFetchNextPage,
    isLoading: myTweetIsLoading,
  } = useMyTweetList(id || "", 5, {
    enabled: !!data && !!data?.email && isTweetsOpen,
  });
  const {
    data: myRetweet,
    fetchNextPage: myRetweetFetchNextPage,
    hasNextPage: myRetweetHasNextPage,
    isFetchingNextPage: myRetweetIsFetchNextPage,
    isLoading: myRetweetIsLoading,
  } = useMyRetweetList(id || "", 5, {
    enabled: !!data && !!data?.email && !isTweetsOpen,
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRefTweet = useRef<HTMLDivElement>(null);
  const loadMoreRefRetweet = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isPublic = !!data && !!data?.email;
  const myTweetList = myTweet?.pages.flatMap((page) => page.results) ?? [];
  const myRetweetList = myRetweet?.pages.flatMap((page) => page.results) ?? [];

  // Navigate to MyProfile
  useEffect(() => {
    if (currentUser?.id && id) {
      if (currentUser.id === id) {
        navigate("/profile", { replace: true });
      }
    }
  }, [currentUser, id, navigate, currentUserLoading, isLoading]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const loadMore = isTweetsOpen
      ? loadMoreRefTweet.current
      : loadMoreRefRetweet.current;
    const hasNextPage = isTweetsOpen
      ? myTweetHasNextPage
      : myRetweetHasNextPage;
    const isFetching = isTweetsOpen
      ? myTweetIsFetchNextPage
      : myRetweetIsFetchNextPage;
    const fetchNext = isTweetsOpen
      ? myTweetFetchNextPage
      : myRetweetFetchNextPage;

    if (!container || !loadMore || !hasNextPage || isFetching) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchNext();
        }
      },
      { root: container, rootMargin: "0px 0px 100px 0px" },
    );

    observer.observe(loadMore);
    return () => observer.disconnect();
  }, [
    isTweetsOpen,
    myTweetHasNextPage,
    myTweetIsFetchNextPage,
    myTweetFetchNextPage,
    myRetweetHasNextPage,
    myRetweetIsFetchNextPage,
    myRetweetFetchNextPage,
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (isLoading || currentUserLoading) return <LoadingPage />;

  return (
    <div className="min-h-fit w-full bg-custom-dark-gradient">
      <div>
        <FollowingFollower
          isUserProfile={true}
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
          isFollower={data.is_following_you}
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
          isPublic={isPublic}
          isMyProfile={false}
          setIsTweetsOpen={setIsTweetsOpen}
          isTweetsOpen={isTweetsOpen}
          tweetIcon={tweet}
          tweetBlueIcon={tweetBlue}
          retweetIcon={retweet}
          retweetGreenIcon={retweetGreen}
          userIcon={user}
          containerRef={scrollContainerRef}
          tweetRetweetList={{
            tweet: {
              isLoading: myTweetIsLoading,
              infoList: myTweetList,
              hasNextPage: myTweetHasNextPage,
              loadMoreRef: loadMoreRefTweet,
              isFetchNextPage: myTweetIsFetchNextPage,
            },
            retweet: {
              isLoading: myRetweetIsLoading,
              infoList: myRetweetList,
              hasNextPage: myRetweetHasNextPage,
              loadMoreRef: loadMoreRefRetweet,
              isFetchNextPage: myRetweetIsFetchNextPage,
            },
          }}
          onUserIconClick={() => setIsUserListOpen(true)}
        />
      </div>
    </div>
  );
};

export default UserProfile;
