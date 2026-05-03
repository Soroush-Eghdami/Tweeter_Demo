import { useMutation } from "@tanstack/react-query";
import api from "../api-services/api";

const getUserInfo = async () => {
  try {
    const response = await api.get("/login");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const useRegister = () => {
  return useMutation({
    mutationFn: getUserInfo,
  });
};
