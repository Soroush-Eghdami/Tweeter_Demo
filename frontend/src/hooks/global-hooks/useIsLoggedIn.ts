import { useUserProfile } from "../useUserProfile";

const useIsLoggedIn = () => {
  const { data, isLoading, error } = useUserProfile();
  return {
    isLoggedIn: !!data && !error,
    isLoading,
  };
};

export default useIsLoggedIn;
