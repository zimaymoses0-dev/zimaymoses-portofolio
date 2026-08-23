import { useEffect, useState } from "react";
import { createProjectRequest, getSavedProjects, type SavedProject } from "../lib/api";

const PROJECT_TYPES = [
  "Branding",
  "Advertising Campaign",
  "Website",
  "UI/UX",
  "Art Direction",
  "Other",
];

const CURRENCIES = ["XOF", "USD", "EUR"];

const STEPS = ["About You", "Your Project", "Your Goals", "Budget", "Timeline", "Submit"];

interface Props {
  onSubmitted: () => void;
}

export function NewRequestForm({ onSubmitted }: Props) {
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [desiredStartDate, setDesiredStartDate] = useState("");
  const [desiredDeadline, setDesiredDeadline] = useState("");
  const [savedItems, setSavedItems] = useState<SavedProject[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSavedProjects()
      .then(setSavedItems)
      .catch(() => {});
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await createProjectRequest({
        companyName,
        industry,
        projectType,
        projectTitle,
        projectDescription,
        budgetMin: budgetMin ? Number(budgetMin) : null,
        budgetMax: budgetMax ? Number(budgetMax) : null,
        currency,
        desiredStartDate,
        desiredDeadline,
        savedItemIds: selectedItemIds,
      });
      onSubmitted();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const isLast = step === STEPS.length - 1;

  return (
    <div className="request-form">
      <div className="step-indicator">
        {STEPS.map((label, i) => (
          <span key={label} className={`step ${i === step ? "active" : i < step ? "done" : ""}`}>
            {String(i + 1).padStart(2, "0")} — {label}
          </span>
        ))}
      </div>

      <div className="step-panel">
        {step === 0 && (
          <>
            <label className="field">
              <span>Company</span>
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </label>
            <label className="field">
              <span>Industry</span>
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <label className="field">
              <span>What do you want to create?</span>
              <select value={projectType} onChange={(e) => setProjectType(e.target.value)}>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Project title (optional)</span>
              <input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
            </label>
          </>
        )}

        {step === 2 && (
          <label className="field">
            <span>What are you trying to achieve?</span>
            <textarea
              rows={5}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              required
            />
          </label>
        )}

        {step === 3 && (
          <>
            <label className="field">
              <span>Budget min</span>
              <input type="number" min="0" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
            </label>
            <label className="field">
              <span>Budget max</span>
              <input type="number" min="0" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
            </label>
            <label className="field">
              <span>Currency</span>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {step === 4 && (
          <>
            <label className="field">
              <span>Desired start date</span>
              <input
                type="date"
                value={desiredStartDate}
                onChange={(e) => setDesiredStartDate(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Deadline (optional)</span>
              <input
                type="date"
                value={desiredDeadline}
                onChange={(e) => setDesiredDeadline(e.target.value)}
              />
            </label>
          </>
        )}

        {step === 5 && (
          <>
            {savedItems.length > 0 && (
              <div className="field">
                <span>Inspired by (optional)</span>
                <div className="saved-picker">
                  {savedItems.map(
                    (s) =>
                      s.portfolio_projects && (
                        <label key={s.id} className="saved-picker-item">
                          <input
                            type="checkbox"
                            checked={selectedItemIds.includes(s.portfolio_projects.id)}
                            onChange={(e) => {
                              const id = s.portfolio_projects!.id;
                              setSelectedItemIds((prev) =>
                                e.target.checked ? [...prev, id] : prev.filter((x) => x !== id)
                              );
                            }}
                          />
                          {s.portfolio_projects.title}
                        </label>
                      )
                  )}
                </div>
              </div>
            )}
            {error && <p className="space-error">{error}</p>}
          </>
        )}
      </div>

      <div className="step-actions">
        {step > 0 && (
          <button className="btn-space-outline" onClick={() => setStep((s) => s - 1)} disabled={submitting}>
            BACK
          </button>
        )}
        {!isLast && (
          <button
            className="btn-space-dark"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 2 && !projectDescription.trim()}
          >
            NEXT
          </button>
        )}
        {isLast && (
          <button className="btn-space-dark" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "SUBMITTING..." : "CREATE PROJECT REQUEST →"}
          </button>
        )}
      </div>
    </div>
  );
}
