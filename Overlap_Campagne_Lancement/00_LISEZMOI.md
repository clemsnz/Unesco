# Overlap · Campagne de lancement « On se tient au jus… jeudi ? »

Section 12 « Marketing & Communication » du dossier, slides à placer après l'intercalaire « MARKETING & COMMUNICATION » du Canva, visuels, Reel et pilotage. Le volet « Free vs Premium, Pricing & Local Partnerships » est inclus.

## Ce qui a été intégré ou exporté

Je n'avais aucun accès en écriture au Google Doc ni au Canva : seulement les exports PDF. **Rien n'a donc été intégré directement.** Tout est livré en fichiers à importer :

| Livrable | Fichier | Comment l'intégrer |
|---|---|---|
| Section 12 du dossier (anglais) | `01_Dossier/Overlap_Section12_Marketing_Communication.docx` | Copier le texte à la place du bloc « Essentiel Mâcon » de la page « Marketing & Communication ». Ne rien toucher ailleurs. |
| Même section mise en page (A4, 15 pages) | `01_Dossier/Overlap_Section12_Marketing_Communication_A4.pdf` | Mise en page reprenant celle du dossier : titre Monument, textes Syne, fond #F7F5F0. |
| Aperçu du dossier complet | `01_Dossier/APERCU_dossier_overlap_avec_section12.pdf` | Pages 1 à 17 et la page Sources reprises telles quelles. Seule la page 18 (texte Essentiel Mâcon) est remplacée par la section. À utiliser pour vérifier, pas comme fichier de rendu. |
| 11 slides (anglais) | `02_Slides/Overlap_MC_slides_a_inserer_apres_intercalaire.pptx` | Dans Canva : Importer, puis placer les slides juste après l'intercalaire « MARKETING & COMMUNICATION » (slide 28). Format 1440 × 810 pt, identique au Canva. Les textes restent éditables. Aperçu : `APERCU_slides_MC.pdf` et `PNG/`. |
| Visuels | `03_Visuels/…` (PNG à taille réelle ; PDF pour l'impression) | Voir la planche-contact `03_Visuels/00_Planche_contact_campagne.png`. |
| Pilotage | `04_Pilotage/Overlap_Pilotage_Campagne.xlsx` | Rétroplanning, calendrier éditorial, budget avec formules, suivi des groupes (calcul automatique des groupes activés), prospects, exemple de revenus. |
| Textes FR prêts à copier | `04_Pilotage/Textes_campagne_FR.md` | Légendes, messages J−1, J+1, J+7 et J+14, publicité Meta, formulaires. |
| Sources éditables | `99_Sources_editables/` | `campaign.json` est la source unique : date, horaires, CTA, prix et URL. Ensuite, `scripts/build_all.sh` regénère tous les supports. Les visuels sont en HTML/CSS, modifiables à la main. |

### Ordre des slides
1. Launch insight
2. The creative idea
3. Visuals in situation
4. Reel
5. One journey, one job per channel
6. Event
7. Calendar
8. Budget & measurement
9. **Free vs Premium & Pricing**
10. **Sponsored Places in the App**
11. **Local Partners & Revenue Model**

### Visuels livrés
- 01 Visuel principal 1080×1350, plus une version paysage 1920×1080
- 02 Affiche A3 : PDF 303 × 426 mm avec 3 mm de fond perdu, et PNG
- 03 Carrousel Instagram : 4 pages en 1080×1350
- 04 Stories 1080×1920 : teasing, invitation à transférer, relance
- 05 Invitation digitale
- 06 Chevalet de table : A4 plié, PDF
- 07 Suivi J+1
- 08 Carte « C'est calé » A6 : support ajouté au plan média
- 09 Reel MP4 15 s 1080×1920 avec son, storyboard minuté (PDF) et 7 plans PNG
- 10 Comparatif Free / Premium
- 11 Lieu sponsorisé dans l'écran réel « Map »
- 12 Fiche commerciale A4 en français
- 20 Mises en situation pour les slides

## Limites à connaître
- **Police Monument Extended.** Elle n'était pas disponible en fichier. Les PNG et PDF utilisent **Unbounded**, le substitut libre le plus proche. Les fichiers PPTX, DOCX et HTML appellent bien « Monument Extended » : la police d'origine revient dès qu'elle est installée, ou dans Canva. **Syne** est la vraie police.
- **Logo et écrans.** Ce sont les vrais assets, extraits du Canva : icône, mascotte, logotype « Overlap » et maquettes. Les maquettes ne sont disponibles qu'en basse définition. Si vous avez des exports HD, il suffit de remplacer les fichiers `99_Sources_editables/assets/screen_*.png`.
- **QR codes.** Aucune URL n'était fournie, l'emplacement est donc réservé sur l'affiche, l'invitation et le chevalet. **Le BAT impression attend l'URL d'inscription.** Il faut la renseigner dans `campaign.json`, lancer `python3 make_qr.py`, regénérer, puis tester le QR avec un téléphone.
- **Établissements.** Les lieux de l'exemple d'annonce (« Le Point Commun », « La Halte ») sont **fictifs**. Les 4 partenaires cités sont des **prospects** : l'activité et l'adresse ont été vérifiées sur leur site officiel en novembre 2026, aucun contact n'a été pris. Les prix et horaires sont à revérifier.
- **Chiffres.** Tous les chiffres de campagne et de revenus sont des **objectifs ou des hypothèses**, jamais des résultats.

## Décisions qui restent au groupe
1. Les prix proposés : 3,99 €/mois, 34,99 €/an et 2,49 €/mois pour les étudiants, avec le modèle « placement payant par sortie confirmée » (2 € HT). La page Business Model du dossier contient encore un texte provisoire et aucun montant n'avait été fixé.
2. Confirmer le jeudi 11 mars 2027. Aucune roadmap n'existe dans les fichiers reçus.
3. L'URL d'inscription, l'URL de la liste d'attente et le nom des comptes Instagram et TikTok.
4. Le prototype cliquable sera-t-il prêt pour la soirée, ou seulement les écrans ?
5. Contacter Le Comptoir Général, prospect prioritaire, avant J−21 (18 février).
6. Les incohérences repérées sans les corriger, car elles sont hors périmètre :
   - Âge de la persona : 23 ans dans le Canva, 24 ans dans le dossier. La campagne utilise 23 ans.
   - Prénom : « Valentine » dans le dossier, « Clémentine » dans le Canva. La campagne utilise Clémentine.
