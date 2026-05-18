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
      // Immediately remove profile from cache → home shows unauthenticated instantly
      queryClient.removeQueries({ queryKey: ["myProf"] });
      setSession(false);
      toast.success("Profile deleted successfully");
      navigate("/", { replace: true });
    },
    onError: () => {
      toast.error("Failed to delete profile. Please try again.");
      // popup stays open because we no longer auto-close it
    },
  });
};