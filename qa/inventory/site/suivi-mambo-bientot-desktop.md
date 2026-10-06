# Inventaire — site/suivi-mambo-bientot-desktop

- Frame : `83:9413` « Suivi Mambo (bientôt) — Desktop 1440 » — 1440 × 2471,5 px
- Page « espace client » à venir (teaser + inscription pour être prévenu).

## 1. Structure
| # | Node | Calque | Fond | Paddings / gap | Taille | Rayon |
|---|---|---|---|---|---|---|
| 1 | 83:9414 | Web/TopBar — Desktop | `#1c1a18` | — | 1440 × 36 | — |
| 2 | 83:9446 | Web/Header — Desktop | blanc | — | 1440 × 85 | — |
| 3 | 83:9519 | Hero (2 colonnes, centrées verticalement) | `--mp-color-neutral-50` `#f8f7f5` | pt 64, pb 96, px 64 ; gap 64 | 1440 × 511 | 0 |
| 3.1 | 83:9520 | Texte (flex 1 = 728 px) | — | colonne gap 20 | 728 × 351 | — |
| 3.1.1 | 83:9521 | Badge | `--mp-color-orange-50` `#fdf4ec` | px 12 / py 6, gap 8 | 163 × 28 | 999 |
| 3.1.2 | 83:9528 | Être prévenu (champ + bouton) | — | rangée gap 10 | 728 × 54 | — |
| 3.2 | 83:9536 | Aperçu (carte maquette d’espace client) | blanc ; bordure 1 px `#e4e1dc` ; ombre `elevation/3` (0 12 24 −4 `#3815361F` + 0 4 8 −4 `#3815360F`) | p 24, gap 12 | 520 × 326 | 28 |
| 4 | 83:9559 | Fonctionnalités | `--mp-color-neutral-0` blanc | px 64 / py 96 ; gap 48 | 1440 × 514 | 0 |
| 4.1 | 83:9560 | En-tête | — | gap 16, largeur 820 | 820 × 88 | — |
| 4.2 | 83:9563 | Grille (4 colonnes égales) | — | gap 16 | 1312 × 186 | — |
| 5 | 83:9594 | Web/CTA — Desktop (instance partagée) | blanc autour ; bandeau dégradé | pb 112, px 64 ; bandeau p 72 | 1440 × 494 | bandeau 40 |
| 6 | 83:9615 | Web/Footer — Desktop | — | — | 1440 × 831,5 | — |
| 7 | 83:9727 | Web/WhatsApp flottant | `#25D366` | — | 64 × 64 | cercle |

## 2. Textes
| Node | Rôle | Texte verbatim | Typo | Couleur |
|---|---|---|---|---|
| 83:9525 | Badge | `Bientôt disponible` (+ icône `clock` 14) | Inter SemiBold 13 / 16, ls 0.13px | `--mp-color-orange-700` `#ad5300` |
| 83:9526 | H1 | **`Suivi Mambo`** (orange) + ` : votre espace client, bientôt en ligne.` | Poppins SemiBold 52 / 58, ls −1.3px | « Suivi Mambo » `#ad5300` ; reste main `#1c1a18` |
| 83:9527 | Chapô | `Suivre vos demandes, retrouver vos devis et échanger avec votre conseiller depuis un seul espace. En attendant, notre équipe vous tient informé par e-mail et WhatsApp.` | Inter Regular 19 / 31 | muted `#5e5952` |
| 83:9533 | Placeholder | `Votre adresse e-mail` (icône `mail` 18) | Inter Regular 16 / 24 | subtle `#7d776f` |
| 4:3 (83:9534) | Bouton | `Me prévenir` | Inter SemiBold 16 / 24 | `#1c1a18` |
| 83:9537 | Titre aperçu | `Mes demandes` | Inter SemiBold 16 / 24 | main |
| 83:9561 | Surtitre (eyebrow) | `Ce qui arrive` (affiché en CAPITALES via `uppercase` → « CE QUI ARRIVE ») | Inter SemiBold 13 / 16, ls 1.04px, uppercase | `--mp-color-text-brand` `#ad5300` |
| 83:9562 | H2 | `Tout votre suivi au même endroit` | Poppins SemiBold 48 / 56, ls −0.96px (style `web/section`) | main |
| CTA I83:9594;56:2084 | H2 CTA | `Une demande` ⏎ `en attendant ?` (saut de ligne explicite, 2 paragraphes) | Poppins SemiBold 52 / 58, ls −1.04px | `--mp-color-neutral-900` `#1c1a18` |
| CTA I83:9594;56:2085 | Texte CTA | `Notre équipe vous répond sous 24 h, par e-mail ou WhatsApp.` | Inter Regular 19 / 30 | `#1c1a18` |
| CTA I83:9594;56:2088 | Bouton | `Demander un devis gratuit` + icône `arrow-right` 18 blanche | Inter SemiBold 16 / 24 | blanc |
| CTA I83:9594;56:2090;4:43 | Bouton | `Écrire sur WhatsApp` | Inter SemiBold 16 / 24 | `#1c1a18` |

## 3. Données répétées

### Fausses demandes de l’aperçu « Mes demandes » (cartes fond `#f8f7f5`, p 16, gap 10, rayon 16 ; piste 6 px `#f1efec` rayon 999)
| Node | Intitulé | Statut (pastille px 10 / py 4, rayon 999, Inter SemiBold 12/16) | Couleurs statut | Barre de progression (largeur remplie / 438) | Couleur barre |
|---|---|---|---|---|---|
| 83:9538 | `Chef privé · 14 nov.` | `Prestation réalisée` | fond `--mp-color-vert-50` `#f6faef`, texte `--mp-color-vert-700` `#557e1b` | 440 (100 %) | vert-500 `#7db928` |
| 83:9545 | `Logement temporaire · Bastos` | `En cours` | fond orange-50 `#fdf4ec`, texte orange-700 `#ad5300` | 264 (≈ 60 %) | brand-primary `#ff7a00` |
| 83:9552 | `Réception de colis` | `Nouvelle` | fond neutral-100 `#f1efec`, texte main `#1c1a18` | 88 (20 %) | `#ff7a00` |

Intitulé : Inter SemiBold 14 / 20, ls 0.07px, main. Séparateur « · » (point médian).

### Fonctionnalités à venir (cartes fond `#f8f7f5`, p 26, gap 12, rayon 22 ; pastille icône 44 × 44 fond orange-50 `#fdf4ec` rayon 13, icône 20 orange)
| Node | Icône (lucide) | Titre | Description |
|---|---|---|---|
| 83:9564 | `file-text` | `Vos demandes et devis` | `Statut en temps réel, de la demande à la prestation.` |
| 83:9572 | `message` (message-square) | `Messages` | `Échangez avec votre conseiller, sans perdre le fil.` |
| 83:9578 | `package` | `Colis et courriers` | `Soyez prévenu à chaque réception à l’agence.` |
| 83:9587 | `wallet` | `Paiement en ligne` | `Carte bancaire et Mobile Money, dans une prochaine étape.` |

Titre : Inter SemiBold 17 / 24 main ; description : Inter Regular 14 / 21 muted.

## 4. Interactifs
| Élément | Détail |
|---|---|
| Champ « être prévenu » | input email, placeholder `Votre adresse e-mail`, icône mail ; fond blanc, bordure 1 px `#cfcac3`, rayon 12, px 18 / py 14, h 54 ; pas de label visible ; requis implicite |
| `Me prévenir` | Button Primary 140 × 48 → inscription à la liste d’attente / notification d’ouverture |
| CTA `Demander un devis gratuit →` | bouton foncé (`#1c1a18`, texte blanc, px 24 / py 14, rayon 12) → `/devis-gratuit` |
| CTA `Écrire sur WhatsApp` | Button WhatsApp `#25D366` → wa.me |
| Pas de consentement ni anti-spam visibles sur le mini-formulaire. |

## 5. Visuels
- Icônes lucide : clock, mail, file-text, message-square, package, wallet, arrow-right.
- Carte aperçu avec ombre `elevation/3` (seule ombre de la page).
- CTA : bandeau dégradé `gradient/energie` linear-gradient(162.6°, `#ff9a1f` 14,6 %, `#ff7a00` 53,5 %, `#f0550f` 85,4 %), rayon 40, p 72 ; symbole « M-Lien » en filigrane (opacité 22 %, 384 × 291,8, x 968 / y −20).
- Rayons : aperçu 28 ; cartes fonctionnalités 22 ; cartes demande 16 ; pastille icône 13 ; champs/boutons 12 ; badges/barres 999.
