export interface StoryChapter {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  note: string;
  cta: string;
  theme: "temple" | "renaissance" | "cosmos";
  videoSrc?: string;
}

export const storyChapters: StoryChapter[] = [
  {
    id: "origins",
    eyebrow: "UNIVERS I — LE SANCTUAIRE DU TEMPS",
    title: "Les Origines Sacrées",
    body: "Bien avant les banques en verre et les algorithmes, la richesse avait des gardiens sacrés. En Mésopotamie, les premiers comptables étaient des prêtres. Sous la lueur des torches, ils gravaient le bétail et le grain dans l'argile. L'écriture est née d'un besoin de compter. Vous n'entrez pas dans une science froide, vous entrez dans le plus vieux secret de l'humanité : l'art de figer le monde réel dans la pierre.",
    note: "La comptabilité est l'ancêtre direct de toute l'écriture humaine. Elle est née pour capturer le passé et établir la vérité.",
    cta: "Prêter serment de prudence →",
    theme: "temple",
  },
  {
    id: "duality",
    eyebrow: "UNIVERS II — L'ÉQUILIBRE DIVIN",
    title: "L'Alchimie de la Partie Double",
    body: "En 1494, dans l'ombre des ateliers de Venise, un moine franciscain et ami de Léonard de Vinci codifie une loi universelle : la partie double. Débit. Crédit. Un miroir parfait où chaque action engendre sa réaction. Pour Luca Pacioli, ce système n'est pas une simple technique commerciale, c'est le reflet de l'harmonie divine. Rien ne se perd, rien ne se crée, tout s'équilibre. Entrez dans le grand livre de l'ordre face au chaos.",
    note: "Le principe du Bilan comptable (Actif = Passif) impose une structure où le passé d'une entreprise doit toujours être parfaitement transparent et équilibré.",
    cta: "Ouvrir le grand livre →",
    theme: "renaissance",
  },
  {
    id: "quantum",
    eyebrow: "UNIVERS III — LA FINANCE QUANTIQUE",
    title: "Les Maîtres du Temps et du Néant",
    body: "Ici, la matière s'efface. La finance moderne ne regarde pas le passé, elle plie le futur. Elle monétise le temps par les taux d'intérêt, fait voyager la valeur à travers les époques et crée de la richesse « ex nihilo » — d'une simple écriture numérique. C'est un monde de pure foi collective : une action n'a de valeur que parce que le monde entier croit en son avenir. Vous êtes au cœur du grand casino mathématique, là où la psychologie humaine façonne la réalité.",
    note: "Contrairement à la comptabilité qui fige le passé avec prudence, la finance spécule sur l'avenir, manipule le risque et crée de la monnaie par le crédit.",
    cta: "Tenter le voyage vers le futur →",
    theme: "cosmos",
    videoSrc: "/bg02.mp4",
  },
];
