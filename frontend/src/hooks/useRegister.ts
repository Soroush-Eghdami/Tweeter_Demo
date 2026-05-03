import { useMutation } from "@tanstack/react-query";
import api from "../api-services/api";

interface newUserInfoType {
  username: string;
  password: string;
  password2: string;
  email: string;
  first_name: string;
}

const newUserInfo = async (userData: newUserInfoType) => {
  const response = await api.post("/accounts/register", userData);
  return response.data;
};

export const useRegister = () => {
  return useMutation({
    mutationFn: newUserInfo,
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};
