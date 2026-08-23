import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import mzLogo from "../assets/mz-logo.png";
import { identityWords, heroAnnotations } from "./aboutContent";

export function AboutHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= identityWords.length - 1) return;
    const timer = window.setTimeout(() => setIndex((i) => i + 1), 850);
    return () => window.clearTimeout(timer);
  }, [index]);

  return (
    <section className="about-hero">
      <div className="about-hero-composition">
        <img src={mzLogo} alt="Moses Z. Zimay" className="about-hero-portrait" />
        <span className="about-annotation about-annotation-1">{heroAnnotations[0]}</span>
        <span className="about-annotation about-annotation-2">{heroAnnotations[1]}</span>
        <span className="about-annotation about-annotation-3">{heroAnnotations[2]}</span>
      </div>

      <p className="about-hero-lead">YOU CAN CALL ME</p>

      <div className="about-hero-word">
        <AnimatePresence mode="wait">
          <motion.h1
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {identityWords[index]}
          </motion.h1>
        </AnimatePresence>
      </div>
    </section>
  );
}
