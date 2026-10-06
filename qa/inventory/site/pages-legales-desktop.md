# Inventaire — site/pages-legales-desktop

- Frame : `71:9645` « Pages légales — Desktop 1440 » — 1440 × 1942,5 px
- Gabarit unique pour les 3 pages légales (Mentions légales / Politique de confidentialité / Gestion des cookies) ; la maquette montre l’onglet **Mentions légales**. Le bandeau cookies est présenté en superposition.

## 1. Structure
| # | Node | Calque | Fond | Paddings / gap | Taille | Rayon |
|---|---|---|---|---|---|---|
| 1 | 71:9646 | Web/TopBar — Desktop | `#1c1a18` | — | 1440 × 36 | — |
| 2 | 71:9678 | Web/Header — Desktop | blanc | — | 1440 × 85 | — |
| 3 | 71:9751 | Hero | `--mp-color-neutral-50` `#f8f7f5` | px 64 / py 48, colonne gap 14 | 1440 × 218 | 0 |
| 4 | 71:9759 | Contenu (2 colonnes) | `--mp-color-neutral-0` blanc | pt 64, pb 112, px 64 ; gap 80 | 1440 × 772 | 0 |
| 4.1 | 71:9760 | Sommaire (colonne gauche, sticky probable) | `#f8f7f5` | p 12, gap 4 | 300 × 164 | 20 |
| 4.2 | 71:9775 | Article | — | colonne gap 36 ; chaque section gap 12 | 932 × 596 | — |
| 5 | 71:9791 | Web/Footer — Desktop | — | — | 1440 × 831,5 | — |
| 6 | 71:9903 | Web/WhatsApp flottant | `#25D366` | — | 64 × 64 | cercle |
| 7 | 71:9907 | Bandeau cookies (flottant, centré en bas de l’écran : x 240, largeur 960) | `--mp-color-neutral-900` `#1c1a18` ; ombre `elevation/4` (0 24 48 −12 `#38153638`) | p 24, gap 24, rangée centrée verticalement | 960 × 118 | 24 |

## 2. Textes
| Node | Rôle | Texte verbatim | Typo | Couleur |
|---|---|---|---|---|
| 71:9753 | Fil d’Ariane | `Accueil` | Inter Regular 13 / 16, ls 0.13px | muted `#5e5952` |
| 71:9756 | Fil d’Ariane courant | `Mentions légales` | Inter SemiBold 13 / 16 | main |
| 71:9757 | H1 | `Mentions légales` | Poppins SemiBold 52 / 58, ls −1.3px | main (pas de surlignage) |
| 71:9758 | Date de mise à jour | `Dernière mise à jour : octobre 2026` | Inter Regular 14 / 20 | muted |
| 71:9777 | H2 section | `1. Éditeur du site` | Poppins SemiBold 24 (`--mp-font-size-h3`) / 32 | main |
| 71:9778 | Paragraphe | `Le site est édité par MAMBO Proxi. Raison sociale, forme juridique, adresse du siège, numéro d’immatriculation et responsable de la publication : informations à compléter par la cliente.` | Inter Regular 17 / 29 | muted |
| 71:9780 | H2 | `2. Hébergement` | idem | main |
| 71:9781 | Paragraphe | `Nom, adresse et coordonnées de l’hébergeur du site : à compléter à la mise en ligne.` | Inter Regular 17 / 29 | muted |
| 71:9783 | H2 | `3. Propriété intellectuelle` | | main |
| 71:9784 | Paragraphe | `L’ensemble des contenus du site (textes, logos, photographies, éléments graphiques) est la propriété de MAMBO Proxi, sauf mention contraire. Toute reproduction sans autorisation est interdite.` | | muted |
| 71:9786 | H2 | `4. Données personnelles` | | main |
| 71:9787 | Paragraphe | `Les données collectées par les formulaires sont limitées au nécessaire et utilisées uniquement pour répondre à vos demandes. Vous disposez d’un droit d’accès, de rectification et de suppression. Voir la politique de confidentialité.` | | muted |
| 71:9789 | H2 | `5. Contact` | | main |
| 71:9790 | Paragraphe | `Pour toute question : contact@mamboproxi.com.` | | muted |
| 71:9909 | Titre bandeau cookies | `Nous respectons votre vie privée` | Inter SemiBold 16 / 24 | blanc |
| 71:9910 | Texte bandeau | `Nous utilisons des cookies pour mesurer l’audience et améliorer le site. Vous pouvez accepter, refuser ou personnaliser vos choix.` | Inter Regular 14 / 20 | `--mp-color-neutral-300` `#cfcac3` |
| 71:9913 | Bouton | `Refuser` | Inter SemiBold 14 / 20, ls 0.07px | blanc |
| 71:9915 | Bouton | `Personnaliser` | Inter SemiBold 14 / 20 | blanc |
| 71:9916 | Bouton | `Accepter` | Inter SemiBold 16 / 24 | `#1c1a18` |

Note : « MAMBO Proxi » est écrit avec MAMBO en capitales dans le corps légal. Textes provisoires (« à compléter ») → contenu éditable.

## 3. Données répétées

### Sommaire (TOC) — entrées px 16 / py 12, gap 8, rayon 14
| Ordre | Node | Libellé | Icône | État | Style |
|---|---|---|---|---|---|
| 1 | 71:9761 | `Mentions légales` | `file-text` 16 (orange) | **actif** | fond blanc + ombre `elevation/1`, Inter SemiBold 14/20, main |
| 2 | 71:9767 | `Politique de confidentialité` | `chevron-right` 16 | inactif | transparent, Inter Medium 14/20, muted |
| 3 | 71:9771 | `Gestion des cookies` | `chevron-right` 16 | inactif | idem |

### Sections de l’article « Mentions légales »
| N° | Titre | Corps |
|---|---|---|
| 1 | `1. Éditeur du site` | voir 71:9778 |
| 2 | `2. Hébergement` | voir 71:9781 |
| 3 | `3. Propriété intellectuelle` | voir 71:9784 |
| 4 | `4. Données personnelles` | voir 71:9787 (contient le renvoi « Voir la politique de confidentialité. » → lien probable) |
| 5 | `5. Contact` | voir 71:9790 (adresse e-mail → `mailto:contact@mamboproxi.com`) |

Les contenus des onglets Politique de confidentialité et Gestion des cookies ne sont pas montrés.

## 4. Interactifs
| Élément | Variante | Taille | Action |
|---|---|---|---|
| Entrées du sommaire | onglets / liens | 276 × 44 | `/mentions-legales`, `/politique-de-confidentialite`, `/cookies` |
| `Refuser` | bouton contour (bordure 1 px `--mp-color-neutral-600` `#5e5952`, transparent, texte blanc, px 16 / py 12, rayon 12) | 88 × 46 | refuser les cookies non essentiels |
| `Personnaliser` | idem | 128 × 46 | ouvrir les préférences |
| `Accepter` | Button Primary | 120 × 48 | accepter |
| `contact@mamboproxi.com` | lien mailto | — | — |

## 5. Visuels
- Icônes : chevron-right, file-text.
- Ombres : `elevation/1` (onglet actif), `elevation/4` (bandeau cookies).
- Rayons : sommaire 20 ; entrées 14 ; bandeau 24 ; boutons 12.
