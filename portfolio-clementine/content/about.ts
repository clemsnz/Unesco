/**
 * PAGE « À PROPOS » et petits textes de l'interface.
 * Pour ajouter une expérience : copie une ligne de `parcours`.
 */
import type { L } from "@/lib/i18n";

export const about = {
  lead: {
    fr: "Je fais le lien entre ce qu’une marque veut dire et ce que les gens vont vivre.",
    en: "I connect what a brand wants to say with what people will actually experience.",
  } satisfies L,

  bio: [
    {
      fr: "En Master 1 à l’EFAP Paris, après des débuts à Toulouse. Depuis 2024 : un festival de danse, une street-food alsacienne, un parlement étudiant, puis Charlotte Muller, une marque de bien-être dont les matelas équipent le George V.",
      en: "Master’s student at EFAP Paris, after starting out in Toulouse. Since 2024: a dance festival, an Alsatian street-food spot, a student parliament, then Charlotte Muller, a wellness brand whose mats are used at the George V.",
    },
    {
      fr: "En dehors : la danse, le Pilates, la mode et les voyages. Et des années de service en salle, qui m’ont appris l’accueil.",
      en: "Outside work: dance, Pilates, fashion and travel. And years of front-of-house jobs, which taught me hospitality.",
    },
  ] satisfies L[],

  photos: [
    { src: "/images/medias/plateau-1.webp", alt: { fr: "Clémentine en plateau à l’EFAP", en: "Clémentine on set at EFAP" }, ratio: 1400 / 1867 },
    { src: "/images/about/bureau.webp", alt: { fr: "Clémentine au bureau chez Charlotte Muller", en: "Clémentine at her desk at Charlotte Muller" }, ratio: 1600 / 1200 },
  ],

  parcours: [
    { when: { fr: "2026 — 27", en: "2026 — 27" }, what: { fr: "Master 1 Communication, Full English", en: "Master’s in Communication, Year 1, Full English" }, where: "EFAP Paris" },
    { when: { fr: "Janv. — mars 2026", en: "Jan — Mar 2026" }, what: { fr: "Communication digitale & marketing (freelance)", en: "Digital communications & marketing (freelance)" }, where: "Charlotte Muller" },
    { when: { fr: "Sept. — déc. 2025", en: "Sep — Dec 2025" }, what: { fr: "Assistante communication & marketing (stage)", en: "Communications & marketing assistant (internship)" }, where: "Charlotte Muller" },
    { when: { fr: "Janv. — mars 2025", en: "Jan — Mar 2025" }, what: { fr: "Communication & social media (stage)", en: "Communications & social media (internship)" }, where: "Hopla, Toulouse" },
    { when: { fr: "2024 — 25", en: "2024 — 25" }, what: { fr: "Responsable communication & événements", en: "Head of communications & events" }, where: "Parlement étudiant de Toulouse" },
    { when: { fr: "Avril — mai 2024", en: "Apr — May 2024" }, what: { fr: "Communication, RP & événementiel (stage)", en: "Communications, PR & events (internship)" }, where: "Le Trait Bleu, Toulouse" },
    { when: { fr: "2023 —", en: "2023 —" }, what: { fr: "École de communication", en: "School of communication" }, where: "EFAP, Toulouse puis Paris" },
  ],

  skills: [
    { title: { fr: "Événements & influence", en: "Events & influence" }, items: { fr: "Organisation d’événements · Sélection d’influenceuses · Relations presse", en: "Event organisation · Creator selection · Press relations" } },
    { title: { fr: "Contenus & CRM", en: "Content & CRM" }, items: { fr: "Instagram & TikTok · Newsletters Klaviyo · Suivi des KPI", en: "Instagram & TikTok · Klaviyo newsletters · KPI tracking" } },
    { title: { fr: "Stratégie & création", en: "Strategy & design" }, items: { fr: "Recommandation 360° · Packaging · Affiches · Mise en page", en: "360° recommendations · Packaging · Posters · Layout" } },
  ] satisfies { title: L; items: L }[],

  tools: "Klaviyo · Wix · Uscreen · Canva · Adobe Suite · Office 365",
  languages: { fr: "Français · Anglais C1 · Espagnol B1", en: "French · English C1 · Spanish B1" } satisfies L,
};

export const ui = {
  work: { fr: "Projets", en: "Work" },
  about: { fr: "À propos", en: "About" },
  contact: { fr: "Contact", en: "Contact" },
  featured: { fr: "À la une", en: "Featured" },
  allWork: { fr: "Tous les projets", en: "All work" },
  view: { fr: "Voir le projet", en: "View project" },
  brief: { fr: "Le brief", en: "The brief" },
  did: { fr: "Ce que j’ai fait", en: "What I did" },
  result: { fr: "Résultat", en: "Outcome" },
  press: { fr: "Dans la presse", en: "In the press" },
  next: { fr: "Projet suivant", en: "Next project" },
  back: { fr: "Tous les projets", en: "All work" },
  role: { fr: "Rôle", en: "Role" },
  path: { fr: "Parcours", en: "Experience" },
  skills: { fr: "Compétences", en: "Skills" },
  tools: { fr: "Outils", en: "Tools" },
  languages: { fr: "Langues", en: "Languages" },
  cv: { fr: "Télécharger le CV", en: "Download CV" },
  more: { fr: "En savoir plus", en: "More about me" },
  contactTitle: { fr: "Travaillons ensemble.", en: "Let’s work together." },
  contactText: {
    fr: "Je cherche un stage de 6 mois, de janvier à juin 2027, en marketing, communication ou événementiel.",
    en: "I’m looking for a 6-month internship, January to June 2027, in marketing, communications or events.",
  },
} satisfies Record<string, L>;
