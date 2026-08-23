// Content for the About page. Kept as plain data (like storyContent.ts) so it's
// easy to edit without touching component logic. Sections marked "PERSONALIZE"
// use safe, generic placeholder copy — real biographical specifics (location,
// dates, history, hobbies) weren't available, so nothing here was invented.

export const identityWords = [
  "MZ.",
  "MOSES.",
  "MOSES Z. ZIMAY.",
  "CREATIVE.",
  "STRATEGIST.",
  "MAKER.",
  "PROBLEM SOLVER.",
  "OR JUST CALL ME MZ.",
];

export const heroAnnotations = ["CREATIVE DIRECTOR", "DIGITAL EXPERIENCES", "STILL MAKING STUFF."];

export const storyParagraphs = [
  "I'm Moses.",
  "I like ideas — especially the ones that look impossible at first.",
  "Somewhere between creativity, technology and strategy, I found the thing I enjoy doing most: turning ideas into experiences people can actually see, use and remember.",
];

export const roles = [
  "CREATIVE DIRECTOR",
  "DIGITAL CREATIVE",
  "ART DIRECTION",
  "DIGITAL ADVERTISING",
  "WEB EXPERIENCES",
  "UI / UX",
  "BRAND THINKING",
  "CREATIVE STRATEGY",
];

// PERSONALIZE: replace with real chapters of the journey (dates, projects, names).
export const timelineChapters = [
  {
    chapter: "CHAPTER 01",
    title: "THE BEGINNING",
    body: "Discovering creativity. First projects, first experiments — figuring out what a good idea even feels like.",
  },
  {
    chapter: "CHAPTER 02",
    title: "MAKING THINGS",
    body: "Building the craft across design, advertising, digital creation, branding and web experiences.",
  },
  {
    chapter: "CHAPTER 03",
    title: "THINKING BIGGER",
    body: "Moving into creative direction and strategy — bigger ideas, bigger stakes, more ambitious work.",
  },
];

export const workspaceItems: { icon: string; label: string; represents: string; sectionId: string }[] = [
  { icon: "🖥", label: "SCREEN", represents: "Digital Experiences", sectionId: "work" },
  { icon: "📓", label: "NOTEBOOK", represents: "Ideas & Creative Direction", sectionId: "about" },
  { icon: "🗂", label: "FILES", represents: "Services", sectionId: "services" },
  { icon: "📱", label: "PHONE", represents: "Digital Advertising", sectionId: "digital-lab" },
  { icon: "🎬", label: "CAMERA", represents: "Visual Storytelling", sectionId: "visual-lab" },
];

export const principles = [
  { number: "01", title: "DESIGN IS NOT DECORATION.", body: "It should resolve, communicate, and provoke something." },
  {
    number: "02",
    title: "TECHNOLOGY IS A CREATIVE TOOL.",
    body: "Not used to impress — used to build better experiences.",
  },
  { number: "03", title: "SIMPLE DOESN'T MEAN BORING.", body: "An experience can be simple and still be memorable." },
  { number: "04", title: "MAKE IT MEAN SOMETHING.", body: "Every project needs an intention behind it." },
];

export const skillCategories = [
  { category: "THINKING", items: ["Creative Strategy", "Concept Development", "Campaign Ideas", "Problem Solving"] },
  { category: "DESIGNING", items: ["Art Direction", "Brand Identity", "Digital Advertising", "UI / UX"] },
  { category: "BUILDING", items: ["Web Experiences", "Digital Platforms", "Interactive Concepts"] },
  { category: "EXPLORING", items: ["AI", "Creative Technology", "New Media", "Digital Experiences"] },
];

// PERSONALIZE: swap these for real current interests.
export const personalNotes = [
  { label: "CURRENTLY EXPLORING", value: "Creative technology" },
  { label: "CURRENTLY OBSESSED WITH", value: "Better digital experiences" },
  { label: "CURRENTLY BUILDING", value: "New ideas" },
  { label: "CURRENTLY LEARNING", value: "Whatever helps me create better things" },
];

export const randomFacts = [
  "I probably have too many ideas open at the same time.",
  "I believe a good idea can come from anywhere.",
  "I enjoy turning \"What if?\" into something real.",
  "I care way too much about small details.",
  "I'm still learning. Always.",
];

export const collaborationPrinciples = [
  { title: "THINK", body: "Understand before creating." },
  { title: "CREATE", body: "Turn ideas into concepts and experiences." },
  { title: "MAKE IT REAL", body: "Take the idea all the way to something real." },
];
