# DESIGN.md — Règles visuelles de Parents Connectés

Ce fichier dit comment construire l'interface. Lis-le avant toute modification de front-end. La source de vérité du code est `design-system/` (`tokens.css`, `components.css`) ; la démo vivante est `design-system/index.html`.

## Esprit

Site pour des parents d'enfants de 0 à 3 ans : chaleureux, rassurant, simple, jamais anxiogène. Fil façon Instagram, cartes pastel aux coins très arrondis, texte bleu nuit, quelques touches manuscrites. Ton bienveillant, tutoiement évité : on vouvoie les parents.

## Règles impératives

1. **Toujours utiliser les tokens.** Aucune couleur hex, taille de police, rayon ou ombre en dur dans les composants : uniquement `var(--pc-…)` de `design-system/tokens.css`. Si un token manque, l'ajouter dans `tokens.css` (et dans le tableau de `design-system/README.md`), pas en local.
2. **Réutiliser les composants `.pc-*`** de `components.css` avant d'en créer un nouveau. Un nouveau composant garde le préfixe `.pc-` et la convention BEM (`.pc-bloc__element--modificateur`).
3. **Icônes uniquement depuis `assets/icones/`.** Pas de bibliothèque d'icônes externe ni d'emoji comme icône. Les insérer en ligne pour qu'elles héritent de `currentColor`, avec la classe `.pc-icon` (+ `--sm`, `--lg`, `--xl`).
4. **Trois polices, pas une de plus** : Fredoka (titres), Nunito (texte), Patrick Hand (accents manuscrits courts uniquement, jamais pour un paragraphe ou un bouton).
5. **Mobile d'abord.** Tout doit fonctionner à 360 px de large sans défilement horizontal, avec une marge latérale de 16 px.
6. **Accessibilité** : cibles tactiles ≥ 44 px, `aria-label` sur chaque bouton-icône, focus visible (contour jaune), texte toujours en bleu nuit sur les pastels, `alt` sur toutes les images.

## Typographie

| Rôle | Token | Police | Où |
|---|---|---|---|
| Titres | `--pc-font-display` | Fredoka 500–700 | logo, titres de section, titres de cartes, règles |
| Texte | `--pc-font-body` | Nunito 400–800 | paragraphes, listes, boutons, formulaires |
| Manuscrit | `--pc-font-hand` | Patrick Hand | slogan, sous-titres « aside », post-it, citation de pied de page |

Échelle : `--pc-text-xs` 13 · `sm` 15 · `md` 16 · `lg` 20 · `xl` 26 · `2xl` 36 · `3xl` 44 px.

## Couleurs

- Principale : `--pc-blue-700` (#1648a8) pour l'en-tête, les boutons et les liens ; `--pc-blue-600` au survol.
- Texte : `--pc-navy-900` pour les titres, `--pc-navy-700` pour le texte courant, `--pc-gray-500` pour les métadonnées.
- Fond de page : `--pc-paper` ; surfaces : blanc.
- Accents : `--pc-red-500` (J'aime), `--pc-green-500` (validation), `--pc-yellow-500` (ampoule, trophée, étoiles).

**Pastels et leur sens** (fond `-200` pour les cartes, `-100` pour les grandes zones) :

| Pastel | Thème |
|---|---|
| `pink` | lien parent-enfant, conseils, mise en avant |
| `sky` | sommeil, calme |
| `green` | activités, défis de la semaine |
| `yellow` | accompagnement, surligneur |
| `lavender` | quiz, savoir, « À retenir » |

Choisir le pastel selon le thème du contenu, pas au hasard. Dans une rangée de cartes, alterner les pastels.

## Formes et espacements

- Rayons : `--pc-radius-sm` 8 (badges, cases) · `md` 14 (images, boutons) · `lg` 20 (cartes) · `xl` 28 (sections) · `pill`.
- Pas d'angles vifs sur les surfaces visibles.
- Espacements sur une base de 4 px (`--pc-space-1` à `--pc-space-10`).
- Ombres très légères (`--pc-shadow-card`) ; la couleur fait la hiérarchie, pas l'ombre.

## Composants disponibles

| Besoin | Composant |
|---|---|
| En-tête | `.pc-header` (accueil à gauche, logo + slogan au centre, recherche / notifications / menu à droite) |
| Bandeau d'intro | `.pc-hero` |
| Section avec titre | `.pc-section` + `.pc-section__head` (icône `--lg`, titre, `__aside` manuscrit) |
| Post du fil | `.pc-feed` > `.pc-post` (auteur, média, `.pc-pill-title`, texte, actions J'aime / Commenter / plus) |
| Conseil / règle | `.pc-rules` > `.pc-rule--{couleur}` (label, icône `--xl`, texte) |
| Défi de la semaine | `.pc-section--green`, `.pc-challenge__highlight`, `.pc-checklist` > `.pc-check`, `.pc-sticky` |
| Quiz | `.pc-quiz` (`__question`, `.pc-radio`, `.pc-btn`, `__answer`) |
| À retenir | `.pc-takeaways` avec l'icône `check-circle` |
| Bouton | `.pc-btn`, `--pill` (appel à l'action), `--soft` (secondaire) |
| Pied de page | `.pc-footer` |

Le HTML de référence de chaque composant est dans `design-system/index.html` : le copier plutôt que le réinventer.

## Icônes

- Format : `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, bouts et jointures arrondis, `aria-hidden="true"`.
- Une nouvelle icône respecte exactement ce format, se nomme en anglais et en kebab-case (`fork-plate.svg`), et s'ajoute à la liste de `design-system/README.md`.
- Cœur actif : `fill: currentColor` (voir `.pc-action--liked`).

## Images

Photos chaleureuses de parents et de jeunes enfants, lumière douce. Dans un post : ratio 16/10, `--pc-radius-md`, `object-fit: cover`. Pas d'enfant devant un écran mis en avant de façon positive.

## À éviter

- Couleurs saturées en grand aplat (hors en-tête bleu et boutons)
- Noir pur pour le texte (utiliser le bleu nuit)
- Police manuscrite sur plus d'une ligne ou deux
- Nouvelles polices, frameworks CSS ou bibliothèques d'icônes sans en discuter
- Textes culpabilisants envers les parents

## Vérifier un changement visuel

Servir le dossier (`npx serve .`) et contrôler la page à 1200 px et à 390 px : pas de défilement horizontal, rendu cohérent avec `design-system/index.html`.
