export const introWords = ["AN IDEA.", "A QUESTION.", "A PROBLEM.", "A VISION.", "SOMETHING REAL."];

export type FilterTag = "BRANDING" | "DIGITAL" | "WEB" | "CAMPAIGNS" | "EXPERIMENTS";

export interface WorkProject {
  id: string;
  title: string;
  categories: string[];
  filterTag: FilterTag;
  description: string;
  gradient: string;
  featured?: boolean;
  client?: string;
  year?: string;
  role?: string[];
}

// PERSONALIZE: swap gradients for real cover images/videos once available,
// and fill in real client/year/role details.
export const projects: WorkProject[] = [
  {
    id: "mindflow",
    title: "MINDFLOW",
    categories: ["Creative Direction", "Brand Identity", "Digital Advertising"],
    filterTag: "BRANDING",
    description: "Brand identity and product design for a platform built around clarity and calm.",
    gradient: "linear-gradient(135deg, #5865ff 0%, #ff5c8a 100%)",
    featured: true,
    client: "MINDFLOW",
    year: "2026",
    role: ["Creative Direction", "Digital Advertising", "Visual Design"],
  },
  {
    id: "oiac",
    title: "OIAC",
    categories: ["Digital Campaign", "Art Direction"],
    filterTag: "CAMPAIGNS",
    description: "A digital campaign built around bold art direction and a clear point of view.",
    gradient: "linear-gradient(135deg, #d9a441 0%, #7a4a1a 100%)",
  },
  {
    id: "nci",
    title: "NCI WEBSITE",
    categories: ["Web Design", "Digital Experience"],
    filterTag: "WEB",
    description: "A full website design and build, from first sketch to shipped product.",
    gradient: "linear-gradient(135deg, #2b2b33 0%, #5cd0ff 100%)",
  },
  {
    id: "campaign-01",
    title: "CAMPAIGN 01",
    categories: ["Digital Campaign"],
    filterTag: "CAMPAIGNS",
    description: "A social ad series designed to stop the scroll.",
    gradient: "linear-gradient(135deg, #ff5c8a 0%, #7a1a3a 100%)",
  },
  {
    id: "campaign-02",
    title: "CAMPAIGN 02",
    categories: ["Digital Campaign", "Motion"],
    filterTag: "CAMPAIGNS",
    description: "A product launch campaign built for momentum.",
    gradient: "linear-gradient(135deg, #7ea9ff 0%, #1a1440 100%)",
  },
  {
    id: "series-a",
    title: "SERIES A",
    categories: ["Visual Design", "Experiments"],
    filterTag: "EXPERIMENTS",
    description: "A set of poster experiments exploring type, texture and contrast.",
    gradient: "linear-gradient(135deg, #f4d35e 0%, #1a1a1a 100%)",
  },
  {
    id: "series-b",
    title: "SERIES B",
    categories: ["Visual Design", "Experiments"],
    filterTag: "EXPERIMENTS",
    description: "Typographic studies exploring rhythm and scale.",
    gradient: "linear-gradient(135deg, #eeeeee 0%, #444444 100%)",
  },
];

export const filterOptions: ("ALL" | FilterTag)[] = ["ALL", "BRANDING", "DIGITAL", "WEB", "CAMPAIGNS", "EXPERIMENTS"];

export const processSteps = [
  { number: "01", title: "THINK", body: "Understand the problem." },
  { number: "02", title: "EXPLORE", body: "Explore ideas and possibilities." },
  { number: "03", title: "CREATE", body: "Build the creative direction." },
  { number: "04", title: "REFINE", body: "Sharpen every detail." },
  { number: "05", title: "MAKE IT REAL", body: "Turn the idea into a real experience." },
];
