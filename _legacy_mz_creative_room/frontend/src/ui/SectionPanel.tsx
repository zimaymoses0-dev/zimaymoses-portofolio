import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import { sections, savableSections } from "../data/sections";
import { getSavedProjects, removeSavedProject, saveProject } from "../lib/api";
import { QuickContactForm } from "./QuickContactForm";
import { useEscapeKey } from "../lib/useEscapeKey";

export function SectionPanel() {
  const activeSection = useAppStore((s) => s.activeSection);
  const closeSection = useAppStore((s) => s.closeSection);
  const openAuth = useAppStore((s) => s.openAuth);
  const session = useAppStore((s) => s.session);
  const contentItems = useAppStore((s) => (activeSection ? s.contentItems[activeSection] : undefined));

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  const setView = useAppStore((s) => s.setView);

  const section = activeSection ? sections[activeSection] : null;
  const canSave = activeSection ? savableSections.includes(activeSection) : false;

  useEscapeKey(closeSection, !!section);

  useEffect(() => {
    if (!session || !canSave) {
      setSavedIds(new Set());
      return;
    }
    getSavedProjects()
      .then((saved) => {
        setSavedIds(new Set(saved.map((s) => s.portfolio_projects?.id).filter(Boolean) as string[]));
      })
      .catch(() => {});
  }, [session, activeSection, canSave]);

  async function toggleSave(projectId: string) {
    if (!session) {
      openAuth();
      return;
    }

    setPendingId(projectId);
    try {
      if (savedIds.has(projectId)) {
        await removeSavedProject(projectId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(projectId);
          return next;
        });
      } else {
        await saveProject(projectId);
        setSavedIds((prev) => new Set(prev).add(projectId));
      }
    } finally {
      setPendingId(null);
    }
  }

  return (
    <AnimatePresence>
      {section && (
        <motion.div
          className="overlay panel-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSection}
        >
          <motion.div
            className="panel"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
          >
            {section.id === "services" && (
              <>
                <video className="panel-video-bg" src="/bg02.mp4" autoPlay muted loop playsInline />
                <div className="panel-video-overlay" />
              </>
            )}

            <div className="panel-content">
              <button className="panel-close" onClick={closeSection} aria-label="Close">
                ✕
              </button>
              <p className="eyebrow">{section.objectLabel}</p>
              <h2>{section.title}</h2>
              <p className="panel-intro">{section.intro}</p>

              {section.id === "about" && (
                <>
                  <div className="panel-featured">
                    <div className="panel-featured-eyebrow">MY STORY</div>
                    <div className="panel-item-title">You Can Call Me MZ.</div>
                    <div className="panel-item-subtitle">
                      Who I am, how I think, and why I make things.
                    </div>
                    <button
                      className="btn-outline"
                      onClick={() => {
                        setView("about");
                        closeSection();
                      }}
                    >
                      READ THE FULL STORY →
                    </button>
                  </div>

                  <div className="panel-featured">
                    <div className="panel-featured-eyebrow">PROOF OF CRAFT</div>
                    <div className="panel-item-title">Credentials</div>
                    <div className="panel-item-subtitle">
                      What I learned, what I built, and how it shaped the work.
                    </div>
                    <button
                      className="btn-outline"
                      onClick={() => {
                        setView("credentials");
                        closeSection();
                      }}
                    >
                      VIEW CREDENTIALS →
                    </button>
                  </div>
                </>
              )}

              {section.id === "work" && (
                <>
                  <div className="panel-featured">
                    <div className="panel-featured-eyebrow">SELECTED WORK</div>
                    <div className="panel-item-title">Every project starts with an idea.</div>
                    <div className="panel-item-subtitle">
                      An immersive tour through branding, campaigns and digital experiences.
                    </div>
                    <button
                      className="btn-outline"
                      onClick={() => {
                        setView("work-overview");
                        closeSection();
                      }}
                    >
                      VIEW SELECTED WORK →
                    </button>
                  </div>

                  <div className="panel-featured">
                    <div className="panel-featured-eyebrow">FEATURED CASE STUDY</div>
                    <div className="panel-item-title">The Alchemy of Value</div>
                    <div className="panel-item-subtitle">
                      An immersive scroll story on the history of accounting and finance.
                    </div>
                    <button
                      className="btn-outline"
                      onClick={() => {
                        setView("story");
                        closeSection();
                      }}
                    >
                      VIEW CASE STUDY →
                    </button>
                  </div>
                </>
              )}

              {contentItems?.loading && <p className="panel-status">Loading…</p>}

              {contentItems?.error && (
                <p className="panel-status panel-status-error">
                  Couldn't load this section ({contentItems.error}).
                </p>
              )}

              {contentItems && !contentItems.loading && !contentItems.error && (
                <ul className="panel-items">
                  {contentItems.items.map((item) => (
                    <li key={item.id}>
                      <div className="panel-item-head">
                        <div className="panel-item-title">{item.title}</div>
                        {canSave && (
                          <button
                            className={`save-btn ${savedIds.has(item.id) ? "saved" : ""}`}
                            disabled={pendingId === item.id}
                            onClick={() => toggleSave(item.id)}
                            aria-label={savedIds.has(item.id) ? "Remove from saved" : "Save this project"}
                          >
                            {savedIds.has(item.id) ? "♥ SAVED" : "♡ SAVE"}
                          </button>
                        )}
                      </div>
                      <div className="panel-item-subtitle">{item.subtitle}</div>
                    </li>
                  ))}
                </ul>
              )}

              {section.id === "contact" && (
                <>
                  <div className="panel-featured">
                    <div className="panel-featured-eyebrow">QUESTIONS YOU MIGHT ACTUALLY HAVE</div>
                    <div className="panel-item-title">FAQ</div>
                    <div className="panel-item-subtitle">
                      An immersive FAQ, before you reach out.
                    </div>
                    <button
                      className="btn-outline"
                      onClick={() => {
                        setView("faq");
                        closeSection();
                      }}
                    >
                      VIEW FAQ →
                    </button>
                  </div>

                  <button className="btn-primary" onClick={openAuth}>
                    START A PROJECT →
                  </button>
                  <div className="panel-quick-contact">
                    <QuickContactForm />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
