import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor({ label }: { label: string }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    function handleMove(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    }
    function handleLeave() {
      setVisible(false);
    }
    window.addEventListener("mousemove", handleMove);
    document.documentElement.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      className="cred-cursor"
      animate={{ x: pos.x, y: pos.y, scale: label ? 1.8 : 1 }}
      transition={{ type: "spring", damping: 30, stiffness: 400, mass: 0.4 }}
    >
      {label && <span>{label}</span>}
    </motion.div>
  );
}
