import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import NewComment from "../components/commentPage/NewComment";
import HomeSideProfileBox from "../components/homePage/HomeSideProfileBox";
import TweetCard from "../components/TweetCard";
import CommentCard from "../components/commentPage/CommentCard";
import BackToPrev from "../components/BackToPrev";
import LoadingPage from "../components/loading/LoadingPage";
import Loading from "../components/loading/Loading";
import { useCommentList } from "../hooks/useCommentList";
import { useTweetDetails } from "../hooks/useTweetDetails";
import { useMyProfile } from "../hooks/useMyProfile";
import { updateButtonBottom } from "../utils/scrollFunction";

const CommentPage = () => {
  const { id } = useParams();
  const { data: currentUser, isLoading: currentUserIsLoading } = useMyProfile();
  const { data: tweetDetail, isLoading: tweetDetailIsLoading } =
    useTweetDetails(id || "");
  const {
    data: commentData,
    isLoading: commentListIsLoading,
    hasNextPage: commentListHasNextPage,
    isFetchingNextPage: commentListIsFetchingNextPage,
    fetchNextPage: commentListFetchNextPage,
  } = useCommentList(Number(id), 5);
  const [combinedBottom, setCombinedBottom] = useState(28);
  const sideBoxRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const commentList = commentData?.pages.flatMap((page) => page.results) ?? [];

  // Fetch Next Pages
  useEffect(() => {
    const container = scrollContainerRef.current;
    const loadMore = loadMoreRef.current;

    if (
      !container ||
      !loadMore ||
      !commentListHasNextPage ||
      commentListIsFetchingNextPage
    ) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        commentListFetchNextPage();
      }
    });

    observer.observe(loadMore);
    return () => observer.disconnect();
  }, [
    commentListHasNextPage,
    commentListIsFetchingNextPage,
    commentListFetchNextPage,
  ]);

  // Back Icon Scroll Fucntion
  useEffect(() => {
    let ticking = false;
    const scrollNum = commentList.length !== 0 ? -150 : 110;

    const update = () => {
      if (sideBoxRef.current) {
        updateButtonBottom(sideBoxRef, setCombinedBottom, scrollNum);
      }
      ticking = false;
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScrollOrResize);
    window.addEventListener("resize", onScrollOrResize);

    const resizeObserver = new ResizeObserver(() => {
      if (sideBoxRef.current) {
        updateButtonBottom(sideBoxRef, setCombinedBottom, scrollNum);
      }
    });
    if (sideBoxRef.current) resizeObserver.observe(sideBoxRef.current);

    updateButtonBottom(sideBoxRef, setCombinedBottom, scrollNum); // initial call

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      resizeObserver.disconnect();
    };
  }, [updateButtonBottom]);

  // Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (currentUserIsLoading || tweetDetailIsLoading) return <LoadingPage />;

  return (
    <>
      {/* Pinned Tweet */}
      <div className="flex gap-24 max-w-[92%] mx-auto min-h-[80dvh] my-16">
        <div className="flex-3">
          {/* Pinned Tweet */}
          <TweetCard
            info={tweetDetail}
            isPinned={true}
            isLoggedIn={!!currentUser}
          />

          {/* New Comment */}
          <NewComment info={tweetDetail} />

          {/* Comment Cards */}
          <div className="relative w-full h-auto">
            {/* Initial Loading */}
            <div ref={scrollContainerRef}>
              {commentListIsLoading && (
                <div className="pt-20">
                  <Loading width="w-12" height="h-12" />
                </div>
              )}
              {/* Mapping Through Comment List */}
              {commentList.length === 0 ? (
                <p className="text-center text-lg font-semibold text-[#777] my-20">
                  No Comments to display.
                </p>
              ) : (
                commentList.map((comment, index) => (
                  <CommentCard
                    key={comment.id}
                    info={comment}
                    isLastComment={
                      index === commentList.length - 1 ? true : false
                    }
                    isLoggedIn={!!currentUser}
                  />
                ))
              )}
              {/* Simple Space Use for Observer to when fetch more data */}
              {commentListHasNextPage && (
                <div ref={loadMoreRef} className="h-5" />
              )}
              {/* Loading when it's going to next page */}
              {commentListIsFetchingNextPage && (
                <div className="flex justify-center pl-44 pt-4 pb-10">
                  <Loading width="w-12" height="h-12" />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1" ref={sideBoxRef}>
          <HomeSideProfileBox
            profile={currentUser}
            isLoading={currentUserIsLoading}
          />
        </div>
        <div
          className={`fixed right-20 cursor-pointer hover:scale-95 transition-all duration-400 ease-in-out z-40`}
          style={{ bottom: `${combinedBottom}px` }}
        >
          <BackToPrev url="/" />
        </div>
      </div>
    </>
  );
};

export default CommentPage;
