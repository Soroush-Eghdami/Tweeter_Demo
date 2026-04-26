import userProfile from "../../assets/icons/profile-default.svg";
import createPost from "../../assets/icons/post.svg";

interface CreatePostPropType {
  setIsCreatedPost: (arg0: boolean) => void;
}

const CreatePost = ({ setIsCreatedPost }: CreatePostPropType) => {
  const handleClick = () => {
    setIsCreatedPost(false);
  };

  return (
    <>
      <div className="fixed z-40 w-dvw min-h-screen  bg-[rgba(33,33,33,0.7)] top-0 right-0 pt-46 ">
        <div className="z-50 max-w-[45%] mx-auto bg-black/50 shadow-[0_0px_30px_rgba(0,0,0,0.4)] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] rounded-2xl pt-3 pb-3">
          <div className="flex flex-row pt-9 px-10 gap-3">
            <img src={userProfile} alt="user-profile" className="size-18" />
            <p className="text-white font-semibold text-lg">Khargoosh</p>
          </div>
          <div className="ml-30 mr-8 relative -top-10">
            <textarea
              name="create-post"
              id="create-post"
              className="h-35 text-[#f4f4f4] placeholder:text-[#939393] resize-none py-3 px-4 mb-2 rounded-xl w-full focus:outline-none"
              placeholder="write your post here"
            />
          </div>
          {/* line */}
          <div className=" w-full border border-white"></div>
          <div className="flex flex-row pt-6">
            <div className="pl-12 py-4">
              {/* checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="peer h-5 w-5 appearance-none rounded border-[1.5px] border-white  transition-all hover:scale-105 duration-200 ease-in-out"
                />
                <label className="text-white font-semibold">Private Post</label>

                {/* Custom checkmark */}
                <svg
                  className=" absolute w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
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
              </label>
            </div>
            <div className="flex flex-row items-center ml-auto mr-6">
              <button
                onClick={() => handleClick()}
                className="flex flex-row gap-1 text-black bg-white px-4 py-1.5 my-3 rounded-4xl font-bold cursor-pointer hover:bg-[#ddd]"
              >
                <img
                  src={createPost}
                  alt="create-post"
                  className="size-5 mt-0.5"
                />
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePost;
