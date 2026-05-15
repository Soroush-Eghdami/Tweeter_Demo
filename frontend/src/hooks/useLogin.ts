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
      navigate("/");
    },
    onError: (error) => {
      console.log("Login failed:", error);
      toast.error("Login Failed!");
    },
  });
};