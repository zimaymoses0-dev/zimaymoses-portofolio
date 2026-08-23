import { Router } from "express";
import { requireUser } from "../supabaseAuth.js";

export const savedProjectsRouter = Router();

savedProjectsRouter.use(requireUser());

savedProjectsRouter.get("/", async (req, res) => {
  const { data, error } = await req
    .supabase!.from("saved_projects")
    .select("id, created_at, portfolio_projects(id, title, slug, short_description)")
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.json({ saved: data });
});

savedProjectsRouter.post("/", async (req, res) => {
  const profileId = req.supabaseAuth!.userClaims!.id;
  const { projectId } = req.body ?? {};

  if (!projectId) {
    res.status(400).json({ message: "projectId is required" });
    return;
  }

  const { data, error } = await req
    .supabase!.from("saved_projects")
    .insert({ profile_id: profileId, project_id: projectId })
    .select()
    .single();

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.status(201).json({ saved: data });
});

savedProjectsRouter.delete("/:projectId", async (req, res) => {
  const { error } = await req
    .supabase!.from("saved_projects")
    .delete()
    .eq("project_id", req.params.projectId);

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.status(204).send();
});
