/**
 * PROJETS
 *
 * Ajouter un projet : copie un bloc { … } entier, colle-le dans la liste,
 * change le `slug` (= l'adresse de la page, sans accent ni espace).
 * L'ordre de la liste = l'ordre sur le site. Le premier est « à la une ».
 *
 * Photos : dépose-les dans /public/images/… puis indique le chemin.
 * `ratio` = largeur ÷ hauteur de la photo (ex. 4/5 pour une photo verticale).
 */
import type { L } from "@/lib/i18n";

export type Img = { src: string; alt: L; caption?: L; ratio: number; /** cadrage, ex. "30% 50%" */ position?: string };

export type Block =
  | { kind: "image"; img: Img; size?: "full" | "medium" }
  | { kind: "pair"; imgs: [Img, Img]; caption?: L }
  | { kind: "row"; imgs: Img[]; caption?: L } // ex. stories Instagram
  | { kind: "pages"; imgs: Img[]; caption?: L } // ex. pages d'un document
  | { kind: "video"; src: string; poster: string; ratio: number; caption?: L; side?: Img };

export type Project = {
  slug: string;
  title: L;
  client: string;
  /** ex. « Stage · 2025 » */
  context: L;
  /** une ligne sous la vignette */
  tag: L;
  role: L;
  cover: Img;
  brief: L;
  /** phrase courte affichée « à la une » sur l'accueil (facultatif) */
  pitch?: L;
  did: L[];
  result?: L;
  links?: { label: string; note: L; url: string }[];
  blocks: Block[];
};

const v = (w: number, h: number) => w / h;

export const projects: Project[] = [
  /* ─────────────── 1 · MINI MAT ─────────────── */
  {
    slug: "lancement-mini-mat",
    title: { fr: "Lancement du Mini Mat", en: "The Mini Mat launch" },
    client: "Charlotte Muller",
    context: { fr: "Stage · 2025", en: "Internship · 2025" },
    tag: { fr: "Packaging, dîner de lancement, presse au George V", en: "Packaging, launch dinner, press at the George V" },
    role: { fr: "Assistante communication & marketing", en: "Communications & Marketing Assistant" },
    cover: { src: "/images/mini-mat/diner-table.webp", alt: { fr: "Table du dîner de lancement du Mini Mat", en: "Table at the Mini Mat launch dinner" }, ratio: v(1179, 1651) },
    brief: {
      fr: "Lancer le Mini Mat, un tapis infrarouge PEMF de 30 cm, et le faire connaître de la presse beauté et bien-être.",
      en: "Launch the Mini Mat, a 30 cm PEMF infrared pad, and get it noticed by the beauty and wellness press.",
    },
    pitch: {
      fr: "J’ai conçu le packaging, organisé le dîner de lancement et coordonné l’événement presse au Four Seasons George V.",
      en: "I designed the packaging, organised the launch dinner and coordinated the press event at the Four Seasons George V.",
    },
    did: [
      { fr: "Conception du packaging, de A à Z.", en: "Designed the packaging, start to finish." },
      { fr: "Organisation du dîner de lancement.", en: "Organised the launch dinner." },
      { fr: "Événement presse au Four Seasons George V : organisation, invitations, coordination avec le bureau de presse Pascale Venot.", en: "Press event at the Four Seasons George V: organisation, invitations, coordination with the Pascale Venot press office." },
    ],
    result: { fr: "Le lancement a été repris dans la presse.", en: "The launch was picked up by the press." },
    links: [
      { label: "Le Journal des Palaces", note: { fr: "Article · 27 oct. 2025", en: "Article · 27 Oct 2025" }, url: "https://www.journaldespalaces.com/article-76280-innovation-la-revolution-des-spas-commence-avec-les-matelas-charlotte-muller.html" },
      { label: "Le Journal des Palaces", note: { fr: "Communiqué · 13 nov. 2025", en: "Press release · 13 Nov 2025" }, url: "https://www.journaldespalaces.com/communique-76483-charlotte-muller-lance-le-mini-mat-pemf-l-objet-bien-etre-de-30-cm-qui-magnetise-paris-et-les-spas-d-hotels-de-luxe.html" },
      { label: "S-Quive", note: { fr: "Article · 11 déc. 2025", en: "Article · 11 Dec 2025" }, url: "https://www.s-quive.com/article/charlotte-muller-method-lexcellence-au-service-du-bien-etre-feminin" },
    ],
    blocks: [
      {
        kind: "pair",
        imgs: [
          { src: "/images/mini-mat/diner-charlotte.webp", alt: { fr: "Charlotte Muller pendant le dîner", en: "Charlotte Muller at the dinner" }, ratio: v(678, 904) },
          { src: "/images/mini-mat/diner-invitees.webp", alt: { fr: "Invitées du dîner de lancement", en: "Guests at the launch dinner" }, ratio: v(1179, 1596) },
        ],
        caption: { fr: "Le dîner de lancement.", en: "The launch dinner." },
      },
      { kind: "image", size: "medium", img: { src: "/images/mini-mat/diner-cadeaux.webp", alt: { fr: "Table des cadeaux et cartes du dîner", en: "Gift table and cards at the dinner" }, caption: { fr: "Cadeaux et cartes remis aux invitées.", en: "Gifts and cards for the guests." }, ratio: v(841, 656) } },
      { kind: "image", size: "full", img: { src: "/images/mini-mat/packaging.webp", alt: { fr: "Packaging du Mini Mat à plat", en: "Flat Mini Mat packaging" }, caption: { fr: "Le packaging que j’ai conçu : face, tranche et dos.", en: "The packaging I designed: front, side and back." }, ratio: v(2000, 777) } },
      {
        kind: "pair",
        imgs: [
          { src: "/images/mini-mat/george-v-spa.webp", alt: { fr: "Spa du George V avec les matelas Charlotte Muller", en: "George V spa with Charlotte Muller mats" }, ratio: v(1125, 2000) },
          { src: "/images/mini-mat/george-v-presse.webp", alt: { fr: "Journalistes pendant l’événement presse au George V", en: "Journalists at the George V press event" }, ratio: v(1500, 2000) },
        ],
        caption: { fr: "L’événement presse au spa du Four Seasons George V.", en: "The press event at the Four Seasons George V spa." },
      },
    ],
  },

  /* ─────────────── 2 · ÉVÉNEMENTS INFLUENCE ─────────────── */
  {
    slug: "evenements-presse-influence",
    title: { fr: "Événements presse & influence", en: "Press & influencer events" },
    client: "Charlotte Muller",
    context: { fr: "Stage puis freelance · 2025–2026", en: "Internship then freelance · 2025–2026" },
    tag: { fr: "Environ 15 événements, un par mois", en: "Around 15 events, one a month" },
    role: { fr: "Influence & relations presse", en: "Influencer & press relations" },
    cover: { src: "/images/influence/studio-groupe.webp", alt: { fr: "Invitées d’un événement influence au studio Charlotte Muller", en: "Guests at an influencer event at the Charlotte Muller studio" }, ratio: v(2000, 1500) },
    brief: {
      fr: "Faire découvrir le studio et ses matelas aux créatrices de contenu et aux journalistes, chaque mois.",
      en: "Introduce the studio and its mats to content creators and journalists, every month.",
    },
    did: [
      { fr: "Sélection des influenceuses, invitations et relances.", en: "Selected creators, sent invitations and follow-ups." },
      { fr: "Organisation d’environ 15 événements au studio, dont un avec 15 invitées.", en: "Organised around 15 events at the studio, one of them with 15 guests." },
      { fr: "Photos et vidéos pendant les événements.", en: "Took photos and videos during the events." },
    ],
    result: { fr: "Les invitées ont partagé leur venue en story.", en: "Guests shared their visit in their stories." },
    blocks: [
      {
        kind: "video",
        src: "/video/cours-studio.mp4",
        poster: "/video/cours-studio-poster.jpg",
        ratio: v(406, 720),
        caption: { fr: "Un cours sur les matelas pendant un événement.", en: "A class on the mats during an event." },
        side: { src: "/images/influence/shooting-miroir.webp", alt: { fr: "Clémentine avec son appareil photo au studio", en: "Clémentine with her camera at the studio" }, caption: { fr: "C’est moi qui faisais les photos.", en: "I was the one taking the photos." }, ratio: v(1400, 1867) },
      },
      {
        kind: "row",
        caption: { fr: "Stories publiées par les invitées après leur venue.", en: "Stories posted by guests after their visit." },
        imgs: [1, 2, 3, 4, 5, 6].map((n) => ({
          src: `/images/influence/story-${n}.webp`,
          alt: { fr: "Story Instagram d’une invitée mentionnant le studio", en: "A guest’s Instagram story mentioning the studio" },
          ratio: [v(700, 1203), v(700, 961), v(700, 1075), v(700, 1262), v(700, 1232), v(700, 937)][n - 1],
        })),
      },
    ],
  },

  /* ─────────────── 3 · DOSSIER ENTREPRISE ─────────────── */
  {
    slug: "dossier-entreprise",
    title: { fr: "Dossier entreprise", en: "Company deck" },
    client: "Charlotte Muller",
    context: { fr: "Stage · 2025", en: "Internship · 2025" },
    tag: { fr: "Conçu et rédigé de A à Z", en: "Designed and written start to finish" },
    role: { fr: "Conception, rédaction, mise en page", en: "Concept, copywriting, layout" },
    cover: { src: "/images/dossier/page-01.webp", alt: { fr: "Couverture du dossier entreprise Charlotte Muller Method", en: "Cover of the Charlotte Muller Method company deck" }, ratio: v(1053, 745) },
    brief: {
      fr: "Présenter le studio Charlotte Muller Method et sa marque de wellness tech dans un seul document.",
      en: "Present the Charlotte Muller Method studio and its wellness-tech brand in a single document.",
    },
    did: [
      { fr: "Structure et rédaction des 19 pages.", en: "Structured and wrote all 19 pages." },
      { fr: "Mise en page et choix des photos.", en: "Layout and photo selection." },
    ],
    blocks: [
      {
        kind: "pages",
        imgs: [2, 3, 4, 6, 7, 9, 11, 12, 13, 14, 15, 17, 18].map((n) => ({
          src: `/images/dossier/page-${String(n).padStart(2, "0")}.webp`,
          alt: { fr: `Page ${n} du dossier`, en: `Page ${n} of the deck` },
          ratio: v(1053, 745),
        })),
      },
    ],
  },

  /* ─────────────── 4 · BIG BATTLE ─────────────── */
  {
    slug: "big-battle-parc-asterix",
    title: { fr: "Big Battle × Parc Astérix", en: "Big Battle × Parc Astérix" },
    client: "EFAP",
    context: { fr: "Compétition · 2026", en: "Competition · 2026" },
    tag: { fr: "3ᵉ place nationale", en: "3rd place nationally" },
    role: { fr: "Équipe de 6", en: "Team of 6" },
    cover: { src: "/images/big-battle/equipe-parc-asterix.webp", alt: { fr: "L’équipe au Parc Astérix", en: "The team at Parc Astérix" }, ratio: v(2000, 1500) },
    brief: {
      fr: "Construire en deux semaines une stratégie de communication 360° pour le Parc Astérix, puis la défendre devant un jury.",
      en: "Build a 360° communications strategy for Parc Astérix in two weeks, then pitch it to a jury.",
    },
    did: [
      { fr: "Benchmark, insights, cible et concept créatif.", en: "Benchmark, insights, target and creative concept." },
      { fr: "Social media, influence, RP, CRM, plan média, activations, KPI et budget.", en: "Social media, influencer, PR, CRM, media plan, activations, KPIs and budget." },
      { fr: "Soutenance devant le jury.", en: "Pitch to the jury." },
    ],
    result: { fr: "1ʳᵉ sur 63 équipes à Paris, 3ᵉ en finale nationale.", en: "1st of 63 teams in Paris, 3rd at the national final." },
    blocks: [],
  },

  /* ─────────────── 5 · RAVENSARE ─────────────── */
  {
    slug: "festival-ravensare",
    title: { fr: "Festival Ravensare", en: "Ravensare Festival" },
    client: "Le Trait Bleu",
    context: { fr: "Stage · 2024", en: "Internship · 2024" },
    tag: { fr: "Affiches, presse, campagne transports", en: "Posters, press, transport campaign" },
    role: { fr: "Communication, RP & événementiel", en: "Communications, PR & events" },
    cover: { src: "/images/ravensare/affiche-a3.webp", alt: { fr: "Affiche du festival Ravensare 2024", en: "Ravensare Festival 2024 poster" }, ratio: v(1400, 1980) },
    brief: {
      fr: "Faire connaître la 22ᵉ édition de Ravensare, festival de danse en plein air à Toulouse.",
      en: "Promote the 22nd edition of Ravensare, an open-air dance festival in Toulouse.",
    },
    did: [
      { fr: "Création de l’affiche et de la bannière, de A à Z.", en: "Designed the poster and banner, start to finish." },
      { fr: "Campagne d’affichage dans les transports en commun.", en: "Poster campaign on public transport." },
      { fr: "Relations presse et réseaux sociaux.", en: "Press relations and social media." },
    ],
    blocks: [
      { kind: "image", size: "full", img: { src: "/images/ravensare/banniere.webp", alt: { fr: "Bannière du festival Ravensare", en: "Ravensare Festival banner" }, caption: { fr: "La bannière, déclinée pour le web.", en: "The banner, adapted for the web." }, ratio: v(2000, 862) } },
    ],
  },

  /* ─────────────── 6 · FACE CAMÉRA ─────────────── */
  {
    slug: "face-camera",
    title: { fr: "Face caméra", en: "On camera" },
    client: "EFAP",
    context: { fr: "EFAP · 2026", en: "EFAP · 2026" },
    tag: { fr: "Chroniques en plateau", en: "News segments on set" },
    role: { fr: "Chroniqueuse", en: "Presenter" },
    cover: { src: "/images/medias/plateau-equipe.webp", alt: { fr: "En plateau à l’EFAP avec Sébastien Erson", en: "On set at EFAP with Sébastien Erson" }, ratio: v(1800, 1350) },
    brief: {
      fr: "S’entraîner à la chronique télé : 1 min 30, une caméra, aucune deuxième prise.",
      en: "Practise the TV segment: 90 seconds, one camera, no second take.",
    },
    did: [
      { fr: "Écriture et présentation d’une chronique sur le Marathon de Paris 2026.", en: "Wrote and presented a segment on the 2026 Paris Marathon." },
      { fr: "Accompagnée par Sébastien Erson.", en: "Coached by Sébastien Erson." },
    ],
    blocks: [
      {
        kind: "pair",
        imgs: [
          { src: "/images/medias/plateau-2.webp", alt: { fr: "Clémentine en plateau", en: "Clémentine on set" }, ratio: v(1400, 1867) },
          { src: "/images/medias/plateau-1.webp", alt: { fr: "Clémentine en plateau", en: "Clémentine on set" }, ratio: v(1400, 1867) },
        ],
      },
      {
        kind: "pair",
        imgs: [
          { src: "/images/medias/live-shopping-1.webp", alt: { fr: "Clémentine sur le plateau d’un live shopping", en: "Clémentine on a live shopping set" }, ratio: v(1400, 1867) },
          { src: "/images/medias/live-shopping-2.webp", alt: { fr: "Plateau de live shopping", en: "Live shopping set" }, ratio: v(1400, 1867) },
        ],
        caption: { fr: "En coulisses d’un live shopping animé par Sébastien Erson.", en: "Behind the scenes of a live shopping show hosted by Sébastien Erson." },
      },
    ],
  },

  /* ─────────────── 7 · HOPLA ─────────────── */
  {
    slug: "hopla",
    title: { fr: "Le menu Hopla", en: "The Hopla menu" },
    client: "Hopla",
    context: { fr: "Stage · 2025", en: "Internship · 2025" },
    tag: { fr: "Refonte du menu & réseaux sociaux", en: "Menu redesign & social media" },
    role: { fr: "Communication & social media", en: "Communications & social media" },
    cover: { src: "/images/hopla/menu-couverture.webp", alt: { fr: "Couverture du menu Hopla", en: "Hopla menu cover" }, ratio: v(1754, 1241) },
    brief: {
      fr: "Refaire le menu de Hopla, street-food alsacienne à Toulouse, et animer ses réseaux sociaux.",
      en: "Redesign the menu of Hopla, an Alsatian street-food spot in Toulouse, and run its social media.",
    },
    did: [
      { fr: "Création du nouveau menu.", en: "Created the new menu." },
      { fr: "Photos, vidéos et posts pour les réseaux sociaux.", en: "Photos, videos and posts for social media." },
      { fr: "Relation client.", en: "Customer relations." },
    ],
    blocks: [
      { kind: "image", size: "full", img: { src: "/images/hopla/menu-interieur.webp", alt: { fr: "Intérieur du menu Hopla", en: "Inside of the Hopla menu" }, caption: { fr: "L’intérieur du menu.", en: "Inside the menu." }, ratio: v(1754, 1241) } },
    ],
  },

  /* ─────────────── 8 · GLOW IN MOTION ─────────────── */
  {
    slug: "glow-in-motion",
    title: { fr: "Glow in Motion", en: "Glow in Motion" },
    client: "Erborian × Charlotte Muller",
    context: { fr: "Projet personnel", en: "Personal project" },
    tag: { fr: "Concept d’événement influence", en: "Influencer event concept" },
    role: { fr: "Projet individuel", en: "Solo project" },
    cover: { src: "/images/glow-in-motion/moodboard-photos.webp", alt: { fr: "Moodboard Glow in Motion", en: "Glow in Motion moodboard" }, ratio: 2000 / 883 },
    brief: {
      fr: "Imaginer une collaboration entre Erborian et le studio Charlotte Muller autour de la Glass Glow Cream.",
      en: "Imagine a collaboration between Erborian and the Charlotte Muller studio around the Glass Glow Cream.",
    },
    did: [
      { fr: "Concept d’événement : cours PowerMat, face-gym, bar à glow, brunch.", en: "Event concept: PowerMat class, face-gym, glow bar, brunch." },
      { fr: "Sélection de 12 créatrices, avec les contenus prévus pour chacune.", en: "Selected 12 creators, with planned content for each." },
      { fr: "Moodboard et présentation.", en: "Moodboard and presentation deck." },
    ],
    blocks: [
      { kind: "image", size: "full", img: { src: "/images/glow-in-motion/moodboard.webp", alt: { fr: "Moodboard complet", en: "Full moodboard" }, ratio: 16 / 9 } },
      { kind: "image", size: "full", img: { src: "/images/glow-in-motion/event-concept.webp", alt: { fr: "Slide de présentation de l’événement", en: "Event presentation slide" }, ratio: 16 / 9 } },
      { kind: "image", size: "medium", img: { src: "/images/glow-in-motion/erborian.webp", alt: { fr: "Slide Erborian et Glass Glow Cream", en: "Erborian and Glass Glow Cream slide" }, caption: { fr: "Visuel produit généré par IA, signalé sur la slide.", en: "AI-generated product visual, flagged on the slide." }, ratio: 16 / 9 } },
    ],
  },

  /* ─────────────── 9 · SPICE YOUR DRINK ─────────────── */
  {
    slug: "spice-your-drink",
    title: { fr: "Spice Your Drink", en: "Spice Your Drink" },
    client: "Sauces Martin",
    context: { fr: "EFAP · projet de groupe", en: "EFAP · group project" },
    tag: { fr: "Activation en magasin", en: "In-store activation" },
    role: { fr: "Cheffe de projet (agence fictive Crescendo)", en: "Project manager (fictional agency Crescendo)" },
    cover: { src: "/images/spice-your-drink/cover.webp", alt: { fr: "Couverture de la recommandation Sauces Martin", en: "Sauces Martin recommendation cover" }, ratio: v(2000, 962), position: "38% 50%" },
    brief: {
      fr: "Faire goûter la sauce Naga Mango à ceux qui ont peur du piment.",
      en: "Get people who are scared of chilli to taste Naga Mango sauce.",
    },
    did: [
      { fr: "Analyse de la marque et du marché.", en: "Brand and market analysis." },
      { fr: "Concept « Spice Your Drink » : la sauce dans un mocktail.", en: "‘Spice Your Drink’ concept: the sauce in a mocktail." },
      { fr: "Dégustations en magasin, offre de remboursement, spot pour les réseaux.", en: "In-store tastings, cashback offer, social video." },
    ],
    result: { fr: "Objectifs fixés : 20–25 % de conversion et 200 dégustations par jour et par magasin.", en: "Targets set: 20–25% conversion and 200 tastings per store per day." },
    blocks: [
      {
        kind: "pair",
        imgs: [
          { src: "/images/spice-your-drink/concept.webp", alt: { fr: "Slide concept", en: "Concept slide" }, ratio: 16 / 9 },
          { src: "/images/spice-your-drink/activation.webp", alt: { fr: "Slide activation en magasin", en: "In-store activation slide" }, ratio: 16 / 9 },
        ],
      },
      {
        kind: "pair",
        imgs: [
          { src: "/images/spice-your-drink/odr.webp", alt: { fr: "Slide offre de remboursement", en: "Cashback offer slide" }, ratio: 16 / 9 },
          { src: "/images/spice-your-drink/kpis.webp", alt: { fr: "Slide KPI", en: "KPI slide" }, ratio: 16 / 9 },
        ],
      },
    ],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const nextProject = (slug: string) => projects[(projects.findIndex((p) => p.slug === slug) + 1) % projects.length];
