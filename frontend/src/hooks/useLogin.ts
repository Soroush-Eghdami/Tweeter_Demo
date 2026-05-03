import { useMutation } from "@tanstack/react-query";
import api from "../api-services/api";

const getUserInfo = async () => {
  try {
    const response = await api.post("/accounts/login");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const useLogin = () => {
  return useMutation({
    mutationFn: getUserInfo,
  });
};
