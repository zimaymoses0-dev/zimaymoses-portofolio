export interface TimelineChapter {
  number: string;
  label: string;
  title: string[];
  body: string;
  types: string[] | null;
  cta?: boolean;
}

export const timelineChapters: TimelineChapter[] = [
  {
    number: "01",
    label: "BEGINNING",
    title: ["WHERE IT", "STARTED."],
    body: "The first stage of my creative and professional journey — before certificates, before clients, just curiosity.",
    types: null,
  },
  {
    number: "02",
    label: "LEARNING",
    title: ["BUILDING THE", "FOUNDATION."],
    body: "The diplomas, schools and courses that gave the work its structure.",
    types: ["degree", "course"],
  },
  {
    number: "03",
    label: "SPECIALIZING",
    title: ["GOING", "DEEPER."],
    body: "Advanced certifications and specializations that sharpened a specific craft.",
    types: ["certificate", "specialization", "award"],
  },
  {
    number: "04",
    label: "APPLYING",
    title: ["MAKING KNOWLEDGE", "USEFUL."],
    body: "None of it means anything until it shows up in real work, for real clients.",
    types: null,
    cta: true,
  },
];

export const nowChapter = {
  label: "NOW",
  title: ["STILL", "LEARNING."],
  body: "The certificate may have an end date. Learning doesn't.",
};

export const bigStatementSequence: { lines: string[]; big?: boolean }[] = [
  { lines: ["I DIDN'T", "COLLECT", "CERTIFICATES."] },
  { lines: ["I COLLECTED"] },
  { lines: ["SKILLS."] },
  { lines: ["EXPERIENCE."] },
  { lines: ["PROOF."], big: true },
];

export const combinationWords = ["EDUCATION", "DESIGN", "TECHNOLOGY", "BUSINESS", "CREATIVITY"];

export const CREDENTIAL_TYPE_LABEL: Record<string, string> = {
  degree: "Degree",
  certificate: "Certificate",
  course: "Course",
  award: "Award",
  specialization: "Specialization",
};
