import { useState } from "react";
import { motion } from "framer-motion";
import type { StoryChapter } from "./storyContent";

const THEME_STYLES: Record<StoryChapter["theme"], { background: string; accent: string }> = {
  temple: {
    background: "radial-gradient(ellipse at 50% 30%, #3a2a12 0%, #0a0704 60%, #000 100%)",
    accent: "#d9a441",
  },
  renaissance: {
    background: "radial-gradient(ellipse at 50% 40%, #3a1414 0%, #150707 60%, #000 100%)",
    accent: "#e0b64a",
  },
  cosmos: {
    background: "radial-gradient(ellipse at 50% 50%, #1a1440 0%, #060314 55%, #000 100%)",
    accent: "#7ea9ff",
  },
};

interface Props {
  chapter: StoryChapter;
  onCta: () => void;
}

export function ChapterSection({ chapter, onCta }: Props) {
  const [flash, setFlash] = useState(false);
  const theme = THEME_STYLES[chapter.theme];

  function handleEnter() {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 350);
  }

  return (
    <section
      className="story-chapter"
      style={{ background: chapter.videoSrc ? "#000" : theme.background }}
    >
      {chapter.videoSrc && (
        <>
          <video className="story-video-bg" src={chapter.videoSrc} autoPlay muted loop playsInline />
          <div className="story-video-overlay" style={{ background: theme.background }} />
        </>
      )}

      {flash && (
        <motion.div
          className="story-flash"
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        />
      )}

      <motion.div
        className="story-chapter-inner"
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        onViewportEnter={handleEnter}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <p className="story-eyebrow" style={{ color: theme.accent }}>
          {chapter.eyebrow}
        </p>
        <h2 className="story-title">{chapter.title}</h2>
        <p className="story-body">{chapter.body}</p>
        <div className="story-note" style={{ borderColor: theme.accent }}>
          <span className="story-note-label" style={{ color: theme.accent }}>
            CE QU'IL FAUT RETENIR
          </span>
          <p>{chapter.note}</p>
        </div>
        <button
          className="story-cta"
          style={{ borderColor: theme.accent, color: theme.accent }}
          onClick={onCta}
        >
          {chapter.cta}
        </button>
      </motion.div>
    </section>
  );
}
