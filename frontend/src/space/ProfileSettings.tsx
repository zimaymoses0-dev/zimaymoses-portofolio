import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../lib/api";

export function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  useEffect(() => {
    getProfile()
      .then((profile) => {
        if (profile) {
          setFirstName(profile.first_name ?? "");
          setLastName(profile.last_name ?? "");
          setPhone(profile.phone ?? "");
          setCompanyName(profile.company_name ?? "");
          setJobTitle(profile.job_title ?? "");
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({ firstName, lastName, phone, companyName, jobTitle });
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="space-muted">Loading…</p>;

  return (
    <div>
      <h1 className="space-greeting">Your Profile</h1>
      <p className="space-subgreeting">Used to personalize your project requests.</p>

      <form className="request-form" onSubmit={handleSubmit}>
        <div className="step-panel">
          <label className="field">
            <span>First name</span>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>
          <label className="field">
            <span>Last name</span>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </label>
          <label className="field">
            <span>Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="field">
            <span>Company</span>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </label>
          <label className="field">
            <span>Job title</span>
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          </label>
        </div>

        {error && <p className="space-error">{error}</p>}
        {saved && <p className="space-success">Profile updated.</p>}

        <div className="step-actions">
          <button className="btn-space-dark" type="submit" disabled={saving}>
            {saving ? "SAVING..." : "SAVE PROFILE"}
          </button>
        </div>
      </form>
    </div>
  );
}
