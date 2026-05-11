import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api-services/api";

// Update Profile Picture
const updateProfilePic = async (formData: FormData) => {
  const response = await api.patch("/accounts/profile/", formData);
  return response.data;
};

export const useUpdateProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfilePic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProf"] });
      toast.success("Profile Picture Updated Successfully!");
    },
    onError: (error) => {
      toast.error("Profile Picture Updating Failed!");
      console.log("Updating Profile Picture Failed:", error);
    },
  });
};

// Update Banner Picture
const updateBannerPicture = async (formData: FormData) => {
  const response = await api.patch("/accounts/profile/", formData);
  return response.data;
};

export const useUpdateBannerPicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBannerPicture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProf"] });
      toast.success("Banner Picture Updated Successfully!");
    },
    onError: (error) => {
      toast.error("Updating Banner Picture Failed!");
      console.log("Updating Banner Picture Failed:", error);
    },
  });
};
