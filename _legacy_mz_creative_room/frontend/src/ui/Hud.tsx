import { motion } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import { supabase } from "../lib/supabaseClient";

export function Hud() {
  const entered = useAppStore((s) => s.entered);
  const openAuth = useAppStore((s) => s.openAuth);
  const session = useAppStore((s) => s.session);
  const setView = useAppStore((s) => s.setView);

  if (!entered) return null;

  return (
    <motion.div
      className="hud"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <div className="hud-title">
        <span className="hud-mark">MZ</span>
        <span className="hud-sub">CREATIVE ROOM</span>
      </div>

      {session ? (
        <div className="hud-user">
          <span className="hud-user-email">{session.user.email}</span>
          <button className="btn-outline" onClick={() => setView("project-space")}>
            PROJECT SPACE
          </button>
          <button className="btn-outline" onClick={() => supabase.auth.signOut()}>
            SIGN OUT
          </button>
        </div>
      ) : (
        <button className="btn-outline" onClick={openAuth}>
          LET'S WORK TOGETHER
        </button>
      )}
    </motion.div>
  );
}
