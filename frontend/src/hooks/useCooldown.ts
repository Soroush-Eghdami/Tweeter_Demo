import { useRef } from "react";

export const useCooldown = (delayMs = 500) => {
  const lastRunRef = useRef(0);

  const run = (callback: () => void) => {
    const now = Date.now();
    if (now - lastRunRef.current >= delayMs) {
      lastRunRef.current = now;
      callback();
    }
  };

  return { run };
};