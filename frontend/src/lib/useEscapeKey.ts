import { useEffect } from "react";

export function useEscapeKey(onEscape: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onEscape();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, onEscape]);
}
