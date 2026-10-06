# Inventaire — site/offre-demploi-detail-desktop

- Figma : fileKey `lsun63JexZYvgYUVpmSYyg`, frame `82:8945` « Offre d’emploi (détail) — Desktop 1440 »
- Dimensions : 1440 × 2206,5 px
- Gabarit de page détail d'une offre (exemple : `Coordinateur·rice de services`). Tous les contenus ci-dessous sont des **données de l'offre**.
- Polices : Poppins (`--mp-font-family-brand`), Inter (`--mp-font-family-ui`).
- Espaces avant `:` `?` : présentes ; insécable non vérifiable → rendre en ` `.
- **Pas de CTA orange, pas de formulaire** sur cette page (le bouton renvoie vers le formulaire de candidature).

## 1. Sections (ordre)

| # | Node id | Calque | Fond | Padding vertical | Hauteur |
|---|---|---|---|---|---|
| 0 | 82:8946 | Web/TopBar — Desktop (global) | — | — | 36 |
| 0b | 82:8978 | Web/Header — Desktop (global) | — | — | 85 |
| 1 | 82:9056 | Hero | `neutral-50` #f8f7f5 | pt 48 / pb 56, px 64 ; gap 18 | 284 |
| 2 | 82:9092 | Contenu (2 colonnes) | `neutral-0` #ffffff | pt 64 / pb 96, px 64 | 970 |
| 3 | 82:9183 | Web/Footer — Desktop (global) | — | — | 831,5 |
| flottant | 82:9295 | Web/WhatsApp flottant | — | x 1348 y 808 | 64 × 64 |

## 2. Textes verbatim

### Hero (82:9056) — une colonne, pas d'illustration, pas d'eyebrow

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 82:9058 | fil d'Ariane niv. 1 (lien) | `Accueil` | Inter Regular 13/16 ls 0.13 | `text-muted` |
| 82:9061 | fil d'Ariane niv. 2 (lien) | `Recrutement` | Inter Regular 13/16 ls 0.13 | `text-muted` |
| 82:9064 | fil d'Ariane courant | `Coordinateur·rice de services` | Inter SemiBold 13/16 ls 0.13 | `text-main` |
| 82:9067 | tag | `Nouveau` | Inter SemiBold 13/16 ls 0.13 | `vert-700` #557e1b sur `vert-50` #f6faef |
| 82:9069 | tag | `CDI` | Inter SemiBold 13/16 ls 0.13 | `text-main` sur blanc |
| 82:9070 | titre H1 | `Coordinateur·rice de services` (pas de surlignage orange) | Poppins SemiBold 52/58 ls -1.3 | `text-main` |
| 82:9076 | méta lieu | `Douala, Cameroun` | Inter Regular 16/24 | `text-muted` |
| 82:9081 | méta contrat | `CDI · temps plein` | Inter Regular 16/24 | `text-muted` |
| 82:9086 | méta prise de poste | `Prise de poste : janvier 2027` | Inter Regular 16/24 | `text-muted` |
| 82:9091 | méta publication | `Publiée le 2 octobre 2026` | Inter Regular 16/24 | `text-muted` |

Tags : bordure 1 px `border-default` #e4e1dc, px 12 py 5, radius 999, gap 8. Méta : icônes 18 (`map-pin`, `briefcase`, `clock`, `calendar`) gap 8, items gap 24, flex-wrap.

### Contenu (82:9092) — colonne principale flex-1 (868) + colonne latérale 380, gap 64

Colonne principale, blocs gap 48 :

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 82:9095 | titre de bloc H2 | `Le poste` | Poppins SemiBold 26/32 | `text-main` |
| 82:9096 | paragraphe | `Au cœur de l’agence de Douala, vous coordonnez les demandes de nos clients, de la réception du besoin jusqu’au suivi de la prestation, avec notre réseau de prestataires.` | Inter Regular 18/30 | `text-muted` |
| 82:9098 | titre de bloc H2 | `Vos missions` | Poppins SemiBold 26/32 | `text-main` |
| 82:9120 | titre de bloc H2 | `Votre profil` | Poppins SemiBold 26/32 | `text-main` |
| 82:9142 | titre de bloc H2 | `Ce que nous offrons` | Poppins SemiBold 26/32 | `text-main` |

Éléments de liste : puce ronde 24 fond `orange-50` #fdf4ec avec icône `check` 14 orange, texte Inter Regular 17/26 `text-main`, gap 12 ; items gap 16 (titre→liste 16).

Colonne latérale (82:9158), gap 16 :

| Node | Rôle | Texte exact | Police | Couleur |
|---|---|---|---|---|
| 82:9160 | titre carte | `Intéressé·e ?` | Poppins SemiBold 20/28 | `text-main` |
| 82:9161 | texte | `Envoyez votre CV en 2 minutes. Réponse sous 15 jours.` | Inter Regular 14/20 | `text-muted` |
| 82:9162 | bouton | `Postuler à cette offre` | Inter SemiBold 16/24 | Primary orange, pleine largeur |
| 82:9165 | libellé partage | `Partager :` | Inter Regular 12/16 ls 0.12 | `text-muted` |
| 82:9180 | lien retour | `Voir toutes les offres` + icône `arrow-left` 16 **placée à droite du texte** | Inter SemiBold 14/20 ls 0.07 | `text-main` |

Carte « Résumé » (82:9159) : fond blanc, bordure 1 px `border-default`, radius 24, p 28, gap 14, **ombre `elevation/2`** (0 4 8 -2 #3815361A + 0 2 4 -2 #3815360F). Boutons de partage : ronds 34, bordure 1 px `border-default`, icônes 16 `whatsapp`, `linkedin`, `mail`, gap 8, rangée centrée.

## 3. Données répétées — structure d'une offre (exemple complet)

| Champ | Valeur |
|---|---|
| slug (présumé) | `coordinateur-rice-de-services` |
| intitulé | `Coordinateur·rice de services` |
| badges | `Nouveau` (vert) ; `CDI` (neutre) |
| lieu (liste) | `Douala` |
| lieu (détail) | `Douala, Cameroun` |
| contrat (liste) | `CDI` |
| contrat (détail) | `CDI · temps plein` (type + temps de travail) |
| prise de poste | `Prise de poste : janvier 2027` |
| date de publication | `Publiée le 2 octobre 2026` (liste : `Publiée il y a 3 jours`) |
| section « Le poste » | paragraphe ci-dessus |
| section « Vos missions » (4) | `Analyser les demandes et préparer les devis` · `Sélectionner et briefer les prestataires` · `Suivre chaque prestation et informer le client` · `Mettre à jour les dossiers dans l’outil de gestion` |
| section « Votre profil » (4) | `Expérience en relation client ou coordination` · `Sens de l’organisation et du service` · `Aisance à l’écrit et à l’oral en français` · `Maîtrise des outils numériques courants` |
| section « Ce que nous offrons » (3) | `Une équipe bienveillante et engagée` · `Des formations régulières` · `Des missions utiles, au service des familles` |

Les titres de sections (`Le poste`, `Vos missions`, `Votre profil`, `Ce que nous offrons`) semblent fixes (gabarit) ; leurs contenus sont propres à chaque offre.

## 4. Éléments interactifs

| Élément | Libellé | Variante | Icône | Destination présumée |
|---|---|---|---|---|
| Fil d'Ariane | `Accueil` | lien | — | `/` |
| Fil d'Ariane | `Recrutement` | lien | — | `/recrutement` |
| Carte latérale | `Postuler à cette offre` | Primary pleine largeur (322 × 48) | — | `/recrutement#candidature` avec Poste visé = cette offre |
| Partage | WhatsApp | bouton rond 34 | `whatsapp` | `https://wa.me/?text=<url>` |
| Partage | LinkedIn | bouton rond 34 | `linkedin` | partage LinkedIn |
| Partage | E-mail | bouton rond 34 | `mail` | `mailto:?subject=…&body=<url>` |
| Lien | `Voir toutes les offres` | lien texte | `arrow-left` (à droite) | `/recrutement#offres` |
| Flottant | WhatsApp | rond 64 | — | `wa.me` |

Pas de formulaire, filtre ni pagination.

## 5. Éléments visuels

- Aucune illustration sur cette page.
- Icônes : `chevron-right` (×2), `map-pin`, `briefcase`, `clock`, `calendar` (18), `check` (14), `whatsapp`, `linkedin`, `mail` (16), `arrow-left` (16).
- Rayons : tags 999 ; puces 999 ; carte résumé 24 ; boutons partage 999 ; bouton 12.
- Ombres : carte résumé `elevation/2` (seule ombre de la page).
- Grille : 2 colonnes (flex-1 + 380) gap 64 ; la colonne latérale n'est pas sticky dans la maquette (rien ne l'indique).

- Version mobile : voir `offre-demploi-detail-mobile.md`.
