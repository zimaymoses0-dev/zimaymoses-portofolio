import { Router } from "express";
import { requireUser } from "../supabaseAuth.js";

export const profileRouter = Router();

profileRouter.use(requireUser());

profileRouter.get("/", async (req, res) => {
  const { data, error } = await req
    .supabase!.from("profiles")
    .select("*")
    .eq("id", req.supabaseAuth!.userClaims!.id)
    .maybeSingle();

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.json({ profile: data });
});

profileRouter.patch("/", async (req, res) => {
  const { firstName, lastName, phone, companyName, jobTitle } = req.body ?? {};

  const { data, error } = await req
    .supabase!.from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone,
      company_name: companyName,
      job_title: jobTitle,
    })
    .eq("id", req.supabaseAuth!.userClaims!.id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.json({ profile: data });
});
