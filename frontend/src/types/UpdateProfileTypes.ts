import type { ProfileType } from "./ProfileType";

export interface picUpdateObjType {
  picUpdate: (arg0: FormData) => Promise<ProfileType>;
  picUpdateLoading: boolean;
}
