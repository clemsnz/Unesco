# Portfolio — Clémentine Sanchez

Style : **magazine épuré** (fond crème, typographie Newsreader + Instrument Sans) avec une touche de couleur **bordeaux / rose poudré**.
Technique : Next.js · TypeScript · Tailwind CSS. Site statique, en français (`/fr/`) et en anglais (`/en/`).

---

## 1. Modifier les contenus

Tout le texte est dans le dossier **`content/`**. Chaque texte existe en deux langues : `{ fr: "…", en: "…" }`.

| Je veux…                                         | Fichier                |
|--------------------------------------------------|------------------------|
| changer mon e-mail, LinkedIn, phrase d’accroche  | `content/site.ts`      |
| modifier / ajouter / réordonner un **projet**    | `content/projects.ts`  |
| modifier mon parcours, compétences, textes des boutons | `content/about.ts` |

### Ajouter un projet
1. Dans `content/projects.ts`, copie un bloc `{ slug: "…", … }` en entier et colle-le dans la liste.
2. Change le `slug` (= adresse de la page) — minuscules, tirets, sans accent.
3. Remplis : `brief` (1 phrase), `did` (2–3 puces courtes), `result` (facultatif).
4. Dépose les photos dans `public/images/<dossier>/` et indique leur chemin.
5. Le **premier projet de la liste** est affiché « À la une » sur l’accueil.

Types de blocs photo disponibles : `image`, `pair` (2 photos), `row` (rangée, ex. stories), `pages` (pages d’un document), `video`.

### Remplacer une photo
Remplace le fichier en gardant le même nom. Si ses proportions changent, mets à jour `ratio` (largeur ÷ hauteur).
Pour recadrer une vignette : ajoute `position: "50% 30%"` à l’image.

### Mettre à jour le CV
Remplace `public/cv/Clementine-Sanchez-CV-EN.pdf` (même nom).

---

## 2. Voir le site sur ton ordinateur (facultatif)

Avec [Node.js](https://nodejs.org) installé :
```bash
cd portfolio-clementine
npm install
npm run dev     # puis ouvre http://localhost:3000/fr/
```

## 3. Publication

Le site est publié sur **Vercel** (projet `clementine-sanchez`, dossier racine `portfolio-clementine`).
Chaque modification fusionnée dans la branche `master` sur GitHub met le site à jour automatiquement.

Si tu achètes un nom de domaine (ex. `clementinesanchez.com`, ~12 €/an), ajoute-le dans Vercel → *Settings → Domains*, puis mets-le à jour dans `content/site.ts` (`url`).
