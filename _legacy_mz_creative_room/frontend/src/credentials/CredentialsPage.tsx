import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import { Reveal } from "../lib/Reveal";
import { LazyScene } from "../lib/LazyScene";
import { CredentialHeroScene, CredentialFinalScene } from "./CredentialScene";
import { CustomCursor } from "./CustomCursor";
import {
  timelineChapters,
  nowChapter,
  bigStatementSequence,
  combinationWords,
  CREDENTIAL_TYPE_LABEL,
} from "./credentialsContent";
import {
  fetchCredentials,
  fetchCredentialBySlug,
  type CredentialListItem,
  type CredentialDetail,
} from "../lib/api";
import "./credentials.css";

type HoverProps = (label: string) => { onMouseEnter: () => void; onMouseLeave: () => void };

function formatYear(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).getFullYear().toString();
}

function StatementStep({
  lines,
  big,
  progress,
  start,
  end,
  holdStart,
  holdEnd,
}: {
  lines: string[];
  big?: boolean;
  progress: MotionValue<number>;
  start: number;
  end: number;
  holdStart: boolean;
  holdEnd: boolean;
}) {
  const span = end - start;
  const fade = Math.min(span * 0.25, 0.06);
  const opacity = useTransform(
    progress,
    [start, start + fade, end - fade, end],
    [holdStart ? 1 : 0, 1, 1, holdEnd ? 1 : 0]
  );
  const y = useTransform(progress, [start, start + fade], [24, 0]);

  return (
    <motion.div
      className={`cred-statement-step ${big ? "cred-statement-step-big" : ""}`}
      style={{ opacity, y }}
    >
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          <br />
        </span>
      ))}
    </motion.div>
  );
}

function CredentialCard({
  item,
  index,
  reduceMotion,
  onOpen,
  hoverProps,
}: {
  item: CredentialListItem;
  index: number;
  reduceMotion: boolean;
  onOpen: () => void;
  hoverProps: HoverProps;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });
  const tilt = (index % 5) - 2;

  return (
    <motion.button
      ref={ref}
      className="cred-card"
      style={{
        rotateX: reduceMotion ? 0 : springX,
        rotateY: reduceMotion ? 0 : springY,
        rotateZ: tilt,
      }}
      onMouseMove={(e) => {
        if (reduceMotion) return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        rotateY.set(px * 14);
        rotateX.set(py * -14);
      }}
      onMouseEnter={hoverProps("VIEW").onMouseEnter}
      onMouseLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
        hoverProps("VIEW").onMouseLeave();
      }}
      onClick={onOpen}
    >
      <span className="cred-card-kicker">
        {CREDENTIAL_TYPE_LABEL[item.credential_type] ?? item.credential_type}
      </span>
      <span className="cred-card-title">{item.title}</span>
      <span className="cred-card-institution">{item.institution}</span>
      <span className="cred-card-year">{formatYear(item.issue_date) || "—"}</span>
    </motion.button>
  );
}

function CredentialDetailModal({
  loading,
  detail,
  onClose,
  hoverProps,
}: {
  loading: boolean;
  detail: CredentialDetail | null;
  onClose: () => void;
  hoverProps: HoverProps;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <motion.div
      className="cred-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="cred-modal"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="cred-modal-close" onClick={onClose} {...hoverProps("CLOSE")}>
          ×
        </button>

        {loading || !detail ? (
          <p className="cred-modal-status">Loading…</p>
        ) : (
          <>
            <div className="cred-modal-kicker">
              {CREDENTIAL_TYPE_LABEL[detail.credential_type] ?? detail.credential_type}
            </div>
            <h2 className="cred-modal-title">{detail.title}</h2>
            <p className="cred-modal-institution">
              {detail.institution}
              {detail.issue_date ? ` — ${formatYear(detail.issue_date)}` : ""}
            </p>

            <div className="cred-modal-meta-grid">
              {detail.field && (
                <div>
                  <span className="cred-modal-meta-label">FIELD</span>
                  <span className="cred-modal-meta-value">{detail.field}</span>
                </div>
              )}
              {detail.level && (
                <div>
                  <span className="cred-modal-meta-label">LEVEL</span>
                  <span className="cred-modal-meta-value">{detail.level}</span>
                </div>
              )}
              {detail.issue_date && (
                <div>
                  <span className="cred-modal-meta-label">DATE</span>
                  <span className="cred-modal-meta-value">{formatYear(detail.issue_date)}</span>
                </div>
              )}
              {detail.credential_id && (
                <div>
                  <span className="cred-modal-meta-label">ID / REFERENCE</span>
                  <span className="cred-modal-meta-value">{detail.credential_id}</span>
                </div>
              )}
            </div>

            {detail.description && <p className="cred-modal-description">{detail.description}</p>}

            {detail.skills.length > 0 && (
              <div className="cred-modal-skills">
                <span className="cred-modal-meta-label">SKILLS ACQUIRED</span>
                <ul>
                  {detail.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </div>
            )}

            {detail.related_projects.length > 0 && (
              <div className="cred-modal-related">
                <span className="cred-modal-meta-label">RELATED WORK</span>
                <ul>
                  {detail.related_projects.map((project) => (
                    <li key={project.id}>{project.title}</li>
                  ))}
                </ul>
              </div>
            )}

            {detail.verification_url && (
              <a
                className="btn-outline"
                href={detail.verification_url}
                target="_blank"
                rel="noreferrer"
                {...hoverProps("OPEN")}
              >
                VERIFY CREDENTIAL ↗
              </a>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export function CredentialsPage() {
  const setView = useAppStore((s) => s.setView);
  const openAuth = useAppStore((s) => s.openAuth);
  const openSection = useAppStore((s) => s.openSection);

  const [cursorLabel, setCursorLabel] = useState("");
  const [reduceMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const pageRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLElement>(null);

  const [credentials, setCredentials] = useState<CredentialListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailSlug, setDetailSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<CredentialDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchCredentials()
      .then(setCredentials)
      .catch(() => setCredentials([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!detailSlug) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    fetchCredentialBySlug(detailSlug)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [detailSlug]);

  const hoverProps: HoverProps = (label) => ({
    onMouseEnter: () => setCursorLabel(label),
    onMouseLeave: () => setCursorLabel(""),
  });

  const { scrollYProgress: statementProgress } = useScroll({
    target: statementRef,
    container: pageRef,
    offset: ["start start", "end end"],
  });

  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    container: pageRef,
    offset: ["start center", "end center"],
  });
  const timelineLineScale = useTransform(timelineProgress, [0, 1], [0, 1]);

  const featured = useMemo(() => credentials.filter((c) => c.is_featured), [credentials]);
  const hasData = credentials.length > 0;

  function chapterItems(types: string[] | null) {
    if (!types) return [];
    return credentials.filter((c) => types.includes(c.credential_type));
  }

  return (
    <div className="cred-page" ref={pageRef}>
      <div className="cred-grain" />
      <CustomCursor label={cursorLabel} />

      <button className="cred-back" onClick={() => setView("immersive")} {...hoverProps("OPEN")}>
        ← Back to the Creative Room
      </button>

      {/* 01 — Entry */}
      <section className="cred-section cred-hero">
        <div className="cred-hero-text">
          <Reveal>
            <div className="cred-label">MZ / 06 — CREDENTIALS</div>
          </Reveal>
          <Reveal delay={0.15}>
            <h1 className="cred-hero-title">
              LEARNING
              <br />
              LEAVES
              <br />A <span className="cred-accent">TRACE.</span>
            </h1>
          </Reveal>
        </div>
        <div className="cred-scroll-indicator">
          SCROLL TO EXPLORE
          <br />↓
        </div>
      </section>

      {/* 02 — Big statement */}
      {reduceMotion ? (
        <section className="cred-section cred-statement-static">
          {bigStatementSequence.map((step, i) => (
            <Reveal key={i} className={`cred-statement-step ${step.big ? "cred-statement-step-big" : ""}`}>
              {step.lines.map((line, li) => (
                <span key={li}>
                  {line}
                  <br />
                </span>
              ))}
            </Reveal>
          ))}
        </section>
      ) : (
        <section className="cred-section cred-statement-sequence" ref={statementRef}>
          <div className="cred-statement-sticky">
            {bigStatementSequence.map((step, i) => {
              const segment = 1 / bigStatementSequence.length;
              const start = i * segment;
              const end = start + segment;
              return (
                <StatementStep
                  key={i}
                  lines={step.lines}
                  big={step.big}
                  progress={statementProgress}
                  start={start}
                  end={end}
                  holdStart={i === 0}
                  holdEnd={i === bigStatementSequence.length - 1}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* 03 — Education timeline */}
      <section className="cred-section cred-timeline" ref={timelineRef}>
        <Reveal>
          <h2 className="cred-heading-xl">
            THE ROAD
            <br />
            SO FAR.
          </h2>
        </Reveal>

        <div className="cred-timeline-track">
          <div className="cred-timeline-line">
            <motion.div
              className="cred-timeline-line-fill"
              style={{ scaleY: reduceMotion ? 1 : timelineLineScale }}
            />
          </div>

          {timelineChapters.map((chapter) => {
            const items = chapterItems(chapter.types);
            return (
              <Reveal key={chapter.number} className="cred-chapter">
                <div className="cred-chapter-meta">
                  <span className="cred-chapter-number">{chapter.number}</span>
                  <span className="cred-chapter-label">{chapter.label}</span>
                </div>
                <h3 className="cred-chapter-title">
                  {chapter.title.map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </h3>
                <p className="cred-chapter-body">{chapter.body}</p>

                {items.length > 0 && (
                  <ul className="cred-chapter-items">
                    {items.map((item) => (
                      <li key={item.id}>
                        <span className="cred-chapter-item-title">{item.title}</span>
                        <span className="cred-chapter-item-meta">
                          {item.institution}
                          {item.issue_date ? ` — ${formatYear(item.issue_date)}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {chapter.cta && (
                  <button
                    className="btn-outline"
                    onClick={() => setView("work-overview")}
                    {...hoverProps("OPEN")}
                  >
                    SEE THE WORK IT BUILT →
                  </button>
                )}
              </Reveal>
            );
          })}

          <Reveal className="cred-chapter cred-chapter-now">
            <div className="cred-chapter-meta">
              <span className="cred-chapter-label">NOW</span>
            </div>
            <h3 className="cred-chapter-title">
              {nowChapter.title.map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </h3>
            <p className="cred-chapter-body">{nowChapter.body}</p>
          </Reveal>
        </div>
      </section>

      {/* 04/05/06/07 — Certifications, wall, selected proof, what it taught me */}
      {!loading && hasData && (
        <>
          <section className="cred-section cred-wall">
            <Reveal>
              <h2 className="cred-heading-xl">
                THE
                <br />
                CREDENTIALS.
              </h2>
              <p className="cred-story-line">
                A collection of certifications, courses and qualifications that shaped the way I think,
                design and build.
              </p>
            </Reveal>

            <motion.div
              className="cred-hero-scene"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <LazyScene>
                <CredentialHeroScene />
              </LazyScene>
            </motion.div>

            <div className="cred-wall-grid">
              {credentials.map((item, i) => (
                <CredentialCard
                  key={item.id}
                  item={item}
                  index={i}
                  reduceMotion={reduceMotion}
                  onOpen={() => setDetailSlug(item.slug)}
                  hoverProps={hoverProps}
                />
              ))}
            </div>
          </section>

          {featured.length > 0 && (
            <section className="cred-section cred-selected">
              <Reveal>
                <h2 className="cred-heading-xl">
                  NOT ALL
                  <br />
                  CREDENTIALS
                  <br />
                  ARE EQUAL.
                </h2>
              </Reveal>

              <div className="cred-selected-list">
                {featured.map((item, i) => (
                  <Reveal key={item.id} delay={i * 0.05} className="cred-selected-row">
                    <span className="cred-selected-number">{String(i + 1).padStart(2, "0")}</span>
                    <div className="cred-selected-info">
                      <span className="cred-selected-title">{item.title}</span>
                      <span className="cred-selected-meta">
                        {item.institution}
                        {item.field ? ` · ${item.field}` : ""}
                        {item.issue_date ? ` · ${formatYear(item.issue_date)}` : ""}
                      </span>
                    </div>
                    <button
                      className="btn-outline"
                      onClick={() => setDetailSlug(item.slug)}
                      {...hoverProps("VIEW")}
                    >
                      DETAILS →
                    </button>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          <section className="cred-section cred-taught">
            <Reveal>
              <h2 className="cred-heading-xl">
                WHAT IT
                <br />
                TAUGHT ME.
              </h2>
            </Reveal>

            <div className="cred-taught-grid">
              {credentials.slice(0, 6).map((item) => (
                <Reveal key={item.id} className="cred-taught-card">
                  <div className="cred-taught-step">
                    <span className="cred-taught-label">CERTIFICATION</span>
                    <span className="cred-taught-value">{item.title}</span>
                  </div>
                  <div className="cred-taught-arrow">↓</div>
                  <div className="cred-taught-step">
                    <span className="cred-taught-label">SKILL</span>
                    <span className="cred-taught-value">{item.skills[0] ?? item.field}</span>
                  </div>
                  <div className="cred-taught-arrow">↓</div>
                  <div className="cred-taught-step">
                    <span className="cred-taught-label">APPLICATION</span>
                    <span className="cred-taught-value">{item.field || item.level}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        </>
      )}

      {!loading && !hasData && (
        <section className="cred-section cred-empty">
          <Reveal>
            <h2 className="cred-heading-xl">
              MORE PROOF
              <br />
              <span className="cred-accent">COMING SOON.</span>
            </h2>
            <p className="cred-story-line">
              This page is wired up and ready — the credentials themselves are being added.
            </p>
          </Reveal>
        </section>
      )}

      {/* 08 — The combination */}
      <section className="cred-section cred-combination">
        <Reveal>
          <h2 className="cred-heading-xl">
            ONE
            <br />
            CREDENTIAL
            <br />
            ISN'T
            <br />
            THE STORY.
          </h2>
        </Reveal>

        <div className="cred-combination-words">
          {combinationWords.map((word, i) => (
            <Reveal key={word} delay={i * 0.08} className="cred-combination-word">
              {word}
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.5} className="cred-combination-result">
          <p className="cred-combination-that">THAT'S MZ.</p>
          <p className="cred-combination-name">MOSES Z. ZIMAY</p>
          <p className="cred-combination-title">CREATIVE DIRECTOR / DIGITAL EXPERIENCES</p>
        </Reveal>
      </section>

      {/* 10 — Final statement */}
      <section className="cred-section cred-final-statement">
        <motion.div
          className="cred-final-scene"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <LazyScene>
            <CredentialFinalScene />
          </LazyScene>
        </motion.div>
        <Reveal className="cred-final-statement-text">
          <h2 className="cred-heading-xl">
            LEARNING
            <br />
            NEVER
            <br />
            GRADUATES.
          </h2>
          <p className="cred-story-line">Every new project teaches me something the last one couldn't.</p>
        </Reveal>
      </section>

      {/* 11 — CTA */}
      <section className="cred-section cred-cta">
        <Reveal>
          <h2 className="cred-heading-xl">
            WANT TO SEE
            <br />
            WHAT I CAN
            <br />
            DO WITH IT?
          </h2>
          <p className="cred-story-line">
            Don't just look at the credentials.
            <br />
            Look at what they became.
          </p>
        </Reveal>
        <div className="cred-cta-buttons">
          <button className="cred-pill-btn" onClick={() => setView("work-overview")} {...hoverProps("OPEN")}>
            SEE MY WORK →
          </button>
          <button
            className="cred-pill-btn cred-pill-btn-primary"
            onClick={openAuth}
            {...hoverProps("OPEN")}
          >
            LET'S WORK TOGETHER →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="cred-footer">
        <div className="cred-footer-brand">
          <span className="cred-footer-mark">MZ</span>
          <p>Creative Director</p>
          <p>Digital Experiences</p>
        </div>
        <nav className="cred-footer-nav">
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
          <button onClick={() => setView("faq")} {...hoverProps("OPEN")}>
            FAQ
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
        <p className="cred-footer-copyright">© 2026 Moses Z. Zimay</p>
      </footer>

      <AnimatePresence>
        {detailSlug && (
          <CredentialDetailModal
            loading={detailLoading}
            detail={detail}
            onClose={() => setDetailSlug(null)}
            hoverProps={hoverProps}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
