import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { setSession } from "../utils/session";
import api from "../api-services/api";

interface loginUserInfoType {
  username: string;
  password: string;
}

const loginUserInfo = async (userData: loginUserInfoType) => {
  const response = await api.post("/accounts/login/", userData);
  return response.data;
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUserInfo,
    onSuccess: () => {
      setSession(true);
      queryClient.invalidateQueries({ queryKey: ["myProf"] });
      toast.success("User Logged in Successfully!");
      navigate("/");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error;
      if (
        errorMessage === "No active account found with the given credentials"
      ) {
        toast.error("Invalid username or password.");
      } else {
        toast.error(errorMessage || "Login failed. Please try again.");
      }
    },
  });
};
