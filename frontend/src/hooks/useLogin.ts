import { useMutation } from "@tanstack/react-query";
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
  return useMutation({
    mutationFn: loginUserInfo,
    onError: (error) => {
      console.log("Login failed:", error);
    },
  });
};
