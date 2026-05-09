import { useQuery } from "@tanstack/react-query";
import api from "../api-services/api";

const getUserInfo = async (id: string) => {
  const response = await api.get(`/accounts/users/${id}`);
  return response.data;
};

export const useUserProfile = (userid: string) => {
  return useQuery({
    queryKey: ["user", userid],
    queryFn: () => getUserInfo(userid),
    enabled: !!userid,
  });
};
