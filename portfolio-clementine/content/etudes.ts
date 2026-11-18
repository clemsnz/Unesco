/**
 * ─────────────────────────────────────────────────────────────
 *  ÉTUDES DE CAS — le contenu détaillé de chaque salle d'œuvre.
 *  La clé est le `slug` de l'œuvre (voir content/museum.ts).
 *  Tous les champs sont facultatifs : une section vide n'apparaît pas.
 * ─────────────────────────────────────────────────────────────
 */

export type Etude = {
  /** Fiche d'identité : quelques lignes « clé : valeur » */
  facts: { k: string; v: string }[];
  context: string[];
  goals?: string[];
  /** Ce que j'ai fait, mission par mission */
  missions: string[];
  /** L'idée, la démarche */
  idea?: { title: string; text: string[] };
  figures?: { value: string; label: string }[];
  /** Petite note sous les chiffres (ex. objectifs et non résultats) */
  figuresNote?: string;
  deliverables?: string[];
  skills?: string[];
  takeaway?: string;
  /** Mention de confidentialité éventuelle */
  note?: string;
};

export const etudes: Record<string, Etude> = {
  "charlotte-muller": {
    facts: [
      { k: "Marque", v: "Charlotte Muller Method" },
      { k: "Rôle", v: "Assistante communication & marketing, puis freelance" },
      { k: "Période", v: "Stage de 5 mois, puis freelance · 2025 — 2026" },
      { k: "Lieu", v: "Paris 9ᵉ · Four Seasons George V" },
      { k: "En lien avec", v: "La fondatrice, Charlotte Muller · le bureau de presse Pascale Venot" },
    ],
    context: [
      "Charlotte Muller Method est un studio parisien dédié au bien-être féminin, installé au dernier étage de l’ancien hôtel particulier du galeriste Goupil. On y pratique le Pilates, le yoga et la barre sur des matelas qui associent infrarouge lointain et champs électromagnétiques pulsés (PEMF), conçus par Charlotte Muller elle-même. Ces matelas équipent aussi le spa du Four Seasons Hotel George V.",
      "Fin 2025, la marque lance le Mini Mat : un tapis PEMF infrarouge de 30 cm, disponible à partir du 1ᵉʳ décembre.",
    ],
    goals: [
      "Faire d’un objet technique un objet désirable.",
      "Faire exister le lancement auprès de la presse beauté, bien-être et palaces.",
      "Faire venir chaque mois créatrices de contenu et journalistes.",
      "Animer la communauté digitale de la marque au quotidien.",
    ],
    missions: [
      "Conception du packaging du Mini Mat, de A à Z.",
      "Dîner de lancement imaginé de A à Z : le jeu « P-ingo », la carte cadeau « A Gift for You », les menus et la décoration de la salle.",
      "Événement presse au spa du Four Seasons George V : organisation, invitations et coordination avec le bureau de presse Pascale Venot.",
      "Une quinzaine d’événements presse & influence, au studio et au George V : sélection et qualification des influenceuses, invitations, relances, organisation, dont un événement avec 15 invitées.",
      "Photos et vidéos pendant les événements : c’est moi qui étais derrière l’appareil.",
      "Contenus Instagram et TikTok, reels, préparation et production de lives Instagram.",
      "Newsletters et campagnes Klaviyo (segmentation), automatisations Wix, messages clients.",
      "Plus de 1 200 vidéos mises en ligne sur la plateforme Uscreen, couvertures vidéo.",
      "Suivi hebdomadaire des OKR et KPI (influence, abonnements, e-mailing) et reporting à la direction.",
      "Rédaction du Wellness Journal, et dossier entreprise de 19 pages conçu de A à Z.",
    ],
    idea: {
      title: "Un lancement qui se vit",
      text: [
        "Plutôt qu’un simple communiqué, le Mini Mat a été lancé comme une expérience : un dîner où chaque détail racontait la marque, du jeu P-ingo posé sur les assiettes à la carte cadeau remise aux invitées.",
        "La presse a ensuite découvert les matelas là où ils sont utilisés : au spa d’un palace parisien.",
      ],
    },
    figures: [
      { value: "≈ 15", label: "événements presse & influence" },
      { value: "15", label: "invitées au plus grand d’entre eux" },
      { value: "1 200+", label: "vidéos mises en ligne sur Uscreen" },
      { value: "3", label: "articles et communiqué publiés" },
      { value: "19", label: "pages de dossier entreprise" },
    ],
    deliverables: ["Packaging du Mini Mat", "Dîner de lancement", "Événement presse au George V", "Événements influence mensuels", "Reels, lives, contenus", "Newsletters Klaviyo", "Wellness Journal", "Dossier entreprise"],
    skills: ["Relations presse", "Marketing d’influence", "Événementiel", "Packaging", "Direction artistique", "CRM & e-mailing", "Social media", "Suivi de KPI"],
    takeaway: "J’ai appris la rigueur, l’importance du détail, la cohérence d’une image et la puissance d’un positionnement clair.",
  },

  "big-battle-parc-asterix": {
    facts: [
      { k: "Compétition", v: "Big Battle EFAP 2026" },
      { k: "Annonceur", v: "Parc Astérix (brief réel)" },
      { k: "Agence", v: "Prisme Agency" },
      { k: "Équipe", v: "6 étudiants : Inès, Isaure, Léonore, Yona, Rilès et moi" },
      { k: "Durée", v: "Un peu plus de deux semaines" },
    ],
    context: [
      "La Big Battle est la compétition nationale de l’EFAP : les équipes reçoivent le brief d’un vrai annonceur et ont un peu plus de deux semaines pour construire et défendre une recommandation complète.",
      "En 2026, l’annonceur était le Parc Astérix.",
    ],
    missions: [
      "Benchmark concurrentiel et étude de marché.",
      "Insights et ciblage.",
      "Concept créatif et plateforme de campagne.",
      "Social media, influence et relations presse.",
      "CRM, plan média et activations.",
      "KPI, budget et rétroplanning.",
      "Soutenance devant le jury, à Paris puis en finale nationale au Parc Astérix.",
    ],
    idea: {
      title: "Une stratégie 360°, construite à six",
      text: ["Toute la recommandation a été pensée collectivement, de l’analyse à la soutenance, avec l’accompagnement de Benjamin Dahan."],
    },
    figures: [
      { value: "1ʳᵉ", label: "sur 63 équipes, campus EFAP Paris" },
      { value: "3ᵉ", label: "à la finale nationale, au Parc Astérix" },
      { value: "≈ 2", label: "semaines entre le brief et la finale" },
    ],
    deliverables: ["Recommandation de 39 pages", "Concept créatif", "Plan média", "Activations", "Budget & KPI", "Soutenance"],
    skills: ["Stratégie 360°", "Insight", "Concept créatif", "Plan média", "Budget", "Prise de parole", "Travail sous pression"],
    takeaway: "Deux semaines qui nous ont appris plus que n’importe quel cours : travailler sous pression, défendre nos idées, faire confiance au collectif.",
    note: "Le contenu de la recommandation reste confidentiel à la demande de l’annonceur.",
  },

  "festival-ravensare": {
    facts: [
      { k: "Structure", v: "Association Le Trait Bleu" },
      { k: "Rôle", v: "Stagiaire communication, RP & événementiel" },
      { k: "Période", v: "Stage · avril — mai 2024" },
      { k: "Lieu", v: "Jardin Raymond VI, Toulouse" },
    ],
    context: [
      "Ravensare est un festival de danse en plein air organisé chaque année par l’association Le Trait Bleu, dans le jardin Raymond VI à Toulouse. Pour sa 22ᵉ édition, les 29 et 30 juin 2024 : spectacles de danse, concert, concours de hip-hop et initiation à la danse hustle.",
    ],
    missions: [
      "Création de l’affiche et de la bannière du festival, de A à Z.",
      "Mise en place d’une campagne d’affichage dans le réseau de transports en commun.",
      "Relations presse.",
      "Contenus et animation des réseaux sociaux, listes de diffusion.",
      "Planning, standard téléphonique et e-mails.",
      "Appui à la logistique et à la coordination du festival.",
    ],
    idea: {
      title: "Le mouvement en affiche",
      text: ["Un fond turquoise, la typographie « DANSE » qui se disloque comme un corps en mouvement, et les danseurs du festival en photo."],
    },
    deliverables: ["Affiche A3", "Bannière web", "Campagne transports", "Contenus réseaux sociaux"],
    skills: ["Design d’affiche", "Relations presse", "Social media", "Logistique événementielle"],
  },

  "secours-populaire": {
    facts: [
      { k: "Association", v: "Secours Populaire de Colomiers" },
      { k: "Cadre", v: "Projet d’école EFAP, en équipe" },
      { k: "Année", v: "2025" },
    ],
    context: ["Le Secours Populaire de Colomiers, association locale d’entraide, manquait de visibilité auprès des habitants."],
    goals: ["Repenser toute sa communication.", "Mieux faire connaître sa mission et créer du lien avec la communauté."],
    missions: ["Nouvelle identité visuelle et nouveau logo.", "Campagne d’affiches, dont « Solitude ».", "Contenus pour les réseaux sociaux."],
    idea: {
      title: "Nommer ce qu’on ne voit pas",
      text: ["« À Colomiers, une personne âgée sur six vit dans l’isolement. » L’affiche pose un mot sur le visage : solitude. Puis elle invite à agir : « Ensemble, redonnons-leur une vie sociale et un peu de chaleur humaine. »"],
    },
    deliverables: ["Identité visuelle", "Logo", "Affiches", "Contenus réseaux sociaux"],
    skills: ["Communication solidaire", "Identité visuelle", "Conception-rédaction"],
  },

  "face-camera": {
    facts: [
      { k: "Cadre", v: "EFAP, plateau TV" },
      { k: "Format", v: "Chronique de 1 min 30" },
      { k: "Accompagnée par", v: "Sébastien Erson" },
      { k: "Année", v: "2026" },
    ],
    context: ["À l’EFAP, les étudiants passent en plateau pour présenter une chronique face caméra, dans les conditions du direct."],
    missions: [
      "Écriture et présentation d’une chronique sur le Marathon de Paris 2026.",
      "Travail du regard caméra, de la gestion du stress, de l’articulation et du rythme.",
      "Dans les coulisses d’un live shopping Orange animé par Sébastien Erson.",
    ],
    idea: { title: "On ne récite pas, on incarne", text: ["Sur le papier, une chronique paraît simple. En plateau, tout se joue en quelques secondes."] },
    skills: ["Prise de parole", "Écriture pour l’oral", "Aisance face caméra"],
    takeaway: "Une expérience qui confirme mon envie d’évoluer dans l’univers des médias et de la communication.",
  },

  hopla: {
    facts: [
      { k: "Enseigne", v: "Hopla, street-food alsacienne" },
      { k: "Rôle", v: "Stagiaire communication & social media" },
      { k: "Période", v: "Stage · janvier — mars 2025" },
      { k: "Lieu", v: "Toulouse" },
    ],
    context: ["Hopla sert une street-food alsacienne à Toulouse : hot-dogs, spaetzles, bretzels, gaufres. Une identité forte et décalée, à faire vivre sur la table comme sur Instagram."],
    missions: [
      "Refonte du menu : mise en page et création d’une partie des illustrations.",
      "Photos, vidéos et reels pour Instagram ; gestion du compte @hopla.toulouse.",
      "Supports marketing pour les produits.",
      "Relation et service client.",
      "Participation à la stratégie de communication globale du restaurant.",
    ],
    deliverables: ["Menu A4 recto-verso", "Reels et posts Instagram", "Supports marketing"],
    skills: ["Création de contenus", "Community management", "Mise en page", "Relation client"],
    takeaway: "L’importance de la cohérence et de l’image de marque dans un environnement au contact direct des clients.",
  },

  "glow-in-motion": {
    facts: [
      { k: "Marques", v: "Erborian × Studio Charlotte Muller" },
      { k: "Cadre", v: "Projet personnel, brief fictif" },
      { k: "Format", v: "Événement d’influence" },
    ],
    context: [
      "Erborian, marque franco-coréenne, lance la Glass Glow Cream : une crème-gel au ginseng blanc, à la réglisse et au squalane, pour un effet « glass skin ». Cible : les femmes de 20 à 40 ans en quête d’une routine minimaliste.",
      "Le Studio Charlotte Muller accompagne les femmes dans leur équilibre global. Les deux marques partagent une même idée de la beauté : douce, consciente, qui révèle l’éclat naturel.",
    ],
    missions: [
      "Rationnel du partenariat entre les deux marques.",
      "Concept et déroulé de l’événement.",
      "Moodboard.",
      "Sélection de 12 créatrices, de 78 k à plus de 3,5 M d’abonnés, avec pour chacune les contenus prévus pendant et après l’événement.",
    ],
    idea: {
      title: "Un moment pour ralentir",
      text: [
        "Accueil avec smoothies « skin glow », cours sur PowerMat, face-gym express, bar à glow Erborian pour tester la crème, photobooth « avant / après glow », puis brunch.",
        "Le casting croise trois profils : expertes beauté pour la crédibilité, créatrices lifestyle pour le quotidien, voix self-love pour l’estime de soi.",
      ],
    },
    figures: [
      { value: "12", label: "créatrices sélectionnées" },
      { value: "6", label: "temps forts dans le déroulé" },
    ],
    deliverables: ["Recommandation", "Déroulé d’événement", "Moodboard", "Casting d’influenceuses"],
    skills: ["Co-branding", "Marketing d’influence", "Concept événementiel"],
  },

  "spice-your-drink": {
    facts: [
      { k: "Marque", v: "Sauces Martin" },
      { k: "Cadre", v: "Cours de marketing, EFAP · travail de groupe" },
      { k: "Rôle", v: "Cheffe de projet de l’agence fictive Crescendo" },
    ],
    context: [
      "Sauces Martin est une marque française de sauces pimentées fondée par trois cousins chefs : 15 recettes, plus de 1 400 points de vente et 1 500 restaurants partenaires.",
      "Certaines recettes restent peu connues, comme la Naga Mango, qui marie la mangue et le piment Naga. Or une sauce se vend d’abord en la goûtant.",
    ],
    goals: ["Faire connaître la Naga Mango.", "Renforcer une image audacieuse et fun.", "Générer de l’engagement sur les réseaux.", "Faire goûter, en magasin, pour déclencher l’achat."],
    missions: ["Coordination de l’équipe en tant que cheffe de projet.", "Analyse de marché et des 4P.", "Insight, cible et stratégie.", "Concept, activation, offre de remboursement et KPI."],
    idea: {
      title: "« J’ai envie de goûter, mais j’ai peur que ce soit trop fort »",
      text: [
        "Le concept « Spice Your Drink » fait de la sauce l’ingrédient secret d’un mocktail : une façon gourmande et rassurante de découvrir le piment.",
        "Le dispositif : dégustations en magasin, offre « 1 bouteille achetée = 2 € remboursés » avec recettes, et spot vertical pour Reels et TikTok.",
      ],
    },
    figures: [
      { value: "20–25 %", label: "de conversion dégustation → achat" },
      { value: "200", label: "dégustations par magasin et par jour" },
      { value: "30 %", label: "des acheteurs activent l’offre" },
    ],
    figuresNote: "Objectifs fixés dans la recommandation : projet d’école, non déployé.",
    deliverables: ["Analyse de marché", "Concept créatif", "Activation en magasin", "Offre de remboursement", "Spot social", "KPI"],
    skills: ["Analyse marketing", "Insight", "Shopper marketing", "Gestion de projet"],
  },
};
