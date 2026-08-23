import { useState } from "react";
import { submitContact } from "../lib/api";

export function QuickContactForm({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await submitContact({
        name,
        email,
        message,
        companyName: "",
        projectType: "",
        budgetRange: "",
      });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return <p className="auth-success">Message sent — thanks, I'll get back to you soon.</p>;
  }

  if (!open) {
    return (
      <button className="auth-switch" onClick={() => setOpen(true)}>
        Or send a quick message instead
      </button>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="auth-field">
        <span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="auth-field">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="auth-field">
        <span>Message</span>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </label>

      {error && <p className="auth-error">{error}</p>}

      <button className="btn-outline" type="submit" disabled={sending}>
        {sending ? "SENDING..." : "SEND MESSAGE"}
      </button>
    </form>
  );
}
