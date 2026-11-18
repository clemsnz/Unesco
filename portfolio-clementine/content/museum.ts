/**
 * ─────────────────────────────────────────────────────────────
 *  LE MUSÉE — tout le contenu du site est ici.
 *
 *  • works      : les œuvres (projets). L'ordre = l'ordre de la visite.
 *                 room: "main" = Galerie 02, "cabinet" = Cabinet d'études.
 *  • journey    : les panneaux de la Galerie 03 (parcours).
 *  • about      : la Galerie 04.
 *  • exit       : la sortie (contact).
 *
 *  Ajouter une œuvre : copie un bloc { … } dans `works`, change le `slug`
 *  (= adresse de sa salle : /oeuvres/<slug>/) et dépose les images dans
 *  /public/images/. `ratio` = largeur ÷ hauteur de l'image.
 * ─────────────────────────────────────────────────────────────
 */

export type Img = { src: string; alt: string; ratio: number; cartel?: string };

export type Work = {
  slug: string;
  room: "main" | "cabinet";
  title: string;
  /** Cartel, ligne 2 : Marque · Catégorie · Année */
  line: string;
  /** Cartel, ligne 3 : rôle */
  role: string;
  /** L'œuvre accrochée au mur */
  art: Img;
  /** "photo" = encadrée avec passe-partout, "print" = affiche/document encadré fin */
  kind: "photo" | "print";
  /** hauteur de l'œuvre sur le mur (m) */
  height: number;
  /** Salle dédiée : trois cartels de mur, une phrase chacun */
  brief: string;
  did: string;
  result?: string;
  /** Œuvres accrochées dans la salle (3 maximum) */
  gallery: Img[];
  /** Salle en chapitres (facultatif) : titre, une phrase, des œuvres */
  chapters?: { title: string; text?: string; imgs: Img[] }[];
  /** Reel Instagram (identifiant après /reel/) */
  reel?: { id: string; cartel: string };
  press?: { outlet: string; note: string; url: string }[];
};

export const entrance = {
  room: "Galerie 01 — Entrée",
  name: "CLÉMENTINE SANCHEZ",
  line: "Marketing & communication · Beauté, bien-être, luxe",
};

export const rooms = {
  main: "Galerie 02 — Œuvres choisies",
  cabinet: "Cabinet d’études",
  journey: "Galerie 03 — Parcours",
  about: "Galerie 04 — À propos",
  exit: "Sortie",
};

export const works: Work[] = [
  {
    slug: "charlotte-muller",
    room: "main",
    title: "Charlotte Muller",
    line: "Charlotte Muller Method · Lancement, presse & influence · 2025 — 2026",
    role: "Stage, puis freelance",
    kind: "photo",
    art: { src: "/images/mini-mat/diner-table.webp", alt: "Table du dîner de lancement du Mini Mat, avec la grille « Le P-ingo »", ratio: 1179 / 1651 },
    height: 2.4,
    brief: "Faire connaître une marque de wellness tech premium : lancer le Mini Mat, tapis infrarouge PEMF de 30 cm, et faire venir chaque mois la presse et les créatrices de contenu.",
    did: "Packaging du Mini Mat et dîner de lancement imaginés de A à Z. Événement presse au Four Seasons George V avec le bureau de presse Pascale Venot. Une quinzaine d’événements presse & influence : sélection des influenceuses, invitations, relances, organisation, photos et vidéos.",
    result: "Le lancement a été repris par la presse spécialisée, et les invitées ont partagé leur venue en story.",
    gallery: [],
    chapters: [
      {
        title: "Le lancement du Mini Mat",
        text: "Packaging, puis un dîner pensé de A à Z : P-ingo, carte cadeau « A Gift for You », menus et décoration de la salle.",
        imgs: [
          { src: "/images/mini-mat/packaging.webp", alt: "Packaging du Mini Mat, à plat", ratio: 2000 / 777, cartel: "Packaging du Mini Mat · Fichier de conception" },
          { src: "/images/mini-mat/diner-charlotte.webp", alt: "La salle du dîner de lancement, bougies et table dressée", ratio: 678 / 904, cartel: "La salle du dîner de lancement" },
          { src: "/images/mini-mat/diner-cadeaux.webp", alt: "Cartes cadeaux « A Gift for You » et grilles P-ingo sur la table d’accueil", ratio: 841 / 656, cartel: "Carte cadeau « A Gift for You » et P-ingo" },
        ],
      },
      {
        title: "La presse au Four Seasons George V",
        text: "Organisation, invitations et coordination avec le bureau de presse Pascale Venot.",
        imgs: [
          { src: "/images/mini-mat/george-v-spa.webp", alt: "Le spa du George V équipé des matelas Charlotte Muller", ratio: 1125 / 2000, cartel: "Le spa du Four Seasons George V" },
          { src: "/images/mini-mat/george-v-presse.webp", alt: "Démonstration du matelas pendant l’événement presse", ratio: 1500 / 2000, cartel: "Démonstration pendant l’événement presse" },
        ],
      },
      {
        title: "Une quinzaine d’événements presse & influence",
        text: "Un par mois, au studio et au George V. Sélection des influenceuses, invitations, relances, et les photos : c’est moi qui étais derrière l’appareil.",
        imgs: [
          { src: "/images/influence/studio-groupe.webp", alt: "Invitées d’un événement influence au studio", ratio: 2000 / 1500, cartel: "Événement influence au studio" },
          { src: "/images/influence/shooting-miroir.webp", alt: "Clémentine avec son appareil photo au studio", ratio: 1400 / 1867, cartel: "Au studio, appareil en main" },
          { src: "/images/influence/story-1.webp", alt: "Story d’une invitée sur le matelas Charlotte Muller", ratio: 700 / 1203, cartel: "Story d’une invitée" },
          { src: "/images/influence/story-2.webp", alt: "Story de deux invitées au studio", ratio: 700 / 961, cartel: "Story d’une invitée" },
          { src: "/images/influence/story-6.webp", alt: "Story d’une invitée après un soin au studio", ratio: 700 / 937, cartel: "Story d’une invitée" },
        ],
      },
    ],
    reel: { id: "DR9Am21CL52", cartel: "Reel réalisé pour @charlottemullermethod" },
    press: [
      { outlet: "Le Journal des Palaces", note: "Article · octobre 2025", url: "https://www.journaldespalaces.com/article-76280-innovation-la-revolution-des-spas-commence-avec-les-matelas-charlotte-muller.html" },
      { outlet: "Le Journal des Palaces", note: "Communiqué · novembre 2025", url: "https://www.journaldespalaces.com/communique-76483-charlotte-muller-lance-le-mini-mat-pemf-l-objet-bien-etre-de-30-cm-qui-magnetise-paris-et-les-spas-d-hotels-de-luxe.html" },
      { outlet: "S-Quive", note: "Article · décembre 2025", url: "https://www.s-quive.com/article/charlotte-muller-method-lexcellence-au-service-du-bien-etre-feminin" },
    ],
  },
  {
    slug: "dossier-entreprise",
    room: "main",
    title: "Dossier entreprise",
    line: "Charlotte Muller · Édition · 2025",
    role: "Conçu, rédigé et mis en page de A à Z",
    kind: "print",
    art: { src: "/images/dossier/page-02.webp", alt: "Page d’ouverture du dossier entreprise Charlotte Muller Method", ratio: 1053 / 745 },
    height: 1.35,
    brief: "Présenter le studio Charlotte Muller Method et sa marque de wellness tech dans un seul document.",
    did: "Structure, rédaction, mise en page et choix des photos des 19 pages.",
    gallery: [
      { src: "/images/dossier/page-01.webp", alt: "Couverture du dossier", ratio: 1053 / 745, cartel: "Couverture" },
      { src: "/images/dossier/page-09.webp", alt: "Page du dossier : fitness, yoga, wellness", ratio: 1053 / 745, cartel: "Les trois piliers · page 9" },
      { src: "/images/dossier/page-12.webp", alt: "Page du dossier : cycle syncing", ratio: 1053 / 745, cartel: "Cycle syncing · page 12" },
    ],
  },
  {
    slug: "big-battle-parc-asterix",
    room: "main",
    title: "Big Battle × Parc Astérix",
    line: "EFAP · Compétition nationale · 2026",
    role: "Prisme Agency, équipe de 6",
    kind: "print",
    art: { src: "/images/big-battle/couverture.webp", alt: "Couverture de la recommandation Prisme Agency × Parc Astérix", ratio: 1800 / 1013 },
    height: 1.35,
    brief: "Deux semaines pour imaginer et défendre une stratégie de communication 360° pour le Parc Astérix.",
    did: "Toute la stratégie construite à six : analyse, insight, concept, activations, plan média, budget, puis soutenance devant le jury.",
    result: "1ʳᵉ sur 63 équipes à Paris. 3ᵉ à la finale nationale, au Parc Astérix.",
    gallery: [{ src: "/images/big-battle/equipe-parc-asterix.webp", alt: "L’équipe Prisme Agency au Parc Astérix", ratio: 2000 / 1500, cartel: "L’équipe, le jour de la finale nationale" }],
  },
  {
    slug: "festival-ravensare",
    room: "main",
    title: "Festival Ravensare",
    line: "Le Trait Bleu · Affiche · 2024",
    role: "Affiche et bannière, conçues de A à Z",
    kind: "print",
    art: { src: "/images/ravensare/affiche-a3.webp", alt: "Affiche du festival Ravensare 2024", ratio: 1400 / 1980 },
    height: 2.0,
    brief: "Faire connaître la 22ᵉ édition de Ravensare, festival de danse en plein air à Toulouse.",
    did: "Affiche et bannière. Campagne dans les transports en commun, relations presse, réseaux sociaux, mailing, planning et logistique du festival.",
    gallery: [{ src: "/images/ravensare/banniere.webp", alt: "Bannière du festival Ravensare", ratio: 2000 / 862, cartel: "Bannière web" }],
  },
  {
    slug: "secours-populaire",
    room: "main",
    title: "Solitude",
    line: "Secours Populaire de Colomiers · Campagne · 2025",
    role: "Projet d’équipe, EFAP",
    kind: "print",
    art: { src: "/images/secours/affiche-solitude.webp", alt: "Affiche « Solitude » : à Colomiers, une personne âgée sur six vit dans l’isolement", ratio: 748 / 1045 },
    height: 1.9,
    brief: "Repenser la communication du Secours Populaire de Colomiers pour lui donner plus de visibilité.",
    did: "En équipe : nouvelle identité visuelle, logo, affiches et contenus pour les réseaux sociaux.",
    gallery: [],
  },
  {
    slug: "face-camera",
    room: "main",
    title: "Face caméra",
    line: "EFAP · Plateau TV · 2026",
    role: "Chroniqueuse",
    kind: "photo",
    art: { src: "/images/medias/plateau-equipe.webp", alt: "En plateau à l’EFAP avec Sébastien Erson et l’équipe", ratio: 1800 / 1350 },
    height: 1.75,
    brief: "1 minute 30, une caméra, une chronique : apprendre à incarner un sujet en direct.",
    did: "Écriture et présentation d’une chronique sur le Marathon de Paris 2026, accompagnée par Sébastien Erson. Dans les coulisses d’un live shopping Orange animé par Sébastien Erson.",
    result: "« On ne récite pas, on incarne. »",
    gallery: [
      { src: "/images/medias/plateau-2.webp", alt: "Clémentine pendant sa chronique en plateau", ratio: 1400 / 1867, cartel: "Chronique sur le Marathon de Paris 2026" },
      { src: "/images/medias/live-shopping-1.webp", alt: "Clémentine sur le plateau d’un live shopping", ratio: 1400 / 1867, cartel: "Live shopping Orange, en coulisses" },
    ],
  },
  {
    slug: "hopla",
    room: "main",
    title: "Hopla",
    line: "Hopla Street Food · Menu & réseaux sociaux · 2025",
    role: "Stage communication",
    kind: "print",
    art: { src: "/images/hopla/menu-couverture.webp", alt: "Couverture du menu Hopla", ratio: 1754 / 1241 },
    height: 1.35,
    brief: "Donner une identité forte à Hopla, street-food alsacienne à Toulouse, sur la table comme sur Instagram.",
    did: "Nouveau menu : mise en page et une partie des illustrations. Photos, vidéos et posts Instagram. Relation client.",
    gallery: [
      { src: "/images/hopla/menu-interieur.webp", alt: "Intérieur du menu Hopla", ratio: 1754 / 1241, cartel: "Le menu, intérieur" },
      { src: "/images/hopla/instagram.webp", alt: "Le compte Instagram de Hopla", ratio: 900 / 1613, cartel: "Le compte @hopla.toulouse" },
    ],
    reel: { id: "DEnNa2WIVDu", cartel: "Reel réalisé pour @hopla.toulouse" },
  },
  {
    slug: "glow-in-motion",
    room: "cabinet",
    title: "Glow in Motion",
    line: "Erborian × Charlotte Muller · Étude · 2025",
    role: "Projet personnel",
    kind: "print",
    art: { src: "/images/glow-in-motion/moodboard.webp", alt: "Moodboard Glow in Motion", ratio: 16 / 9 },
    height: 1.2,
    brief: "Imaginer une collaboration entre Erborian et le studio Charlotte Muller autour de la Glass Glow Cream.",
    did: "Concept d’événement influence : cours PowerMat, face-gym, bar à glow Erborian, brunch. Moodboard, sélection de 12 créatrices et contenus prévus pour chacune.",
    gallery: [{ src: "/images/glow-in-motion/event-concept.webp", alt: "Présentation de l’événement Glow in Motion", ratio: 16 / 9, cartel: "Le concept de l’événement" }],
  },
  {
    slug: "spice-your-drink",
    room: "cabinet",
    title: "Spice Your Drink",
    line: "Sauces Martin · Étude · EFAP",
    role: "Cheffe de projet, travail de groupe",
    kind: "print",
    art: { src: "/images/spice-your-drink/cover.webp", alt: "Couverture de la recommandation Sauces Martin", ratio: 2000 / 962 },
    height: 1.1,
    brief: "Faire goûter la sauce Naga Mango à ceux qui ont peur du piment.",
    did: "Analyse de marché et 4P, insight, concept « la sauce dans un mocktail », dégustations en magasin, offre de remboursement, spot social et KPI.",
    gallery: [{ src: "/images/spice-your-drink/activation.webp", alt: "L’activation en magasin", ratio: 16 / 9, cartel: "L’activation en magasin" }],
  },
];

/** Galerie 03 — chaque panneau : années, poste, structure, missions. */
export const journey = [
  { years: "2026 — 2027", title: "Master 1 Communication", org: "EFAP Paris · Full English", details: ["Après trois années à l’EFAP, entre Toulouse et Paris", "Recherche un stage de 6 mois, janvier → juin 2027"] },
  {
    years: "2025 — 2026",
    title: "Communication & marketing",
    org: "Charlotte Muller · Stage (5 mois), puis freelance",
    details: ["Influence & RP, avec le bureau de presse Pascale Venot", "Une quinzaine d’événements presse & influence", "Contenus Instagram & TikTok, lives Instagram", "Newsletters Klaviyo, automatisations Wix", "1 200+ vidéos mises en ligne sur Uscreen", "Suivi hebdomadaire des KPI · Wellness Journal"],
  },
  { years: "2025", title: "Communication & social media", org: "Hopla Street Food · Toulouse · Stage", details: ["Réseaux sociaux, photos & vidéos", "Nouveau menu", "Relation client, marketing digital"] },
  { years: "2024 — 2025", title: "Communication & événements", org: "Parlement des Étudiants · Toulouse", details: ["Simulations parlementaires, visites institutionnelles", "Stratégie de communication, réseaux sociaux", "Organisation des événements, relations partenaires"] },
  { years: "2024", title: "Communication, RP & événementiel", org: "Le Trait Bleu · Festival Ravensare · Stage", details: ["Affiche et bannière du festival", "Relations presse, réseaux sociaux, mailing", "Campagne dans les transports en commun", "Planning, standard, logistique du festival"] },
  { years: "2022 — 2024", title: "Économie-gestion, puis EFAP", org: "Université Toulouse Capitole · EFAP Toulouse", details: ["Année préparatoire en économie & gestion", "Entrée à l’EFAP, école des nouveaux métiers de la communication"] },
  {
    years: "Engagements",
    title: "Bénévolat & jobs étudiants",
    org: "En parallèle des études",
    details: ["Scouts et Guides de France", "Festival de Confolens : 10 jours de bénévolat", "Refuges Solidaires, Briançon : accueil des personnes migrantes", "Chef d’équipe chez Pokawa", "Service et accueil en restaurants et clubs, Toulouse & Biarritz"],
  },
];

export const about = {
  portrait: { src: "/images/about/portrait.webp", alt: "Clémentine Sanchez en plateau à l’EFAP", ratio: 1050 / 1400 },
  quote: "Organiser le détail pour que l’ensemble paraisse simple.",
  lines: ["Étudiante en Master 1 à l’EFAP Paris."],
  seeking: "Stage de 6 mois · janvier → juin 2027",
  /** Panneau « Compétences » face au portrait */
  skills: [
    { title: "Compétences", text: "Communication de marque · Influence & RP · Événementiel · Social media · CRM & e-mailing · Rédaction · Plan média" },
    { title: "Outils", text: "Klaviyo · Wix · Uscreen · Canva · Adobe Suite · Office 365 · Instagram · TikTok" },
    { title: "Langues", text: "Français (langue maternelle) · Anglais C1 · Espagnol B1" },
  ],
};

export const exit = {
  line: "Let’s create something meaningful.",
};
