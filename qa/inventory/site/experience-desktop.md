# Inventaire — site/experience-desktop

- Figma : frame `60:1491` « Expérience — Desktop 1440 », 1440 × 5486,5 px
- Gabarit « page rubrique » (identique pour Immobilier, Services de proximité, Culture & événementiel).
- Typographie : apostrophes droites `'` sauf **`l’objet` / `d’un` (apostrophes typographiques U+2019)** dans le lead de la section Services (60:1669). Pas d'espace insécable détecté avant `:` `?`.
- Légende fiabilité : valeurs marquées *(rendu)* = relevées sur capture (limite d'appels de l'API Figma atteinte pendant l'inventaire, styles exacts non lus) ; tout le reste provient du design context.

## 1. Sections

| # | Node | Calque | Fond | Padding vertical | Hauteur |
|---|------|--------|------|------------------|---------|
| 0 | 60:1492 | Web/TopBar — Desktop | composant | — | 36 |
| 0b | 60:1524 | Web/Header — Desktop | composant | — | 85 |
| 1 | 60:1602 | Hero | neutral-50 #f8f7f5 (même gabarit que Nos services) | ~pt 48 / pb 80 | 568 |
| 2 | 60:1631 | Pour qui ? | `--mp-color-neutral-0` #fff | py 80, px 64, gap 48 | 554 |
| 3 | 60:1665 | Services | neutral-50 #f8f7f5 *(rendu)* | py 96 | 1268 |
| 4 | 60:1833 | Déroulé | #fff *(rendu)* | py 96 | 556 |
| 5 | 60:1862 | Témoignage | neutral-50 *(rendu)* ; carte blanche bordée | py 96 | 606 |
| 6 | 60:1886 | Autres rubriques | #fff *(rendu)* | py 96 | 458 |
| 7 | 60:1945 | Web/CTA — Desktop (**surchargé**, lu sur capture) : titre `Envie d’un moment` / `sur mesure ?` ; texte `Dites-nous ce que vous imaginez : nous vous proposons un devis gratuit sous 24 h.` (`24 h.` coupé en fin de ligne ⇒ espace ordinaire) | #fff + gradient | pb 112 | 524 |
| 8 | 60:1966 | Web/Footer — Desktop | composant | — | 831,5 |
| — | 60:2078 | WhatsApp flottant 64×64 | — | — | — |

## 2. Textes

### Hero (60:1602) — texte 688 px gap 22, visuel 560×440
| Rôle | Texte | Typo | Couleur |
|------|-------|------|---------|
| Fil d'Ariane | `Accueil` › `Nos services` › **`Expérience`** (2 premiers Inter Regular 13/16 ls 0.13 text-muted, dernier Inter SemiBold text-main ; séparateurs chevron-right 14) | | |
| Eyebrow | `Expérience` (uppercase) | Inter SemiBold 13/16 ls 1.04 | text-brand #ad5300 |
| H1 | `Des moments sur mesure, ` + **`pensés pour vous.` (orange #ad5300)** | Poppins SemiBold 52/58 ls -1.3 | text-main |
| Lead | `Location de voiture, chef privé, massage, photographe, événementiel : nous réservons pour vous des prestataires de confiance, au Cameroun.` | Inter Regular 19/31 | text-muted |
| Boutons | `Demander un devis gratuit` (Primary) · `Écrire sur WhatsApp` (WhatsApp) | Inter SemiBold 16/24 | |
Visuel : `Illustration — chef` 560×440.

### Pour qui ? (60:1631)
| Rôle | Texte | Typo |
|------|-------|------|
| Eyebrow | `Pour qui ?` | web/eyebrow, text-brand |
| H2 | `Pour les particuliers, les familles et ceux qui reçoivent.` | Poppins SemiBold 48/56 ls -0.96 (bloc 820) |

Cartes publics : 3 colonnes égales gap 16 ; fond neutral-50, radius 24, p 28, gap 16 ; icône 24 dans carré 52 radius 16 fond orange-50 ; titre Poppins SemiBold 19/28 text-main ; texte Inter 15/22 text-muted.

| Icône | Titre | Texte |
|-------|-------|-------|
| user | Particuliers | Vous voulez vous faire plaisir ou simplifier un séjour, sans chercher pendant des heures. |
| users | Familles en séjour | Vous rentrez au pays en vacances : tout est prêt à votre arrivée. |
| party (party-popper) | Organisateurs | Anniversaire, mariage, réception : des prestataires fiables pour votre événement privé. |

### Services (60:1665)
| Rôle | Texte | Typo |
|------|-------|------|
| Eyebrow | `Nos services` | web/eyebrow |
| H2 | `5 services pour vivre chaque moment pleinement.` | Poppins SemiBold 48/56 *(gabarit)* |
| Lead | `Chaque prestation fait l’objet d’un devis gratuit et personnalisé.` (apostrophes ’) | Inter 18/28 *(rendu)*, text-muted |

Grille 3 colonnes (cartes 424 px, gap 20 horizontal / 20 vertical). Carte : fond #fff, bordure border-default, radius 24, overflow clip ; illustration 422×220 en haut ; contenu p 26 gap 12 : icône 18 dans carré 40 radius 12 fond orange-50 + titre Poppins SemiBold 19/26 ; description Inter 15/23 text-muted ; actions (pt 6, justify-between) : `Voir le service` + arrow-right 16 (Inter SemiBold 14/20 text-main) et `Devis` + arrow-up-right 16 (Inter SemiBold 14/20 text-brand).

| # | Service | Description | Icône | Illustration (fond) |
|---|---------|-------------|-------|---------------------|
| 1 | Location de voiture | Véhicules récents, avec ou sans chauffeur, pour vos trajets et vos séjours. | mobilite (car) | Illustration — voiture (#fdf4ec) |
| 2 | Photographe | Portraits, événements, reportages : vos moments immortalisés. | photo (camera) | Illustration — photo (vert clair *(rendu)*) |
| 3 | Chef privé | Un chef à domicile pour vos dîners, réceptions et grandes occasions. | chef (chef-hat) | Illustration — chef (#fce7d5) |
| 4 | Massage bien-être | Des praticiens qualifiés, chez vous ou sur votre lieu de séjour. | bien-etre | Illustration — massage (crème *(rendu)*) |
| 5 | Services événementiels | Décoration, traiteur, animation : des prestataires pour vos événements privés. | party | Illustration — evenement (pêche *(rendu)*) |

### Déroulé (60:1833)
| Rôle | Texte |
|------|-------|
| Eyebrow | `Comment ça se passe` |
| H2 | `Nous coordonnons tout, du premier message au suivi.` (48/56) |

4 cartes (316 px, gap 16), fond #fff, bordure border-default, radius ~20 *(rendu)*, p 27 ; pastille numéro ronde 36 (fond neutral-900, chiffre blanc ; **étape 4 fond orange #ff7a00**) ; titre Inter SemiBold 16/24 *(rendu)* ; texte Inter 14/20 text-muted *(rendu)*.

| N° | Titre | Texte |
|----|-------|-------|
| 1 | Votre demande | Formulaire, WhatsApp ou rendez-vous. |
| 2 | Devis sur mesure | Une proposition claire sous 24 h. |
| 3 | Intervention | Un prestataire sélectionné, un suivi constant. |
| 4 | Votre avis | Un court questionnaire après chaque prestation. |

### Témoignage (60:1862)
Carte 1312×414 fond #fff, bordure, radius ~32 *(rendu)* ; colonne texte 762 : icône `quote` 40 (violet `--mp-color-brand-secondary` *(rendu)*), citation Poppins Medium ~26/40 *(rendu)* text-main, auteur (avatar 44 initiales sur #f8cfaa-like, nom Inter SemiBold 16/24, sous-ligne Inter 12/16 muted) ; `Illustration — equipe` 380×300 radius ~24 à droite.

| Citation | Auteur | Initiales | Sous-ligne |
|----------|--------|-----------|-----------|
| « Le chef privé a régalé nos invités pour l'anniversaire de ma mère. Service impeccable, équipe aux petits soins du début à la fin. » | Jean-Marc T. | JT | Yaoundé · Chef privé |

### Autres rubriques (60:1886)
| Rôle | Texte |
|------|-------|
| Eyebrow | `Découvrir aussi` |
| H2 | `Nos autres rubriques` (48/56) |
3 cartes horizontales (426,7 × 130, gap 16) fond #fff bordure radius ~20 : vignette illustration 88×88 radius ~16, titre Poppins/Inter SemiBold 16/24, sous-ligne Inter 14/20 muted, icône arrow-up-right 20.

| Rubrique | Sous-ligne | Vignette |
|----------|-----------|----------|
| Immobilier | Se loger en toute sérénité · 7 services | Illustration — logement |
| Services de proximité | Votre quotidien simplifié · 3 services | Illustration — courses |
| Culture & événementiel | Vivre le Cameroun · 4 services | Illustration — culture |

## 3. Interactifs
| Élément | Variante | Destination |
|---------|----------|-------------|
| Fil d'Ariane Accueil / Nos services | liens | /, /nos-services |
| Demander un devis gratuit | Primary | /devis?rubrique=experience |
| Écrire sur WhatsApp | WhatsApp | wa.me |
| Voir le service ×5 | lien texte | /services/<slug> (ex. /services/chef-prive) |
| Devis ×5 | lien orange | /devis?service=<slug> |
| Cartes autres rubriques ×3 | carte cliquable | /immobilier, /services-de-proximite, /culture-evenementiel |
| CTA | 2 boutons | /devis, wa.me |

## 4. Visuels
- Illustrations : chef (hero + carte), voiture, photo, massage, evenement, equipe (témoignage), logement / courses / culture (vignettes).
- Icônes : chevron-right, user, users, party, mobilite, photo, chef, bien-etre, arrow-right, arrow-up-right, quote.
- Rayons : cartes 24 ; pastilles icônes 16 (52) / 12 (40).
