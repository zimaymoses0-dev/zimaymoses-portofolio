import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { projects, filterOptions, type FilterTag } from "./workContent";
import { Reveal } from "../lib/Reveal";

export function ProjectListMode() {
  const [filter, setFilter] = useState<"ALL" | FilterTag>("ALL");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  const filtered = projects.filter((p) => filter === "ALL" || p.filterTag === filter);
  const hoveredProject = projects.find((p) => p.id === hoveredId);

  return (
    <section className="work-section work-list-section" onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}>
      <Reveal>
        <h2 className="work-heading">
          MORE THINGS
          <br />
          I'VE MADE.
        </h2>
      </Reveal>

      <Reveal className="work-filters">
        {filterOptions.map((opt) => (
          <button
            key={opt}
            className={`work-filter ${filter === opt ? "active" : ""}`}
            onClick={() => setFilter(opt)}
          >
            {opt}
          </button>
        ))}
      </Reveal>

      <div className="work-list" onMouseLeave={() => setHoveredId(null)}>
        <AnimatePresence initial={false}>
          {filtered.map((project, i) => (
            <motion.button
              key={project.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredId && hoveredId !== project.id ? 0.35 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="work-list-row"
              onMouseEnter={() => setHoveredId(project.id)}
              onClick={() => {}}
            >
              <span className="work-list-number">{String(i + 1).padStart(2, "0")}</span>
              <span className="work-list-title">{project.title}</span>
              <span className="work-list-category">{project.categories[0]}</span>
              <span className="work-list-view">VIEW →</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {canHover && (
        <AnimatePresence>
          {hoveredProject && (
            <motion.div
              className="work-floating-preview"
              style={{
                left: mouse.x + 24,
                top: mouse.y - 90,
                background: hoveredProject.gradient,
              }}
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: -4 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
      )}
    </section>
  );
}
