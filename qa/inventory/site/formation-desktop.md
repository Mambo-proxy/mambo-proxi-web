# Inventaire — site/formation-desktop

- Figma : fileKey `lsun63JexZYvgYUVpmSYyg`, frame `66:6190` « Formation — Desktop 1440 »
- Dimensions : 1440 × 3932,5 px
- Polices : Poppins (`--mp-font-family-brand`), Inter (`--mp-font-family-ui`). Couleurs = tokens `--mp-color-*` (hex).
- Espaces avant `:` `?` : présentes dans Figma. Le titre `Une formation pour votre équipe ?` montre dans Figma le `?` **rejeté seul à la ligne** (espace non insécable) → à corriger côté site avec ` `.
- **Pas de bandeau CTA** sur cette page.

## 1. Sections (ordre)

| # | Node id | Calque | Fond | Padding vertical | Hauteur |
|---|---|---|---|---|---|
| 0 | 66:6191 | Web/TopBar — Desktop (global) | — | — | 36 |
| 0b | 66:6223 | Web/Header — Desktop (global) | — | — | 85 |
| 1 | 66:6301 | Hero | `neutral-50` #f8f7f5 | pt 48 / pb 80, px 64 | 568 |
| 2 | 66:6327 | Offres | `neutral-0` #ffffff | py 96, px 64 | 476 |
| 3 | 66:6354 | Nos formations | `neutral-50` #f8f7f5 | py 96, px 64 | 990 |
| 4 | 66:6528 | Formulaire — Demande de formation | `neutral-0` #ffffff | py 96, px 64 | 946 |
| 5 | 66:6614 | Web/Footer — Desktop (global) | — | — | 831,5 |
| flottant | 66:6726 | Web/WhatsApp flottant | — | x 1348 y 808 | 64 × 64 |

## 2. Textes verbatim

### Hero (66:6301) — 2 col (texte flex-1 / illustration 560 × 440), gap 64 ; texte gap 22

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 66:6304 | fil d'Ariane lien | `Accueil` | Inter Regular 13/16 ls 0.13 | `text-muted` #5e5952 |
| 66:6307 | fil d'Ariane courant | `Formation` | Inter SemiBold 13/16 ls 0.13 | `text-main` #1c1a18 |
| 66:6308 | eyebrow | `Formation` (uppercase) | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` #ad5300 |
| 66:6309 | titre H1 | `Transmettre les savoir-faire ` + **`qui font la qualité.`** (surligné orange #ad5300) | Poppins SemiBold 52/58 ls -1.3 | `text-main` / #ad5300 |
| 66:6310 | lead | `Formations pour les professionnels, ateliers et sessions de sensibilisation : pour élever le niveau de service, au Cameroun et en France.` | Inter Regular 19/31 | `text-muted` |
| 66:6312 | bouton | `Demander une formation` | Inter SemiBold 16/24 | #1c1a18 sur `brand-primary` #ff7a00 |
| 66:6314 | bouton | `Voir le catalogue` | Inter SemiBold 16/24 | `text-main`, Outline bordure 1,5 px #cfcac3 |

### Offres (66:6327) — 2 cartes, gap 16

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 66:6334 | titre carte 1 | `Formation des professionnels` | Poppins SemiBold 28/32 (`h3`) | blanc |
| 66:6335 | texte carte 1 | `Pour les prestataires et les entreprises : accueil, qualité de service, hygiène, entretien, gestion locative.` | Inter Regular 16/26 | `neutral-300` #cfcac3 |
| 66:6337 | lien carte 1 | `Voir les formations` + `arrow-right` 16 | Inter SemiBold 14/20 ls 0.07 | `orange-400` #f59842 |
| 66:6347 | titre carte 2 | `Ateliers & sensibilisation` | Poppins SemiBold 28/32 | `text-main` |
| 66:6348 | texte carte 2 | `Pour les particuliers, les familles et les associations : installation, accompagnement des proches, culture locale.` | Inter Regular 16/26 | `text-muted` |
| 66:6350 | lien carte 2 | `Voir les formations` + `arrow-right` 16 | Inter SemiBold 14/20 ls 0.07 | `text-brand` #ad5300 |

Carte 1 : fond `neutral-900` #1c1a18, p 40, radius 32, gap 16 ; pastille 52 fond `neutral-800` #2e2b28 radius 16, icône `briefcase` 24 orange.
Carte 2 : fond `orange-50` #fdf4ec, p 40, radius 32 ; pastille 52 blanche radius 16, icône `users` 24 orange foncé.

### Nos formations (66:6354) — gap 48

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 66:6356 | eyebrow | `Nos formations` | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` |
| 66:6357 | titre H2 | `Le catalogue` | Poppins SemiBold 48/56 ls -0.96 | `text-main` |
| 66:6358 | lead | `Chaque formation peut être adaptée à votre structure et à vos équipes.` | Inter Regular 18/28 | `text-muted` |

Filtres (66:6359) : `Toutes` (ACTIF, check, fond #1c1a18) · `Professionnels` · `Ateliers` · `Sensibilisation` (outline). Inter Medium 14/20, px 14 py 9, radius 999, gap 8.

### Formulaire — Demande de formation (66:6528) — 2 col : infos 420 + formulaire flex-1, gap 64

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 66:6531 | eyebrow | `Demande de formation` | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` |
| 66:6532 | titre H2 | `Une formation pour votre équipe ?` | Poppins SemiBold 48/56 ls -0.96 | `text-main` |
| 66:6533 | lead | `Dites-nous ce dont vous avez besoin : nous vous proposons un programme et un devis adaptés.` | Inter Regular 16/26 | `text-muted` |

Sous le lead : **Illustration — formation** 420 × 280 (79:13928), fond #fdf4ec, radius 24.
Carte formulaire (66:6545) : fond **`neutral-50`** #f8f7f5 (différent de Partenaires qui est blanc), **sans bordure**, radius 28, p 40, gap 20. Détail § 4.

## 3. Données répétées

### Offres de formation (66:6328)

| # | Clé | Icône | Titre | Description | Lien | Thème |
|---|---|---|---|---|---|---|
| 1 | professionnels | `briefcase` | `Formation des professionnels` | `Pour les prestataires et les entreprises : accueil, qualité de service, hygiène, entretien, gestion locative.` | `Voir les formations` → filtre Professionnels | sombre |
| 2 | ateliers | `users` | `Ateliers & sensibilisation` | `Pour les particuliers, les familles et les associations : installation, accompagnement des proches, culture locale.` | `Voir les formations` → filtres Ateliers/Sensibilisation | clair orange-50 |

### Catalogue des formations (66:6370) — grille 3 colonnes (cartes 416 px), gap 20

| # | Node | Icône (lucide) | Titre | Catégorie (badge) | Durée | Format · Lieu |
|---|---|---|---|---|---|---|
| 1 | 66:6371 | `users` | `Accueil et relation client` | `Professionnels` | `1 jour` | `Présentiel · Douala` |
| 2 | 66:6398 | `utensils` | `Hygiène et sécurité en cuisine` | `Professionnels` | `2 jours` | `Présentiel · Douala` |
| 3 | 66:6425 | `wrench` | `Entretien professionnel des logements` | `Professionnels` | `1 jour` | `Présentiel · Yaoundé` |
| 4 | 66:6450 | `building` (building-2) | `Gestion locative : les fondamentaux` | `Professionnels` | `2 jours` | `En ligne` |
| 5 | 66:6477 | `plane` | `Bien préparer son installation au Cameroun` | `Ateliers` | `2 heures` | `En ligne` |
| 6 | 66:6502 | `home-heart` (house + cœur) | `Accompagner un proche âgé à domicile` | `Sensibilisation` | `3 heures` | `Présentiel · Douala` |

Lien commun : `Demander cette formation` + `arrow-right` 16 (Inter SemiBold 14/20 `text-brand`).
Modèle de données suggéré : `format` ∈ {`Présentiel`, `En ligne`} + `city` optionnelle (affichée « Présentiel · Ville »).
Carte : fond blanc, bordure 1 px `border-default` #e4e1dc, radius 24, p 28, gap 14. En-tête : pastille 44 fond `vert-50` #f6faef radius 13 (icône verte 20) à gauche, badge catégorie à droite. Badge `Professionnels` : fond `neutral-100` #f1efec, texte `text-main` ; badges `Ateliers` / `Sensibilisation` : fond `orange-50` #fdf4ec, texte `orange-700` #ad5300 ; badge px 10 py 4 radius 999, Inter SemiBold 12/16 ls 0.12. Titre Poppins SemiBold 20/28. Infos : icônes `clock` / `map-pin` 16 + Inter Regular 13/20 `text-muted`, gap 16 (6 interne). Séparateur 1 px `border-default`. Hauteurs : 227 (titre 1 ligne) / 255 (titre 2 lignes) — les cartes ne s'étirent pas (alignement haut).

## 4. Éléments interactifs

### Boutons / liens

| Élément | Libellé | Variante | Icône | Destination présumée |
|---|---|---|---|---|
| Fil d'Ariane | `Accueil` | lien | — | `/` |
| Hero | `Demander une formation` | Primary | — | `#demande-formation` |
| Hero | `Voir le catalogue` | Outline | — | `#catalogue` |
| Offre ×2 | `Voir les formations` | lien | arrow-right | `#catalogue` + filtre |
| Carte formation ×6 | `Demander cette formation` | lien orange | arrow-right | `#demande-formation` avec formation présélectionnée |
| Formulaire | `Envoyer ma demande` | Primary 215 × 48 | — | soumission |
| Flottant | WhatsApp | rond 64 | — | `wa.me` |

### Filtres catalogue

`Toutes` (actif) · `Professionnels` · `Ateliers` · `Sensibilisation`. Pas de pagination.

### Formulaire « Demande de formation » (66:6545)

Styles identiques au formulaire Partenaires (label Inter SemiBold 14/20, astérisque `text-brand`, champ blanc bordure #cfcac3 radius 12 px 16 py 14 h 54, placeholder Inter 16/24 `text-subtle` #7d776f, icône 18).

| # | Node | Label | Type | Requis | Placeholder | Icône | Largeur |
|---|---|---|---|---|---|---|---|
| 1 | 66:6546 | `Formation souhaitée` | select | oui `*` | `Choisir une formation` | `chevron-down` (droite) | pleine |
| 2 | 66:6555 | `Structure` | texte | oui `*` | `Entreprise, association, particulier…` | — | ½ |
| 3 | 66:6561 | `Nombre de participants` | nombre | oui `*` | `Ex. : 8` | — | ½ |
| 4 | 66:6568 | `Nom et prénom` | texte | oui `*` | `Votre nom complet` | `user` | ½ |
| 5 | 66:6577 | `E-mail` | email | oui `*` | `vous@exemple.com` | `mail` | ½ |
| 6 | 66:6587 | `Téléphone / WhatsApp` | tél | oui `*` | `+237 6 00 00 00 00` | `phone` | ½ |
| 7 | 66:6596 | `Période souhaitée` | texte / mois | non | `Ex. : janvier 2027` | `calendar` | ½ |
| 8 | 66:6604 | `Précisions` | textarea (h 110) | non | `Objectifs, niveau des participants, lieu…` | — | pleine |
| 9 | 66:6609 | consentement | case à cocher 20 × 20 | (implicite) | — | — | pleine |

Options du select : non affichées ; logiquement = titres du catalogue (6 formations ci-dessus).
Consentement (verbatim, apostrophe droite) : `J'accepte que Mambo Proxi traite mes données pour répondre à ma demande, conformément à la politique de confidentialité.`
**Aucune mention anti-spam sur ce formulaire** (contrairement à Partenaires).
Bouton : `Envoyer ma demande`.

## 5. Éléments visuels

- **Illustration — formation** hero (79:13898) : 560 × 440, fond #fdf4ec (orange très pâle → vert pâle), radius 32. Scène : formatrice debout (chignon, haut vert, bras levé) devant un grand tableau blanc avec barre orange, lignes grises et courbe de progression verte ; deux participants assis de dos/face (haut orange, haut sombre) ; sol vert pâle.
- **Illustration — formation** formulaire (79:13928) : même scène 420 × 280, fond #fdf4ec, radius 24.
- Icônes : `chevron-right`, `briefcase`, `users`, `arrow-right`, `check`, `utensils`, `wrench`, `building`, `plane`, `home-heart`, `clock`, `map-pin`, `chevron-down`, `user`, `mail`, `phone`, `calendar`.
- Rayons : offres 32 ; cartes catalogue 24 ; pastilles 16 / 13 ; badges 999 ; carte formulaire 28 ; champs 12 ; case 6 ; boutons 12.
- Ombres : aucune.
- Grilles : offres 2 col gap 16 ; catalogue 3 col gap 20 ; formulaire 2 col (420 + flex) gap 64 ; champs 2 col gap 16.

- Version mobile : voir `formation-mobile.md`.
