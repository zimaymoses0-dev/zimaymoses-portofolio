import { Router } from "express";
import { requireUser } from "../supabaseAuth.js";

export const projectRequestsRouter = Router();

projectRequestsRouter.use(requireUser());

projectRequestsRouter.get("/", async (req, res) => {
  const { data, error } = await req
    .supabase!.from("project_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.json({ requests: data });
});

projectRequestsRouter.post("/", async (req, res) => {
  const profileId = req.supabaseAuth!.userClaims!.id;
  const {
    companyName,
    industry,
    projectType,
    projectTitle,
    projectDescription,
    budgetMin,
    budgetMax,
    currency,
    desiredStartDate,
    desiredDeadline,
    savedItemIds,
  } = req.body ?? {};

  const { data: request, error } = await req
    .supabase!.from("project_requests")
    .insert({
      profile_id: profileId,
      company_name: companyName,
      industry,
      project_type: projectType,
      project_title: projectTitle,
      project_description: projectDescription,
      budget_min: budgetMin || null,
      budget_max: budgetMax || null,
      currency: currency || "XOF",
      desired_start_date: desiredStartDate || null,
      desired_deadline: desiredDeadline || null,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  if (Array.isArray(savedItemIds) && savedItemIds.length > 0) {
    await req.supabase!.from("project_request_inspirations").insert(
      savedItemIds.map((portfolioProjectId: string) => ({
        project_request_id: request.id,
        portfolio_project_id: portfolioProjectId,
      }))
    );
  }

  res.status(201).json({ request });
});
