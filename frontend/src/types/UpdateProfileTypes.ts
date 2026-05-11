import type { ProfileType } from "./ProfileType";

export interface picUpdateObjType {
  picUpdate: (arg0: FormData) => Promise<ProfileType>;
  picUpdateLoading: boolean;
}
export interface bannerUpdateObjType {
  bannerUpdate: (arg0: FormData) => Promise<ProfileType>;
  bannerUpdateLoading: boolean;
}
