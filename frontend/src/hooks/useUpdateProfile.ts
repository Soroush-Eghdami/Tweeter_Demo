import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api-services/api";

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
