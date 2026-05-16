import { useMutation } from "@tanstack/react-query";
import api from "../api-services/api";

interface EditProfilePayload {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  bio: string;
  is_public_user: boolean;
}

const editProfile = async (userData: Partial<EditProfilePayload>) => {
  const response = await api.patch("/accounts/profile/", userData);
  return response.data;
};

export const useEditProfile = () => {
  return useMutation({
    mutationFn: editProfile,
    onError: (error) => {
      console.error("Profile update failed:", error);
    },
  });
};