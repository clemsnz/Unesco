/**
 * ─────────────────────────────────────────────────────────────
 *  PROJETS — le cœur du portfolio
 *
 *  ➜ Pour AJOUTER un projet : copie un bloc { … } complet,
 *    colle-le dans la liste `projects`, puis change le `slug`
 *    (= l'adresse de la page, sans espace ni accent).
 *  ➜ L'ordre de la liste = l'ordre d'affichage sur le site.
 *  ➜ `featured: true` = le projet apparaît sur la page d'accueil.
 *  ➜ Images : dépose-les dans /public/images/<slug>/ puis écris
 *    le chemin "/images/<slug>/mon-image.webp".
 *  ➜ Un visuel manquant ? Utilise { kind: "placeholder", … } :
 *    un cadre élégant « Visuel à fournir » s'affichera.
 * ─────────────────────────────────────────────────────────────
 */
import type { L } from "@/lib/i18n";

export type CategoryKey = "events" | "influence" | "campaigns" | "strategy" | "digital";

export const categories: Record<CategoryKey, L> = {
  events: { fr: "Événements & expériences", en: "Events & Experiences" },
  influence: { fr: "Influence & RP", en: "Influencer & PR" },
  campaigns: { fr: "Marketing & campagnes", en: "Marketing & Campaigns" },
  strategy: { fr: "Stratégie de marque", en: "Brand Strategy" },
  digital: { fr: "Digital & contenus", en: "Digital & Content" },
};

export type Media = {
  src: string;
  alt: L;
  caption?: L;
  /** largeur / hauteur — sert à réserver la place avant le chargement */
  ratio: number;
};

export type Block =
  | { kind: "text"; label: L; title?: L; body: L[] }
  | { kind: "list"; label: L; title?: L; items: L[]; ordered?: boolean }
  | { kind: "quote"; text: L; source?: L }
  | { kind: "figures"; label: L; items: { value: string; label: L }[]; note?: L }
  | { kind: "image"; media: Media; layout?: "full" | "wide" | "inset" }
  | { kind: "pair"; media: [Media, Media] }
  | { kind: "slides"; label: L; media: Media[] }
  | { kind: "video"; src: string; poster: string; caption: L; ratio: number }
  | { kind: "placeholder"; label: L; ratio?: number }
  | { kind: "chapter"; number: string; title: L; intro?: L }
  | { kind: "press"; label: L; items: { outlet: string; title: string; date: L; url: string; type: L }[]; note?: L };

export type Project = {
  slug: string;
  featured: boolean;
  title: L;
  /** Marque / client */
  client: string;
  year: L;
  category: CategoryKey;
  /** Stage, projet de groupe, projet personnel… */
  type: L;
  role: L;
  team: L;
  summary: L;
  cover: Media | null;
  /** Affiche typographique utilisée quand il n'y a pas d'image de couverture */
  poster?: { figure: string; sup?: string; line: L };
  /** couleur d'ambiance du projet (survol, détails) */
  tone: string;
  deliverables: L[];
  skills: L[];
  /** Ce que j'ai fait personnellement */
  mine: L[];
  /** Pour les projets de groupe : ce qui revient à l'équipe */
  teamWork?: L[];
  blocks: Block[];
};

const CM = "/images/charlotte-muller";
const GM = "/images/glow-in-motion";
const SD = "/images/spice-your-drink";

export const projects: Project[] = [
  /* ───────────────────────── 01 · CHARLOTTE MULLER ───────────────────────── */
  {
    slug: "charlotte-muller",
    featured: true,
    title: { fr: "Le Mini Mat, du packaging au palace", en: "The Mini Mat, from packaging to palace" },
    client: "Charlotte Muller Method",
    year: { fr: "Sept. 2025 — mars 2026", en: "Sep 2025 — Mar 2026" },
    category: "events",
    type: { fr: "Stage, puis freelance", en: "Internship, then freelance" },
    role: { fr: "Assistante communication & marketing", en: "Communications & Marketing Assistant" },
    team: { fr: "Aux côtés de la fondatrice et de l’agence Pascale Venot", en: "Alongside the founder and the Pascale Venot PR agency" },
    summary: {
      fr: "Lancer un objet bien-être technique comme un objet de désir : packaging, dîner de lancement, événement presse au Four Seasons George V, influence au studio — et tout le quotidien digital d’une marque premium.",
      en: "Launching a technical wellness device as an object of desire: packaging, launch dinner, a press event at the Four Seasons George V, influencer events at the studio — and the day-to-day digital life of a premium brand.",
    },
    cover: {
      src: `${CM}/press-event-george-v.webp`,
      alt: { fr: "Événement presse Charlotte Muller au spa du Four Seasons Hotel George V", en: "Charlotte Muller press event at the Four Seasons Hotel George V spa" },
      ratio: 1500 / 2000,
    },
    tone: "#C9A69A",
    deliverables: [
      { fr: "Packaging du Mini Mat", en: "Mini Mat packaging" },
      { fr: "Événement presse au Four Seasons George V", en: "Press event at the Four Seasons George V" },
      { fr: "Dîner de lancement", en: "Launch dinner" },
      { fr: "2 événements influence & presse au studio", en: "2 influencer & press events at the studio" },
      { fr: "Contenus Instagram / TikTok, lives", en: "Instagram / TikTok content, lives" },
      { fr: "Newsletters Klaviyo", en: "Klaviyo newsletters" },
      { fr: "Wellness Journal", en: "Wellness Journal" },
    ],
    skills: [
      { fr: "Relations presse", en: "Press relations" },
      { fr: "Marketing d’influence", en: "Influencer marketing" },
      { fr: "Événementiel", en: "Events" },
      { fr: "Packaging", en: "Packaging design" },
      { fr: "CRM & e-mailing", en: "CRM & email marketing" },
      { fr: "Social media", en: "Social media" },
      { fr: "Suivi de KPI", en: "KPI tracking" },
    ],
    mine: [
      { fr: "Conception du packaging du Mini Mat PEMF infrarouge.", en: "Designed the packaging for the PEMF infrared Mini Mat." },
      { fr: "Organisation, invitations et coordination avec l’agence Pascale Venot pour l’événement presse au Four Seasons Hotel George V.", en: "Organisation, invitations and coordination with the Pascale Venot agency for the press event at the Four Seasons Hotel George V." },
      { fr: "Organisation d’un dîner pour le lancement du Mini Mat.", en: "Organised a dinner for the launch of the Mini Mat." },
      { fr: "Sourcing et qualification d’influenceuses, invitations et relances ; co-organisation de 2 événements influence/presse au studio, dont un avec 15 invitées.", en: "Sourced and qualified creators, handled invitations and follow-ups; co-organised 2 influencer/press events at the studio, including one with 15 guests." },
      { fr: "Création et planification de contenus Instagram/TikTok, préparation et production de lives, community management.", en: "Created and scheduled Instagram/TikTok content, prepared and produced Instagram lives, managed communities." },
      { fr: "Newsletters et campagnes Klaviyo (segmentation), automatisations Wix, messages clients.", en: "Klaviyo newsletters and campaigns (segmentation), Wix automations, customer messaging." },
      { fr: "Suivi hebdomadaire des OKR/KPI (influence, abonnements, e-mailing) et reporting à la direction.", en: "Weekly OKR/KPI tracking (influence, memberships, email) and reporting to management." },
    ],
    blocks: [
      {
        kind: "text",
        label: { fr: "Contexte", en: "Context" },
        title: { fr: "Une méthode, un studio, une technologie.", en: "A method, a studio, a technology." },
        body: [
          {
            fr: "Charlotte Muller Method est un studio dédié au bien-être féminin dans le 9ᵉ arrondissement de Paris : Pilates, yoga, barre, et des séances sur PowerMat associant infrarouge lointain et champs électromagnétiques pulsés (PEMF). Ses matelas équipent notamment le spa du Four Seasons Hotel George V.",
            en: "Charlotte Muller Method is a women’s wellbeing studio in Paris’s 9th arrondissement: Pilates, yoga, barre, and PowerMat sessions combining far-infrared and pulsed electromagnetic fields (PEMF). Its mats are used, among others, at the spa of the Four Seasons Hotel George V.",
          },
          {
            fr: "Fin 2025, la marque lance le Mini Mat : un pad PEMF infrarouge de 30 cm, disponible à partir du 1ᵉʳ décembre. L’enjeu : faire d’un objet technique un objet désirable, et le faire exister auprès de la presse et des influenceuses au niveau des palaces qui l’utilisent.",
            en: "In late 2025 the brand launched the Mini Mat: a 30 cm PEMF infrared pad, available from 1 December. The challenge: turn a technical device into a desirable object, and give it a presence with press and creators that matches the palaces where it is used.",
          },
        ],
      },
      {
        kind: "chapter",
        number: "I",
        title: { fr: "Le packaging", en: "The packaging" },
        intro: {
          fr: "J’ai conçu le packaging du Mini Mat : un étui bilingue qui doit à la fois rassurer (caractéristiques techniques, mentions réglementaires) et séduire (codes d’une maison de beauté).",
          en: "I designed the Mini Mat packaging: a bilingual box that has to reassure (technical specs, regulatory marks) and seduce (the codes of a beauty house).",
        },
      },
      {
        kind: "image",
        layout: "full",
        media: {
          src: `${CM}/packaging.webp`,
          alt: { fr: "Fichier de conception du packaging du Mini Tapis PEMF Infrarouge Charlotte Muller, à plat", en: "Flat design file of the Charlotte Muller PEMF Infrared Mini Mat packaging" },
          caption: { fr: "Fichier de conception à plat — face, tranche « version » et dos.", en: "Flat design file — front, ‘version’ side panel and back." },
          ratio: 2000 / 777,
        },
      },
      {
        kind: "list",
        label: { fr: "Partis pris", en: "Design choices" },
        items: [
          { fr: "Une face épurée : logotype espacé, photographie du pad, promesse en deux lignes — « Pad 30 cm · 9 programmes PEMF ».", en: "A clean front: spaced logotype, a photograph of the pad, a two-line promise — ‘30 cm pad · 9 PEMF programmes’." },
          { fr: "Un système de trois versions — Crystal, Quartz, Amethyst — signalées par des pastilles de couleur sur la tranche.", en: "A three-version system — Crystal, Quartz, Amethyst — flagged by colour dots on the side panel." },
          { fr: "Une hiérarchie bilingue au dos : bénéfices, fonctionnalités clés, contenu, distributeur, mentions CE / UKCA / RoHS.", en: "A bilingual hierarchy on the back: benefits, key features, contents, distributor, CE / UKCA / RoHS marks." },
          { fr: "Une palette ivoire et vieux rose, fidèle à l’univers du studio.", en: "An ivory and dusty-rose palette, true to the studio’s world." },
        ],
      },
      {
        kind: "chapter",
        number: "II",
        title: { fr: "Lancement & presse au George V", en: "Launch & press at the George V" },
        intro: {
          fr: "Pour le lancement, j’ai organisé un dîner, puis un événement presse au spa du Four Seasons Hotel George V — organisation, invitations et coordination avec le bureau de presse Pascale Venot.",
          en: "For the launch I organised a dinner, then a press event at the spa of the Four Seasons Hotel George V — organisation, invitations and coordination with the Pascale Venot press office.",
        },
      },
      {
        kind: "pair",
        media: [
          {
            src: `${CM}/spa-power-mats.webp`,
            alt: { fr: "Transats du spa du George V équipés de matelas Charlotte Muller", en: "George V spa loungers fitted with Charlotte Muller mats" },
            caption: { fr: "Le spa avant l’arrivée des invitées : les matelas Charlotte Muller installés sur les transats.", en: "The spa before guests arrived: Charlotte Muller mats installed on the loungers." },
            ratio: 1125 / 2000,
          },
          {
            src: `${CM}/press-event-george-v.webp`,
            alt: { fr: "Démonstration du PowerMat pendant l’événement presse", en: "PowerMat demonstration during the press event" },
            caption: { fr: "Démonstration et échanges avec les journalistes autour du bassin.", en: "Demonstration and conversations with journalists by the pool." },
            ratio: 1500 / 2000,
          },
        ],
      },
      {
        kind: "video",
        src: "/video/press-event.mp4",
        poster: "/video/press-event-poster.jpg",
        ratio: 720 / 1280,
        caption: { fr: "Sur place, pendant l’événement presse.", en: "On site, during the press event." },
      },
      {
        kind: "press",
        label: { fr: "La marque dans la presse", en: "The brand in the press" },
        note: {
          fr: "Articles et communiqué publiés pendant ma mission (oct. — déc. 2025).",
          en: "Articles and press release published during my time with the brand (Oct — Dec 2025).",
        },
        items: [
          {
            outlet: "Le Journal des Palaces",
            title: "Innovation : la révolution des spas commence avec les matelas Charlotte Muller",
            date: { fr: "27 octobre 2025", en: "27 October 2025" },
            type: { fr: "Article", en: "Article" },
            url: "https://www.journaldespalaces.com/article-76280-innovation-la-revolution-des-spas-commence-avec-les-matelas-charlotte-muller.html",
          },
          {
            outlet: "Le Journal des Palaces",
            title: "Charlotte Muller lance le Mini-mat PEMF : l’objet bien-être de 30 cm qui magnétise Paris et les spas d’hôtels de luxe",
            date: { fr: "13 novembre 2025", en: "13 November 2025" },
            type: { fr: "Communiqué", en: "Press release" },
            url: "https://www.journaldespalaces.com/communique-76483-charlotte-muller-lance-le-mini-mat-pemf-l-objet-bien-etre-de-30-cm-qui-magnetise-paris-et-les-spas-d-hotels-de-luxe.html",
          },
          {
            outlet: "S-Quive",
            title: "Charlotte Muller, l’excellence au service du bien-être féminin",
            date: { fr: "11 décembre 2025", en: "11 December 2025" },
            type: { fr: "Article", en: "Article" },
            url: "https://www.s-quive.com/article/charlotte-muller-method-lexcellence-au-service-du-bien-etre-feminin",
          },
        ],
      },
      {
        kind: "chapter",
        number: "III",
        title: { fr: "L’influence au studio", en: "Influence at the studio" },
        intro: {
          fr: "Sourcing et qualification de profils, invitations, relances : j’ai participé à l’organisation de deux événements influence et presse au studio, dont un réunissant 15 invitées.",
          en: "Sourcing and qualifying profiles, invitations, follow-ups: I helped organise two influencer and press events at the studio, one of them with 15 guests.",
        },
      },
      {
        kind: "placeholder",
        label: { fr: "Photo d’un événement influence au studio", en: "Photo of an influencer event at the studio" },
        ratio: 16 / 9,
      },
      {
        kind: "chapter",
        number: "IV",
        title: { fr: "Le quotidien digital d’une marque premium", en: "The day-to-day digital life of a premium brand" },
        intro: {
          fr: "Contenus Instagram et TikTok, lives, newsletters Klaviyo, automatisations Wix, plateforme vidéo Uscreen — et un suivi hebdomadaire des KPI partagé avec la direction. En freelance (janv. — mars 2026), j’ai poursuivi avec la gestion du studio digital, les couvertures vidéo et la rédaction du Wellness Journal.",
          en: "Instagram and TikTok content, lives, Klaviyo newsletters, Wix automations, the Uscreen video platform — and weekly KPI tracking shared with management. As a freelancer (Jan — Mar 2026) I went on to manage the digital studio, design video covers and write the Wellness Journal.",
        },
      },
      {
        kind: "figures",
        label: { fr: "En chiffres", en: "In figures" },
        items: [
          { value: "1 200+", label: { fr: "vidéos mises en ligne sur Uscreen", en: "videos uploaded to Uscreen" } },
          { value: "2", label: { fr: "événements influence & presse au studio", en: "influencer & press events at the studio" } },
          { value: "15", label: { fr: "invitées lors du plus grand d’entre eux", en: "guests at the largest one" } },
        ],
      },
      {
        kind: "placeholder",
        label: { fr: "Captures : posts Instagram, newsletter Klaviyo, couvertures vidéo", en: "Screenshots: Instagram posts, Klaviyo newsletter, video covers" },
        ratio: 16 / 9,
      },
      {
        kind: "quote",
        text: {
          fr: "J’ai appris la rigueur, l’importance du détail, la cohérence d’une image et la puissance d’un positionnement clair.",
          en: "I learned rigour, the importance of detail, the consistency of an image and the power of a clear positioning.",
        },
        source: { fr: "Ce que je retiens", en: "What I take away" },
      },
    ],
  },

  /* ───────────────────────── 02 · GLOW IN MOTION ───────────────────────── */
  {
    slug: "glow-in-motion",
    featured: true,
    title: { fr: "Glow in Motion", en: "Glow in Motion" },
    client: "Erborian × Studio Charlotte Muller",
    year: { fr: "Projet personnel", en: "Personal project" },
    category: "influence",
    type: { fr: "Projet personnel · brief fictif", en: "Personal project · fictional brief" },
    role: { fr: "Conception de A à Z", en: "End-to-end concept" },
    team: { fr: "Projet individuel", en: "Solo project" },
    summary: {
      fr: "Imaginer une alliance de marques entre Erborian et le studio Charlotte Muller : un événement d’influence sensoriel autour de la Glass Glow Cream, où le mouvement rencontre le soin.",
      en: "Imagining a brand alliance between Erborian and the Charlotte Muller studio: a sensory influencer event around the Glass Glow Cream, where movement meets skincare.",
    },
    cover: {
      src: `${GM}/moodboard.webp`,
      alt: { fr: "Moodboard Glow in Motion", en: "Glow in Motion moodboard" },
      ratio: 16 / 9,
    },
    tone: "#E7B9C6",
    deliverables: [
      { fr: "Rationnel de partenariat", en: "Partnership rationale" },
      { fr: "Concept & déroulé d’événement", en: "Event concept & run of show" },
      { fr: "Moodboard", en: "Moodboard" },
      { fr: "Casting de 12 créatrices", en: "Casting of 12 creators" },
      { fr: "Plan de contenus pendant / après", en: "On-site & post-event content plan" },
    ],
    skills: [
      { fr: "Co-branding", en: "Co-branding" },
      { fr: "Marketing d’influence", en: "Influencer marketing" },
      { fr: "Concept événementiel", en: "Event concept" },
      { fr: "Direction artistique", en: "Art direction" },
    ],
    mine: [
      { fr: "Projet réalisé seule, de l’analyse des deux marques au casting des influenceuses.", en: "Carried out solo, from analysing both brands to casting the creators." },
    ],
    blocks: [
      {
        kind: "text",
        label: { fr: "Le point de départ", en: "Starting point" },
        title: { fr: "Deux marques, une même idée de la beauté.", en: "Two brands, one idea of beauty." },
        body: [
          {
            fr: "Erborian, marque franco-coréenne née de la rencontre entre plantes traditionnelles coréennes et innovation cosmétique française, lance la Glass Glow Cream : une crème-gel au ginseng blanc pour un effet « glass skin ». Le Studio Charlotte Muller, lui, accompagne les femmes dans leur équilibre global — mouvement, hormones, stress.",
            en: "Erborian, a Franco-Korean brand blending traditional Korean botanicals with French cosmetic innovation, is launching the Glass Glow Cream: a white-ginseng gel-cream for a ‘glass skin’ effect. The Charlotte Muller studio helps women find an overall balance — movement, hormones, stress.",
          },
          {
            fr: "Le lien : une beauté douce et consciente, qui révèle l’éclat naturel plutôt que de le masquer. L’une travaille la lumière de la peau, l’autre l’énergie du corps.",
            en: "The link: a gentle, mindful approach to beauty that reveals natural radiance rather than covering it up. One works on the skin’s light, the other on the body’s energy.",
          },
        ],
      },
      {
        kind: "slides",
        label: { fr: "Extraits de la recommandation", en: "From the recommendation" },
        media: [
          { src: `${GM}/erborian.webp`, alt: { fr: "Slide Erborian et la Glass Glow Cream", en: "Slide on Erborian and the Glass Glow Cream" }, caption: { fr: "La marque et le produit (visuel produit généré par IA, signalé sur la slide).", en: "Brand and product (AI-generated product visual, flagged on the slide)." }, ratio: 16 / 9 },
          { src: `${GM}/studio-cmm.webp`, alt: { fr: "Slide Studio Charlotte Muller Method", en: "Slide on the Charlotte Muller Method studio" }, caption: { fr: "Le lieu et la raison d’être du partenariat.", en: "The venue and the reason for the partnership." }, ratio: 16 / 9 },
        ],
      },
      {
        kind: "text",
        label: { fr: "Le concept", en: "The concept" },
        title: { fr: "Un moment pour ralentir.", en: "A moment to slow down." },
        body: [
          {
            fr: "« Glow in Motion » est un événement d’influence bien-être et beauté sensorielle, dans l’atmosphère intimiste du Studio CMM. Objectif : réunir une communauté de femmes créatives et influentes autour d’une expérience authentique, aux couleurs d’Erborian. Cible : les femmes de 20 à 40 ans en quête d’une routine minimaliste.",
            en: "‘Glow in Motion’ is a wellness and sensory-beauty influencer event, set in the intimate atmosphere of Studio CMM. The aim: bring together a community of creative, influential women around an authentic experience in Erborian’s colours. Target: women aged 20 to 40 looking for a minimalist routine.",
          },
        ],
      },
      {
        kind: "list",
        label: { fr: "Déroulé", en: "Run of show" },
        ordered: true,
        items: [
          { fr: "Accueil avec jus et smoothies « skin glow »", en: "Welcome with ‘skin glow’ juices and smoothies" },
          { fr: "Cours PowerMat — 30 min", en: "PowerMat class — 30 min" },
          { fr: "Face-gym express — 15 min par rotation", en: "Express face-gym — 15 min rotations" },
          { fr: "Bar à glow Erborian : test de la Glass Glow Cream et conseils d’application", en: "Erborian glow bar: Glass Glow Cream testing and application tips" },
          { fr: "Photobooth « avant / après glow »", en: "‘Before / after glow’ photobooth" },
          { fr: "Brunch skin-friendly et échanges", en: "Skin-friendly brunch and conversation" },
        ],
      },
      {
        kind: "image",
        layout: "wide",
        media: { src: `${GM}/event-concept.webp`, alt: { fr: "Slide de présentation de l’événement Glow in Motion", en: "Slide presenting the Glow in Motion event" }, ratio: 16 / 9 },
      },
      {
        kind: "image",
        layout: "full",
        media: { src: `${GM}/moodboard.webp`, alt: { fr: "Moodboard Glow in Motion : textures, smoothies roses, tapis, brunch", en: "Glow in Motion moodboard: textures, pink smoothies, mats, brunch" }, caption: { fr: "Moodboard : rose poudré, lumière douce, textures et gestes.", en: "Moodboard: powder pink, soft light, textures and gestures." }, ratio: 16 / 9 },
      },
      {
        kind: "text",
        label: { fr: "Le casting", en: "The casting" },
        title: { fr: "12 créatrices, choisies une à une.", en: "12 creators, chosen one by one." },
        body: [
          {
            fr: "De 78 k à plus de 3,5 M d’abonnés : des expertes beauté pour la caution produit, des créatrices lifestyle et jeunes mamans pour l’ancrage quotidien, des voix self-love et body positive pour le discours d’estime de soi. Critères croisés : affinité avec le Pilates et le yoga, relation existante avec Erborian, authenticité de la communauté.",
            en: "From 78k to over 3.5M followers: beauty experts for product credibility, lifestyle creators and young mothers for everyday relevance, self-love and body-positive voices for the self-esteem message. Cross-checked criteria: affinity with Pilates and yoga, an existing relationship with Erborian, an authentic community.",
          },
          {
            fr: "Pour chacune : un contenu pendant l’événement (stories, reels texture, GRWM glow) et une suite après (challenge « 30 jours glow », interview avec Charlotte Muller, routine glass skin…), pour faire vivre la collaboration au-delà de la journée.",
            en: "For each: on-site content (stories, texture reels, glow GRWM) and a follow-up (a ‘30-day glow’ challenge, an interview with Charlotte Muller, a glass-skin routine…) to keep the collaboration alive beyond the day.",
          },
        ],
      },
    ],
  },

  /* ───────────────────────── 03 · SPICE YOUR DRINK ───────────────────────── */
  {
    slug: "spice-your-drink",
    featured: true,
    title: { fr: "Spice Your Drink", en: "Spice Your Drink" },
    client: "Sauces Martin",
    year: { fr: "EFAP · cours de marketing", en: "EFAP · Marketing course" },
    category: "campaigns",
    type: { fr: "Projet de groupe", en: "Group project" },
    role: { fr: "Membre de l’agence fictive « Crescendo »", en: "Member of the fictional agency ‘Crescendo’" },
    team: { fr: "Travail de groupe", en: "Group work" },
    summary: {
      fr: "Faire goûter une sauce piquante à ceux qui en ont peur : une activation en magasin où la Naga Mango devient l’ingrédient secret d’un mocktail, prolongée par une ODR et une campagne sociale.",
      en: "Getting people who fear hot sauce to taste one: an in-store activation where Naga Mango becomes the secret ingredient of a mocktail, extended by a cashback offer and a social campaign.",
    },
    cover: {
      src: `${SD}/cover.webp`,
      alt: { fr: "Couverture de la recommandation Crescendo × Sauces Martin", en: "Cover of the Crescendo × Sauces Martin recommendation" },
      ratio: 2000 / 962,
    },
    tone: "#E8743B",
    deliverables: [
      { fr: "Analyse marché & 4P", en: "Market analysis & 4Ps" },
      { fr: "Insight & stratégie", en: "Insight & strategy" },
      { fr: "Concept créatif", en: "Creative concept" },
      { fr: "Activation en magasin", en: "In-store activation" },
      { fr: "ODR", en: "Cashback offer" },
      { fr: "Spot social 9:16 / 16:9", en: "9:16 / 16:9 social spot" },
      { fr: "KPI", en: "KPIs" },
    ],
    skills: [
      { fr: "Analyse marketing", en: "Marketing analysis" },
      { fr: "Insight consommateur", en: "Consumer insight" },
      { fr: "Shopper marketing", en: "Shopper marketing" },
      { fr: "Définition de KPI", en: "KPI design" },
    ],
    mine: [
      { fr: "[À compléter] Précise ici les parties que tu as réalisées toi-même (ex. : analyse, concept, KPI, mise en page…).", en: "[To complete] Specify the parts you handled yourself (e.g. analysis, concept, KPIs, layout…)." },
    ],
    teamWork: [
      { fr: "Recommandation complète construite en groupe, de l’analyse aux KPI.", en: "Full recommendation built as a team, from analysis to KPIs." },
    ],
    blocks: [
      {
        kind: "text",
        label: { fr: "Contexte", en: "Context" },
        title: { fr: "Une marque connue, une recette qui ne l’est pas.", en: "A known brand, a recipe that isn’t." },
        body: [
          {
            fr: "Sauces Martin est une marque française de sauces pimentées fondée par trois cousins chefs : 15 recettes, plus de 1 400 points de vente et 1 500 restaurants partenaires, un ton fun et décalé. Mais certaines recettes, comme la Naga Mango — douceur de la mangue, puissance du piment Naga —, restent peu connues. Or la valeur d’une sauce repose d’abord sur la dégustation.",
            en: "Sauces Martin is a French hot-sauce brand founded by three chef cousins: 15 recipes, over 1,400 points of sale and 1,500 partner restaurants, a fun and offbeat tone. Yet some recipes, like Naga Mango — mango sweetness, Naga-chilli heat — remain little known. And a sauce’s value lies first in tasting it.",
          },
        ],
      },
      {
        kind: "slides",
        label: { fr: "Analyse", en: "Analysis" },
        media: [
          { src: `${SD}/client.webp`, alt: { fr: "Slide Le client", en: "Client slide" }, ratio: 16 / 9 },
          { src: `${SD}/context.webp`, alt: { fr: "Slide Contexte & analyses : objectifs et 4P", en: "Context & analysis slide: objectives and 4Ps" }, ratio: 16 / 9 },
        ],
      },
      {
        kind: "quote",
        text: {
          fr: "« J’ai envie de découvrir des saveurs nouvelles et épicées, mais j’ai peur que ce soit trop fort pour moi. »",
          en: "‘I want to discover new, spicy flavours, but I’m afraid it will be too hot for me.’",
        },
        source: { fr: "Insight consommateur", en: "Consumer insight" },
      },
      {
        kind: "text",
        label: { fr: "Stratégie", en: "Strategy" },
        title: { fr: "La douceur qui cache du caractère.", en: "Sweetness with a hidden kick." },
        body: [
          {
            fr: "Cible : les 25–40 ans urbains, actifs, curieux en cuisine et sensibles aux tendances food comme le « swicy » (sucré + épicé). Ils aiment découvrir, mais ont besoin d’être rassurés face au piment : la dégustation devient le levier clé pour transformer la curiosité en achat. Le ton : chaleureux, complice, légèrement provocateur — jamais dans la performance ou le défi.",
            en: "Target: urban, active 25–40-year-olds, curious about cooking and responsive to food trends like ‘swicy’ (sweet + spicy). They love discovery but need reassurance about chilli: tasting becomes the key lever to turn curiosity into purchase. Tone: warm, playful, slightly provocative — never about endurance or dares.",
          },
        ],
      },
      {
        kind: "image",
        layout: "wide",
        media: { src: `${SD}/concept.webp`, alt: { fr: "Slide Notre concept", en: "Our concept slide" }, ratio: 16 / 9 },
      },
      {
        kind: "text",
        label: { fr: "Concept", en: "Concept" },
        title: { fr: "Spice Your Drink.", en: "Spice Your Drink." },
        body: [
          {
            fr: "Révéler un nouvel usage : bien plus qu’un condiment, la Naga Mango devient l’ingrédient qui « twiste » les boissons et s’invite dans les moments de convivialité du quotidien. Le concept répond directement à l’insight, s’appuie sur la spécificité du produit — l’équilibre fruité/épicé — et transforme la découverte du piment en expérience gourmande et accessible.",
            en: "Reveal a new use: far more than a condiment, Naga Mango becomes the ingredient that twists drinks and joins everyday moments of conviviality. The concept answers the insight head-on, builds on what makes the product unique — the fruity/spicy balance — and turns discovering chilli into an accessible, indulgent experience.",
          },
        ],
      },
      {
        kind: "list",
        label: { fr: "Dispositif", en: "Activation plan" },
        items: [
          { fr: "Activation en magasin : stand de dégustation de mocktails à la Naga Mango.", en: "In-store activation: Naga Mango mocktail tasting stand." },
          { fr: "ODR « Testez-la chez vous » : 1 bouteille achetée = 2 € remboursés via QR code, recettes de mocktails incluses.", en: "‘Try it at home’ cashback: buy 1 bottle, get €2 back via QR code, mocktail recipes included." },
          { fr: "Spot social vertical 9:16 pour Reels et TikTok, déclinaison 16:9 pour les écrans événementiels.", en: "Vertical 9:16 social spot for Reels and TikTok, with a 16:9 version for event screens." },
          { fr: "Signature : « Sauces Martin. Goûtez l’audace. »", en: "Sign-off: ‘Sauces Martin. Taste the audacity.’" },
        ],
      },
      {
        kind: "pair",
        media: [
          { src: `${SD}/activation.webp`, alt: { fr: "Slide Activation en magasin", en: "In-store activation slide" }, ratio: 16 / 9 },
          { src: `${SD}/odr.webp`, alt: { fr: "Slide ODR Testez-la chez vous", en: "‘Try it at home’ cashback slide" }, ratio: 16 / 9 },
        ],
      },
      {
        kind: "figures",
        label: { fr: "Objectifs fixés", en: "Targets set" },
        note: {
          fr: "Objectifs de la recommandation — projet d’école, non déployé.",
          en: "Targets from the recommendation — a school project, not rolled out.",
        },
        items: [
          { value: "20–25 %", label: { fr: "de conversion dégustation → achat", en: "tasting-to-purchase conversion" } },
          { value: "200", label: { fr: "dégustations par magasin et par jour", en: "tastings per store per day" } },
          { value: "30 %", label: { fr: "des acheteurs activent l’ODR", en: "of buyers redeem the offer" } },
          { value: "200", label: { fr: "contenus générés par les consommateurs", en: "pieces of user-generated content" } },
        ],
      },
    ],
  },

  /* ───────────────────────── 04 · BIG BATTLE ───────────────────────── */
  {
    slug: "big-battle-parc-asterix",
    featured: true,
    title: { fr: "Big Battle × Parc Astérix", en: "Big Battle × Parc Astérix" },
    client: "Parc Astérix",
    year: { fr: "2026", en: "2026" },
    category: "strategy",
    type: { fr: "Compétition nationale EFAP · équipe de 6", en: "EFAP national competition · team of 6" },
    role: { fr: "Agence « PAgency »", en: "Agency ‘PAgency’" },
    team: { fr: "Équipe de 6 étudiants", en: "Team of 6 students" },
    summary: {
      fr: "Un peu plus de deux semaines pour bâtir et défendre une stratégie de communication 360° pour un annonceur réel. 1ʳᵉ place sur 63 équipes à Paris, 3ᵉ place à la finale nationale.",
      en: "Just over two weeks to build and defend a 360° communications strategy for a real advertiser. 1st of 63 teams in Paris, 3rd at the national final.",
    },
    cover: null,
    poster: { figure: "3", sup: "e", line: { fr: "au national — 1ʳᵉ sur 63 équipes à Paris", en: "nationally — 1st of 63 teams in Paris" } },
    tone: "#B89B6E",
    deliverables: [
      { fr: "Benchmark concurrentiel", en: "Competitive benchmark" },
      { fr: "Insights & ciblage", en: "Insights & targeting" },
      { fr: "Concept créatif", en: "Creative concept" },
      { fr: "Social, influence & RP", en: "Social, influencer & PR" },
      { fr: "CRM & plan média", en: "CRM & media plan" },
      { fr: "Activations", en: "Activations" },
      { fr: "KPI & budget", en: "KPIs & budget" },
      { fr: "Soutenance devant jury", en: "Jury pitch" },
    ],
    skills: [
      { fr: "Stratégie 360°", en: "360° strategy" },
      { fr: "Plan média", en: "Media planning" },
      { fr: "Budget", en: "Budgeting" },
      { fr: "Prise de parole", en: "Pitching" },
      { fr: "Travail sous pression", en: "Working under pressure" },
    ],
    mine: [
      { fr: "[À compléter] Précise ta contribution personnelle (ex. : benchmark, influence & RP, plan média, soutenance…).", en: "[To complete] Specify your own contribution (e.g. benchmark, influencer & PR, media plan, pitch…)." },
    ],
    teamWork: [
      { fr: "Stratégie 360° construite et défendue en équipe devant le jury.", en: "360° strategy built and defended as a team in front of the jury." },
    ],
    blocks: [
      {
        kind: "figures",
        label: { fr: "Résultat", en: "Outcome" },
        items: [
          { value: "1ʳᵉ", label: { fr: "place sur 63 équipes · campus EFAP Paris", en: "place out of 63 teams · EFAP Paris campus" } },
          { value: "3ᵉ", label: { fr: "place à la finale nationale, au Parc Astérix", en: "place at the national final, held at Parc Astérix" } },
          { value: "~2", label: { fr: "semaines entre le brief et la finale", en: "weeks from brief to final" } },
        ],
      },
      {
        kind: "text",
        label: { fr: "Le défi", en: "The challenge" },
        title: { fr: "Une recommandation complète, pour un vrai annonceur.", en: "A complete recommendation, for a real advertiser." },
        body: [
          {
            fr: "La Big Battle est la compétition nationale de l’EFAP. En un peu plus de deux semaines, notre équipe a imaginé, structuré et défendu une stratégie de communication 360° pour le Parc Astérix : benchmark, insights, ciblage, concept créatif, social media, influence et RP, CRM, plan média, activations, KPI et budget.",
            en: "The Big Battle is EFAP’s national competition. In just over two weeks our team imagined, structured and defended a 360° communications strategy for Parc Astérix: benchmark, insights, targeting, creative concept, social media, influencer and PR, CRM, media plan, activations, KPIs and budget.",
          },
          {
            fr: "Premiers parmi 63 équipes sur le campus de Paris, nous avons représenté l’école lors de la finale nationale, organisée au Parc Astérix — et décroché la troisième place.",
            en: "First out of 63 teams on the Paris campus, we represented the school at the national final, held at Parc Astérix — and took third place.",
          },
        ],
      },
      {
        kind: "placeholder",
        label: { fr: "Photo de l’équipe en finale / slides de la recommandation", en: "Team photo at the final / recommendation slides" },
        ratio: 16 / 9,
      },
      {
        kind: "quote",
        text: {
          fr: "Deux semaines qui nous ont appris bien plus que n’importe quel cours : travailler sous pression, défendre nos idées, faire confiance au collectif.",
          en: "Two weeks that taught us more than any class: working under pressure, defending our ideas, trusting the team.",
        },
        source: { fr: "Ce que je retiens", en: "What I take away" },
      },
    ],
  },

  /* ───────────────────────── 05 · RAVENSARE ───────────────────────── */
  {
    slug: "festival-ravensare",
    featured: false,
    title: { fr: "Festival Ravensare", en: "Ravensare Festival" },
    client: "Le Trait Bleu",
    year: { fr: "Avril — mai 2024", en: "April — May 2024" },
    category: "events",
    type: { fr: "Stage", en: "Internship" },
    role: { fr: "Stagiaire communication, RP & événementiel", en: "Communications, PR & Events Intern" },
    team: { fr: "Association Le Trait Bleu, Toulouse", en: "Le Trait Bleu association, Toulouse" },
    summary: {
      fr: "Faire connaître un festival de danse en plein air à Toulouse : relations presse, affiches, réseaux sociaux, campagne dans les transports en commun et logistique du festival.",
      en: "Promoting an open-air dance festival in Toulouse: press relations, posters, social media, a public-transport campaign and festival logistics.",
    },
    cover: null,
    tone: "#7E8FA6",
    deliverables: [
      { fr: "Affiches", en: "Posters" },
      { fr: "Campagne transports en commun", en: "Public transport campaign" },
      { fr: "Relations presse", en: "Press relations" },
      { fr: "Contenus réseaux sociaux", en: "Social media content" },
    ],
    skills: [
      { fr: "Relations presse", en: "Press relations" },
      { fr: "Design d’affiches", en: "Poster design" },
      { fr: "Logistique événementielle", en: "Event logistics" },
    ],
    mine: [
      { fr: "Relations presse, réseaux sociaux, création et diffusion de contenus.", en: "Press relations, social media, content creation and distribution." },
      { fr: "Conception d’affiches et mise en place d’une campagne dans le réseau de transports en commun.", en: "Poster design and roll-out of a campaign across the public-transport network." },
      { fr: "Planning, standard téléphonique et e-mails ; appui à la logistique et à la coordination du festival.", en: "Scheduling, phone line and emails; support with festival logistics and coordination." },
    ],
    blocks: [
      {
        kind: "text",
        label: { fr: "Contexte", en: "Context" },
        body: [
          {
            fr: "Organisé par l’association Le Trait Bleu, Ravensare transforme chaque année le jardin Raymond VI, à Toulouse, en scène à ciel ouvert, avec des danseurs venus de toute la France.",
            en: "Run by the Le Trait Bleu association, Ravensare turns Toulouse’s Jardin Raymond VI into an open-air stage every year, with dancers from all over France.",
          },
        ],
      },
      {
        kind: "placeholder",
        label: { fr: "Affiches du festival et visuels de la campagne transports", en: "Festival posters and transport campaign visuals" },
        ratio: 4 / 3,
      },
    ],
  },

  /* ───────────────────────── 06 · HOPLA ───────────────────────── */
  {
    slug: "hopla",
    featured: false,
    title: { fr: "Hopla, street-food alsacienne", en: "Hopla, Alsatian street food" },
    client: "Hopla Street Food Alsacienne",
    year: { fr: "Janvier — mars 2025", en: "January — March 2025" },
    category: "digital",
    type: { fr: "Stage", en: "Internship" },
    role: { fr: "Stagiaire communication & social media", en: "Communications & Social Media Intern" },
    team: { fr: "Toulouse", en: "Toulouse" },
    summary: {
      fr: "Donner une voix digitale à un restaurant de street-food : contenus photo et vidéo, réseaux sociaux, relation client et refonte du menu.",
      en: "Giving a street-food restaurant a digital voice: photo and video content, social media, customer relations and a menu redesign.",
    },
    cover: null,
    tone: "#C46A4A",
    deliverables: [
      { fr: "Refonte du menu", en: "Menu redesign" },
      { fr: "Contenus photo & vidéo", en: "Photo & video content" },
      { fr: "Supports marketing", en: "Marketing materials" },
    ],
    skills: [
      { fr: "Création de contenus", en: "Content creation" },
      { fr: "Community management", en: "Community management" },
      { fr: "Relation client", en: "Customer relations" },
    ],
    mine: [
      { fr: "Création de contenus photo et vidéo, gestion des réseaux sociaux.", en: "Created photo and video content, managed social media." },
      { fr: "Refonte du menu et supports marketing pour les produits.", en: "Redesigned the menu and produced marketing materials for products." },
      { fr: "Relation et service client.", en: "Customer relations and service." },
    ],
    blocks: [
      {
        kind: "placeholder",
        label: { fr: "Menu redessiné et exemples de posts", en: "Redesigned menu and sample posts" },
        ratio: 4 / 3,
      },
    ],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function nextProject(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}
