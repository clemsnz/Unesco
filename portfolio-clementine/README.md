# Portfolio — Clémentine Sanchez

Direction artistique : **« Galerie Nocturne »** — la structure d’une galerie d’exposition (salles, cartels, défilement horizontal) dans l’ambiance d’un palace la nuit (noir chaud, ivoire, accent champagne, arches).

- **Typographies** : Playfair Display (titres), Manrope (textes), JetBrains Mono (cartels)
- **Technique** : Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Motion · Lenis
- **Langues** : `/fr/` et `/en/` (la racine `/` redirige selon la langue du navigateur)

---

## 1. Voir le site sur ton ordinateur

Il faut avoir [Node.js](https://nodejs.org) (version 20 ou plus) installé.

```bash
cd portfolio-clementine
npm install        # une seule fois
npm run dev        # puis ouvre http://localhost:3000/fr/
```

Le site se recharge tout seul à chaque modification.

---

## 2. Modifier les contenus (sans toucher au code)

Tout le texte du site est dans le dossier **`content/`**. Chaque texte existe en deux langues :

```ts
{ fr: "Texte en français", en: "Text in English" }
```

| Je veux…                                   | Fichier à ouvrir          |
|--------------------------------------------|---------------------------|
| changer mon e-mail, LinkedIn, accroche, chiffres clés | `content/site.ts` |
| modifier / ajouter un **projet**           | `content/projects.ts`     |
| modifier mon parcours, compétences, outils | `content/about.ts`        |
| changer un texte de bouton ou de menu      | `content/ui.ts`           |

### Ajouter un projet
1. Dans `content/projects.ts`, copie un bloc `{ slug: "…", … }` en entier.
2. Change le `slug` (ce sera l’adresse : `/fr/work/mon-slug/`) — minuscules, tirets, sans accent.
3. Mets `featured: true` pour qu’il apparaisse sur la page d’accueil.
4. Dépose les images dans `public/images/mon-slug/` et indique leur chemin : `"/images/mon-slug/photo.webp"`.

Les « blocs » d’une étude de cas (`blocks: [ … ]`) se combinent librement :
`text`, `list`, `quote`, `figures`, `image`, `pair` (2 images), `slides`, `video`, `chapter` (I, II, III…), `press`, `placeholder` (cadre « Visuel à fournir »).

### Remplacer une photo
Remplace le fichier dans `public/images/…` **en gardant le même nom**. Formats conseillés : `.webp` ou `.jpg`, 2000 px de large maximum.
Si les proportions changent, mets à jour `ratio` (largeur ÷ hauteur) dans le fichier de contenu.

### Mettre à jour le CV
Remplace `public/cv/Clementine-Sanchez-CV-EN.pdf` (même nom).
Pour ajouter la version française : dépose `public/cv/Clementine-Sanchez-CV-FR.pdf`, puis dans `content/site.ts` remplace `fr: null` par `fr: "/cv/Clementine-Sanchez-CV-FR.pdf"`.

---

## 3. Éléments encore à compléter

Ils apparaissent sur le site dans un cadre hachuré **« Visuel à fournir »** ou en italique entre crochets **[À compléter]** :

- **Spice Your Drink** et **Big Battle** : ta contribution personnelle (`mine` dans `content/projects.ts`)
- **Big Battle** : photo de l’équipe en finale ou slides de la recommandation
- **Charlotte Muller** : photo d’un événement influence au studio ; captures Instagram / newsletter Klaviyo / couvertures vidéo
- **Festival Ravensare** : affiches et visuels de la campagne transports
- **Hopla** : menu redessiné et exemples de posts
- **CV en français** (seule la version anglaise est en ligne)

---

## 4. Publier en ligne avec Vercel (gratuit)

1. Crée un compte sur [vercel.com](https://vercel.com) avec ton GitHub.
2. **Add New → Project**, choisis le dépôt.
3. Dans **Root Directory**, sélectionne `portfolio-clementine`. Le framework « Next.js » est détecté tout seul.
4. Clique sur **Deploy**. Ton site est en ligne en ~1 minute (adresse en `.vercel.app`).
5. Chaque modification poussée sur GitHub met le site à jour automatiquement.

### Nom de domaine
- Idéal : **`clementinesanchez.com`** ou **`clementine-sanchez.com`** (~12 €/an chez OVH, Gandi ou directement dans Vercel → *Settings → Domains*).
- Alternatives : `clementinesanchez.fr`, `csanchez.studio`.
- Évite les chiffres, les abréviations obscures et « portfolio » dans le nom.
- Une fois le domaine choisi, mets-le à jour dans `content/site.ts` (`url: …`) : il sert à l’aperçu LinkedIn et au référencement.

---

## 5. Pour aller plus loin (optionnel)
- **Formulaire de contact** : il ouvre actuellement la messagerie du visiteur avec le message pré-rempli. Pour recevoir les messages directement, crée un formulaire gratuit sur [formspree.io](https://formspree.io) et remplace la fonction `onSubmit` de `components/ContactForm.tsx`.
- **Image d’aperçu LinkedIn** : `public/og-image.png` (1200 × 630).
- **Favicon** : `public/icon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`.
