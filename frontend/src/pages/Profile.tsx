import tweet from "/src/assets/icons/profile/tweet.svg";
import Avatar from "/src/assets/icons/profile-default.svg";
import Edit from "/src/assets/icons/profile/edit-profile-pic.svg";
import User from "/src/assets/icons/user-profile.svg";
import Email from "/src/assets/icons/profile/edit-email.svg";
import Calender from "/src/assets/icons/profile/joined-date.svg";
import FollowerFollowing from "/src/assets/icons/profile/follower-following-counter.svg";
import Bio from "/src/assets/icons/profile/bio.svg";
import retweet from "/src/assets/icons/profile/retweet.svg";
import heart from "/src/assets/icons/heart.svg";
import EditUser from "/src/assets/icons/profile/edit-username.svg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfilePictureEdit from "../components/profilePictureEdit/ProfilePictureEdit";

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  followers: number;
  following: number;
  tweets: number;
  retweet: number;
  joinDate: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [isProfilePicOpen, setIsProfilePicOpen] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  const [profile] = useState<ProfileData>({
    name: "soroush :)",
    email: "peyman0034@gmail.com",
    bio: "Frontend developer",
    avatarUrl: "",
    followers: 87,
    following: 563,
    tweets: 8,
    retweet: 69,
    joinDate: "Joined at 12/4/2020",
  });

  return (
    <div className="min-h-fit w-full bg-custom-dark-gradient ">
      {isProfilePicOpen && (
        <div>
          <ProfilePictureEdit setIsOpen={setIsProfilePicOpen} />
        </div>
      )}

      <div className=" w-full  ">
        {/* Banner */}
        <div className=" relative h-36 w-full overflow-hidden group cursor-pointer ">
          <div className="h-full w-full flex items-center justify-center group-hover:bg-[#333] transition-colors duration-400"></div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
            <img src={Edit} className="w-25 h-25" alt="Edit" />
          </div>
        </div>

        {/* line  */}
        <div className="relative mb-20">
          <div className="relative border-t-2 border-white ">
            <div className="absolute -top-13 w-full">
              <div className="relative flex justify-between items-center   ">
                {/* hover effect */}
                <div
                  className="absolute -top-6 group cursor-pointer ml-39"
                  onClick={() => setIsProfilePicOpen((prev) => !prev)}
                >
                  <img
                    src={Avatar}
                    alt="avatar"
                    className="size-35 rounded-full border-2 border-white shadow-md transition-transform duration-200 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <img src={Edit} alt="Edit" className="w-20 h-20 " />
                  </div>
                </div>

                <button
                  className={`absolute top-5 right-10 text-xl mr-16 ${isFollowed ? "px-13" : "px-15.75"} py-3 rounded-3xl bg-black text-white border-2 border-white hover:bg-[#333] transition-colors cursor-pointer duration-300`}
                  onClick={() => setIsFollowed((prev) => !prev)}
                >
                  {isFollowed ? "Unfollow" : "Follow"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* left box */}
        <div className=" flex gap-6 transition-none sm:px-6 lg:px-8  mt-32">
          <div className=" bg-white/10 backdrop-filter-md   h-fit flex-1  backdrop-filter backdrop-blur-[35px] backdrop-brightness-[0.6] rounded-2xl shadow-xl border-2 border-white p-7 space-y-4  ">
            <div className=" flex items-center gap-2 text-xl font-bold text-gray-900 ">
              <img src={EditUser} alt="User" className="w-6 h-6 " />

              <span className="text-white">{profile.name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-800">
              <img src={Email} alt="Email" className="w-5 h-5 " />
              <span className="text-white ">{profile.email}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-800">
              <img src={Calender} alt="Calender" className="w-5 h-5 " />
              <span className="text-sm text-white">{profile.joinDate}</span>
            </div>

            <div className="flex items-start gap-2 text-gray-800">
              <img src={Bio} alt="Bio" className="w-5 h-5 " />
              <p className="text-white">{profile.bio}</p>
            </div>

            {/* follow and following */}
            <div className=" flex-1 min-w-35 bg-white/15 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] rounded-xl p-3 border border-white/40">
              <div className="flex justify-around">
                <div className="flex items-center gap-2">
                  <img
                    src={FollowerFollowing}
                    alt="User"
                    className="w-8 h-8 hover:scale-115 duration-700"
                  />
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-lg text-white">
                      {profile.followers}
                    </span>
                    <span className="text-xs text-white">Followers</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <img
                    src={FollowerFollowing}
                    alt="user"
                    className="w-8 h-8 hover:scale-115 duration-700"
                  />
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-lg text-white">
                      {profile.following}
                    </span>
                    <span className="text-xs text-white">Following</span>
                  </div>
                </div>
              </div>
            </div>

            {/* tweets and posts */}
            <div className=" flex-1 min-w-35 bg-white/15 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5] rounded-xl p-3 border border-white/40">
              <div className=" flex justify-around">
                <div className=" mr-4 flex items-center ">
                  <img
                    src={tweet}
                    alt="tweet"
                    className="mr-4.5 w-8 h-8 hover:scale-115 duration-700"
                  />
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-lg text-white">
                      {profile.tweets}
                    </span>
                    <span className="text-xs text-white">Tweet</span>
                  </div>
                </div>

                {/*  tweet and retweet */}
                <div className="flex items-center gap-3 mr-1">
                  <img
                    src={retweet}
                    alt="retweet"
                    className="w-6 h-6 hover:scale-115 duration-700"
                  />
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-lg text-white">
                      {profile.retweet}
                    </span>
                    <span className="text-xs text-white">Re-tweet</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/edit-profile")}
              className=" rounded-2xl cursor-pointer w-full flex items-center justify-center gap-2 mt-2 px-4 py-2 text-white hover:bg-white/40 hover:text-[#222] transition-colors duration-300   bg-white/10 backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5]"
            >
              Edit Profile
            </button>
          </div>

          {/* right box */}
          <div className="  min-h-150 flex-4 md:col-span-2 backdrop-filter-blur-[35px] backdrop-brightness-[1] rounded-2xl  border-white border-2 ">
            <div className=" px-6 pt-6 flex items-center justify-between cursor-pointer   ">
              <div className="  flex items-center gap-7">
                <img
                  src={tweet}
                  alt="tweet"
                  className="ml-4 w-10 h-10 hover:scale-115 duration-700"
                />
                <img
                  src={retweet}
                  alt="retweet"
                  className="w-9 h-9  hover:scale-115 duration-700"
                />
                <img
                  src={heart}
                  alt="heart"
                  className="w-10 h-10 hover:scale-115 duration-700"
                />
              </div>
              <img
                src={User}
                alt="profile"
                className="mr-4 w-10 h-10 hover:scale-115 duration-700 "
              />
            </div>
            <div className="border-t border-white mx-0 mt-3"></div>

            <div className="overflow-hidden rounded-b-xl">
              <div
                className="px-6 pb-6 space-y-5 max-h-150 overflow-y-auto 
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-track]:bg-white/10
                    [&::-webkit-scrollbar-thumb]:bg-white/30
                    [&::-webkit-scrollbar-thumb]:rounded-t-none
                    [&::-webkit-scrollbar-thumb]:hover:bg-white/50
                    "
              >
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum
                  autem culpa rerum officia, molestias molestiae quae soluta aut
                  eligendi, fugit tenetur nobis odio necessitatibus placeat a
                  natus repudiandae quibusdam, ratione perferendis nulla
                  veritatis sit perspiciatis hic. Repellat repellendus ullam
                  facere praesentium iure aliquam, voluptate hic, perferendis
                  quibusdam nemo est earum, autem sint provident inventore
                  quisquam sapiente a excepturi distinctio consequuntur rerum
                  debitis et. Blanditiis consequatur ullam dignissimos
                  quibusdam, autem mollitia odit minus sapiente, voluptates quod
                  sint cum? Sapiente, tenetur! Similique accusamus
                  exercitationem soluta incidunt odit impedit vero distinctio
                  sed placeat. Cupiditate neque veniam accusantium sequi ipsam,
                  architecto laboriosam perspiciatis deserunt nostrum aut nisi
                  vitae incidunt quia debitis cumque itaque, aliquid excepturi
                  dolorum quibusdam a! Ab, possimus temporibus. Autem tenetur
                  labore voluptates? Ut animi, numquam sequi recusandae
                  laudantium et labore in iusto id mollitia doloremque omnis,
                  itaque deserunt. Numquam voluptatibus suscipit porro
                  blanditiis earum, quae amet distinctio nesciunt rerum possimus
                  dolores pariatur accusantium expedita deleniti ipsum. Atque
                  dolores doloribus id facere provident porro numquam, sunt vero
                  recusandae facilis ducimus ullam asperiores minus veritatis
                  modi explicabo itaque nesciunt quis! Ipsa soluta assumenda
                  nostrum dolorum? Labore excepturi dicta distinctio, dolorem ex
                  ea mollitia? A voluptatibus necessitatibus cumque facilis
                  impedit recusandae quaerat? Culpa aspernatur consequuntur
                  ratione dolorem necessitatibus, suscipit, magni harum placeat,
                  asperiores expedita blanditiis obcaecati laboriosam? Maiores
                  cum quod veritatis distinctio ducimus nisi necessitatibus
                  officia quibusdam mollitia deleniti veniam, fugit dolor
                  reprehenderit. Nam neque distinctio, eius doloremque vel quae
                  voluptate iusto quas molestias, rerum ipsum accusamus aut
                  aspernatur quidem. Dicta, molestiae nostrum! Iste rem, minus
                  reprehenderit dicta vel vitae harum ut, ad, placeat alias at
                  dolor? Error consequuntur ipsa fugit id aliquam aut odio
                  voluptas impedit quod non? Aperiam, dolores odit. Quia,
                  sapiente sunt quas blanditiis cupiditate distinctio iure
                  laudantium velit quibusdam exercitationem alias? Sed, fugiat,
                  repellendus cumque, perferendis asperiores tempore quas quis
                  culpa ullam a labore maiores autem. Quibusdam enim natus ut
                  veritatis odio? Mollitia ratione consequatur suscipit
                  laboriosam perferendis, dolor porro quas earum dolorem vel
                  velit maxime facere officiis placeat ipsa. Omnis nobis iure
                  commodi alias deleniti molestias nostrum? Distinctio totam
                  nisi ex excepturi delectus? Ipsum obcaecati fugit nesciunt
                  ducimus possimus adipisci? Consequatur cumque animi, iure
                  iusto nulla assumenda eaque modi aliquam id, ad nostrum,
                  facilis quos nemo! Impedit deserunt ipsa ea, illo mollitia
                  sunt ratione rerum nulla aliquid quisquam, suscipit provident
                  quos. Odit, minus. Delectus similique est beatae tempora illo
                  amet laborum neque, pariatur, explicabo ipsum deleniti odit
                  corrupti aliquid. Illo similique eius adipisci necessitatibus
                  facere! Distinctio sint impedit ducimus praesentium expedita
                  laborum quaerat dolorem fugit est necessitatibus eligendi fuga
                  nostrum at cum, quisquam suscipit porro quidem soluta id vel
                  minima quod earum doloribus! Odit ipsam aspernatur magni quas
                  quia quibusdam, ratione iusto molestias voluptas nostrum,
                  eligendi in minima animi nisi et impedit velit reprehenderit
                  quaerat pariatur sed soluta asperiores, illo reiciendis
                  obcaecati? Veritatis repellat qui minima sed quisquam ipsa
                  maxime eius nesciunt vel dignissimos dolores ea vero animi
                  quas, illum distinctio autem, nisi possimus rem officiis?
                  Nesciunt maxime est corporis ad animi ab doloremque soluta
                  vero, saepe, omnis obcaecati. Fugiat in ex, nobis ipsa
                  pariatur cupiditate totam a libero, eum labore dolore error
                  perspiciatis quasi culpa laudantium cumque ipsum impedit
                  laboriosam, maiores magnam! Debitis dicta consectetur animi
                  amet impedit delectus fuga quisquam quibusdam dolor aliquid
                  molestias eveniet quis nemo exercitationem nobis quam magnam
                  dolore temporibus, necessitatibus vero totam modi est aut hic.
                  Id cupiditate maiores expedita rem nisi eaque magni minus
                  veritatis, quibusdam natus architecto doloribus alias eos, at
                  officia ut sapiente dignissimos eligendi facilis incidunt
                  officiis vel ad dolorem. Neque quas sapiente numquam quo ex
                  dicta nobis iste quia, vel earum quibusdam in facere maxime
                  libero eveniet consequatur, ratione nam quaerat! Reiciendis
                  facilis impedit quis, facere ut et dolorem enim quam
                  perferendis inventore assumenda voluptatem tempora voluptas
                  rem eveniet. Autem, totam officia? Doloremque vitae dolorem
                  illum dignissimos odio corrupti veritatis rem, minima dolore
                  tempore dolores obcaecati recusandae repellendus vel
                  blanditiis, ab explicabo nemo accusantium quod voluptatibus
                  esse soluta officia. Voluptatibus, nulla asperiores distinctio
                  voluptas, minus sequi, temporibus iusto accusantium porro
                  dignissimos reprehenderit rem id deleniti earum debitis eos
                  possimus! Adipisci repudiandae voluptatibus exercitationem
                  sequi veniam tempore. Nemo non, maxime magnam beatae aperiam,
                  impedit consequatur dolore delectus pariatur deserunt, est
                  repellendus neque ut adipisci vel a odio necessitatibus soluta
                  ratione! Nostrum assumenda odio excepturi sequi provident
                  laboriosam, temporibus blanditiis animi, illo doloremque eum
                  accusamus aut ducimus eveniet enim iste. Atque quas aut
                  corrupti tempore, odio numquam officia cum? Totam dolorem
                  reiciendis voluptates placeat, officiis, praesentium quam
                  dicta ipsa, impedit sapiente deserunt laboriosam maiores quod!
                  Perspiciatis, dicta culpa eveniet delectus ipsum aspernatur
                  officia facilis alias accusantium tempore? Ipsa mollitia harum
                  consequuntur cum a alias, ipsum tempora adipisci fugit officia
                  accusamus explicabo quae nobis deleniti sequi eveniet id
                  consequatur temporibus sapiente deserunt suscipit non veniam
                  molestias quis. Vero magnam eos molestias quasi et, facere
                  placeat quos rerum nesciunt. Consectetur, voluptatibus
                  dolores?
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
