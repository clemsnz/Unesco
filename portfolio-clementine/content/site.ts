/**
 * INFORMATIONS GÉNÉRALES
 * Chaque texte existe en deux langues : { fr: "…", en: "…" }
 */
import type { L } from "@/lib/i18n";

export const site = {
  name: "Clémentine Sanchez",

  /** Adresse du site en ligne (à mettre à jour si tu achètes un nom de domaine). */
  url: "https://clementine-sanchez.vercel.app",

  email: "clementine.sanchez@efap.com",
  linkedin: "https://www.linkedin.com/in/clementine-sanchez08122004",

  /** Remplace le fichier dans /public/cv/ en gardant le même nom. */
  cv: "/cv/Clementine-Sanchez-CV-EN.pdf",

  tagline: {
    fr: "Marketing & communication — beauté, bien-être, luxe",
    en: "Marketing & communications — beauty, wellness, luxury",
  } satisfies L,

  school: { fr: "Master 1 · EFAP Paris", en: "Master’s, Year 1 · EFAP Paris" } satisfies L,

  availability: {
    fr: "Stage 6 mois · janvier → juin 2027",
    en: "6-month internship · January → June 2027",
  } satisfies L,

  /** Petite présentation (page d'accueil) */
  intro: {
    fr: "J’organise des événements, je travaille avec la presse et les influenceuses, et je crée les supports qui vont avec. Mon terrain : la beauté, le bien-être et le luxe.",
    en: "I organise events, work with press and creators, and design the materials that go with them. My field: beauty, wellness and luxury.",
  } satisfies L,

  portrait: {
    src: "/images/medias/plateau-2.webp",
    alt: { fr: "Clémentine Sanchez en plateau à l’EFAP", en: "Clémentine Sanchez on set at EFAP" } satisfies L,
  },
};
