import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useIsLoggedIn from "../../hooks/global-hooks/useIsLoggedIn";
import { useCreateComment } from "../../hooks/useCreateComment";
import type { TweetCardInfoType } from "../../types/TweetTypes";
import defaultProfile from "../../assets/icons/profile-default.svg";

interface NewCommentPropsType {
  info: TweetCardInfoType;
}

const NewComment = ({ info }: NewCommentPropsType) => {
  const { isLoggedIn } = useIsLoggedIn();
  const { mutate: createComment, isPending } = useCreateComment();
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigation = useNavigate();

  // Auto-resize the textarea based on its scrollHeight
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to correctly compute scrollHeight, then set to scrollHeight
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = () => {
    if (!content.trim() || !isLoggedIn) return;
    createComment(
      { content: content.trim(), parentTweetId: info.id },
      {
        onSuccess: () => {
          setContent(""); // Clear textarea after successful comment
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="rounded-xl">
      <div className="ml-18 pt-12">
        <div className="flex items-start gap-5">
          <img
            src={info.user?.profile_picture || defaultProfile}
            alt="Profile"
            className="w-15 h-15 rounded-full object-cover"
          />
          <p className="text-[#afafaf] font-semibold">
            Reply to{" "}
            <span
              className="text-white font-bold cursor-pointer hover:text-[#65A2FF] hover:underline"
              onClick={() => navigation(`/profile/${info.user?.id}`)}
            >
              {info.user?.username}
            </span>
          </p>
        </div>
        <textarea
          ref={textareaRef}
          name="comment"
          id="comment"
          placeholder="Write your comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          rows={3}
          className="relative -top-3 w-full pl-22 pr-22 resize-none focus:outline-none disabled:opacity-50 overflow-hidden"
          style={{ height: "auto" }}
        />
        <div className="text-right mb-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isLoggedIn || !content.trim() || isPending}
            className="bg-white font-bold py-2 px-4 mr-4 text-black rounded-3xl cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black transition-all hover:scale-105 duration-200 ease-in-out"
          >
            {isPending ? "Reply..." : "Reply"}
          </button>
        </div>
      </div>
      <div className="h-px w-full bg-white mb-14"></div>
    </div>
  );
};

export default NewComment;
