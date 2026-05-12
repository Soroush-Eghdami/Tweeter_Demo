import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api-services/api";
import { setSession } from "../utils/session";

const logoutUser = async () => {
  const response = await api.post("/accounts/logout/");
  return response.data;
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      setSession(false);
      queryClient.clear();
      navigate("/login");
    },
    onError: (error) => {
      console.log("Logout failed:", error);
      toast.error("Logout failed");
    },
  });
};