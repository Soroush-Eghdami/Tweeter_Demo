// ✅ CORRECT: do not read ref.current during render
import { useState, useRef, useCallback } from "react";

export const useCooldown = (delayMs = 500) => {
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const timerRef = useRef<number | null>(null);

  const startCooldown = useCallback(() => {
    if (isCoolingDown) return;
    setIsCoolingDown(true);
    timerRef.current = setTimeout(() => {
      setIsCoolingDown(false);
      timerRef.current = null;
    }, delayMs);
  }, [delayMs, isCoolingDown]);

  return { isCoolingDown, startCooldown };
};
