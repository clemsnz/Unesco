/**
 * ─────────────────────────────────────────────────────────────
 *  PAGE « À PROPOS » : présentation, parcours, compétences, outils.
 *  Pour ajouter une expérience : copie une ligne de `timeline`.
 * ─────────────────────────────────────────────────────────────
 */
import type { L } from "@/lib/i18n";

export const portrait = {
  src: "/images/about/portrait.webp",
  alt: { fr: "Portrait de Clémentine Sanchez en plateau à l’EFAP", en: "Portrait of Clémentine Sanchez on set at EFAP" } as L,
  caption: { fr: "En plateau à l’EFAP — chronique sur le Marathon de Paris 2026.", en: "On set at EFAP — a news segment on the 2026 Paris Marathon." } as L,
  ratio: 1180 / 1320,
};

export const bio: L[] = [
  {
    fr: "Mon parcours commence à Toulouse — une année préparatoire en économie-gestion à l’Université Toulouse Capitole, puis l’EFAP — et se poursuit à Paris, en Master 1 Full English.",
    en: "My path began in Toulouse — a preparatory year in economics and management at Toulouse Capitole University, then EFAP — and continues in Paris, on the Full English Master’s track.",
  },
  {
    fr: "Depuis 2024, j’ai multiplié les terrains : un festival de danse, une street-food alsacienne, un parlement étudiant, puis une marque de bien-être premium dont les matelas équipent un palace parisien. Ce qui relie tout cela : comprendre ce qu’une marque veut faire ressentir, et organiser chaque détail pour que ce soit le cas.",
    en: "Since 2024 I have worked across very different settings: a dance festival, an Alsatian street-food spot, a student parliament, then a premium wellness brand whose mats equip a Parisian palace hotel. The common thread: understanding what a brand wants people to feel, and organising every detail so they do.",
  },
  {
    fr: "En parallèle de mes études, j’ai travaillé en salle et à l’accueil — chef d’équipe chez Pokawa, restaurants et clubs à Toulouse et Biarritz. Une école de l’expérience client à part entière.",
    en: "Alongside my studies I have worked front-of-house — team leader at Pokawa, restaurants and clubs in Toulouse and Biarritz. A school of customer experience in its own right.",
  },
];

export const personal: { title: L; text: L }[] = [
  {
    title: { fr: "Face caméra", en: "On camera" },
    text: {
      fr: "1 min 30, une caméra, une chronique sur le Marathon de Paris 2026. On ne récite pas : on incarne.",
      en: "90 seconds, one camera, a segment on the 2026 Paris Marathon. You don’t recite — you embody.",
    },
  },
  {
    title: { fr: "Mouvement", en: "Movement" },
    text: {
      fr: "La danse et le Pilates — un rapport au corps et au rythme qui m’a menée naturellement vers l’univers du bien-être.",
      en: "Dance and Pilates — a feel for body and rhythm that led me naturally to the world of wellness.",
    },
  },
  {
    title: { fr: "Mode, musique, voyages", en: "Fashion, music, travel" },
    text: {
      fr: "Des sources d’inspiration quotidiennes pour observer comment les marques construisent leurs univers.",
      en: "Everyday sources of inspiration for watching how brands build their worlds.",
    },
  },
  {
    title: { fr: "Engagement", en: "Commitment" },
    text: {
      fr: "Bénévole chez Refuges Solidaires en 2022.",
      en: "Volunteer with Refuges Solidaires in 2022.",
    },
  },
];

export type TimelineItem = {
  period: L;
  title: L;
  org: L | string;
  place: string;
  kind: "work" | "school" | "award";
  text?: L;
  /** lien vers un projet du portfolio (slug) */
  project?: string;
};

export const timeline: TimelineItem[] = [
  {
    period: { fr: "2026 — 2027", en: "2026 — 2027" },
    title: { fr: "Master 1 Communication — Full English", en: "Master’s in Communication, Year 1 — Full English" },
    org: "EFAP",
    place: "Paris",
    kind: "school",
  },
  {
    period: { fr: "2026", en: "2026" },
    title: { fr: "Big Battle — 1ʳᵉ à Paris, 3ᵉ au national", en: "Big Battle — 1st in Paris, 3rd nationally" },
    org: "EFAP × Parc Astérix",
    place: "Paris",
    kind: "award",
    project: "big-battle-parc-asterix",
  },
  {
    period: { fr: "Janv. — mars 2026", en: "Jan — Mar 2026" },
    title: { fr: "Communication digitale & marketing — freelance", en: "Digital Communications & Marketing — freelance" },
    org: "Charlotte Muller Method",
    place: "Paris",
    kind: "work",
    text: { fr: "Studio digital, couvertures vidéo, suivi des publications, Wellness Journal.", en: "Digital studio, video covers, publication monitoring, Wellness Journal." },
    project: "charlotte-muller",
  },
  {
    period: { fr: "Sept. — déc. 2025", en: "Sep — Dec 2025" },
    title: { fr: "Assistante communication & marketing — stage", en: "Communications & Marketing Assistant — internship" },
    org: "Charlotte Muller Method",
    place: "Paris",
    kind: "work",
    text: { fr: "Influence, RP & événements, contenus, CRM, suivi de KPI.", en: "Influencer, PR & events, content, CRM, KPI tracking." },
    project: "charlotte-muller",
  },
  {
    period: { fr: "Janv. — mars 2025", en: "Jan — Mar 2025" },
    title: { fr: "Communication & social media — stage", en: "Communications & Social Media — internship" },
    org: "Hopla Street Food Alsacienne",
    place: "Toulouse",
    kind: "work",
    project: "hopla",
  },
  {
    period: { fr: "2024 — 2025", en: "2024 — 2025" },
    title: { fr: "Responsable communication & événements", en: "Head of Communications & Events" },
    org: { fr: "Parlement étudiant de Toulouse", en: "Toulouse Student Parliament" },
    place: "Toulouse",
    kind: "work",
    text: { fr: "Promotion et organisation des grands événements, réseaux sociaux, mobilisation des participants.", en: "Promoting and delivering major events, social media, engaging participants." },
  },
  {
    period: { fr: "Avril — mai 2024", en: "Apr — May 2024" },
    title: { fr: "Communication, RP & événementiel — stage", en: "Communications, PR & Events — internship" },
    org: "Le Trait Bleu · Festival Ravensare",
    place: "Toulouse",
    kind: "work",
    project: "festival-ravensare",
  },
  {
    period: { fr: "2023 — aujourd’hui", en: "2023 — present" },
    title: { fr: "École des nouveaux métiers de la communication", en: "School of new communication professions" },
    org: "EFAP",
    place: "Toulouse → Paris",
    kind: "school",
  },
  {
    period: { fr: "2022 — 2023", en: "2022 — 2023" },
    title: { fr: "Année préparatoire économie & gestion", en: "Preparatory year in Economics & Management" },
    org: { fr: "Université Toulouse Capitole", en: "Toulouse Capitole University" },
    place: "Toulouse",
    kind: "school",
  },
];

export const skills: { title: L; items: L[] }[] = [
  {
    title: { fr: "Marketing & stratégie", en: "Marketing & Strategy" },
    items: [
      { fr: "Benchmark concurrentiel", en: "Competitive benchmarking" },
      { fr: "Insights & ciblage", en: "Insights & targeting" },
      { fr: "Analyse marketing (4P)", en: "Marketing analysis (4Ps)" },
      { fr: "Concept créatif", en: "Creative concept" },
      { fr: "Plan média, KPI & budget", en: "Media planning, KPIs & budget" },
    ],
  },
  {
    title: { fr: "Influence, RP & événementiel", en: "Influencer, PR & Events" },
    items: [
      { fr: "Sourcing & qualification d’influenceurs", en: "Creator sourcing & qualification" },
      { fr: "Relations presse & agences", en: "Press & agency relations" },
      { fr: "Invitations & relances", en: "Invitations & follow-ups" },
      { fr: "Organisation d’événements", en: "Event organisation" },
      { fr: "Coordination & logistique", en: "Coordination & logistics" },
    ],
  },
  {
    title: { fr: "Digital, contenus & CRM", en: "Digital, Content & CRM" },
    items: [
      { fr: "Contenus Instagram & TikTok", en: "Instagram & TikTok content" },
      { fr: "Community management", en: "Community management" },
      { fr: "Newsletters & segmentation", en: "Newsletters & segmentation" },
      { fr: "Suivi OKR / KPI & reporting", en: "OKR / KPI tracking & reporting" },
      { fr: "Rédaction & packaging", en: "Copywriting & packaging" },
    ],
  },
];

export const tools = ["Klaviyo", "Wix", "Uscreen", "Canva", "Adobe Suite", "Office 365", "Instagram", "TikTok"];

export const languages: { name: L; level: L }[] = [
  { name: { fr: "Français", en: "French" }, level: { fr: "Langue maternelle", en: "Native" } },
  { name: { fr: "Anglais", en: "English" }, level: { fr: "C1", en: "C1" } },
  { name: { fr: "Espagnol", en: "Spanish" }, level: { fr: "B1", en: "B1" } },
];
