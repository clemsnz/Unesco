/**
 * MUSÉE — contenu du prototype (Galerie 01 · Entrée + début de la Galerie 02).
 * Chaque œuvre = un projet, avec son cartel.
 */

export type Artwork = {
  n: string;
  slug: string;
  title: string;
  /** Marque · Catégorie · Année */
  line: string;
  /** Rôle en une ligne */
  role: string;
  kind: "photo" | "poster" | "screen";
  src: string;
  poster?: string;
  /** largeur ÷ hauteur */
  ratio: number;
  /** hauteur de l'œuvre accrochée, en mètres */
  height: number;
  /** mur gauche (-1) ou droit (+1), position dans la galerie (m) */
  side: -1 | 1;
  z: number;
  /** page détaillée disponible dans le prototype */
  page?: string;
};

export const entrance = {
  room: "Galerie 01 — Entrée",
  name: "CLÉMENTINE SANCHEZ",
  line: "Marketing & communication · Beauté, bien-être, luxe",
};

export const artworks: Artwork[] = [
  {
    n: "01",
    slug: "lancement-mini-mat",
    title: "Lancement du Mini Mat",
    line: "Charlotte Muller · Lancement produit · 2025",
    role: "Packaging, dîner de lancement, presse",
    kind: "photo",
    src: "/images/mini-mat/diner-table.webp",
    ratio: 1179 / 1651,
    height: 2.15,
    side: -1,
    z: -15,
    page: "/prototype/lancement-mini-mat/",
  },
  {
    n: "02",
    slug: "evenements-presse-influence",
    title: "Événements presse & influence",
    line: "Charlotte Muller · Événementiel · 2025 — 2026",
    role: "Une quinzaine d’événements, un par mois",
    kind: "screen",
    src: "/video/cours-studio.mp4",
    poster: "/video/cours-studio-poster.jpg",
    ratio: 406 / 720,
    height: 2.2,
    side: 1,
    z: -24,
  },
  {
    n: "03",
    slug: "festival-ravensare",
    title: "Festival Ravensare",
    line: "Le Trait Bleu · Affiche · 2024",
    role: "Affiche et bannière, conçues de A à Z",
    kind: "poster",
    src: "/images/ravensare/affiche-a3.webp",
    ratio: 1400 / 1980,
    height: 2.0,
    side: -1,
    z: -33,
  },
];
