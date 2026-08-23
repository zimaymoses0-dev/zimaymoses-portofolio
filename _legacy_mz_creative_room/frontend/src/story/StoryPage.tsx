import { useRef } from "react";
import { useAppStore } from "../store/useAppStore";
import { storyChapters } from "./storyContent";
import { ChapterSection } from "./ChapterSection";
import "./story.css";

export function StoryPage() {
  const setView = useAppStore((s) => s.setView);
  const containerRef = useRef<HTMLDivElement>(null);

  function goToChapter(index: number) {
    const el = containerRef.current?.querySelectorAll(".story-chapter")[index];
    el?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="story-page" ref={containerRef}>
      <button className="story-back" onClick={() => setView("immersive")}>
        ← Back to the Creative Room
      </button>

      {storyChapters.map((chapter, i) => (
        <ChapterSection
          key={chapter.id}
          chapter={chapter}
          onCta={() => {
            if (i < storyChapters.length - 1) goToChapter(i + 1);
            else setView("immersive");
          }}
        />
      ))}
    </div>
  );
}
