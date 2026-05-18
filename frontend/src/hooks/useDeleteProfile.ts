import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api-services/api";
import { setSession } from "../utils/session";

const deleteProfileFunc = async () => {
  await api.delete("/accounts/profile/");
};

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteProfileFunc,
    onSuccess: () => {
      toast.success("Profile deleted successfully");
      setSession(false);
      queryClient.invalidateQueries({ queryKey: ["myProf"] });
      navigate("/");
    },
    onError: () => {
      toast.error("Failed to delete profile. Please try again.");
    },
  });
};
