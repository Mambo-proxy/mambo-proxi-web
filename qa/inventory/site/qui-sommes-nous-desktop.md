# Inventaire — site/qui-sommes-nous-desktop

- Figma : fileKey `lsun63JexZYvgYUVpmSYyg`, frame `63:4730` « Qui sommes-nous — Desktop 1440 »
- Dimensions : 1440 × 5496,5 px
- Conventions : polices `Poppins` (titres, token `--mp-font-family-brand`) et `Inter` (UI, token `--mp-font-family-ui`). Couleurs exprimées en token CSS `--mp-color-*` (valeur hex entre parenthèses).
- Note typographie : l'export ne permet pas de distinguer une espace normale d'une espace insécable devant `:` `;` `?` `!`. Partout où une espace précède ces signes, elle est présente dans Figma (à rendre en insécable ` ` côté site).

## 1. Sections (ordre)

| # | Node id | Calque | Fond | Padding vertical | Hauteur |
|---|---|---|---|---|---|
| 0 | 63:4731 | Web/TopBar — Desktop (instance globale) | — | — | 36 |
| 0b | 63:4763 | Web/Header — Desktop (instance globale) | — | — | 85 |
| 1 | 63:4841 | Hero | `neutral-50` (#f8f7f5) | pt 48 / pb 80, px 64 | 588 |
| 2 | 63:4873 | Présentation | `neutral-0` (#ffffff) | py 96, px 64 | 440 |
| 3 | 63:4894 | Parcours de la fondatrice | `neutral-50` (#f8f7f5) | py 96, px 64 | 792 |
| 4 | 63:4919 | Notre équipe | `neutral-0` (#ffffff) | py 96, px 64 | 856 |
| 5 | 63:4981 | Nos valeurs | `neutral-900` (#1c1a18) — section sombre | py 96, px 64 | 532 |
| 6 | 63:5015 | Pourquoi Mambo Proxi ? | `neutral-0` (#ffffff) | py 96, px 64 | 812 |
| 7 | 63:5062 | Web/CTA — Desktop (instance) | `neutral-0` ; bandeau dégradé `gradient/energie` | pt 0 / pb 112, px 64 ; bandeau p 72 | 524 |
| 8 | 63:5083 | Web/Footer — Desktop (instance globale) | — | — | 831,5 |
| flottant | 63:5195 | Web/WhatsApp flottant | — | x 1348, y 808 | 64 × 64 |

## 2. Textes verbatim

### Hero (63:4841) — layout flex, gap 64 entre texte (flex-1) et illustration (560 × 460)
Colonne texte : gap 22.

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 63:4844 | fil d'Ariane (lien) | `Accueil` | Inter Regular 13/16, ls 0.13 | `text-muted` #5e5952 |
| 63:4845 | séparateur | icône `chevron-right` 14 px | — | — |
| 63:4847 | fil d'Ariane (page courante) | `Qui sommes-nous ?` | Inter SemiBold 13/16, ls 0.13 | `text-main` #1c1a18 |
| 63:4848 | eyebrow (uppercase) | `Qui sommes-nous ?` (rendu « QUI SOMMES-NOUS ? ») | Inter SemiBold 13/16, ls 1.04, uppercase | `text-brand` #ad5300 |
| 63:4849 | titre H1 | `Une agence qui relie ` + **`la France et le Cameroun.`** (surligné orange #ad5300) | Poppins SemiBold 52/58, ls -1.3 | `text-main` #1c1a18 ; partie surlignée #ad5300 |
| 63:4850 | lead | `MAMBO Proxi est une agence de coordination multiservices. Nous accompagnons les personnes, les familles et les organisations dans l’immobilier, les services de proximité, l’expérience, la culture et l’événementiel.` | Inter Regular 19/31 | `text-muted` #5e5952 |

Chips d'ancrage « Choix » (63:4851), flex-wrap gap 8 :

| Node | Libellé | État |
|---|---|---|
| 63:4852 | `Présentation` (+ icône `check` 14 px) | ACTIF : fond `neutral-900` #1c1a18, bordure #1c1a18, texte `neutral-0` blanc |
| 63:4856 | `Notre équipe` | inactif : fond `neutral-0`, bordure 1 px `border-strong` #cfcac3, texte `text-main` |
| 63:4858 | `Nos valeurs` | inactif |
| 63:4860 | `Pourquoi Mambo Proxi ?` | inactif |

Chip : Inter Medium 14/20, ls 0.07 ; px 14, py 9 ; radius 999 ; hauteur 40.

### Présentation (63:4873) — 2 colonnes : gauche 520 px, droite flex-1, gap 80

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 63:4876 | eyebrow | `Présentation` | Inter SemiBold 13/16, ls 1.04, uppercase | `text-brand` #ad5300 |
| 63:4877 | titre H2 | `Mambo, ce n’est pas qu’un service. C’est une expérience pensée pour vous.` | Poppins SemiBold 40/48, ls -0.8 | `text-main` |
| 63:4879 | body | `Né du constat qu’il est difficile d’organiser sa vie au Cameroun à distance, ou d’y trouver des prestataires fiables, MAMBO Proxi réunit en un seul lieu des services essentiels et des expériences de qualité.` | Inter Regular 18/30 (`body-lg`) | `text-muted` |
| 63:4880 | body | `Notre rôle : comprendre votre besoin, trouver la bonne solution, coordonner les prestataires et vous tenir informé à chaque étape. En France comme au Cameroun, vous avez un seul interlocuteur.` | Inter Regular 18/30 | `text-muted` |

Piliers (63:4881), pastilles non interactives, gap 8 : `Vie`, `Expérience`, `Culture`, `Transmission`. Chaque pastille : fond `neutral-50`, puce 6 px `brand-primary` #ff7a00, texte Inter Medium 14/20 `text-main`, px 14 py 8, radius 999, gap 8.

### Parcours de la fondatrice (63:4894) — illustration 520 × 600 + texte flex-1, gap 72, alignement vertical centré

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 63:4908 | eyebrow | `Le parcours de la fondatrice` | Inter SemiBold 13/16, ls 1.04, uppercase | `text-brand` |
| 63:4909 | icône | `quote` 40 px (violet) | — | — |
| 63:4912 | citation | `« J’ai voulu créer le service dont chaque famille entre la France et le Cameroun a besoin : quelqu’un de confiance, sur place, qui s’occupe de tout comme pour les siens. »` | Poppins Medium 28/40 | `text-main` |
| 63:4913 | body | `Fondatrice de MAMBO Proxi, Mireille Bell a fait de la proximité le cœur de son engagement : relier deux pays qu’elle connaît intimement et accompagner chacun avec attention et exigence.` | Inter Regular 17/28 | `text-muted` |
| 63:4915 | trait signature | barre 32 × 2 `brand-primary` #ff7a00 | — | — |
| 63:4917 | nom | `Mireille Bell` | Inter SemiBold 16/24 (`label/md`) | `text-main` |
| 63:4918 | fonction | `Fondatrice et directrice` | Inter Regular 13/16, ls 0.13 | `text-muted` |

Colonne texte gap 20 ; signature gap 12.

### Notre équipe (63:4919) — gap 48 en-tête / grille

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 63:4921 | eyebrow | `Notre équipe` | Inter SemiBold 13/16, ls 1.04, uppercase | `text-brand` |
| 63:4922 | titre H2 | `Des visages derrière chaque service` | Poppins SemiBold 48/56, ls -0.96 (style `web/section`) | `text-main` |
| 63:4923 | lead | `Une équipe présente en France et au Cameroun, joignable et à l’écoute.` | Inter Regular 18/28 (`body-lg`) | `text-muted` |

En-tête largeur 820, gap 16.

### Nos valeurs (63:4981) — section sombre

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 63:4983 | eyebrow | `Nos valeurs` | Inter SemiBold 13/16, ls 1.04, uppercase | `orange-400` #f59842 |
| 63:4984 | titre H2 | `Ce qui nous guide, chaque jour.` | Poppins SemiBold 48/56, ls -0.96 | `neutral-0` blanc |

En-tête largeur 760, gap 14. Cartes : voir § 3.

### Pourquoi Mambo Proxi ? (63:5015)

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 63:5017 | eyebrow | `Pourquoi Mambo Proxi ?` | Inter SemiBold 13/16, ls 1.04, uppercase | `text-brand` |
| 63:5018 | titre H2 | `Trois engagements, une seule promesse.` | Poppins SemiBold 48/56, ls -0.96 | `text-main` |

### CTA (63:5062, instance Web/CTA — Desktop)

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| I63:5062;56:2084 | titre (2 lignes explicites) | `Faisons` ⏎ `connaissance.` | Poppins SemiBold 52/58, ls -1.04 | `neutral-900` #1c1a18 |
| I63:5062;56:2085 | lead | `Une question, un projet ? Échangeons par téléphone, WhatsApp ou lors d’un rendez-vous.` | Inter Regular 19/30 | `neutral-900` |
| I63:5062;56:2088 | bouton | `Demander un devis gratuit` + icône `arrow-right` 18 | Inter SemiBold 16/24 | blanc sur `neutral-900` |
| I63:5062;56:2090 | bouton | `Écrire sur WhatsApp` | Inter SemiBold 16/24 | `text-on-primary` #1c1a18 sur #25d366 |

## 3. Données répétées

### Membres de l'équipe (63:4924) — 4 colonnes, gap 20, carte 313 × 428

| # | Node | Nom | Rôle · Lieu | Portrait (fond #fce7d5) — couleur du haut |
|---|---|---|---|---|
| 1 | 63:4925 | `Prénom Nom` | `Coordination · Douala` | orange vif (#ff7a00) |
| 2 | 63:4939 | `Prénom Nom` | `Relation clients · France` | vert (#7fba2a env.) |
| 3 | 63:4953 | `Prénom Nom` | `Immobilier · Yaoundé` | brun foncé / noir |
| 4 | 63:4967 | `Prénom Nom` | `Partenariats · Douala` | orange clair |

Nom : Inter SemiBold 17/24 `text-main`. Rôle : Inter Regular 14/20 `text-muted` (séparateur « · » point médian, à modéliser comme 2 champs `role` + `location`). Portrait : 313 × 360, radius 24, gap 12 sous l'image.

### Valeurs (63:4985) — 4 colonnes, gap 16

| # | Node | Icône | Titre | Description |
|---|---|---|---|---|
| 1 | 63:4986 | `users` | `Proximité` | `Être présents, accessibles et attentifs, ici et là-bas.` |
| 2 | 63:4994 | `shield` (shield-check visuel) | `Confiance` | `Des prestataires vérifiés, des engagements tenus.` |
| 3 | 63:5001 | `sparkles` | `Exigence` | `Le même niveau de qualité, quel que soit le service.` |
| 4 | 63:5008 | `graduation` (graduation-cap) | `Transmission` | `Partager la culture, les savoir-faire et les bonnes pratiques.` |

Carte : fond `neutral-800` #2e2b28, p 28, radius 24, gap 14. Pastille icône 48 × 48 fond `neutral-700` #46423d radius 14, icône 22 px orange. Titre Poppins SemiBold 20/28 (`h4`) blanc. Description Inter Regular 15/23 `neutral-300` #cfcac3.

### Engagements (63:5019) — 3 colonnes, gap 16

| # | Node | Icône | Numéro | Titre | Description |
|---|---|---|---|---|---|
| 1 | 63:5020 | `users` | `01` | `Une équipe à vos côtés` | `Un interlocuteur unique qui vous accompagne pas à pas.` |
| 2 | 63:5030 | `shield` | `02` | `Des solutions concrètes et durables` | `Des prestataires vérifiés, suivis et évalués.` |
| 3 | 63:5039 | `globe` | `03` | `Un pont entre la France et le Cameroun` | `Préparez depuis la France, nous agissons sur place.` |

Carte : bordure 1 px `border-default` #e4e1dc, fond transparent (blanc), p 32, radius 24, gap 14. Pastille 48 fond `vert-50` #f6faef radius 14, icône 22 vert. Numéro Poppins SemiBold 40/44 ls -0.8 `orange-200` #f8cfaa, aligné à droite. Titre Poppins SemiBold 20/28 `text-main`. Description Inter Regular 15/23 `text-muted`.

### Chiffres clés (63:5049) — 4 colonnes, gap 16

| # | Node | Valeur | Libellé |
|---|---|---|---|
| 1 | 63:5050 | `150+` | `projets accompagnés` |
| 2 | 63:5053 | `40+` | `partenaires engagés` |
| 3 | 63:5056 | `2` | `pays couverts` |
| 4 | 63:5059 | `19` | `services` |

Tuile : fond `neutral-50`, p 28, radius 20, gap 4. Valeur Poppins SemiBold 48/56 ls -0.96 `text-main`. Libellé Inter Regular 14/20 `text-muted`.

## 4. Éléments interactifs

| Élément | Libellé | Variante | Icône | Destination présumée |
|---|---|---|---|---|
| Fil d'Ariane | `Accueil` | lien texte | chevron-right séparateur | `/` |
| Chip ancre | `Présentation` | chip active (sombre) | check | `#presentation` |
| Chip ancre | `Notre équipe` | chip outline | — | `#equipe` |
| Chip ancre | `Nos valeurs` | chip outline | — | `#valeurs` |
| Chip ancre | `Pourquoi Mambo Proxi ?` | chip outline | — | `#pourquoi` |
| Bouton CTA | `Demander un devis gratuit` | dark (fond #1c1a18, radius 12, px 24 py 14) | arrow-right | `/devis` |
| Bouton CTA | `Écrire sur WhatsApp` | WhatsApp (#25d366, radius 12, px 24 py 12) | — | lien `wa.me` |
| Flottant | WhatsApp | bouton rond 64 | logo WhatsApp | `wa.me` |

Aucun formulaire, aucun filtre, aucune pagination.

## 5. Éléments visuels

- **Illustration — equipe** (79:13336) : 560 × 460, fond #eaf5db (vert pâle → dégradé chaud), radius 32. Scène : trois personnages debout derrière une grande table/bureau sombre, celui du centre (pull noir, cheveux bruns) devant un ordinateur portable à écran orange pâle, à gauche un personnage avec casque/coiffe orange et haut orange qui tend la main, à droite un personnage en haut vert ; plante en pot orange à droite.
- **Illustration — portrait** fondatrice (79:13374) : 520 × 600, fond #fce7d5, radius 32. Personnage buste (cheveux afro noirs, peau brune, haut orange #ff7a00), grand disque clair en haut à droite.
- **Illustration — portrait** ×4 équipe (79:13384, 79:13394, 79:13404, 79:13414) : 313 × 360, fond #fce7d5, radius 24 ; même gabarit, variation de couleur du haut (orange, vert, brun foncé, orange clair) et de teinte de peau.
- Icônes : `chevron-right` (14), `check` (14), `quote` (40, violet), `users`, `shield`, `sparkles`, `graduation` (graduation-cap), `globe` (22), `arrow-right` (18).
- Filigrane CTA : symbole « M-Lien » 384 × 291,84, opacité 22 %, position left 968 / top -20.
- Rayons : chips/pastilles 999 ; cartes 24 ; tuiles chiffres 20 ; illustrations 32 (hero, fondatrice) / 24 (équipe) ; pastilles icônes 14 ; bandeau CTA 40 ; boutons 12.
- Ombres : aucune ombre visible sur ces sections.
- Grilles : équipe 4 col gap 20 ; valeurs 4 col gap 16 ; engagements 3 col gap 16 ; chiffres 4 col gap 16 ; présentation 2 col (520 + flex) gap 80 ; fondatrice 2 col (520 + flex) gap 72 ; hero 2 col (flex + 560) gap 64.

- Version mobile : voir `qui-sommes-nous-mobile.md`.
