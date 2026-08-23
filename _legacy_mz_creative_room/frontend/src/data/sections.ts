export type SectionId =
  | "work"
  | "about"
  | "services"
  | "digital-lab"
  | "visual-lab"
  | "contact";

export interface SectionItem {
  id: string;
  title: string;
  subtitle: string;
}

export interface Section {
  id: SectionId;
  objectLabel: string;
  title: string;
  intro: string;
}

export const sections: Record<SectionId, Section> = {
  work: {
    id: "work",
    objectLabel: "SCREEN",
    title: "WORK",
    intro: "Projects and case studies.",
  },
  about: {
    id: "about",
    objectLabel: "NOTEBOOK",
    title: "ABOUT",
    intro: "My story, my path, my personality.",
  },
  services: {
    id: "services",
    objectLabel: "FILES",
    title: "SERVICES",
    intro: "What I offer.",
  },
  "digital-lab": {
    id: "digital-lab",
    objectLabel: "PHONE",
    title: "DIGITAL LAB",
    intro: "Ad campaigns and digital creations.",
  },
  "visual-lab": {
    id: "visual-lab",
    objectLabel: "CAMERA",
    title: "VISUAL LAB",
    intro: "Posters, experiments, and visual creations.",
  },
  contact: {
    id: "contact",
    objectLabel: "CARD",
    title: "CONTACT",
    intro: "Ready to start something together?",
  },
};

export const sectionOrder: SectionId[] = [
  "work",
  "about",
  "services",
  "digital-lab",
  "visual-lab",
  "contact",
];

// Only portfolio projects can be bookmarked (saved_projects references
// portfolio_projects) — services and the about blurb aren't real rows.
export const savableSections: SectionId[] = ["work", "digital-lab", "visual-lab"];
