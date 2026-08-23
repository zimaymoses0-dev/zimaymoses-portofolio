import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className,
  style,
}: {
  children?: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
