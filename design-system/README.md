# Design system — Parents Connectés

Extrait de la maquette d'origine : un site chaleureux et rassurant pour les parents d'enfants de 0 à 3 ans, avec un en-tête bleu roi, des cartes pastel aux coins très arrondis, un texte bleu nuit et des touches manuscrites.

- `tokens.css` : variables CSS (couleurs, typo, espacements, rayons, ombres)
- `components.css` : composants prêts à l'emploi (classes préfixées `.pc-`)
- `index.html` : page de démonstration de tous les éléments (ouvrir via un petit serveur local, par ex. `npx serve design-system`)
- `../assets/icones/` : icônes SVG

## Typographie

La maquette est une image, donc les polices ne peuvent pas être lues directement : ce sont les polices Google Fonts les plus proches.

| Rôle | Police | Usage dans la maquette |
|---|---|---|
| Titres (`--pc-font-display`) | **Fredoka** 500–700 | Logo « Parents Connectés », titres de section, titres de cartes, règles |
| Texte (`--pc-font-body`) | **Nunito** 400–800 | Texte des posts, listes, boutons |
| Accent manuscrit (`--pc-font-hand`) | **Patrick Hand** | Slogan, « Des idées, des conseils… », post-it, citation du pied de page |

Alternatives si besoin : Baloo 2 pour les titres, Caveat pour le manuscrit.

Échelle : 13 / 15 / 16 / 20 / 26 / 36 / 44 px (`--pc-text-xs` → `--pc-text-3xl`).

## Couleurs

| Token | Hex | Rôle |
|---|---|---|
| `--pc-blue-700` | `#1648a8` | En-tête, boutons, couleur principale |
| `--pc-blue-600` | `#1f5bc6` | Survol, mise en avant (« 0 à 3 ans ») |
| `--pc-navy-900` | `#14215a` | Titres, texte fort, icônes |
| `--pc-navy-700` | `#2b3a72` | Texte courant |
| `--pc-gray-500` | `#6b7393` | Méta (date d'un post) |
| `--pc-paper` | `#fbfaf7` | Fond de page |
| `--pc-pink-200` | `#f9d3dc` | Héro, règle 4, question de quiz, « Nos conseils » |
| `--pc-sky-200` | `#c9dcf6` | Règle 2, thème sommeil |
| `--pc-green-200` | `#cfe8bf` | Règle 1, défi de la semaine, activités |
| `--pc-yellow-200` | `#fbe78f` | Règle 3, surligneur du défi |
| `--pc-lavender-200` | `#dcd6f5` | Quiz, « À retenir » |
| `--pc-red-500` | `#e0384f` | Cœur « J'aime » |
| `--pc-green-500` | `#3aa84a` | Coches de validation |
| `--pc-yellow-500` | `#f2c230` | Ampoule, trophée, étoiles |
| `--pc-color-overlay` | bleu nuit 55 % | Voile du titre au survol d'une vignette |
| `--pc-color-backdrop` | bleu nuit 60 % | Fond derrière une fenêtre modale |

Chaque pastel a une variante plus claire en `-100` pour les grands fonds.

**Convention thématique** : rose = lien parent-enfant, ciel = sommeil, vert = activités / défis, jaune = accompagnement, lavande = quiz et savoir.

## Formes

- Rayons : 8 (badges) · 14 (images, boutons) · 20 (cartes) · 28 (sections) · pilule
- Ombres très légères (`--pc-shadow-card`), les couleurs pastel font l'essentiel du travail
- Espacements sur une base de 4 px

## Composants

| Composant | Classes |
|---|---|
| En-tête | `.pc-header`, `__brand`, `__logo`, `__tagline`, `__actions`, `.pc-icon-btn` |
| Héro | `.pc-hero`, `__title` (avec `<em>` pour l'accent bleu), `__text` ; `--split` (texte + illustration) avec `__content`, `__deco`, `__media`, `__note` |
| Section | `.pc-section` (`--pink`, `--green`, `--lavender`), `__head`, `__art` (petit dessin en couleur à la place de l'icône), `__title`, `__aside` |
| Post du fil | `.pc-feed` > `.pc-post`, `__author`, `.pc-avatar`, `__media`, `.pc-pill-title` (`--sky`, `--green`, `--yellow`), `__text`, `__actions`, `.pc-action` (`--liked`) |
| Règle / conseil | `.pc-rules` > `.pc-rule` (`--green`, `--sky`, `--yellow`, `--pink`), `__label`, `__text` |
| Défi de la semaine | `.pc-challenge__highlight`, `__body`, `__art`, `.pc-checklist`, `.pc-check`, `.pc-sticky` |
| Quiz | `.pc-quiz`, `__question`, `.pc-radio`, `__answer` ; `--split` (question à gauche, réponse à droite) avec `__form`, `__side`, `__hint`, `__deco` |
| À retenir | `.pc-takeaways` (icône `check-circle`) |
| Boutons | `.pc-btn`, `--pill`, `--soft` |
| Pied de page | `.pc-footer`, `__quote`, `__brand` |
| Navigation | `.pc-app` (réserve la place de la barre), `.pc-nav` (barre basse en mobile, rangée sous l'en-tête dès 760 px), `__link` avec `aria-current="page"` |
| Filtres | `.pc-chips` > `.pc-chip` (état par `aria-pressed` + coche) |
| Badges | `.pc-badges` > `.pc-badge` (`--green`, `--yellow`, `--lavender`) : âge, durée, « Privé » |
| Formulaire | `.pc-form` (`--narrow`), `__title`, `__row`, `__actions`, `__switch`, `.pc-field` (`__label`, `__hint`, `__error`), `.pc-input`, `.pc-fieldset`, `.pc-radio--sm` |
| Messages | `.pc-alert` (erreur), `--success`, `--info` |
| Listes de contenu | `.pc-section__head--green` / `--sky`, `.pc-section__lead`, `.pc-section__list`, `.pc-toolbar`, `.pc-cards`, `.pc-post__detail` |
| Quiz (pages) | `.pc-quiz-card` (`__text`), `.pc-progress` (`__bar`), `.pc-score` (`__value`) |
| Chargement | `.pc-skeleton` (bloc qui pulse) ; `--card` en forme de post : `__head`, `__circle`, `__media`, `__line` (`--title`, `--short`) |
| Grille de publications | `.pc-grid` (2 colonnes, 3 dès 480 px) > `.pc-tile` (`--sky`, `--yellow`, `--green`, `--lavender`, `--skeleton`), `__text`, `__overlay` (survol et focus), `__badge` ; `.pc-grid__end` |
| Fenêtre modale | `<dialog class="pc-modal">` (`--small`), `__content`, `__close` ; `.pc-publication` (`--text`), `__media`, `__info`, `__title`, `__activity` ; `.pc-confirm` |
| Commentaires | `.pc-comments` (`__title`, `__list`, `__form`, `__row`, `__input`, `__empty`) > `.pc-comment` (`__head`, `__text`) |
| Carrousel et galerie | `.pc-carousel`, `__frame`, `__nav`, `__btn`, `__count` ; `.pc-lightbox` ; `.pc-gallery` > `__item` (bouton qui agrandit) |
| Carte d'activité | `.pc-activity-grid` > `.pc-activity-card` (`--skeleton`) : `__media`, `__private`, `__body`, `__top`, `__title` (2 lignes), `__tools`, `__badges` (1 ligne), `__summary` (3 lignes), `__author`, `__cta` (toujours en bas). Gabarit fixe : largeur `--pc-card-width`, hauteur identique quel que soit le contenu |
| Activité détaillée | `.pc-activity`, `__head`, `__title`, `__material`, `__description`, `__subtitle`, `__linked` ; `.pc-steps` > `__item`, `__number`, `__body`, `__title` |
| Éditeur | `.pc-editor` (`__form`, `__block`, `__preview`, `__actions` collée en bas, `__cancel`) ; `.pc-step-editor` (`__list`, `__item`, `--dragging`, `--over`, `__bar`, `__handle`, `__number`, `__tools`) ; `.pc-photos` > `.pc-photo` (`__thumb`, `__body`, `__progress`), `__add` |
| Utilitaires | `.pc-text` (texte saisi, retours à la ligne gardés), `.pc-clamp` (3 lignes), `.pc-visually-hidden`, `.pc-scroll-lock`, `.pc-icon--flip` / `--up` / `--down`, `.pc-back` |

## Mise en page

`.pc-page` (pile de sections), `.pc-duo` (deux colonnes égales), `.pc-duo--wide` (3/5 + 2/5 dès 900 px).

| Token | Valeur | Rôle |
|---|---|---|
| `--pc-container` | `1120px` | Largeur maximale du contenu |
| `--pc-narrow` | `480px` | Formulaire seul (connexion, inscription) |
| `--pc-card-width` | `300px` | Largeur fixe des cartes d'activité |
| `--pc-nav-height` | `64px` | Hauteur de la barre de navigation basse, réservée par `.pc-app` |
| `--pc-gutter` | `16px` | Marge latérale |

## Images

Dans `assets/illustrations/`, reprises de la maquette : parent-child-reading (héro), building-blocks, sleeping-child, child-drawing (posts, 16/10), kids-reading-book (défi, fond retiré), trophy et bulb (titres « Défi de la semaine » et « Nos conseils », fond retiré, classe `.pc-section__art`).
À afficher en `<img>` avec un `alt` descriptif (alt vide pour trophy et bulb, décoratifs).

## Icônes

36 icônes dans `assets/icones/`, toutes au même format :

- `viewBox="0 0 24 24"`, trait de 2 px, bouts arrondis
- `stroke="currentColor"` : elles prennent la couleur du texte parent
- À intégrer en ligne (inline) pour pouvoir les colorer, ou via `<img>` (elles seront alors noires)

Liste : baby, bell, book, bulb, calendar, check, check-circle, checkbox, checkbox-checked, chevron-right, clock, close, comment, family, fork-plate, globe, heart, home, leaf, megaphone, menu, moon, more, play, puzzle, question, radio, radio-checked, screen-off, search, send, smile, sparkle, star, trophy, user.

Pour un cœur plein (« J'aime » activé) : ajouter `fill: currentColor` (voir `.pc-action--liked`).

## Accessibilité

- Texte bleu nuit sur pastel : contraste supérieur à 7:1
- Cibles tactiles d'au moins 44 px (`.pc-icon-btn`, `.pc-btn`)
- Focus visible en jaune
- Les boutons-icônes doivent avoir un `aria-label`
