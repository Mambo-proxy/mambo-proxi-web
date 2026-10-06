# Inventaire — site/avis-clients-desktop

- Figma : fileKey `lsun63JexZYvgYUVpmSYyg`, frame `68:7186` « Avis clients — Desktop 1440 »
- Dimensions : 1440 × 3304,5 px
- Polices : Poppins (`--mp-font-family-brand`), Inter (`--mp-font-family-ui`). Couleurs = tokens `--mp-color-*` (hex).
- Espaces avant `:` `%` : présentes (`86 %`, `réponse sous 24 h`) ; insécable non vérifiable → rendre en ` ` (y compris entre nombre et `%`).
- Les textes d'avis contiennent des apostrophes **droites** `'` (`l'aéroport`, `s'est`, `l'anniversaire`) et un avis une apostrophe typographique `’` (`l’agence`, `m’a`) : reproduits tels quels dans Figma (incohérence de saisie à normaliser côté données si souhaité).

## 1. Sections (ordre)

| # | Node id | Calque | Fond | Padding vertical | Hauteur |
|---|---|---|---|---|---|
| 0 | 68:7187 | Web/TopBar — Desktop (global) | — | — | 36 |
| 0b | 68:7219 | Web/Header — Desktop (global) | — | — | 85 |
| 1 | 68:7292 | Hero | `neutral-50` #f8f7f5 | pt 48 / pb 80, px 64 | 404 |
| 2 | 68:7342 | Avis | `neutral-0` #ffffff *(déduit, alternance)* | py 96, px 64 | 878 |
| 3 | 68:7519 | Votre avis compte | `neutral-50` #f8f7f5 ; bloc blanc | py 96, px 64 ; bloc p 48 | 576 |
| 4 | 68:7549 | Web/CTA — Desktop (instance, textes spécifiques) | `neutral-0` ; bandeau `gradient/energie` | pb 112, px 64 ; bandeau p 72 | 494 |
| 5 | 68:7570 | Web/Footer — Desktop (global) | — | — | 831,5 |
| flottant | 68:7682 | Web/WhatsApp flottant | — | x 1348 y 808 | 64 × 64 |

## 2. Textes verbatim

### Hero (68:7292) — texte flex-1 + carte « Note globale » 520 px, gap 64, centrés verticalement

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 68:7295 | fil d'Ariane lien | `Accueil` | Inter Regular 13/16 ls 0.13 | `text-muted` |
| 68:7298 | fil d'Ariane courant | `Avis clients` | Inter SemiBold 13/16 | `text-main` |
| 68:7299 | eyebrow | `Avis clients` (uppercase) | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` #ad5300 |
| 68:7300 | titre H1 | `Ce que ` + **`nos clients`** (surligné orange #ad5300, **au milieu** de la phrase) + ` disent de nous.` | Poppins SemiBold 52/58 ls -1.3 | `text-main` / #ad5300 |
| 68:7301 | lead | `Chaque avis est recueilli après une prestation réalisée, puis validé par l’agence avant publication.` | Inter Regular 19/31 | `text-muted` |

Carte « Note globale » (68:7302) : fond blanc, bordure 1 px `border-default`, radius 28, p 32, gap 32.

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 68:7304 | note moyenne | `4,9` (virgule décimale) | Poppins SemiBold 64/68 ls -1.28 | `text-main` |
| 68:7305 | étoiles | 5 × `star` 18 px pleines orange, gap 2 | — | `brand-primary` |
| 68:7316 | nombre d'avis | `120 avis vérifiés` | Inter Regular 14/20 | `text-muted` |

### Avis (68:7342)

Barre de filtres (68:7343), justify-between :
- Chips : `Tous` (ACTIF, check) · `Expérience` · `Immobilier` · `Proximité` · `Culture & événementiel`.
- Tri à droite (68:7357) : `Plus récents` + `chevron-down` 16 ; bordure 1 px `border-strong`, radius 999, px 16 py 10, fond transparent ; Inter Medium 14/20.

Note de bas : aucune.

### Votre avis compte (68:7519)

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 68:7522 | eyebrow | `Votre avis compte` | Inter SemiBold **12/16** ls 0.96 uppercase | `text-brand` |
| 68:7523 | titre | `Après chaque prestation, un court questionnaire` | Poppins SemiBold 34/42 ls -0.34 | `text-main` |
| 68:7524 | texte | `Vous recevez automatiquement un e-mail avec un lien : 5 questions maximum, 2 minutes. Avec votre accord, votre avis peut être publié sur le site.` | Inter Regular 16/26 | `text-muted` |

Bloc : fond blanc, bordure 1 px `border-default`, radius 32, p 48, gap 56 ; texte flex-1 (gap 14) + colonne d'étapes 420 px.

### CTA (68:7549) — textes propres à cette page

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| I68:7549;56:2084 | titre (2 lignes explicites) | `À votre tour de vivre` ⏎ `l’expérience Mambo.` | Poppins SemiBold 52/58 ls -1.04 | `neutral-900` |
| I68:7549;56:2085 | lead | `Demandez votre devis gratuit : réponse sous 24 h.` | Inter Regular 19/30 | `neutral-900` |
| I68:7549;56:2088 | bouton | `Demander un devis gratuit` + `arrow-right` | Inter SemiBold 16/24 | blanc sur #1c1a18 |
| I68:7549;56:2090 | bouton | `Écrire sur WhatsApp` | Inter SemiBold 16/24 | #1c1a18 sur #25d366 |

## 3. Données répétées

### Synthèse des notes (répartition) (68:7317) — 5 lignes, gap 8

| Étoiles | Pourcentage | Largeur barre (piste ~258–268 px) |
|---|---|---|
| `5` | `86 %` | 224 |
| `4` | `10 %` | 26 |
| `3` | `3 %` | 8 |
| `2` | `1 %` | 6 |
| `1` | `0 %` | 0 (piste vide) |

Ligne : chiffre Inter Medium 14/20 `text-main` ; piste h 8 fond `neutral-100` #f1efec radius 999 ; valeur `brand-primary` #ff7a00 radius 999 ; pourcentage Inter Regular 12/16 ls 0.12 `text-muted` ; gap 10.
Synthèse globale : moyenne `4,9`, total `120 avis vérifiés`.

### Avis clients (68:7361) — grille 3 colonnes (424 px) en **maçonnerie** (colonnes indépendantes, gap colonnes 20, gap vertical 20), 6 avis ; ordre de lecture par date décroissante (tri `Plus récents`)

| # | Node | Note | Date | Texte | Initiales | Auteur | Ville / trajet | Service (badge) | Mention vérifiée |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 68:7365 | 5 | `12 sept. 2026` | `Arrivée à Douala sans stress : logement prêt, chauffeur à l'aéroport et même les courses faites. On s'est sentis attendus.` | `AK` | `Aurélie K.` | `Paris → Douala` | `Logement temporaire` | oui : `Avis vérifié après prestation` |
| 2 | 68:7393 | 5 | `3 sept. 2026` | `Le chef privé a régalé nos invités pour l'anniversaire de ma mère. Service impeccable du début à la fin.` | `JT` | `Jean-Marc T.` | `Yaoundé` | `Chef privé` | non affichée |
| 3 | 68:7416 | 5 | `28 août 2026` | `Je vis en France et Mambo gère mon appartement à Bonapriso. Comptes rendus réguliers, locataires suivis : je suis enfin serein.` | `SM` | `Sandrine M.` | `Lyon` | `Gestion locative` | non affichée |
| 4 | 68:7439 | 5 | `20 août 2026` | `Ma mère reçoit ses repas chaque midi. Depuis Paris, je suis rassurée et toujours informée.` | `CN` | `Clarisse N.` | `Paris` | `Portage de repas` | non affichée |
| 5 | 68:7462 | 5 | `9 août 2026` | `La journée découverte à Kribi était parfaite : guide passionné, repas local, tout était organisé.` | `PE` | `Patrick E.` | `Marseille` | `Découverte du Cameroun` | non affichée |
| 6 | 68:7485 | 5 | `2 août 2026` | `Colis reçu à l’agence, on m’a appelé le jour même et livré le lendemain. Très pro.` | `HD` | `Hervé D.` | `Douala` | `Réception de colis` | non affichée |

Positions masonry : colonne 1 = Aurélie, Clarisse ; colonne 2 = Jean-Marc, Patrick ; colonne 3 = Sandrine, Hervé.
Seul l'avis 1 porte la mention `Avis vérifié après prestation` (icône `shield` 14 vert + Inter Medium 12/16 ls 0.12 `vert-700` #557e1b) → champ booléen `verified` (probablement à afficher pour tous les avis publiés, l'exemple ne le montre qu'une fois).

Carte : fond blanc, bordure 1 px `border-default`, radius 24, p 28, gap 16. En-tête : étoiles 15 px (gap 2) à gauche, date Inter Regular 12/16 ls 0.12 `text-subtle` #7d776f à droite (format `J mois-abrégé. AAAA` : `12 sept. 2026`, `3 sept. 2026`, `20 août 2026`). Texte Inter Regular 16/26 `text-main`. Pied « Auteur » : filet haut 1 px `border-default`, pt 16, gap 12 ; avatar rond 40 avec initiales Inter SemiBold 14/20 (fond Aurélie #f8cfaa / `orange-200`, Clarisse #fce7d5 ; autres non relevés) ; nom Inter SemiBold 14/20 ; ville Inter Regular 12/16 `text-muted` ; badge service fond `orange-50` texte `orange-700` #ad5300 Inter SemiBold 11/16 ls 0.11, px 10 py 5, radius 999, aligné à droite.

### Étapes de collecte d'avis (68:7525) — liste verticale gap 10

| # | Icône (lucide) | Libellé |
|---|---|---|
| 1 | `calendar-check` | `Prestation réalisée` |
| 2 | `mail` | `E-mail avec le questionnaire` |
| 3 | `star` | `Vous notez et commentez` |
| 4 | `check` | `Avis publié après validation` |

Item : fond `neutral-50`, radius 16, p 14, gap 12 ; pastille 36 blanche radius 11, icône 17 orange ; libellé Inter Medium 14/20 `text-main`.

## 4. Éléments interactifs

| Élément | Libellé | Variante | Destination présumée |
|---|---|---|---|
| Fil d'Ariane | `Accueil` | lien | `/` |
| Filtres catégorie | `Tous` (actif) · `Expérience` · `Immobilier` · `Proximité` · `Culture & événementiel` | chips | filtre client/serveur sur la catégorie de service |
| Tri | `Plus récents` | select pill | options non montrées (présumé : Plus récents / Mieux notés…) |
| Pagination | `1` (actif) · `2` · `3` · `…` · `12` | boutons carrés 40 × 40 radius 12 | `?page=n` |
| CTA | `Demander un devis gratuit` | dark + arrow-right | `/devis` |
| CTA | `Écrire sur WhatsApp` | WhatsApp | `wa.me` |
| Flottant | WhatsApp | rond 64 | `wa.me` |

Pagination (68:7508) : centrée, gap 8 ; page active fond `neutral-900` texte blanc ; autres fond blanc, bordure 1 px `border-default`, texte `text-main` ; Inter Medium 14/20 ; ellipse `…` dans une case identique (non cliquable présumé). Pas de flèches précédent/suivant. 12 pages × 6 avis ≈ cohérent avec « 120 avis » (10/page) → à arbitrer.
Pas de formulaire de dépôt d'avis sur cette page (le dépôt passe par l'e-mail post-prestation).

## 5. Éléments visuels

- Aucune illustration sur cette page.
- Icônes : `chevron-right`, `star` (18 / 15 / 17), `check`, `chevron-down`, `shield` (14), `calendar-check`, `mail`, `arrow-right`.
- Rayons : carte note 28 ; pistes 999 ; cartes avis 24 ; avatars 999 ; badges 999 ; bloc « Votre avis compte » 32 ; étapes 16 ; pastilles 11 ; pagination 12 ; tri 999.
- Ombres : aucune.
- Grilles : avis 3 colonnes masonry gap 20 ; bloc « Votre avis compte » 2 col (flex + 420) gap 56.
- Filigrane CTA M-Lien opacité 22 %.

- Version mobile : voir `avis-clients-mobile.md`.
