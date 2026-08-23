import { Router } from "express";
import { createContextClient } from "@supabase/server/core";
import type { SupabaseClient } from "@supabase/supabase-js";

export const credentialsRouter = Router();

const LIST_COLUMNS =
  "id, title, slug, credential_type, institution, field, level, issue_date, expiration_date, skills, is_featured, display_order";

credentialsRouter.get("/", async (req, res) => {
  const supabase = createContextClient();
  const featuredOnly = req.query.featured === "true";

  let query = supabase
    .from("credentials")
    .select(LIST_COLUMNS)
    .eq("is_published", true)
    .order("issue_date", { ascending: true });

  if (featuredOnly) query = query.eq("is_featured", true);

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.json({ credentials: data });
});

credentialsRouter.get("/timeline", async (_req, res) => {
  const supabase = createContextClient();

  const { data, error } = await supabase
    .from("credentials")
    .select(LIST_COLUMNS)
    .eq("is_published", true)
    .order("issue_date", { ascending: true });

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.json({ credentials: data });
});

credentialsRouter.get("/featured", async (_req, res) => {
  const supabase = createContextClient();

  const { data, error } = await supabase
    .from("credentials")
    .select(LIST_COLUMNS)
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("display_order", { ascending: true });

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.json({ credentials: data });
});

credentialsRouter.get("/:slug", async (req, res) => {
  const supabase: SupabaseClient = createContextClient();

  const { data: credential, error } = await supabase
    .from("credentials")
    .select(
      "id, title, slug, credential_type, institution, description, field, level, issue_date, expiration_date, credential_id, verification_url, certificate_image, skills, is_featured"
    )
    .eq("slug", req.params.slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  if (!credential) {
    res.status(404).json({ message: "Credential not found." });
    return;
  }

  const { data: relatedProjects, error: relatedError } = await supabase
    .from("credential_projects")
    .select("portfolio_projects(id, title, slug)")
    .eq("credential_id", credential.id);

  if (relatedError) {
    res.status(500).json({ message: relatedError.message });
    return;
  }

  res.json({
    credential: {
      ...credential,
      related_projects: (relatedProjects ?? []).map((row) => row.portfolio_projects).filter(Boolean),
    },
  });
});
