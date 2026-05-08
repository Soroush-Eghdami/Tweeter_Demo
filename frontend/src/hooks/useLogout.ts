import { useMutation } from "@tanstack/react-query";
import api from "../api-services/api";

const logoutUser = async () => {
  const response = await api.post("/accounts/logout/");
  return response.data;
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logoutUser,
    onError: (error) => {
      console.log("Logout failed:", error);
    },
  });
};
