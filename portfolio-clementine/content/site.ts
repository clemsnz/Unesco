/**
 * ─────────────────────────────────────────────────────────────
 *  INFORMATIONS GÉNÉRALES DU SITE
 *  Modifie ici ton e-mail, ton LinkedIn, ton CV, tes accroches…
 *  Chaque texte existe en deux langues : { fr: "…", en: "…" }
 * ─────────────────────────────────────────────────────────────
 */
import type { L } from "@/lib/i18n";

export const site = {
  name: "Clémentine Sanchez",
  firstName: "Clémentine",
  lastName: "Sanchez",
  initials: "CS",

  /** Adresse finale du site (à mettre à jour après l'achat du nom de domaine). */
  url: "https://clementinesanchez.com",

  email: "clementine.sanchez@efap.com",
  linkedin: "https://www.linkedin.com/in/clementine-sanchez08122004",
  linkedinLabel: "in/clementine-sanchez",

  /** CV téléchargeables. Remplace le fichier dans /public/cv/ en gardant le même nom. */
  cv: {
    en: "/cv/Clementine-Sanchez-CV-EN.pdf",
    fr: null as string | null, // ← ajoute "/cv/Clementine-Sanchez-CV-FR.pdf" quand tu l'auras
  },

  city: "Paris",

  role: {
    fr: "Brand communication · Marketing · Influence & RP · Événementiel",
    en: "Brand communication · Marketing · Influencer & PR · Events",
  } satisfies L,

  tagline: {
    fr: "De l’insight à l’expérience.",
    en: "From insight to experience.",
  } satisfies L,

  availability: {
    fr: "Recherche un stage de 6 mois · janvier → juin 2027",
    en: "Seeking a 6-month internship · January → June 2027",
  } satisfies L,

  school: {
    fr: "Master 1 Full English · EFAP Paris",
    en: "Master’s Year 1, Full English track · EFAP Paris",
  } satisfies L,

  intro: {
    fr: "Étudiante en Master 1 à l’EFAP Paris, je construis des stratégies de marque qui se vivent : événements presse et influence, contenus, CRM, activations. Mon terrain de prédilection — la beauté, le bien-être et le luxe, là où chaque détail raconte la marque.",
    en: "A Master’s student at EFAP Paris, I build brand strategies people can experience — press and influencer events, content, CRM, activations. My natural territory: beauty, wellness and luxury, where every detail tells the brand’s story.",
  } satisfies L,

  vision: {
    fr: "Une marque se juge à ce qu’elle fait ressentir. Mon rôle : partir d’un insight, le traduire en concept, puis tenir chaque détail jusqu’au jour J — la liste d’invités, le packaging, la newsletter du lendemain.",
    en: "A brand is judged by how it makes people feel. My job: start from an insight, turn it into a concept, then own every detail through to the day itself — the guest list, the packaging, the follow-up newsletter.",
  } satisfies L,

  /** Chiffres clés — uniquement des faits vérifiables. */
  keyFacts: [
    {
      value: "3ᵉ",
      label: { fr: "place nationale · Big Battle EFAP × Parc Astérix 2026", en: "place nationally · Big Battle EFAP × Parc Astérix 2026" },
    },
    {
      value: "1ʳᵉ / 63",
      label: { fr: "équipes sur le campus EFAP Paris", en: "teams on the EFAP Paris campus" },
    },
    {
      value: "1 200+",
      label: { fr: "vidéos mises en ligne sur Uscreen pour Charlotte Muller", en: "videos uploaded to Uscreen for Charlotte Muller" },
    },
    {
      value: "4",
      label: { fr: "expériences en communication depuis 2024", en: "communications roles since 2024" },
    },
  ],
};
