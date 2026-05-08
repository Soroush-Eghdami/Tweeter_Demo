import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import api from "../api-services/api";

const MyProfileInfo = async () => {
  const response = await api.get("/accounts/profile/");
  return response.data;
};

export const useMyProfile = () => {
  return useQuery({
    queryKey: ["myProf"],
    queryFn: MyProfileInfo,
    staleTime: 15 * 60 * 1000, // 15 min
    // refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 403) return false;
      }
      return failureCount < 3;
    },
  });
};
