import { Router } from "express";
import { createContextClient } from "@supabase/server/core";
import type { SupabaseClient } from "@supabase/supabase-js";

export const contactSubmissionsRouter = Router();

contactSubmissionsRouter.post("/", async (req, res) => {
  const { name, email, companyName, projectType, budgetRange, message } = req.body ?? {};

  if (!name || !email || !message) {
    res.status(400).json({ message: "name, email, and message are required" });
    return;
  }

  const supabase: SupabaseClient = createContextClient();
  const { error } = await supabase.from("contact_submissions").insert({
    name,
    email,
    company_name: companyName || null,
    project_type: projectType || null,
    budget_range: budgetRange || null,
    message,
  });

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.status(201).json({ ok: true });
});
