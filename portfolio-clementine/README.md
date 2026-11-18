# Portfolio — Clémentine Sanchez · « Le musée »

Le portfolio se visite comme un musée d’art contemporain : on fait défiler pour avancer dans les salles.

- **Galerie 01** — Entrée · **Galerie 02** — Œuvres choisies · **Cabinet d’études** · **Galerie 03** — Parcours · **Galerie 04** — À propos · **Sortie** — Contact
- Chaque œuvre ouvre sa salle dédiée : `/oeuvres/<slug>/`
- Ordinateur : visite 3D (Three.js). Téléphone, animations réduites ou appareil sans WebGL : galerie verticale.

## Modifier le contenu
Tout est dans **`content/museum.ts`** (œuvres, cartels, parcours, à propos, phrase de sortie) et **`content/site.ts`** (e-mail, LinkedIn, CV).

- **Ajouter une œuvre** : copie un bloc de `works`, change `slug`, `title`, `line`, `role`, l’image `art` et les textes `brief` / `did` / `result`. `room: "main"` = galerie principale, `room: "cabinet"` = cabinet d’études. La 3D se réorganise toute seule.
- **Images** : dépose-les dans `public/images/…`. `ratio` = largeur ÷ hauteur.
- **Reel Instagram** : `reel: { id: "…", cartel: "…" }` (l’identifiant est la partie après `/reel/` dans le lien).
- **CV** : remplace `public/cv/Clementine-Sanchez-CV-EN.pdf` (même nom).

## Lancer en local
```bash
cd portfolio-clementine
npm install
npm run dev   # http://localhost:3000
```

## Publication
Vercel (projet `clementine-sanchez`, dossier racine `portfolio-clementine`). Toute modification fusionnée dans `master` met le site à jour automatiquement.
