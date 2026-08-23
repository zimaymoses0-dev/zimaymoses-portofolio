import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import { supabase } from "../lib/supabaseClient";
import { useEscapeKey } from "../lib/useEscapeKey";

type Mode = "sign-in" | "sign-up" | "forgot-password";

function isUnconfirmedEmailError(message: string) {
  return message.toLowerCase().includes("not confirmed");
}

export function AuthModal() {
  const authOpen = useAppStore((s) => s.authOpen);
  const closeAuth = useAppStore((s) => s.closeAuth);
  const session = useAppStore((s) => s.session);
  const setView = useAppStore((s) => s.setView);

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resetLinkSent, setResetLinkSent] = useState(false);

  function resetForm() {
    setEmail("");
    setPassword("");
    setError(null);
    setConfirmationSent(false);
    setUnconfirmed(false);
    setResent(false);
    setResetLinkSent(false);
    setMode("sign-in");
  }

  function handleClose() {
    closeAuth();
    resetForm();
  }

  useEscapeKey(handleClose, authOpen);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUnconfirmed(false);
    setResent(false);

    const { error } =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      setUnconfirmed(mode === "sign-in" && isUnconfirmedEmailError(error.message));
      return;
    }

    if (mode === "sign-up") {
      setConfirmationSent(true);
    } else {
      setView("project-space");
      handleClose();
    }
  }

  async function handleResend() {
    setResending(true);
    setResent(false);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (error) {
      setError(error.message);
    } else {
      setResent(true);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setResetLinkSent(true);
    }
  }

  return (
    <AnimatePresence>
      {authOpen && (
        <motion.div
          className="overlay auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="auth-card"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="panel-close" onClick={handleClose} aria-label="Close">
              ✕
            </button>
            <p className="eyebrow">PROJECT SPACE</p>

            {session ? (
              <>
                <h2>Welcome back.</h2>
                <p className="panel-intro">Signed in as {session.user.email}.</p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setView("project-space");
                    handleClose();
                  }}
                >
                  ACCESS YOUR PROJECT SPACE →
                </button>
              </>
            ) : confirmationSent ? (
              <>
                <h2>Check your inbox.</h2>
                <p className="panel-intro">
                  We sent a confirmation link to {email}. Confirm your address, then sign
                  in here.
                </p>
                <button
                  className="btn-outline"
                  onClick={() => {
                    setConfirmationSent(false);
                    setMode("sign-in");
                  }}
                >
                  BACK TO SIGN IN
                </button>
              </>
            ) : mode === "forgot-password" ? (
              resetLinkSent ? (
                <>
                  <h2>Check your inbox.</h2>
                  <p className="panel-intro">
                    We sent a password reset link to {email}. Follow it to choose a new
                    password.
                  </p>
                  <button className="btn-outline" onClick={() => setMode("sign-in")}>
                    BACK TO SIGN IN
                  </button>
                </>
              ) : (
                <>
                  <h2>Reset your password.</h2>
                  <p className="panel-intro">
                    Enter your email and we'll send you a link to choose a new password.
                  </p>
                  <form className="auth-form" onSubmit={handleForgotPassword}>
                    <label className="auth-field">
                      <span>Email</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </label>

                    {error && <p className="auth-error">{error}</p>}

                    <button className="btn-primary" type="submit" disabled={loading}>
                      {loading ? "SENDING..." : "SEND RESET LINK"}
                    </button>
                  </form>
                  <button className="auth-switch" onClick={() => setMode("sign-in")}>
                    Back to sign in
                  </button>
                </>
              )
            ) : (
              <>
                <h2>{mode === "sign-in" ? "Welcome back." : "Create your account."}</h2>
                <p className="panel-intro">
                  {mode === "sign-in"
                    ? "Sign in to access your project space."
                    : "Sign up to save projects, submit a brief, and track your request."}
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                  <label className="auth-field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </label>
                  <label className="auth-field">
                    <span>Password</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                    />
                  </label>

                  {error && <p className="auth-error">{error}</p>}
                  {resent && <p className="auth-success">Confirmation email resent — check your inbox.</p>}

                  <button className="btn-primary" type="submit" disabled={loading}>
                    {loading
                      ? "PLEASE WAIT..."
                      : mode === "sign-in"
                        ? "SIGN IN"
                        : "CREATE ACCOUNT"}
                  </button>

                  {unconfirmed && (
                    <button
                      type="button"
                      className="auth-switch"
                      onClick={handleResend}
                      disabled={resending}
                    >
                      {resending ? "Resending..." : "Resend confirmation email"}
                    </button>
                  )}

                  {mode === "sign-in" && !unconfirmed && (
                    <button
                      type="button"
                      className="auth-switch"
                      onClick={() => {
                        setError(null);
                        setMode("forgot-password");
                      }}
                    >
                      Forgot your password?
                    </button>
                  )}
                </form>

                <button
                  className="auth-switch"
                  onClick={() => {
                    setMode(mode === "sign-in" ? "sign-up" : "sign-in");
                    setError(null);
                    setUnconfirmed(false);
                  }}
                >
                  {mode === "sign-in"
                    ? "New here? Create an account"
                    : "Already have an account? Sign in"}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
