import { create } from "zustand";

interface isLoggedInType {
  isLoggedIn: boolean;
  setIsLoggedIn: () => void;
}

const useIsLoggedIn = create<isLoggedInType>((set) => ({
  isLoggedIn: false,
  setIsLoggedIn: () =>
    set((state) => ({
      isLoggedIn: !state.isLoggedIn,
    })),
}));

export default useIsLoggedIn;
