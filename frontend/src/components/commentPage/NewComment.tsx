import { useNavigate } from "react-router-dom";
import useIsLoggedIn from "../../hooks/global-hooks/useIsLoggedIn";
import defaultProfile from "../../assets/icons/profile-default.svg";

const NewComment = () => {
  const { isLoggedIn } = useIsLoggedIn();
  const navigation = useNavigate();

  return (
    <div className="rounded-xl">
      <div className="ml-18 pt-12">
        <div className="flex items-start gap-5">
          <img src={defaultProfile} alt="Default-Profile" />
          <p className="text-[#afafaf] font-semibold">
            Reply to{" "}
            <span
              className="text-white font-bold cursor-pointer hover:text-[#65A2FF] hover:underline"
              onClick={() => navigation("/profile")}
            >
              @khargoosh
            </span>
          </p>
        </div>
        <textarea
          name="comment"
          id="comment"
          placeholder="Write your comment..."
          className="relative -top-3 w-full pl-22 resize-none focus:outline-none"
        ></textarea>
        <div className="text-right mb-6">
          <button
            type="button"
            disabled={!isLoggedIn}
            className="bg-white font-bold py-2 px-4 mr-4 text-black rounded-3xl cursor-pointer hover:text-white hover:bg-black disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black transition-all duration-200 ease-in-out"
          >
            Reply
          </button>
        </div>
      </div>
      <div className="h-px w-full bg-white mb-14"></div>
    </div>
  );
};

export default NewComment;
