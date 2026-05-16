import { useState } from "react";
import toast from "react-hot-toast";
import Loading from "../loading/Loading";
import { useCreateTweet } from "../../hooks/useCreateTweet";
import userProfile from "../../assets/icons/profile-default.svg";
import createPost from "../../assets/icons/post.svg";

interface CreatePostPropType {
  setIsCreatedPost: (arg0: boolean) => void;
  isCreatedPost: boolean;
  profile: ProfileType;
  profileLoading: boolean;
}

const CreatePost = ({ setIsCreatedPost, isCreatedPost,profile }: CreatePostPropType) => {
  // for create tweet
  const [content, setContent] = useState("");
  const createTweetMutation = useCreateTweet();
  const displayName = profile?.username || profile?.custom_id || "User";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Enter your Tweet");
      return;
    }
    createTweetMutation.mutate(
      {
        content: content.trim(),
      },
      {
        // call backs
        onSuccess: () => {
          setContent("");
          setIsCreatedPost(false);
          toast.success("Tweet create successfully!");
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message || "Error to sent Tweet";
          toast.error(errorMessage);
        },
      },
    );
  };

  return (
    <>
      <div
        className={`fixed z-40 w-dvw min-h-screen top-0 right-0 pt-46 backdrop-blur-md bg-black/70 origin-bottom-right ${isCreatedPost ? "animate-[newTweetAnimation_0.3s_ease-out]" : "animate-[newTweetAnimationExit_0.3s_ease-out_forwards]"} `}
      >
        <div className="pt-3 pb-3 z-50 max-w-[45%] mx-auto bg-[#1c1c1c]/90 rounded-2xl shadow-[0_0px_30px_rgba(0,0,0,0.4)]">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-row gap-3 pt-9 px-10">
                <img 
                key={profile?.profile_picture}
                src={profile?.profile_picture || userProfile}
                alt="user-profile" className="size-18 rounded-full object-cover"/>
              {/* username */}
                <p className="text-white font-semibold text-lg ml-2 mt-2">{displayName}</p>
            </div>
            <div className="relative ml-30 mr-8 -top-10">
              <textarea
                name="create-tweet"
                id="create-tweet"
                className="h-35 mt-2 text-[#f4f4f4] placeholder:text-[#939393] resize-none py-3 px-4 mb-2 rounded-xl w-full focus:outline-none"
                placeholder="Write your tweet here ..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={createTweetMutation.isPending}
              />
            </div>
            {/* line */}
            <div className="w-full border border-white"></div>
            <div className="flex flex-row pt-6">
              <div className="pl-12 py-4">
                {/* checkbox */}
                {/* <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="checkbox"
                    id="checkbox"
                    className="peer h-5 w-5 appearance-none rounded border-[1.5px] border-white transition-all hover:scale-105 duration-200 ease-in-out"
                  /> */}
                {/* <label className="text-white font-semibold" htmlFor="checkbox">
                    Private Post
                  </label> */}

                {/* Custom checkmark */}
                {/* <svg
                    className="absolute w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M5 10l3 3 7-7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </label> */}
              </div>
              <div className="flex flex-row items-center ml-auto mr-6">
                <button
                  type="submit"
                  disabled={createTweetMutation.isPending}
                  className="text-black bg-white px-4 py-1.5 my-3 rounded-4xl font-bold cursor-pointer hover:bg-[#ddd]"
                >
                  <div className="grid grid-cols-1 place-items-center">
                    {createTweetMutation.isPending && (
                      <div className="col-start-1 row-start-1">
                        <Loading width="w-5" height="h-5"/>
                      </div>
                    )}
                    <div
                      className={`col-start-1 row-start-1 flex items-center gap-1 ${createTweetMutation.isPending ? "invisible" : ""}`}
                    >
                      <img
                        src={createPost}
                        alt="create-tweet"
                        className="size-5 mt-0.5"
                      />
                      <span>Tweet</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreatePost;
