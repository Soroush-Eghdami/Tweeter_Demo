import type { ProfileType } from "../types/ProfileType";

export const privateEnabled = (data: ProfileType): boolean => {
  return !!data && !!data?.is_public_user;
};
