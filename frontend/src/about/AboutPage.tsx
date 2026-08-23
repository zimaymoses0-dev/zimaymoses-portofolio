import { useAppStore } from "../store/useAppStore";
import type { SectionId } from "../data/sections";
import { AboutHero } from "./AboutHero";
import { Reveal } from "../lib/Reveal";
import {
  storyParagraphs,
  roles,
  timelineChapters,
  workspaceItems,
  principles,
  skillCategories,
  personalNotes,
  randomFacts,
  collaborationPrinciples,
} from "./aboutContent";
import "./about.css";

export function AboutPage() {
  const setView = useAppStore((s) => s.setView);
  const openSection = useAppStore((s) => s.openSection);
  const openAuth = useAppStore((s) => s.openAuth);

  function goToWorkspaceItem(sectionId: string) {
    setView("immersive");
    openSection(sectionId as SectionId);
  }

  return (
    <div className="about-page">
      <button className="about-back" onClick={() => setView("immersive")}>
        ← Back to the Creative Room
      </button>

      <AboutHero />

      {/* 02 — Introduction */}
      <section className="about-section">
        <Reveal>
          <h2 className="about-heading">A LITTLE STORY ABOUT ME.</h2>
        </Reveal>
        <div className="about-story">
          {storyParagraphs.map((p, i) => (
            <Reveal key={p} delay={i * 0.1}>
              <p className="about-story-line">{p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 03 — What do I actually do */}
      <section className="about-section">
        <Reveal>
          <p className="about-eyebrow">SO...</p>
          <h2 className="about-heading">WHAT DO I ACTUALLY DO?</h2>
        </Reveal>
        <div className="about-roles">
          {roles.map((role, i) => (
            <Reveal key={role} delay={i * 0.05} className="about-role-tag">
              {role}
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="about-story-line">It's difficult to put everything into one title.</p>
          <p className="about-story-line">I work where creativity, technology and strategy meet.</p>
        </Reveal>
        <Reveal className="about-merge">
          <span>CREATIVITY</span>
          <span className="about-merge-dot">•</span>
          <span>TECHNOLOGY</span>
          <span className="about-merge-dot">•</span>
          <span>STRATEGY</span>
          <span className="about-merge-arrow">→</span>
          <span className="about-merge-result">EXPERIENCES.</span>
        </Reveal>
      </section>

      {/* 04 — Timeline */}
      <section className="about-section">
        <Reveal>
          <h2 className="about-heading">THE JOURNEY SO FAR.</h2>
        </Reveal>
        <div className="about-timeline">
          {timelineChapters.map((chapter) => (
            <Reveal key={chapter.chapter} className="about-timeline-chapter">
              <p className="about-eyebrow">{chapter.chapter}</p>
              <h3 className="about-timeline-title">{chapter.title}</h3>
              <p className="about-timeline-body">{chapter.body}</p>
            </Reveal>
          ))}
          <Reveal className="about-timeline-chapter about-timeline-now">
            <p className="about-eyebrow">NOW</p>
            <h3 className="about-timeline-title">STILL MAKING STUFF.</h3>
          </Reveal>
        </div>
      </section>

      {/* 05 — The Workspace */}
      <section className="about-section">
        <Reveal>
          <h2 className="about-heading">WELCOME TO MY CREATIVE ROOM.</h2>
          <p className="about-story-line">Click an object to explore that part of the room.</p>
        </Reveal>
        <div className="about-workspace">
          {workspaceItems.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.05}>
              <button className="about-workspace-item" onClick={() => goToWorkspaceItem(item.sectionId)}>
                <span className="about-workspace-icon">{item.icon}</span>
                <span className="about-workspace-label">{item.label}</span>
                <span className="about-workspace-represents">{item.represents}</span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 06 — Philosophy */}
      <section className="about-section about-section-minimal">
        <Reveal>
          <h2 className="about-heading about-heading-xl">
            GOOD IDEAS
            <br />
            DESERVE
            <br />
            GOOD EXECUTION.
          </h2>
        </Reveal>
        <div className="about-principles">
          {principles.map((p, i) => (
            <Reveal key={p.number} delay={i * 0.08} className="about-principle">
              <span className="about-eyebrow">{p.number}</span>
              <h3 className="about-principle-title">{p.title}</h3>
              <p className="about-story-line">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 07 — Skills */}
      <section className="about-section">
        <Reveal>
          <h2 className="about-heading">THINGS I LOVE MAKING.</h2>
        </Reveal>
        <div className="about-skills">
          {skillCategories.map((cat, i) => (
            <Reveal key={cat.category} delay={i * 0.08} className="about-skill-category">
              <h3 className="about-skill-heading">{cat.category}</h3>
              <ul>
                {cat.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 08 — Personal */}
      <section className="about-section">
        <Reveal>
          <h2 className="about-heading">WHEN I'M NOT MAKING STUFF...</h2>
        </Reveal>
        <div className="about-personal">
          {personalNotes.map((note, i) => (
            <Reveal key={note.label} delay={i * 0.06} className="about-personal-note">
              <span className="about-eyebrow">{note.label}</span>
              <p>{note.value}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 09 — Random facts */}
      <section className="about-section">
        <Reveal>
          <h2 className="about-heading">A FEW RANDOM THINGS.</h2>
        </Reveal>
        <div className="about-facts">
          {randomFacts.map((fact, i) => (
            <Reveal key={fact} delay={i * 0.06} className="about-fact">
              <span className="about-fact-number">{String(i + 1).padStart(2, "0")}</span>
              <p>{fact}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 10 — Collaboration */}
      <section className="about-section">
        <Reveal>
          <p className="about-eyebrow">SO...</p>
          <h2 className="about-heading">WHY SHOULD WE WORK TOGETHER?</h2>
          <p className="about-story-line">
            Because I don't just want to make something that looks good. I want to understand the
            idea behind it, the people it's made for, and what it's supposed to achieve.
          </p>
        </Reveal>
        <div className="about-collab">
          {collaborationPrinciples.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08} className="about-collab-item">
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 11 — Final CTA */}
      <section className="about-section about-section-final">
        <Reveal>
          <h2 className="about-heading about-heading-xl">THAT'S ME.</h2>
          <p className="about-story-line">Well... at least the version of me that fits on a website.</p>
          <h2 className="about-heading">NOW I'D LIKE TO KNOW ABOUT YOU.</h2>
        </Reveal>
        <Reveal className="about-final-ctas">
          <button className="btn-primary" onClick={openAuth}>
            START A PROJECT →
          </button>
          <button
            className="btn-outline"
            onClick={() => {
              setView("immersive");
              openSection("contact");
            }}
          >
            LET'S TALK →
          </button>
        </Reveal>
      </section>
    </div>
  );
}
