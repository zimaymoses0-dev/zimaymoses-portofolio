export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    id: 1,
    question: "What kind of projects do you work on?",
    answer:
      "Creative and digital projects: campaigns, branding, web experiences, digital platforms and visual systems.",
  },
  {
    id: 2,
    question: "How does your creative process work?",
    answer: "Think, explore, create, refine, then make it real. Every project moves through the same rhythm.",
  },
  {
    id: 3,
    question: "Can we work together on a full digital experience?",
    answer: "Yes — from the first idea to a shipped, working product.",
  },
  {
    id: 4,
    question: "How long does a project usually take?",
    answer: "It depends on scope, but most projects move in weeks, not months. We'll set a timeline together.",
  },
  {
    id: 5,
    question: "Do you work with brands outside Côte d'Ivoire?",
    answer: "Yes. Distance isn't a blocker — most of the process happens remotely anyway.",
  },
  {
    id: 6,
    question: "How do I start a project with you?",
    answer: "Hit \"Start a Project\" below, tell me what you're working on, and we'll take it from there.",
  },
];

export const footerLinks = [
  { label: "WORK", view: "work-overview" as const },
  { label: "ABOUT", view: "about" as const },
];
