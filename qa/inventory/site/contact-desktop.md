# Inventaire — site/contact-desktop

- Figma : fileKey `lsun63JexZYvgYUVpmSYyg`, frame `69:7651` « Contact — Desktop 1440 »
- Dimensions : 1440 × 3348,5 px
- Polices : Poppins (`--mp-font-family-brand`), Inter (`--mp-font-family-ui`). Couleurs = tokens `--mp-color-*` (hex).
- Espaces : l'export complet de cette page ne contient **aucune espace insécable** (U+00A0 / U+202F) → dans Figma, les espaces avant `:` `?` et dans `24 h` sont des espaces normales ; à rendre en insécable côté site.
- Le tiret de `Lun – Sam · 8h – 20h` est un **demi-cadratin** `–` (U+2013) ; le séparateur est le point médian `·`.
- **Pas de bandeau CTA** sur cette page.

## 1. Sections (ordre)

| # | Node id | Calque | Fond | Padding vertical | Hauteur |
|---|---|---|---|---|---|
| 0 | 69:7652 | Web/TopBar — Desktop (global) | — | — | 36 |
| 0b | 69:7684 | Web/Header — Desktop (global) | — | — | 85 |
| 1 | 69:7762 | Hero (+ moyens de contact) | `neutral-50` #f8f7f5 | pt 48 / pb 72, px 64 ; gap 40 | 542 |
| 2 | 69:7805 | Formulaires | `neutral-0` #ffffff | py 96, px 64 | 1066 |
| 3 | 69:8019 | Notre agence | `neutral-50` #f8f7f5 | py 96, px 64 ; gap 48 | 788 |
| 4 | 69:8062 | Web/Footer — Desktop (global) | — | — | 831,5 |
| flottant | 69:8174 | Web/WhatsApp flottant | #25d366, radius 32, ombre `0 10 14 rgba(18,102,51,.35)` | x 1348 y 808 | 64 × 64 |

## 2. Textes verbatim

### Hero (69:7762) — une colonne, pas d'illustration

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 69:7764 | fil d'Ariane lien | `Accueil` | Inter Regular 13/16 ls 0.13 | `text-muted` |
| 69:7767 | fil d'Ariane courant | `Contact` | Inter SemiBold 13/16 | `text-main` |
| 69:7769 | eyebrow | `Contact` (uppercase) | Inter SemiBold **12/16** ls 0.96 uppercase | `text-brand` #ad5300 |
| 69:7770 | titre H1 | `Parlons de ` + **`votre projet.`** (surligné orange #ad5300) | Poppins SemiBold **56/62** ls -1.4 | `text-main` / #ad5300 |
| 69:7771 | lead | `Par téléphone, WhatsApp, e-mail ou lors d’un rendez-vous : choisissez ce qui vous convient, nous vous répondons rapidement.` | Inter Regular 19/31 | `text-muted` |

Bloc texte largeur 820, gap 16.

### Formulaires (69:7805) — 2 cartes côte à côte, gap 32

Carte gauche (69:7807, calque « Demande d’information ») : fond blanc, bordure 1 px `border-default`, radius 28, p 40, gap 20.

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 69:7810 | onglet ACTIF | `Nous contacter` | Inter SemiBold 14/20 ls 0.07 | `text-main` sur blanc + ombre légère |
| 69:7812 | onglet inactif | `Demande d’information` | Inter Medium 14/20 ls 0.07 | `text-main` |
| 69:7813 | titre de carte | `Écrivez-nous` | Poppins SemiBold 26/32 | `text-main` |
| 69:7865 | bouton | `Envoyer le message` | Inter SemiBold 16/24 | Primary orange (202 × 48) |

Onglets (69:7808) : conteneur pill fond `neutral-100` #f1efec, p 4, gap 4, radius 999 ; onglet px 16 py 9 radius 999 ; actif fond blanc + ombre `0 1 1.5 rgba(56,21,54,.1), 0 1 1 rgba(56,21,54,.06)`.

Carte droite (69:7867, « Prendre rendez-vous ») : fond `neutral-50` #f8f7f5, radius 28, p 40, gap 20, sans bordure.

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 69:7875 | titre de carte | `Prendre rendez-vous` | Poppins SemiBold 26/32 | `text-main` |
| 69:7876 | sous-titre | `À l’agence, par téléphone ou en visio` | Inter Regular 14/20 | `text-muted` |
| 69:7878 | label | `Motif du rendez-vous` | Inter SemiBold 14/20 ls 0.07 | `text-main` |
| 69:7893 | label | `Format` | Inter SemiBold 14/20 | `text-main` |
| 69:7907 | mois du calendrier | `Novembre 2026` | Inter SemiBold 16/24 | `text-main` |
| 69:7913… | jours de semaine | `L` `M` `M` `J` `V` `S` `D` | Inter SemiBold 12/16 ls 0.12 | `text-subtle` #7d776f |
| 69:7996 | label créneaux | `Jeudi 12 novembre · créneaux disponibles` | Inter SemiBold 14/20 *(style label)* | `text-main` |
| 69:8015 | fuseau | `Heure de Douala (UTC+1)` + icône `globe` 14 | Inter Regular 12/16 ls 0.12 | `text-muted` |
| 69:8016 | bouton | `Demander ce rendez-vous` | Inter SemiBold 16/24 | Primary orange **pleine largeur** (559 × 48) |
| 69:8018 | note | `Le rendez-vous est confirmé par l’agence par e-mail ou WhatsApp.` | Inter Regular 12/16 ls 0.12 | `text-muted` |

En-tête de carte : pastille 44 blanche radius 13 + icône `calendar-check` 20 orange, gap 12 avec le titre.

### Notre agence (69:8019)

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 69:8021 | eyebrow | `Notre agence` | Inter SemiBold 13/16 ls 1.04 uppercase | `text-brand` |
| 69:8022 | titre H2 | `Venez nous rencontrer` | Poppins SemiBold 48/56 ls -0.96 | `text-main` |
| 69:8039 | titre carte adresse | `Agence MAMBO Proxi` | Inter SemiBold 16/24 | `text-main` |
| 69:8044 | adresse | `Adresse de l’agence · Douala, Cameroun` (placeholder d'adresse) | Inter Regular 14/20 | `text-muted` |
| 69:8049 | horaires | `Lun – Sam · 8h – 20h` | Inter Regular 14/20 | `text-muted` |
| 69:8056 | service | `Réception des colis et courriers` | Inter Regular 14/20 | `text-muted` |
| 69:8058 | lien | `Itinéraire` + `arrow-up-right` 16 | Inter SemiBold 14/20 ls 0.07 | `text-main` |

## 3. Données répétées

### Moyens de contact (69:7772) — 4 colonnes, gap 16

| # | Node | Icône | Pastille | Libellé | Valeur |
|---|---|---|---|---|---|
| 1 | 69:7773 | `phone` | `orange-50` #fdf4ec | `France` | `+33 6 00 00 00 00` |
| 2 | 69:7781 | `phone` | `orange-50` | `Cameroun` | `+237 6 00 00 00 00` |
| 3 | 69:7789 | `whatsapp` | **#e9fbf0** (vert WhatsApp pâle, hors token) | `WhatsApp` | `Réponse rapide, 7j/7` |
| 4 | 69:7797 | `mail` | `orange-50` | `E-mail` | `contact@mamboproxi.com` |

Carte : fond blanc, bordure 1 px `border-default`, radius 22, p 24, gap 14 (vertical) ; pastille 44 radius 13, icône 20 ; libellé Inter Medium 14/20 ls 0.07 `text-muted` ; valeur Inter SemiBold 16/24 `text-main` (gap 2).

### Motifs de rendez-vous (69:7879) — chips choix unique

`Devis` · `Immobilier` (SÉLECTIONNÉ, check, fond #1c1a18) · `Partenariat` · `Recrutement` · `Autre`

### Formats de rendez-vous (69:7894) — chips choix unique

`À l’agence` · `Téléphone` · `Visio` (SÉLECTIONNÉ, check)

### Calendrier (69:7903) — mois affiché `Novembre 2026`

Carte calendrier : fond blanc, bordure 1 px `border-default`, radius 20, p 20, gap 12. En-tête : `arrow-left` 18 (mois précédent) à gauche, mois centré, `chevron-right` 18 (mois suivant) à droite — **icônes incohérentes** (flèche vs chevron) dans Figma. Grille 7 colonnes (cellules 36 × 36 rondes, gap vertical 6), semaine commençant le lundi.

| Semaine | L | M | M | J | V | S | D |
|---|---|---|---|---|---|---|---|
| 1 | — | — | — | — | — | — | `1` (désactivé) |
| 2 | `2` (désact.) | `3` (désact.) | `4` (désact.) | `5` | `6` | `7` | `8` (désact.) |
| 3 | `9` | `10` | `11` | **`12` (sélectionné)** | `13` | `14` | `15` (désact.) |
| 4 | `16` | `17` | `18` | `19` | `20` | `21` | `22` (désact.) |
| 5 | `23` | `24` | `25` | `26` | `27` | `28` | `29` (désact.) |

États : disponible = texte `text-main` ; désactivé (jours passés 1–4 et dimanches) = `text-disabled` #a8a29a ; sélectionné = fond `brand-primary` #ff7a00 rond, texte `neutral-900`. Chiffres Inter Medium 14/20 *(déduit)*.
**Anomalie** : le `30` novembre est absent de la grille (le mois s'arrête à 29).

### Créneaux affichés pour le jeudi 12 novembre (69:7997)

`09:00` · `10:30` · `14:00` (SÉLECTIONNÉ, check) · `15:30` · `17:00` — format 24 h `HH:MM`, chips choix unique.

### Agence (69:8038)

| Champ | Valeur |
|---|---|
| nom | `Agence MAMBO Proxi` |
| adresse | `Adresse de l’agence · Douala, Cameroun` |
| horaires | `Lun – Sam · 8h – 20h` |
| service sur place | `Réception des colis et courriers` (icône `package`) |
| lien | `Itinéraire` (icône `arrow-up-right`, lien externe cartographie) |

Carte adresse : fond blanc, radius 20, p 24, gap 12, largeur 360, **ombre** `0 4 4 rgba(56,21,54,.06), 0 12 12 rgba(56,21,54,.12)`, posée en haut à gauche (40, 40) sur la carte.

## 4. Éléments interactifs

### Boutons / liens

| Élément | Libellé | Variante | Destination présumée |
|---|---|---|---|
| Fil d'Ariane | `Accueil` | lien | `/` |
| Carte contact France | `+33 6 00 00 00 00` | carte cliquable | `tel:+33600000000` |
| Carte contact Cameroun | `+237 6 00 00 00 00` | carte cliquable | `tel:+237600000000` |
| Carte WhatsApp | `Réponse rapide, 7j/7` | carte cliquable | `https://wa.me/…` |
| Carte e-mail | `contact@mamboproxi.com` | carte cliquable | `mailto:contact@mamboproxi.com` |
| Onglets | `Nous contacter` (actif) / `Demande d’information` | segmented control | bascule de formulaire (le 2ᵉ contenu n'est pas maquetté) |
| Formulaire contact | `Envoyer le message` | Primary | soumission |
| Calendrier | ← / → | icônes | mois précédent / suivant |
| Formulaire RDV | `Demander ce rendez-vous` | Primary pleine largeur | soumission |
| Agence | `Itinéraire` | lien + arrow-up-right | Google Maps (nouvel onglet) |
| Flottant | WhatsApp | rond 64 | `wa.me` |

### Formulaire « Nous contacter » (69:7807)

Styles champs identiques aux autres formulaires (label Inter SemiBold 14/20, `*` `text-brand`, champ blanc bordure `border-strong` #cfcac3 radius 12 px 16 py 14 h 54, placeholder Inter 16/24 `text-subtle`). Rangées 2 colonnes (271,5 px) gap 16.

| # | Node | Label | Type | Requis | Placeholder / valeur | Icône |
|---|---|---|---|---|---|---|
| 1 | 69:7815 | `Nom et prénom` | texte | oui `*` | `Votre nom complet` | `user` |
| 2 | 69:7824 | `E-mail` | email | oui `*` | `vous@exemple.com` | `mail` |
| 3 | 69:7834 | `Téléphone / WhatsApp` | tél | **non** (pas d'astérisque, contrairement aux autres formulaires) | `+237 6 00 00 00 00` | `phone` |
| 4 | 69:7842 | `Pays` | select | non | valeur sélectionnée `Cameroun` (texte `text-main`) | `chevron-down` |
| 5 | 69:7849 | `Sujet` | select (pleine largeur) | non | `Choisir un sujet` | `chevron-down` |
| 6 | 69:7856 | `Message` | textarea h 130 | oui `*` | `Votre message…` | — |
| 7 | 69:7862 | consentement | case 20 × 20 | (implicite) | — | — |

Options `Pays` / `Sujet` non montrées (présumé Pays : France, Cameroun, Autre ; Sujet : catégories de services).
Consentement (verbatim, apostrophe droite) : `J'accepte que Mambo Proxi traite mes données pour répondre à ma demande, conformément à la politique de confidentialité.`
Pas de mention anti-spam.

### Formulaire « Prendre rendez-vous » (69:7867)

| # | Label | Type | Requis | Options (sélection affichée) |
|---|---|---|---|---|
| 1 | `Motif du rendez-vous` | chips choix unique | non marqué | `Devis`, `Immobilier`*, `Partenariat`, `Recrutement`, `Autre` |
| 2 | `Format` | chips choix unique | non marqué | `À l’agence`, `Téléphone`, `Visio`* |
| 3 | (date) | calendrier mensuel | implicite | jour sélectionné 12/11/2026 ; jours passés et dimanches désactivés |
| 4 | `Jeudi 12 novembre · créneaux disponibles` | chips créneaux choix unique | implicite | `09:00`, `10:30`, `14:00`*, `15:30`, `17:00` |
| — | aide | texte | — | `Heure de Douala (UTC+1)` |

Aucun champ d'identité dans ce bloc (nom/e-mail non demandés dans la maquette) ; pas de case de consentement ; note finale `Le rendez-vous est confirmé par l’agence par e-mail ou WhatsApp.`

## 5. Éléments visuels

- **Carte de localisation** (69:8023) : 1312 × 460, fond `neutral-100` #f1efec, radius 32 ; fond de carte vectoriel stylisé (zones et routes beiges/blanches, une zone verte en haut à droite), halo circulaire 96 px et repère (pin) 44 × 56 au centre (598, 160). Ce n'est pas une illustration « Illustration — … » mais une carte factice à remplacer par une carte réelle ou une image statique.
- Icônes : `chevron-right`, `phone`, `whatsapp`, `mail`, `user`, `chevron-down`, `calendar-check`, `check`, `arrow-left`, `globe`, `map-pin`, `clock`, `package`, `arrow-up-right`.
- Rayons : cartes contact 22 ; pastilles 13 ; cartes formulaires 28 ; onglets 999 ; champs 12 ; case 6 ; calendrier 20 ; jours 999 ; chips 999 ; carte agence 32 ; carte adresse 20 ; boutons 12.
- Ombres : onglet actif (légère) ; carte adresse (elevation forte) ; WhatsApp flottant.
- Grilles : moyens de contact 4 col gap 16 ; formulaires 2 col (≈641 / 639) gap 32 ; champs 2 col gap 16 ; calendrier 7 col.

- Version mobile : voir `contact-mobile.md`.
