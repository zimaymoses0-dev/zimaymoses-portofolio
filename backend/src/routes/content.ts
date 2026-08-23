import { Router } from "express";
import { createContextClient } from "@supabase/server/core";

export const contentRouter = Router();

contentRouter.get("/portfolio-projects", async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const supabase = createContextClient();

  let query = supabase
    .from("portfolio_projects")
    .select(
      category
        ? "id, title, slug, short_description, cover_image_url, display_order, categories:portfolio_project_categories!inner(category:project_categories!inner(slug))"
        : "id, title, slug, short_description, cover_image_url, display_order"
    )
    .order("display_order", { ascending: true });

  if (category) query = query.eq("categories.category.slug", category);

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.json({ projects: data });
});

contentRouter.get("/services", async (_req, res) => {
  const supabase = createContextClient();

  const { data, error } = await supabase
    .from("services")
    .select("id, title, slug, short_description, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.json({ services: data });
});

contentRouter.get("/site-settings", async (_req, res) => {
  const supabase = createContextClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("site_name, owner_name, owner_title, about_short, hero_title, hero_subtitle")
    .maybeSingle();

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.json({ settings: data });
});
