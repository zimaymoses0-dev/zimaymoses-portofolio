import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { supabase } from "../lib/supabaseClient";
import { Dashboard } from "./Dashboard";
import { NewRequestForm } from "./NewRequestForm";
import { SavedProjectsList } from "./SavedProjectsList";
import { ProfileSettings } from "./ProfileSettings";
import "./ProjectSpace.css";

type Tab = "dashboard" | "new-request" | "saved" | "profile";

export function ProjectSpace() {
  const session = useAppStore((s) => s.session);
  const setView = useAppStore((s) => s.setView);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  if (!session) {
    return (
      <div className="space-root space-signed-out">
        <p>You need to sign in to access your project space.</p>
        <button className="btn-space-dark" onClick={() => setView("immersive")}>
          BACK TO THE CREATIVE ROOM
        </button>
      </div>
    );
  }

  return (
    <div className="space-root">
      <header className="space-header">
        <div className="space-brand">
          <span className="space-brand-mark">MZ</span>
          <span className="space-brand-sub">PROJECT SPACE</span>
        </div>

        <nav className="space-tabs">
          <button className={tab === "dashboard" ? "active" : ""} onClick={() => setTab("dashboard")}>
            Dashboard
          </button>
          <button className={tab === "new-request" ? "active" : ""} onClick={() => setTab("new-request")}>
            New Request
          </button>
          <button className={tab === "saved" ? "active" : ""} onClick={() => setTab("saved")}>
            Saved Projects
          </button>
          <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>
            Profile
          </button>
        </nav>

        <div className="space-account">
          <span className="space-account-email">{session.user.email}</span>
          <button className="space-link" onClick={() => setView("immersive")}>
            Back to the Creative Room
          </button>
          <button className="space-link" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </header>

      <main className="space-main">
        {tab === "dashboard" && <Dashboard key={refreshKey} />}
        {tab === "new-request" && (
          <NewRequestForm
            onSubmitted={() => {
              setRefreshKey((k) => k + 1);
              setTab("dashboard");
            }}
          />
        )}
        {tab === "saved" && <SavedProjectsList />}
        {tab === "profile" && <ProfileSettings />}
      </main>
    </div>
  );
}
