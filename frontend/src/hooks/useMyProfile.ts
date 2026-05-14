import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import api from "../api-services/api";
import { hasSession, setSession } from "../utils/session";

const MyProfileInfo = async () => {
  const response = await api.get("/accounts/profile/");
  setSession(true);  // session is valid
  return response.data;
};

export const useMyProfile = () => {
  const enabled = hasSession(); // only fetch if we think user has a session

  return useQuery({
    queryKey: ["myProf"],
    queryFn: MyProfileInfo,
    staleTime: 0,
    // refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled,
    retry: (failureCount, error) => {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          setSession(false); // session expired/invalid
          return false;
        }
      }
      return failureCount < 3;
    },
  });
};