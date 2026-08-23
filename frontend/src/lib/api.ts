import type { SectionId, SectionItem } from "../data/sections";
import { supabase } from "./supabaseClient";

const API_URL = import.meta.env.VITE_API_URL;

interface PortfolioProjectRow {
  id: string;
  title: string;
  short_description: string | null;
}

interface ServiceRow {
  id: string;
  title: string;
  short_description: string | null;
}

interface SiteSettingsRow {
  owner_name: string | null;
  owner_title: string | null;
  about_short: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
}

async function getJson(path: string) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchContentItems(section: SectionId): Promise<SectionItem[]> {
  if (section === "contact") return [];

  if (section === "services") {
    const { services }: { services: ServiceRow[] } = await getJson("/services");
    return services.map((s) => ({ id: s.id, title: s.title, subtitle: s.short_description ?? "" }));
  }

  if (section === "about") {
    const { settings }: { settings: SiteSettingsRow | null } = await getJson("/site-settings");
    if (!settings) return [];
    return [
      {
        id: "about",
        title: settings.owner_name ?? "About",
        subtitle: settings.about_short ?? settings.hero_subtitle ?? "",
      },
    ];
  }

  // work | digital-lab | visual-lab
  const { projects }: { projects: PortfolioProjectRow[] } = await getJson(
    `/portfolio-projects?category=${section}`
  );
  return projects.map((p) => ({ id: p.id, title: p.title, subtitle: p.short_description ?? "" }));
}

async function authFetch(path: string, options: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Not signed in.");

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed with status ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export interface ProjectRequest {
  id: string;
  reference_number: string;
  company_name: string | null;
  industry: string | null;
  project_type: string;
  project_title: string | null;
  project_description: string;
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  desired_start_date: string | null;
  desired_deadline: string | null;
  status: string;
  created_at: string;
}

export interface NewProjectRequestPayload {
  companyName: string;
  industry: string;
  projectType: string;
  projectTitle: string;
  projectDescription: string;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  desiredStartDate: string;
  desiredDeadline: string;
  savedItemIds: string[];
}

export async function getProjectRequests(): Promise<ProjectRequest[]> {
  const data = await authFetch("/project-requests");
  return data.requests;
}

export async function createProjectRequest(
  payload: NewProjectRequestPayload
): Promise<ProjectRequest> {
  const data = await authFetch("/project-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.request;
}

export interface SavedProject {
  id: string;
  created_at: string;
  portfolio_projects: {
    id: string;
    title: string;
    short_description: string | null;
  } | null;
}

export async function getSavedProjects(): Promise<SavedProject[]> {
  const data = await authFetch("/saved-projects");
  return data.saved;
}

export async function saveProject(projectId: string): Promise<void> {
  await authFetch("/saved-projects", {
    method: "POST",
    body: JSON.stringify({ projectId }),
  });
}

export async function removeSavedProject(projectId: string): Promise<void> {
  await authFetch(`/saved-projects/${projectId}`, { method: "DELETE" });
}

export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company_name: string | null;
  job_title: string | null;
}

export interface ProfileUpdatePayload {
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  jobTitle: string;
}

export async function getProfile(): Promise<Profile | null> {
  const data = await authFetch("/profile");
  return data.profile;
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<Profile> {
  const data = await authFetch("/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.profile;
}

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  companyName: string;
  projectType: string;
  budgetRange: string;
  message: string;
}

export type CredentialType = "degree" | "certificate" | "course" | "award" | "specialization";

export interface CredentialListItem {
  id: string;
  title: string;
  slug: string;
  credential_type: CredentialType;
  institution: string;
  field: string;
  level: string;
  issue_date: string | null;
  expiration_date: string | null;
  skills: string[];
  is_featured: boolean;
  display_order: number;
}

export interface CredentialRelatedProject {
  id: string;
  title: string;
  slug: string;
}

export interface CredentialDetail extends CredentialListItem {
  description: string;
  credential_id: string;
  verification_url: string;
  certificate_image: string;
  related_projects: CredentialRelatedProject[];
}

export async function fetchCredentials(): Promise<CredentialListItem[]> {
  const { credentials }: { credentials: CredentialListItem[] } = await getJson("/credentials");
  return credentials;
}

export async function fetchFeaturedCredentials(): Promise<CredentialListItem[]> {
  const { credentials }: { credentials: CredentialListItem[] } = await getJson("/credentials/featured");
  return credentials;
}

export async function fetchCredentialBySlug(slug: string): Promise<CredentialDetail> {
  const { credential }: { credential: CredentialDetail } = await getJson(
    `/credentials/${encodeURIComponent(slug)}`
  );
  return credential;
}

export async function submitContact(payload: ContactSubmissionPayload): Promise<void> {
  const res = await fetch(`${API_URL}/contact-submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed with status ${res.status}`);
  }
}
