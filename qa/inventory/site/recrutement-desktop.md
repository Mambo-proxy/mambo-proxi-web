# Inventaire — site/recrutement-desktop

- Figma : fileKey `lsun63JexZYvgYUVpmSYyg`, frame `67:6710` « Recrutement — Desktop 1440 »
- Dimensions : 1440 × 4166,5 px
- Polices : Poppins (`--mp-font-family-brand`), Inter (`--mp-font-family-ui`). Couleurs = tokens `--mp-color-*` (hex).
- Espaces avant `:` `?` : présentes ; insécable non vérifiable → rendre en ` `.
- Les intitulés de poste utilisent le **point médian** `·` (écriture inclusive) et l'apostrophe typographique `’`.
- **Pas de bandeau CTA orange** ; un bandeau sombre « Devenir prestataire » en tient lieu.
- Valeurs marquées *(déduit)* : obtenues par la géométrie (hauteur de boîte), non lues directement.

## 1. Sections (ordre)

| # | Node id | Calque | Fond | Padding vertical | Hauteur |
|---|---|---|---|---|---|
| 0 | 67:6711 | Web/TopBar — Desktop (global) | — | — | 36 |
| 0b | 67:6743 | Web/Header — Desktop (global) | — | — | 85 |
| 1 | 67:6821 | Hero | `neutral-50` #f8f7f5 | pt 48 / pb 80, px 64 | 568 |
| 2 | 67:6847 | Pourquoi nous rejoindre | `neutral-0` #ffffff | py **80**, px 64 | 278 |
| 3 | 67:6874 | Nos offres | `neutral-50` #f8f7f5 | py 96, px 64 | 972 |
| 4 | 67:6991 | Devenir prestataire | `neutral-0` ; bandeau `neutral-900` #1c1a18 | py 80, px 64 ; bandeau p 44 | 348 (bandeau 188) |
| 5 | 67:6999 | Formulaire — Candidature | `neutral-50` *(déduit, alternance)* | py 96, px 64 | 1048 |
| 6 | 67:7073 | Web/Footer — Desktop (global) | — | — | 831,5 |
| flottant | 67:7185 | Web/WhatsApp flottant | — | x 1348 y 808 | 64 × 64 |

## 2. Textes verbatim

### Hero (67:6821) — 2 col (texte flex-1 / illustration 560 × 440), gap 64 ; texte gap 22

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 67:6824 | fil d'Ariane lien | `Accueil` | Inter Regular 13/16 ls 0.13 | `text-muted` |
| 67:6827 | fil d'Ariane courant | `Recrutement` | Inter SemiBold 13/16 | `text-main` |
| 67:6828 | eyebrow | `Recrutement` (uppercase) | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` #ad5300 |
| 67:6829 | titre H1 | `Rejoignez une équipe ` + **`qui prend soin des autres.`** (surligné orange #ad5300) | Poppins SemiBold 52/58 ls -1.3 | `text-main` / #ad5300 |
| 67:6830 | lead | `Collaborateurs, prestataires, partenaires : nous recherchons des personnes fiables, attentionnées et exigeantes, au Cameroun et en France.` | Inter Regular 19/31 | `text-muted` |
| 67:6832 | bouton | `Voir nos offres` | Inter SemiBold 16/24 | #1c1a18 sur #ff7a00 (Primary) |
| 67:6834 | bouton | `Candidature spontanée` | Inter SemiBold 16/24 | Outline (bordure 1,5 px #cfcac3) |

### Nos offres (67:6874) — gap 48

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 67:6877 | eyebrow | `Nos offres` | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` |
| 67:6878 | titre H2 | `4 postes ouverts` (le nombre = compteur dynamique) | Poppins SemiBold 48/56 ls -0.96 | `text-main` |
| 67:6883 | recherche (placeholder) | `Rechercher un poste` | Inter Regular 16/24 | `text-subtle` #7d776f |
| 67:6990 | note de bas de liste | `Les offres sont mises à jour régulièrement par l’agence.` | Inter Regular 12/16 ls 0.12 (`caption`) | `text-muted` |

En-tête : titre à gauche (820), champ de recherche à droite aligné en bas (360 × 50, fond blanc, bordure 1 px `border-strong`, **radius 999**, px 16 py 12, icône `search` 18, gap 10).

### Devenir prestataire (67:6991)

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 67:6994 | eyebrow | `Devenir prestataire / collaborateur` | Inter SemiBold **12/16** ls 0.96 uppercase | `orange-400` #f59842 |
| 67:6995 | titre | `Indépendant ou entreprise ? Proposez vos services.` | Poppins SemiBold 32/40 (`h2`) ls -0.32 | blanc |
| 67:6996 | texte | `Chauffeurs, chefs, photographes, masseurs, agents d’entretien : rejoignez notre réseau de prestataires.` | Inter Regular 16/24 | `neutral-300` #cfcac3 |
| 67:6997 | bouton | `Proposer mes services` | Inter SemiBold 16/24 | Primary orange |

Bandeau : fond `neutral-900`, radius 32, p 44, gap 40 ; texte flex-1 (gap 10), bouton à droite centré verticalement.

### Formulaire — Candidature (67:6999) — 2 col : infos 420 + formulaire flex-1, gap 64

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 67:7002 | eyebrow | `Candidature` | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` |
| 67:7003 | titre H2 | `Postulez ou envoyez une candidature spontanée` | Poppins SemiBold, 3 lignes sur 420 px, h 144 → 40/48 *(déduit)* | `text-main` |
| 67:7004 | lead | `Nous lisons chaque candidature et revenons vers vous sous 15 jours.` | Inter Regular 16/26 *(déduit, identique aux autres formulaires)* | `text-muted` |

Carte formulaire (67:7005) : fond blanc, bordure 1 px `border-default` #e4e1dc, radius 28, p 40, gap 20.

## 3. Données répétées

### Atouts « Pourquoi nous rejoindre » (67:6848) — 3 colonnes, gap 16 (pas d'en-tête de section)

| # | Node | Icône | Titre | Description |
|---|---|---|---|---|
| 1 | 67:6849 | `users` | `Une équipe soudée` | `Entre Douala, Yaoundé et la France, on avance ensemble.` |
| 2 | 67:6858 | `graduation` | `Formation continue` | `Des sessions régulières pour progresser dans votre métier.` |
| 3 | 67:6866 | `sparkles` | `Des missions utiles` | `Chaque jour, vous simplifiez la vie de familles.` |

Carte : fond `neutral-50`, radius 22, p 24, disposition **horizontale** (icône à gauche, texte à droite, gap 16). Pastille 44 fond `orange-50` radius 13, icône 20 orange foncé. Titre Inter SemiBold 17/24 ; description Inter Regular 14/21 `text-muted`.

### Offres d'emploi (67:6899) — liste verticale, gap 12

| # | Node | Intitulé | Badge | Lieu | Contrat | Publication | Bouton |
|---|---|---|---|---|---|---|---|
| 1 | 67:6900 | `Coordinateur·rice de services` | `Nouveau` | `Douala` | `CDI` | `Publiée il y a 3 jours` | `Voir l’offre` |
| 2 | 67:6924 | `Chargé·e de relation clients diaspora` | — | `France · télétravail` | `CDD 12 mois` | `Publiée il y a 1 semaine` | `Voir l’offre` |
| 3 | 67:6946 | `Agent·e d’entretien des logements` | — | `Yaoundé` | `Temps partiel` | `Publiée il y a 2 semaines` | `Voir l’offre` |
| 4 | 67:6968 | `Chauffeur·euse partenaire` | — | `Douala` | `Freelance` | `Publiée il y a 3 semaines` | `Voir l’offre` |

Ligne : fond blanc, bordure 1 px `border-default`, radius 22, p 28, gap 24, alignement centré ; bloc texte flex-1 (gap 8) + bouton Outline à droite (130 × 51). Intitulé Poppins SemiBold 20/28. Badge `Nouveau` : fond `vert-50` #f6faef, texte `vert-700` #557e1b Inter SemiBold 12/16 ls 0.12, px 9 py 3, radius 999, gap 10 après le titre. Méta : icônes `map-pin` / `briefcase` / `clock` 16 + Inter Regular 14/20 `text-muted`, gap 16 (6 interne), flex-wrap.
Date relative « Publiée il y a … » = calculée depuis la date de publication (cf. détail : `Publiée le 2 octobre 2026`).

## 4. Éléments interactifs

### Boutons / liens

| Élément | Libellé | Variante | Destination présumée |
|---|---|---|---|
| Fil d'Ariane | `Accueil` | lien | `/` |
| Hero | `Voir nos offres` | Primary | `#offres` |
| Hero | `Candidature spontanée` | Outline | `#candidature` (Poste visé = Candidature spontanée) |
| Offre ×4 | `Voir l’offre` | Outline (bordure 1,5 px #cfcac3, radius 12) | `/recrutement/<slug>` (page détail) |
| Bandeau | `Proposer mes services` | Primary | `/partenaires#formulaire` |
| Formulaire | `Envoyer ma candidature` | Primary (235 × 48) | soumission |
| Flottant | WhatsApp | rond 64 | `wa.me` |

### Recherche et filtres

- Champ `Rechercher un poste` (texte libre, icône search, pill).
- Filtres chips (choix unique visible) : `Tous` (ACTIF, check) · `Douala` · `Yaoundé` · `France` · `CDI` · `Freelance`. Mélange de filtres **lieu** (Douala, Yaoundé, France) et **contrat** (CDI, Freelance) dans une même rangée.
- Pas de pagination.

### Formulaire « Candidature » (67:7005)

| # | Node | Label | Type | Requis | Placeholder / valeur | Icône |
|---|---|---|---|---|---|---|
| 1 | 67:7006 | `Poste visé` | select | oui `*` | valeur affichée `Candidature spontanée` (texte **`text-main`**, donc valeur sélectionnée et non placeholder) | `chevron-down` |
| 2 | 67:7015 | `Nom et prénom` | texte | oui `*` | `Votre nom complet` | `user` |
| 3 | 67:7024 | `E-mail` | email | oui `*` | `vous@exemple.com` | `mail` |
| 4 | 67:7034 | `Téléphone / WhatsApp` | tél | oui `*` | `+237 6 00 00 00 00` | `phone` |
| 5 | 67:7043 | `Ville` | texte | non | `Douala` (placeholder) | `map-pin` |
| 6 | 67:7051 | `CV` | fichier (glisser-déposer) | oui `*` | `Glissez votre CV ici ou parcourez vos fichiers` / aide `PDF ou Word · 5 Mo maximum` | `upload` |
| 7 | 67:7063 | `Message` | textarea (h 110) | non | `Présentez-vous en quelques lignes…` | — |
| 8 | 67:7068 | consentement | case 20 × 20 | (implicite) | — | — |

Options du select « Poste visé » : non affichées ; logiquement `Candidature spontanée` + intitulés des offres ouvertes.
Zone de dépôt : fond `neutral-50`, bordure 1 px **pointillée** `border-strong`, radius 16, p 28, gap 8, centrée ; pastille 44 blanche radius 13 + icône `upload` 20 orange ; texte principal Inter Medium 14/20 `text-main` ; aide Inter Regular 12/16 ls 0.12 `text-muted`.
Consentement (verbatim, apostrophe droite) : `J'accepte que Mambo Proxi traite mes données pour répondre à ma demande, conformément à la politique de confidentialité.`
**Pas de mention anti-spam** sur ce formulaire.
Bouton : `Envoyer ma candidature`.

## 5. Éléments visuels

- **Illustration — equipe** hero (79:13988) : 560 × 440, fond #eaf5db (même scène que Qui sommes-nous/Partenaires : trois personnages autour d'une table avec ordinateur, plante en pot).
- Icônes : `chevron-right`, `users`, `graduation`, `sparkles`, `search`, `check`, `map-pin`, `briefcase`, `clock`, `chevron-down`, `user`, `mail`, `phone`, `upload`.
- Rayons : atouts 22 ; lignes d'offre 22 ; badge 999 ; recherche 999 ; bandeau 32 ; carte formulaire 28 ; zone de dépôt 16 ; champs 12 ; boutons 12.
- Ombres : aucune.
- Grilles : atouts 3 col gap 16 ; offres liste 1 col gap 12 ; formulaire 2 col (420 + flex) gap 64 ; champs 2 col gap 16.

- Version mobile : voir `recrutement-mobile.md`.
