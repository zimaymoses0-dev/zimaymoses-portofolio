import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import mzLogo from "../assets/mz-logo.png";

export function IntroOverlay() {
  const entered = useAppStore((s) => s.entered);
  const enter = useAppStore((s) => s.enter);

  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (entered || expanded) return;

    function updateProgress(delta: number) {
      setProgress((prev) => {
        const next = Math.min(1, Math.max(0, prev + delta));
        if (next >= 1) {
          setExpanded(true);
          window.setTimeout(enter, 550);
        }
        return next;
      });
    }

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      updateProgress(e.deltaY * 0.0012);
    }

    function handleTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0].clientY;
    }

    function handleTouchMove(e: TouchEvent) {
      e.preventDefault();
      const y = e.touches[0].clientY;
      updateProgress((touchStartY.current - y) * 0.006);
      touchStartY.current = y;
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [entered, expanded, enter]);

  const size = 20 + progress * 80; // vmin/vh-ish percentage of viewport
  const radius = 32 * (1 - progress);
  const textOpacity = Math.max(0, 1 - progress * 2.2);

  return (
    <AnimatePresence>
      {!entered && (
        <motion.div
          className="overlay intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="intro-logo-box"
            style={{
              width: `${size}vmin`,
              height: `${size * 0.66}vmin`,
              borderRadius: `${radius}px`,
            }}
          >
            <img src={mzLogo} alt="Moses Z. Zimay" className="intro-logo-img" />
          </div>

          <div className="intro-content" style={{ opacity: textOpacity }}>
            <p className="eyebrow">MOSES Z. ZIMAY — CREATIVE DIRECTOR</p>
            <h1>Welcome to my universe.</h1>
            <p className="intro-hint">Scroll to enter</p>
            <button className="btn-outline" onClick={enter}>
              ENTER MY WORLD
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
