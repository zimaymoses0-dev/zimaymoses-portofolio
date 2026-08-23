import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import { Reveal } from "../lib/Reveal";
import { HeroScene } from "./HeroScene";
import { ImpactScene } from "./ImpactScene";
import { LabScene } from "./LabScene";
import { LazyScene } from "../lib/LazyScene";
import { CircleButton } from "./CircleButton";
import { CustomCursor } from "./CustomCursor";
import { faqItems } from "./faqContent";
import "./faq.css";

export function FAQPage() {
  const setView = useAppStore((s) => s.setView);
  const openAuth = useAppStore((s) => s.openAuth);
  const openSection = useAppStore((s) => s.openSection);

  const [cursorLabel, setCursorLabel] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [ctaHover, setCtaHover] = useState(false);
  const [reduceMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const pageRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLElement>(null);

  const { scrollYProgress: impactProgress } = useScroll({
    target: impactRef,
    container: pageRef,
    offset: ["start end", "end start"],
  });
  const impactTextY = useTransform(impactProgress, [0, 1], [140, -140]);
  const impactSceneY = useTransform(impactProgress, [0, 1], [40, -40]);

  const hoverProps = (label: string) => ({
    onMouseEnter: () => setCursorLabel(label),
    onMouseLeave: () => setCursorLabel(""),
  });

  function scrollToTop() {
    pageRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="faq-page" ref={pageRef}>
      <div className="faq-grain" />
      <CustomCursor label={cursorLabel} />

      <button className="faq-back" onClick={() => setView("immersive")} {...hoverProps("OPEN")}>
        ← Back to the Creative Room
      </button>

      {/* 01 — Hero */}
      <section className="faq-section faq-hero">
        <div className="faq-hero-text">
          <Reveal>
            <h1 className="faq-hero-title">
              <span className="faq-accent">QUESTIONS</span>
              <br />
              YOU MIGHT
              <br />
              <span className="faq-accent">ACTUALLY</span> HAVE.
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="faq-story-line">
              A few things people usually want to know before working with me, exploring my work,
              or turning an idea into something real.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <button
              className="faq-pill-btn"
              onClick={() =>
                document.querySelector(".faq-accordion-section")?.scrollIntoView({ behavior: "smooth" })
              }
              {...hoverProps("VIEW")}
            >
              Discover now →
            </button>
          </Reveal>
        </div>
        <motion.div
          className="faq-hero-scene"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <LazyScene>
            <HeroScene />
          </LazyScene>
        </motion.div>
        <div className="faq-scroll-indicator">
          SCROLL DOWN
          <br />↓
        </div>
      </section>

      {/* 02 — 3D Impact */}
      <section className="faq-section faq-impact" ref={impactRef}>
        <motion.div className="faq-impact-scene" style={reduceMotion ? undefined : { y: impactSceneY }}>
          <LazyScene>
            <ImpactScene />
          </LazyScene>
        </motion.div>
        <motion.div className="faq-impact-text" style={reduceMotion ? undefined : { y: impactTextY }}>
          <h2 className="faq-heading-xl">
            100%
            <br />
            <span className="faq-accent">CURIOUS.</span>
          </h2>
          <h2 className="faq-heading-xl faq-impact-second">
            ALWAYS
            <br />
            EXPLORING.
          </h2>
        </motion.div>
        <div className="faq-circle-wrap">
          <CircleButton onClick={() => document.querySelector(".faq-accordion-section")?.scrollIntoView({ behavior: "smooth" })} />
        </div>
      </section>

      {/* 03 — Big statement */}
      <section className="faq-section faq-statement">
        <Reveal>
          <h2 className="faq-heading-xl">
            <span className="faq-accent">CREATIVITY.</span>
            <br />
            NEVER
            <br />
            STAYS STILL.
          </h2>
        </Reveal>
        <div className="faq-statement-object faq-css-orb" />
      </section>

      {/* 04 — Second 3D composition */}
      <section className="faq-section faq-lab">
        <div className="faq-lab-scene">
          <LazyScene>
            <LabScene />
          </LazyScene>
        </div>
        <Reveal className="faq-lab-text">
          <h2 className="faq-heading-xl">
            <span className="faq-accent">NEW</span>
            <br />
            IDEAS
            <br />
            NEED
            <br />
            NEW WAYS.
          </h2>
        </Reveal>
      </section>

      {/* 05 — Friendly FAQ intro */}
      <section className="faq-section faq-intro-friendly">
        <Reveal>
          <h2 className="faq-heading">
            <span className="faq-accent">FRIENDLY</span>
            <br />
            ASKED
            <br />
            QUESTIONS.
          </h2>
          <p className="faq-story-line">
            In our FAQ section, you'll find answers to some of the questions people usually ask
            about my work, creative process and collaboration.
          </p>
          <button className="btn-outline" onClick={scrollToTop} {...hoverProps("OPEN")}>
            BACK TO TOP →
          </button>
        </Reveal>
        <div className="faq-question-object">
          <span className="faq-css-question">?</span>
        </div>
      </section>

      {/* 06 — FAQ accordion */}
      <section className="faq-section faq-accordion-section">
        <div className="faq-label">MZ / FAQ / 001</div>
        {faqItems.map((item, i) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className={`faq-row ${isOpen ? "open" : ""}`}>
              <button
                className="faq-row-header"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                {...hoverProps("VIEW")}
              >
                <span className="faq-row-number">{String(i + 1).padStart(2, "0")}</span>
                <span className="faq-row-question">{item.question}</span>
                <span className="faq-row-toggle">{isOpen ? "×" : "+"}</span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="faq-row-content"
              >
                <p>{item.answer}</p>
              </motion.div>
            </div>
          );
        })}
      </section>

      {/* 07 — Final CTA */}
      <section className="faq-section faq-final">
        <div className="faq-final-object faq-css-bubble" />
        <Reveal className="faq-final-content">
          <h2 className="faq-heading-xl">
            SCHEDULE A
            <br />
            <span className="faq-gradient-text">CONSULTATION.</span>
          </h2>
          <p className="faq-story-line">
            Have an idea?
            <br />
            Let's make it real.
          </p>
          <button
            className="faq-pill-btn faq-pill-btn-primary"
            onClick={openAuth}
            onMouseEnter={() => {
              setCtaHover(true);
              setCursorLabel("OPEN");
            }}
            onMouseLeave={() => {
              setCtaHover(false);
              setCursorLabel("");
            }}
          >
            {ctaHover ? "START →" : "LET'S GO →"}
          </button>
        </Reveal>
      </section>

      {/* 08 — Footer */}
      <footer className="faq-footer">
        <div className="faq-footer-brand">
          <span className="faq-footer-mark">MZ</span>
          <p>Creative Director</p>
          <p>Digital Experiences</p>
          <p>Côte d'Ivoire</p>
        </div>
        <nav className="faq-footer-nav">
          <button onClick={() => setView("work-overview")} {...hoverProps("OPEN")}>
            WORK
          </button>
          <button onClick={() => setView("about")} {...hoverProps("OPEN")}>
            ABOUT
          </button>
          <button
            onClick={() => {
              setView("immersive");
              openSection("services");
            }}
            {...hoverProps("OPEN")}
          >
            SERVICES
          </button>
          <button onClick={scrollToTop} {...hoverProps("OPEN")}>
            FAQ
          </button>
          <button onClick={() => setView("credentials")} {...hoverProps("OPEN")}>
            CREDENTIALS
          </button>
          <button
            onClick={() => {
              setView("immersive");
              openSection("contact");
            }}
            {...hoverProps("OPEN")}
          >
            CONTACT
          </button>
        </nav>
        <p className="faq-footer-copyright">© 2026 Moses Z. Zimay</p>
      </footer>
    </div>
  );
}
