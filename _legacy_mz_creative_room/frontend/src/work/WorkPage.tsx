import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Reveal } from "../lib/Reveal";
import { ProjectListMode } from "./ProjectListMode";
import { introWords, projects, processSteps } from "./workContent";
import "./work.css";

function IntroWordCycle() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= introWords.length - 1) return;
    const timer = window.setTimeout(() => setIndex((i) => i + 1), 1100);
    return () => window.clearTimeout(timer);
  }, [index]);

  return <span className="work-cycle-word">{introWords[index]}</span>;
}

export function WorkPage() {
  const setView = useAppStore((s) => s.setView);
  const openAuth = useAppStore((s) => s.openAuth);
  const openSection = useAppStore((s) => s.openSection);

  const featured = projects.find((p) => p.featured) ?? projects[0];
  const secondary = projects.filter((p) => p.id !== featured.id).slice(0, 3);

  return (
    <div className="work-page">
      <button className="work-back" onClick={() => setView("immersive")}>
        ← Back to the Creative Room
      </button>

      {/* 01 — Hero */}
      <section className="work-section work-hero">
        <Reveal className="work-label">(01 — SELECTED WORK)</Reveal>
        <Reveal delay={0.1}>
          <h1 className="work-hero-title">
            SELECTED
            <br />
            WORK.
          </h1>
        </Reveal>
        <Reveal delay={0.2} className="work-hero-subtitle">
          A selection of projects, ideas and experiences made with curiosity, strategy and a
          slightly unhealthy obsession with details.
        </Reveal>
      </section>

      {/* 02 — Philosophy */}
      <section className="work-section work-philosophy">
        <Reveal>
          <h2 className="work-heading">
            EVERY PROJECT
            <br />
            STARTS WITH
            <br />
            <IntroWordCycle />
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <h2 className="work-heading">
            I DON'T JUST MAKE THINGS LOOK GOOD.
            <br />I MAKE THEM MEAN <span className="work-accent">SOMETHING.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.25} className="work-philosophy-body">
          <p>
            Every project starts somewhere. Sometimes with a clear brief. Sometimes with a messy
            idea. Sometimes with a problem nobody has solved yet.
          </p>
          <p>The interesting part is figuring out what it can become.</p>
        </Reveal>
      </section>

      {/* 03 — Featured project */}
      <section className="work-section work-featured" style={{ background: featured.gradient }}>
        <div className="work-featured-overlay" />
        <div className="work-featured-content">
          <Reveal className="work-label">01 / FEATURED</Reveal>
          <Reveal delay={0.1}>
            <h2 className="work-featured-title">{featured.title}.</h2>
          </Reveal>
          <Reveal delay={0.2} className="work-featured-categories">
            {featured.categories.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </Reveal>
          <Reveal delay={0.3} className="work-featured-info">
            <div>
              <span className="work-eyebrow">CLIENT</span>
              <p>{featured.client}</p>
            </div>
            <div>
              <span className="work-eyebrow">YEAR</span>
              <p>{featured.year}</p>
            </div>
            <div>
              <span className="work-eyebrow">ROLE</span>
              <p>{featured.role?.join(", ")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 04 — Alternating projects */}
      <section className="work-section work-alt work-alt-side">
        <Reveal className="work-alt-visual" style={{ background: secondary[0]?.gradient }} />
        <Reveal delay={0.1} className="work-alt-content">
          <span className="work-eyebrow">02</span>
          <h3 className="work-alt-title">{secondary[0]?.title}</h3>
          <p className="work-alt-tags">{secondary[0]?.categories.join(" · ")}</p>
          <p className="work-story-line">{secondary[0]?.description}</p>
        </Reveal>
      </section>

      <section className="work-section work-alt work-alt-vertical">
        <Reveal className="work-alt-visual work-alt-visual-tall" style={{ background: secondary[1]?.gradient }} />
        <Reveal delay={0.1}>
          <h3 className="work-alt-title">{secondary[1]?.title}.</h3>
          <p className="work-alt-tags">{secondary[1]?.categories.join(" · ")}</p>
        </Reveal>
      </section>

      <section className="work-section work-alt work-alt-question">
        <Reveal>
          <h2 className="work-heading">
            HOW DO YOU MAKE
            <br />
            PEOPLE STOP
            <br />
            SCROLLING?
          </h2>
        </Reveal>
        <Reveal delay={0.15} className="work-alt-visual" style={{ background: secondary[2]?.gradient }} />
        <Reveal delay={0.25}>
          <h3 className="work-alt-title">{secondary[2]?.title}</h3>
          <p className="work-alt-tags">{secondary[2]?.categories.join(" · ")}</p>
        </Reveal>
      </section>

      {/* 05 — List mode with filters + floating preview */}
      <ProjectListMode />

      {/* 08 — Process */}
      <section className="work-section work-process">
        <Reveal>
          <h2 className="work-heading">
            FROM "WHAT IF?"
            <br />
            TO "HERE IT IS."
          </h2>
        </Reveal>
        <div className="work-process-steps">
          {processSteps.map((step, i) => (
            <Reveal key={step.number} delay={i * 0.08} className="work-process-step">
              <span className="work-eyebrow">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="work-section work-final">
        <Reveal>
          <h2 className="work-heading work-heading-xl">
            YOUR PROJECT
            <br />
            COULD BE
            <br />
            <span className="work-accent">NEXT.</span>
          </h2>
          <p className="work-story-line">Have an idea, a problem, or something you want to build?</p>
        </Reveal>
        <Reveal className="work-final-ctas">
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
