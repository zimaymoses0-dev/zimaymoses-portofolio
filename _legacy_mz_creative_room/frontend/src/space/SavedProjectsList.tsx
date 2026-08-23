import { useEffect, useState } from "react";
import { getSavedProjects, removeSavedProject, type SavedProject } from "../lib/api";

export function SavedProjectsList() {
  const [items, setItems] = useState<SavedProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    getSavedProjects()
      .then(setItems)
      .catch((err: Error) => setError(err.message));
  }

  useEffect(load, []);

  async function handleRemove(projectId: string) {
    await removeSavedProject(projectId);
    load();
  }

  const withContent = items?.filter((i) => i.portfolio_projects) ?? [];

  return (
    <div>
      <h1 className="space-greeting">Saved Projects</h1>

      {error && <p className="space-error">Couldn't load saved projects ({error}).</p>}
      {!error && items === null && <p className="space-muted">Loading…</p>}
      {items && withContent.length === 0 && (
        <p className="space-muted">
          Nothing saved yet — explore the Creative Room and bookmark projects you like.
        </p>
      )}

      {withContent.length > 0 && (
        <ul className="saved-list">
          {withContent.map((item) => (
            <li key={item.id} className="saved-card">
              <div>
                <div className="saved-card-title">{item.portfolio_projects!.title}</div>
                <div className="saved-card-subtitle">{item.portfolio_projects!.short_description}</div>
              </div>
              <button className="space-link" onClick={() => handleRemove(item.portfolio_projects!.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
