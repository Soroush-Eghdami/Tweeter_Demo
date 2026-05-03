export interface userInfoType {
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

export const userInfo: userInfoType = {
  name: "soroush :)",
  email: "peyman0034@gmail.com",
  bio: "Frontend developer",
  avatarUrl: "",
  followers: 87,
  following: 563,
  tweets: 8,
  retweet: 69,
  joinDate: "Joined at 12/4/2020",
};
