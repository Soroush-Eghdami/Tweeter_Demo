import { useMyProfile } from "../useMyProfile";

const useIsLoggedIn = () => {
  const { data, isLoading, error } = useMyProfile();
  return {
    isLoggedIn: !!data && !error,
    isLoading,
  };
};

export default useIsLoggedIn;
