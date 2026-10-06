# Inventaire — site/partenaires-desktop

- Figma : fileKey `lsun63JexZYvgYUVpmSYyg`, frame `65:5704` « Partenaires — Desktop 1440 »
- Dimensions : 1440 × 4510,5 px
- Polices : Poppins (`--mp-font-family-brand`), Inter (`--mp-font-family-ui`). Couleurs = tokens `--mp-color-*` (hex).
- Espaces avant `:` `?` : présentes dans Figma ; insécable non vérifiable à l'export → rendre en ` `.
- **Pas de bandeau CTA** sur cette page (le formulaire en tient lieu).

## 1. Sections (ordre)

| # | Node id | Calque | Fond | Padding vertical | Hauteur |
|---|---|---|---|---|---|
| 0 | 65:5705 | Web/TopBar — Desktop (global) | — | — | 36 |
| 0b | 65:5737 | Web/Header — Desktop (global) | — | — | 85 |
| 1 | 65:5815 | Hero | `neutral-50` #f8f7f5 | pt 48 / pb 80, px 64 | 568 |
| 2 | 65:5841 | Nos partenaires | `neutral-0` #ffffff | py 96, px 64 | 632 |
| 3 | 65:5889 | Catégories | `neutral-50` #f8f7f5 | py 96, px 64 | 806 |
| 4 | 65:5957 | Avantages | `neutral-0` #ffffff | py 96, px 64 | 570 |
| 5 | 65:5991 | Formulaire — Devenir partenaire | `neutral-50` #f8f7f5 | py 96, px 64 | 982 |
| 6 | 65:6092 | Web/Footer — Desktop (global) | — | — | 831,5 |
| flottant | 65:6204 | Web/WhatsApp flottant | — | x 1348 y 808 | 64 × 64 |

## 2. Textes verbatim

### Hero (65:5815) — 2 col (texte flex-1 / illustration 560 × 440), gap 64 ; texte gap 22

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 65:5818 | fil d'Ariane lien | `Accueil` | Inter Regular 13/16 ls 0.13 | `text-muted` #5e5952 |
| 65:5821 | fil d'Ariane courant | `Partenaires` | Inter SemiBold 13/16 ls 0.13 | `text-main` #1c1a18 |
| 65:5822 | eyebrow | `Partenaires` (uppercase) | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` #ad5300 |
| 65:5823 | titre H1 | `Construisons ensemble des services ` + **`de confiance.`** (surligné orange #ad5300) | Poppins SemiBold 52/58 ls -1.3 | `text-main` / #ad5300 |
| 65:5824 | lead | `Chauffeurs, chefs, photographes, propriétaires, agences, entreprises : rejoignez le réseau MAMBO Proxi et recevez des demandes qualifiées.` | Inter Regular 19/31 | `text-muted` |
| 65:5826 | bouton | `Devenir partenaire` | Inter SemiBold 16/24 (`label/md`) | `text-on-primary` #1c1a18 sur `brand-primary` #ff7a00 |
| 65:5828 | bouton | `Voir nos partenaires` | Inter SemiBold 16/24 | `text-main` ; Outline bordure 1,5 px `border-strong` #cfcac3 |

Actions gap 10. Boutons : px 24, py 12, radius 12, hauteur 48.

### Nos partenaires (65:5841) — gap 48

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 65:5843 | eyebrow | `Nos partenaires` | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` |
| 65:5844 | titre H2 | `Ils travaillent à nos côtés` | Poppins SemiBold 48/56 ls -0.96 (`web/section`) | `text-main` |

Filtres (65:5845), chips gap 8 : `Tous` (ACTIF, icône `check`, fond #1c1a18, texte blanc) · `Prestataires Expérience` · `Immobilier` · `Entreprises & prestataires` (outline, bordure #cfcac3). Inter Medium 14/20 ls 0.07, px 14 py 9, radius 999.

### Catégories (65:5889) — gap 48

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 65:5891 | eyebrow | `Devenir partenaire` | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` |
| 65:5892 | titre H2 | `Trois façons de travailler avec nous` | Poppins SemiBold 48/56 ls -0.96 | `text-main` |

### Avantages (65:5957) — gap 48

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 65:5959 | eyebrow | `Pourquoi nous rejoindre ?` | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` |
| 65:5960 | titre H2 | `Un réseau qui valorise votre savoir-faire` | Poppins SemiBold 48/56 ls -0.96 | `text-main` |

### Formulaire — Devenir partenaire (65:5991) — 2 col : infos 420 px + formulaire flex-1, gap 64

Colonne infos (gap 20) :

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 65:5994 | eyebrow | `Formulaire` | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` |
| 65:5995 | titre H2 | `Devenir partenaire` | Poppins SemiBold 48/56 ls -0.96 | `text-main` |
| 65:5996 | lead | `Présentez votre activité en quelques minutes. Nous vous recontactons sous 72 h pour faire connaissance.` | Inter Regular 16/26 | `text-muted` |
| 65:5998 | titre encadré | `Et ensuite ?` | Inter SemiBold 16/24 | `text-main` |
| 65:6002 | étape 1 | `Étude de votre demande` | Inter Regular 14/20 | `text-main` |
| 65:6006 | étape 2 | `Échange avec notre équipe` | Inter Regular 14/20 | `text-main` |
| 65:6010 | étape 3 | `Signature de la charte partenaire` | Inter Regular 14/20 | `text-main` |

Encadré « Et ensuite ? » (65:5997) : fond blanc, bordure 1 px `border-default` #e4e1dc, radius 20, p 24, gap 14. Puces numérotées `1` `2` `3` : rond 26 px fond `neutral-900`, chiffre Inter SemiBold 12/16 blanc ; gap 10.

Carte formulaire (65:6011) : fond blanc, bordure 1 px `border-default`, radius 28, p 40, gap 20. Champs détaillés § 4.

## 3. Données répétées

### Partenaires (logos) (65:5856) — grille 4 colonnes × 2 rangées, gap 16, tuile 316 × 100

| # | Node | Logo (placeholder) | Catégorie (badge) |
|---|---|---|---|
| 1 | 65:5857 | `Logo partenaire` | `Expérience` |
| 2 | 65:5861 | `Logo partenaire` | `Immobilier` |
| 3 | 65:5865 | `Logo partenaire` | `Entreprise` |
| 4 | 65:5869 | `Logo partenaire` | `Expérience` |
| 5 | 65:5873 | `Logo partenaire` | `Immobilier` |
| 6 | 65:5877 | `Logo partenaire` | `Entreprise` |
| 7 | 65:5881 | `Logo partenaire` | `Expérience` |
| 8 | 65:5885 | `Logo partenaire` | `Entreprise` |

Tuile : fond `neutral-50`, radius 20, px 12 py 24, centrée, gap 10. Texte placeholder Inter SemiBold 14/20 `neutral-400` #a8a29a (à remplacer par l'image logo). Badge catégorie : fond blanc, radius 999, px 9 py 3, Inter Regular 11/16 ls 0.11 `text-muted`.
Correspondance filtres ↔ badges : `Prestataires Expérience` ↔ `Expérience` ; `Immobilier` ↔ `Immobilier` ; `Entreprises & prestataires` ↔ `Entreprise`.

### Types de partenariat (65:5893) — 3 colonnes, gap 16

| # | Node | Illustration (fond) | Titre | Sous-titre (orange) | Description | Lien |
|---|---|---|---|---|---|---|
| 1 | 65:5894 | `equipe` (#eaf5db) | `Prestataires Expérience` | `Chauffeurs, photographes, chefs privés, masseurs, prestataires événementiels.` | `Recevez des demandes de prestations près de chez vous.` | `Je candidate` → |
| 2 | 65:5915 | `logement` (#f1efec) | `Immobilier` | `Propriétaires, agences et acteurs immobiliers.` | `Confiez une gestion locative ou proposez vos logements.` | `Je candidate` → |
| 3 | 65:5936 | `equipe` (#eaf5db) | `Entreprises & prestataires` | `Livraison, entretien, culture, loisirs, services aux familles.` | `Développez votre activité avec un partenaire de confiance.` | `Je candidate` → |

Carte : fond blanc, bordure 1 px `border-default`, radius 24, overflow clip ; illustration pleine largeur h 200 ; corps p 28, gap 10. Titre Poppins SemiBold 20/28 `text-main`. Sous-titre Inter Medium 14/20 ls 0.07 `text-brand` #ad5300. Description Inter Regular 15/23 `text-muted`. Lien Inter SemiBold 14/20 `text-main` + `arrow-right` 16, gap 6.

### Avantages (65:5961) — 4 colonnes, gap 16

| # | Node | Icône | Titre | Description |
|---|---|---|---|---|
| 1 | 65:5962 | `mail` | `Des demandes qualifiées` | `Des clients dont le besoin est déjà précisé.` |
| 2 | 65:5969 | `shield` | `Une relation claire` | `Des engagements écrits, des règles simples.` |
| 3 | 65:5976 | `users` | `Une visibilité nouvelle` | `En France comme au Cameroun, auprès de la diaspora.` |
| 4 | 65:5984 | `graduation` | `Formation et accompagnement` | `Ateliers pour progresser et monter en qualité.` |

Carte : fond `neutral-50`, radius 22, p 26, gap 12. Pastille 44 fond `orange-50` #fdf4ec radius 13, icône 20 orange foncé. Titre Inter SemiBold 17/24. Description Inter Regular 14/21 `text-muted`.

### Étapes « Et ensuite ? »

| # | Libellé |
|---|---|
| 1 | `Étude de votre demande` |
| 2 | `Échange avec notre équipe` |
| 3 | `Signature de la charte partenaire` |

## 4. Éléments interactifs

### Boutons / liens

| Élément | Libellé | Variante | Icône | Destination présumée |
|---|---|---|---|---|
| Fil d'Ariane | `Accueil` | lien | — | `/` |
| Hero | `Devenir partenaire` | Primary (orange) | — | ancre `#formulaire` |
| Hero | `Voir nos partenaires` | Outline | — | ancre `#partenaires` |
| Carte type ×3 | `Je candidate` | lien texte | arrow-right 16 | `#formulaire` avec type présélectionné |
| Formulaire | `Envoyer ma demande` | Primary (orange), largeur auto 215 × 48 | — | soumission POST |
| Flottant | WhatsApp | rond 64 | WhatsApp | `wa.me` |

### Filtres partenaires

| Libellé | État |
|---|---|
| `Tous` | actif (sombre + check) |
| `Prestataires Expérience` | inactif |
| `Immobilier` | inactif |
| `Entreprises & prestataires` | inactif |

Pas de pagination.

### Formulaire « Devenir partenaire » (65:6011)

Label : Inter SemiBold 14/20 ls 0.07 `text-main` ; astérisque `*` Inter Medium 14/20 `text-brand` #ad5300 (gap 4). Saisie : fond blanc, bordure 1 px `border-strong` #cfcac3, radius 12, px 16 py 14, hauteur 54 ; placeholder Inter Regular 16/24 `text-subtle` #7d776f ; icône 18 à gauche (gap 10). Rangées 2 colonnes gap 16.

| # | Node | Label | Type | Requis | Placeholder / valeur | Icône | Options |
|---|---|---|---|---|---|---|---|
| 1 | 65:6012 | `Type de partenariat` | choix unique (chips) | oui `*` | — | — | `Prestataire Expérience` (sélectionné, check), `Immobilier`, `Entreprise & prestataire`, `Autre` |
| 2 | 65:6028 | `Nom de la structure` | texte | oui `*` | `Ex. : Saveurs de Douala` | — | — |
| 3 | 65:6034 | `Activité` | texte | oui `*` | `Ex. : chef privé, traiteur` | — | — |
| 4 | 65:6041 | `Nom et prénom` | texte | oui `*` | `Votre nom complet` | `user` | — |
| 5 | 65:6050 | `E-mail` | email | oui `*` | `vous@exemple.com` | `mail` | — |
| 6 | 65:6060 | `Téléphone / WhatsApp` | tél | oui `*` | `+237 6 00 00 00 00` | `phone` (smartphone) | — |
| 7 | 65:6069 | `Pays et ville` | select | oui `*` | `Cameroun · Douala` | `chevron-down` à droite | (liste non montrée ; format « Pays · Ville ») |
| 8 | 65:6077 | `Présentez votre activité` | textarea (h 120) | non (pas d'astérisque) | `Expérience, zones d’intervention, disponibilités…` | — | — |
| 9 | 65:6082 | consentement | case à cocher (20 × 20, bordure 1,5 px #cfcac3, radius 6) | (implicite) | — | — | — |

Libellés des chips de type : noter le **singulier** dans le formulaire (`Prestataire Expérience`, `Entreprise & prestataire`) vs le **pluriel** dans les filtres/cartes (`Prestataires Expérience`, `Entreprises & prestataires`).

Texte de consentement (verbatim, apostrophe droite `'` dans Figma) :
`J'accepte que Mambo Proxi traite mes données pour répondre à ma demande, conformément à la politique de confidentialité.` (Inter Regular 14/20 `text-muted`, gap 12 avec la case)

Mention anti-spam (verbatim) : icône `lock` 16 + `Formulaire protégé contre les envois automatiques` (Inter Regular 12/16 ls 0.12, `text-muted`, gap 8).

Bouton : `Envoyer ma demande` (Primary).

## 5. Éléments visuels

- **Illustration — equipe** hero (79:13602) : 560 × 440, fond #eaf5db (vert pâle → chaud), radius 32. Trois personnages derrière une table sombre (gauche : coiffe et haut orange tendant la main ; centre : pull noir devant un ordinateur à écran orange pâle ; droite : haut vert), plante en pot orange à droite.
- **Illustration — equipe** cartes 1 et 3 (79:13640, 79:13712) : même scène recadrée 424,7 × 200, fond #eaf5db, sans radius propre (clip par la carte radius 24) ; plante verte au sol.
- **Illustration — logement** carte 2 (79:13678) : 424,7 × 200, fond #f1efec. Immeuble blanc avec fenêtres orange et vert pâle, porte orange, second bâtiment beige à droite avec 3 fenêtres blanches, grosse clé orange dans un disque pêche en haut à droite, plantes vertes.
- Icônes : `chevron-right`, `check`, `arrow-right` (16), `mail`, `shield`, `users`, `graduation`, `user`, `phone`, `chevron-down`, `lock`.
- Rayons : tuiles logos 20 ; badges 999 ; cartes type 24 ; avantages 22 ; pastilles 13 ; encadré « Et ensuite ? » 20 ; carte formulaire 28 ; champs 12 ; case 6 ; boutons 12 ; chips 999.
- Ombres : aucune.
- Grilles : logos 4 col gap 16 ; types 3 col gap 16 ; avantages 4 col gap 16 ; formulaire 2 col (420 + flex) gap 64 ; champs 2 col gap 16.

- Version mobile : voir `partenaires-mobile.md`.
