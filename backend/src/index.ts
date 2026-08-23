import "dotenv/config";
import express from "express";
import cors from "cors";
import { requireUser } from "./supabaseAuth.js";
import { contentRouter } from "./routes/content.js";
import { projectRequestsRouter } from "./routes/projectRequests.js";
import { savedProjectsRouter } from "./routes/savedProjects.js";
import { profileRouter } from "./routes/profile.js";
import { contactSubmissionsRouter } from "./routes/contactSubmissions.js";
import { credentialsRouter } from "./routes/credentials.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/me", requireUser(), (req, res) => {
  res.json({ user: req.supabaseAuth?.userClaims });
});

app.use("/", contentRouter);
app.use("/project-requests", projectRequestsRouter);
app.use("/saved-projects", savedProjectsRouter);
app.use("/profile", profileRouter);
app.use("/contact-submissions", contactSubmissionsRouter);
app.use("/credentials", credentialsRouter);

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
