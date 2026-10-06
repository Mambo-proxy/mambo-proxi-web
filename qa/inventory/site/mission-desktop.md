# Inventaire — site/mission-desktop

- Figma : fileKey `lsun63JexZYvgYUVpmSYyg`, frame `64:5257` « Mission — Desktop 1440 »
- Dimensions : 1440 × 4502,5 px
- Polices : Poppins (`--mp-font-family-brand`), Inter (`--mp-font-family-ui`). Couleurs = tokens `--mp-color-*` (hex).
- Espaces avant `:` `?` `!` : présentes dans Figma ; type (insécable ou non) non distinguable à l'export → rendre en ` `.

## 1. Sections (ordre)

| # | Node id | Calque | Fond | Padding vertical | Hauteur |
|---|---|---|---|---|---|
| 0 | 64:5258 | Web/TopBar — Desktop (global) | — | — | 36 |
| 0b | 64:5290 | Web/Header — Desktop (global) | — | — | 85 |
| 1 | 64:5368 | Hero | `neutral-50` #f8f7f5 | pt 48 / pb 80, px 64 | 568 |
| 2 | 64:5400 | Mission et vision | `neutral-0` #ffffff | py 96, px 64 | 624 |
| 3 | 64:5416 | Nos engagements | `neutral-50` #f8f7f5 | py 96, px 64 | 755 |
| 4 | 64:5451 | Notre méthode de coordination | `neutral-0` #ffffff | py 96, px 64 | 661 |
| 5 | 64:5514 | Citation | `neutral-0` ; bandeau `vert-50` #f6faef | pt 0 / pb 96, px 64 ; bandeau p 56 | 448 (bandeau 352) |
| 6 | 64:5530 | Web/CTA — Desktop (instance, textes spécifiques) | `neutral-0` ; bandeau `gradient/energie` | pb 112, px 64 ; bandeau p 72 | 494 |
| 7 | 64:5551 | Web/Footer — Desktop (global) | — | — | 831,5 |
| flottant | 64:5663 | Web/WhatsApp flottant | — | x 1348 y 808 | 64 × 64 |

## 2. Textes verbatim

### Hero (64:5368) — 2 col (texte flex-1 / illustration 560 × 440), gap 64 ; colonne texte gap 22

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 64:5371 | fil d'Ariane lien | `Accueil` | Inter Regular 13/16 ls 0.13 | `text-muted` #5e5952 |
| 64:5372 | séparateur | icône `chevron-right` 14 | — | — |
| 64:5374 | fil d'Ariane courant | `Mission` | Inter SemiBold 13/16 ls 0.13 | `text-main` #1c1a18 |
| 64:5375 | eyebrow | `Notre mission` (uppercase) | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` #ad5300 |
| 64:5376 | titre H1 | `Simplifier la vie, ` + **`rapprocher les distances.`** (surligné orange #ad5300) | Poppins SemiBold 52/58 ls -1.3 | `text-main` / #ad5300 |
| 64:5377 | lead | `Notre mission, notre vision, nos engagements et la méthode qui nous permet de coordonner chaque service avec rigueur.` | Inter Regular 19/31 | `text-muted` |

Chips d'ancrage (64:5378) : `Notre mission` (ACTIVE, icône `check`, fond #1c1a18, texte blanc) · `Notre vision` · `Nos engagements` · `Notre méthode` (outline, bordure `border-strong` #cfcac3, fond blanc). Inter Medium 14/20 ls 0.07, px 14 py 9, radius 999, gap 8.

### Mission et vision (64:5400) — 2 cartes, gap 24, hauteurs égales (432)

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 64:5407 | eyebrow carte 1 | `Notre mission` | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` #ad5300 |
| 64:5408 | énoncé carte 1 | `Accompagner les personnes, les familles et les organisations entre la France et le Cameroun, en leur offrant des solutions fiables, humaines et coordonnées pour se loger, se simplifier le quotidien et vivre des expériences de qualité.` | Poppins Medium 26/38 | `text-main` |
| 64:5414 | eyebrow carte 2 | `Notre vision` | Inter SemiBold 13/16 ls 1.04 uppercase | `orange-400` #f59842 |
| 64:5415 | énoncé carte 2 | `Devenir la référence de la coordination de services entre la France et le Cameroun : un lieu unique où chacun trouve un interlocuteur de confiance, quel que soit son besoin.` | Poppins Medium 26/38 | `neutral-0` blanc |

Carte 1 « Notre mission » : fond `orange-50` #fdf4ec, p 48, radius 32, gap 20 ; pastille icône 52 fond blanc radius 16, icône `shield` (shield-check) 24 orange foncé.
Carte 2 « Notre vision » : fond `neutral-900` #1c1a18, p 48, radius 32 ; pastille 52 fond `neutral-800` #2e2b28 radius 16, icône `compass` 24 orange.

### Nos engagements (64:5416) — gap 48

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 64:5418 | eyebrow | `Nos engagements` | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` |
| 64:5419 | titre H2 | `Ce que nous vous promettons, à chaque demande.` | Poppins SemiBold 48/56 ls -0.96 (`web/section`) | `text-main` |

### Notre méthode de coordination (64:5451) — gap 48

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 64:5453 | eyebrow | `Notre méthode de coordination` | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` |
| 64:5454 | titre H2 | `Cinq étapes, un seul interlocuteur.` | Poppins SemiBold 48/56 ls -0.96 | `text-main` |
| 64:5455 | lead | `De votre premier message jusqu’à votre avis, chaque demande suit le même parcours.` | Inter Regular 18/28 | `text-muted` |

Rail (64:5456) : 5 pastilles rondes 44 px numérotées `1` `2` `3` `4` `5` (Inter SemiBold 16/24) reliées par des lignes 2 px `border-strong` #cfcac3 (flex-1). Pastilles 1–4 : fond `neutral-900` #1c1a18, chiffre blanc. Pastille 5 : fond `brand-primary` #ff7a00, chiffre #1c1a18 (dernière étape mise en avant).

### Citation (64:5514)

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 64:5517 | citation | `« Mambo, ce n’est pas qu’un service. C’est une expérience pensée pour vous. »` | Poppins SemiBold 34/44 ls -0.34 | `vert-900` #30460f |
| 64:5518 | attribution | `La signature de MAMBO Proxi` | Inter Medium 14/20 ls 0.07 (`label/sm`) | `vert-700` #557e1b |

Bandeau : fond `vert-50` #f6faef, radius 32, p 56, gap 48 ; texte flex-1 (gap 16) + illustration 360 × 240.

### CTA (64:5530) — textes propres à cette page

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| I64:5530;56:2084 | titre (2 lignes explicites) | `Une demande` ⏎ `à nous confier ?` | Poppins SemiBold 52/58 ls -1.04 | `neutral-900` |
| I64:5530;56:2085 | lead | `Nous l’étudions avec soin et vous répondons sous 24 h.` | Inter Regular 19/30 | `neutral-900` |
| I64:5530;56:2088 | bouton | `Demander un devis gratuit` + `arrow-right` | Inter SemiBold 16/24 | blanc sur #1c1a18 |
| I64:5530;56:2090 | bouton | `Écrire sur WhatsApp` | Inter SemiBold 16/24 | #1c1a18 sur #25d366 |

## 3. Données répétées

### Énoncés mission / vision

| Clé | Eyebrow | Icône | Texte | Thème carte |
|---|---|---|---|---|
| mission | `Notre mission` | `shield` | (voir 64:5408) | clair orange-50 |
| vision | `Notre vision` | `compass` | (voir 64:5415) | sombre neutral-900 |

### Engagements (64:5420) — grille 2 colonnes (cartes 648 px), gap 16

| # | Node | Numéro | Titre | Description |
|---|---|---|---|---|
| 1 | 64:5421 | `01` | `Écoute` | `Comprendre votre besoin réel avant de proposer une solution.` |
| 2 | 64:5426 | `02` | `Transparence` | `Un devis clair, sans frais cachés, avant toute prestation.` |
| 3 | 64:5431 | `03` | `Fiabilité` | `Des prestataires vérifiés, suivis et évalués.` |
| 4 | 64:5436 | `04` | `Réactivité` | `Une réponse sous 24 h, un suivi à chaque étape.` |
| 5 | 64:5441 | `05` | `Confidentialité` | `Vos informations protégées et utilisées avec votre accord.` |
| 6 | 64:5446 | `06` | `Amélioration continue` | `Votre avis après chaque prestation pour progresser.` |

Carte : fond blanc, bordure 1 px `border-default` #e4e1dc, radius 22, p 28, disposition horizontale gap 18. Numéro Poppins SemiBold 32/36 ls -0.64 `orange-300` #f8b272. Titre Poppins SemiBold 20/28 (`h4`) `text-main`. Description Inter Regular 15/23 `text-muted`. Gap titre/desc 4.

### Étapes de la méthode (64:5471) — 5 colonnes, gap 16

| # | Node | Icône (lucide) | Titre | Description |
|---|---|---|---|---|
| 1 | 64:5472 | `file-text` | `Écoute` | `Vous nous décrivez votre besoin par formulaire, WhatsApp ou rendez-vous.` |
| 2 | 64:5481 | `search` | `Analyse` | `Nous identifions la solution et les prestataires les plus adaptés.` |
| 3 | 64:5489 | `mail` | `Proposition` | `Vous recevez un devis clair et personnalisé sous 24 h.` |
| 4 | 64:5497 | `users` | `Coordination` | `Nous organisons et supervisons l’intervention des prestataires.` |
| 5 | 64:5506 | `sparkles` | `Suivi et évaluation` | `Un questionnaire de satisfaction clôture chaque prestation.` |

Carte : fond `neutral-50`, radius 22, p 24, gap 14. Pastille 44 fond blanc radius 13, icône 20 orange foncé. Titre Inter SemiBold 17/24 `text-main`. Description Inter Regular 14/21 `text-muted`.

## 4. Éléments interactifs

| Élément | Libellé | Variante | Icône | Destination présumée |
|---|---|---|---|---|
| Fil d'Ariane | `Accueil` | lien texte | — | `/` |
| Chip | `Notre mission` | active sombre | check | `#mission` |
| Chip | `Notre vision` | outline | — | `#vision` |
| Chip | `Nos engagements` | outline | — | `#engagements` |
| Chip | `Notre méthode` | outline | — | `#methode` |
| Bouton CTA | `Demander un devis gratuit` | dark radius 12 px 24 py 14 | arrow-right 18 | `/devis` |
| Bouton CTA | `Écrire sur WhatsApp` | WhatsApp #25d366 radius 12 | — | `wa.me` |
| Flottant | WhatsApp | rond 64 | WhatsApp | `wa.me` |

Pas de formulaire, filtre, ni pagination. Le rail d'étapes est décoratif (non interactif).

## 5. Éléments visuels

- **Illustration — accueil** (79:13512) : 560 × 440, fond #fce7d5, radius 32. Scène : maison blanche à toit orange avec fenêtres vert pâle et porte orange à droite, soleil pâle en haut à droite, palmier à gauche, valise sombre à bande orange, deux personnages (l'un en haut vert, l'autre avec bonnet orange et haut orange, bras sur l'épaule) sur un sol sable orangé.
- **Illustration — culture** (79:13546) : 360 × 240, fond #2e2b28 (scène nocturne), radius 24. Scène : grand soleil orange, palmier vert à gauche, tambour/panier orange à motifs chevrons au centre, masque africain stylisé beige à droite, collines grises.
- Icônes : `chevron-right`, `check`, `shield`(shield-check), `compass`, `file-text`, `search`, `mail`, `users`, `sparkles`, `arrow-right`.
- Rayons : cartes mission/vision 32 ; engagements 22 ; étapes 22 ; pastilles icône 16 / 13 ; bandeau citation 32 ; illustration hero 32, culture 24 ; chips/rail 999 ; CTA 40 ; boutons 12.
- Ombres : aucune.
- Grilles : mission/vision 2 col gap 24 ; engagements 2 col gap 16 ; étapes 5 col gap 16 ; rail horizontal pleine largeur.
- Filigrane CTA : symbole M-Lien 384 × 291,84 opacité 22 %.

- Version mobile : voir `mission-mobile.md`.
