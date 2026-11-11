---
name: ux-ui
description: Concevoir, construire ou relire une page ou un composant d'interface de Parents Connectés (fil, conseils, défis, quiz, activités) en respectant le design system et une UX adaptée aux parents de jeunes enfants.
---

# UX/UI — Parents Connectés

À utiliser pour toute création ou modification d'écran, de composant ou de parcours, et pour relire une interface existante.

## 1. Avant de coder

1. Lire `DESIGN.md` (règles visuelles) et parcourir `design-system/index.html` (HTML de référence des composants).
2. Formuler en une phrase : **qui** (parent, souvent fatigué, sur téléphone, d'une main), **quoi** (la tâche principale de l'écran), **succès** (ce qui doit se passer en moins de 3 taps).
3. Lister les composants `.pc-*` existants qui couvrent le besoin. N'en créer un nouveau que si aucun ne convient.

## 2. Principes UX propres au public

- **Une action principale par écran.** Un seul `.pc-btn` plein ; les autres actions en `--soft` ou en lien.
- **Lecture rapide** : titres courts (≤ 8 mots), paragraphes de 2 à 3 lignes en mobile, listes plutôt que blocs de texte.
- **Usage à une main** : actions fréquentes en bas ou au centre de l'écran, cibles ≥ 44 px, espacement ≥ 8 px entre cibles.
- **Ton bienveillant** : on vouvoie, on encourage, on ne culpabilise jamais (« Essayez… » plutôt que « Ne faites pas… »). Les erreurs disent quoi faire, pas ce qui est faux.
- **Repère d'âge** : tout contenu (conseil, activité, défi) indique la tranche d'âge concernée (0–6 mois, 6–12 mois, 1–2 ans, 2–3 ans).
- **Progression visible** : défis et quiz montrent l'avancement (cases cochées, « 2/4 », réponse expliquée après validation).
- **Retour immédiat** : chaque tap donne un retour (état actif, cœur rempli, coche verte, message court).
- **États à prévoir systématiquement** : chargement (squelette pastel), vide (message encourageant + action), erreur (explication + bouton réessayer), succès.
- **Pas de piège d'attention** : pas de défilement infini sans fin claire, pas de notifications insistantes, pas de compteurs anxiogènes. Le site prône moins d'écrans : il doit lui-même être sobre.

## 3. Construire l'UI

- Uniquement les tokens `var(--pc-…)` ; aucune valeur en dur.
- Composants `.pc-*` copiés depuis `design-system/index.html`, nouveaux composants en BEM avec le préfixe `.pc-` ajoutés à `components.css` et à la démo.
- Icônes de `assets/icones/` en ligne, avec `aria-hidden="true"` ; le bouton porteur a un `aria-label`.
- Pastel choisi selon le thème (rose lien, ciel sommeil, vert activités/défis, jaune accompagnement, lavande quiz/savoir).
- Hiérarchie : titre Fredoka → texte Nunito → accent Patrick Hand (une ligne max).
- HTML sémantique : `header`, `main`, `nav`, `article` pour un post, `section` avec titre, `button` pour une action, `a` pour une navigation, `fieldset`/`legend` pour un quiz.
- Mobile d'abord, puis élargir avec `grid`/`auto-fill`. Pas de largeur fixe en px sur un conteneur.

## 4. Accessibilité (obligatoire)

- Contraste texte ≥ 4.5:1 (le bleu nuit sur pastel passe ; le blanc sur pastel ne passe pas).
- Navigation complète au clavier, focus visible, ordre de tabulation logique.
- `alt` descriptif sur les photos, `alt=""` sur les images décoratives.
- Ne pas transmettre une info par la couleur seule (ajouter icône ou texte).
- Respecter `prefers-reduced-motion` pour toute animation ; animations ≤ 200 ms.
- Champs de formulaire avec `label` visible.

## 5. Vérifier

1. Servir le dépôt (`npx serve .`) et ouvrir la page avec Playwright à **390 px** et **1200 px** de large.
2. Contrôler : pas de défilement horizontal (`document.documentElement.scrollWidth === innerWidth`), rendu cohérent avec la démo, tous les états (chargement, vide, erreur) affichés.
3. Parcourir au clavier (Tab) et vérifier le focus.
4. Faire une capture et la regarder avant de déclarer le travail terminé.

## 6. Grille de relecture

Pour relire un écran, noter chaque point ✅ / ⚠️ / ❌ avec une correction proposée :

| Critère | Question |
|---|---|
| Objectif | L'action principale est-elle évidente en 3 secondes ? |
| Design system | Que des tokens et des composants `.pc-*` ? |
| Couleur | Pastel cohérent avec le thème ? |
| Lisibilité | Textes courts, hiérarchie claire ? |
| Mobile | OK à 360 px, cibles ≥ 44 px ? |
| États | Chargement, vide, erreur, succès prévus ? |
| Accessibilité | Contraste, clavier, labels, `alt` ? |
| Ton | Bienveillant, sans culpabilisation ? |
| Sobriété | Rien qui pousse à rester plus longtemps sur l'écran ? |
