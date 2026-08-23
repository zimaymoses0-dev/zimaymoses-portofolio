import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import { supabase } from "../lib/supabaseClient";

export function ResetPasswordModal() {
  const passwordRecovery = useAppStore((s) => s.passwordRecovery);
  const setPasswordRecovery = useAppStore((s) => s.setPasswordRecovery);
  const setView = useAppStore((s) => s.setView);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
  }

  return (
    <AnimatePresence>
      {passwordRecovery && (
        <motion.div
          className="overlay auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="auth-card"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
          >
            <p className="eyebrow">PROJECT SPACE</p>

            {done ? (
              <>
                <h2>Password updated.</h2>
                <p className="panel-intro">You're all set — continue to your project space.</p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setPasswordRecovery(false);
                    setView("project-space");
                  }}
                >
                  CONTINUE →
                </button>
              </>
            ) : (
              <>
                <h2>Choose a new password.</h2>
                <p className="panel-intro">Enter and confirm your new password below.</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                  <label className="auth-field">
                    <span>New password</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </label>
                  <label className="auth-field">
                    <span>Confirm password</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </label>

                  {error && <p className="auth-error">{error}</p>}

                  <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? "SAVING..." : "SAVE NEW PASSWORD"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
