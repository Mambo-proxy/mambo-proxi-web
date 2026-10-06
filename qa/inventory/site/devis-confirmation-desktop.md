# Inventaire — site/devis-confirmation-desktop

- Frame : `70:8799` « Devis — Confirmation — Desktop 1440 » — 1440 × 1631,5 px
- Page affichée après soumission du formulaire de devis.

## 1. Structure
| # | Node | Calque | Fond | Paddings / gap | Taille | Rayon |
|---|---|---|---|---|---|---|
| 1 | 70:8800 | Web/TopBar — Desktop | `#1c1a18` | — | 1440 × 36 | — |
| 2 | 70:8832 | Web/Header — Desktop | blanc | — | 1440 × 85 | — |
| 3 | 70:8905 | Confirmation | `--mp-color-neutral-50` `#f8f7f5` | pt 112, pb 128, px 64 ; colonne centrée, gap 24 | 1440 × 679 | 0 |
| 3.1 | 70:8906 | Icône (halo) | `--mp-color-vert-100` `#eaf5db` | centre | 88 × 88 | 999 |
| 3.1.1 | 70:8907 | i (disque) | `--mp-color-vert-500` `#7db928` | — | 60 × 60, icône `check` 30 px blanche | 999 |
| 3.2 | 70:8910 | Titre | — | largeur 760 | 760 × 104 (2 lignes) | — |
| 3.3 | 70:8911 | Texte | — | largeur 640 | 640 × 58 | — |
| 3.4 | 70:8912 | Référence (pilule) | blanc ; bordure 1 px `#e4e1dc` | px 18 / py 10, gap 10 | 345 × 42 | 999 |
| 3.5 | 70:8915 | Actions | — | rangée gap 10 | 404 × 51 | — |
| 4 | 70:8920 | Web/Footer — Desktop | — | — | 1440 × 831,5 | — |
| 5 | 70:9032 | Web/WhatsApp flottant | `#25D366` | — | 64 × 64 | cercle |

## 2. Textes
| Node | Rôle | Texte verbatim | Typo | Couleur |
|---|---|---|---|---|
| 70:8910 | H1 centré | `Merci, votre demande est bien envoyée !` | Poppins SemiBold 44 / 52, ls −1.1px, centré | main `#1c1a18` |
| 70:8911 | Paragraphe centré | `Un accusé de réception vient de vous être envoyé par e-mail. Un conseiller MAMBO Proxi vous répond sous 24 h avec votre devis personnalisé.` (« MAMBO » en capitales dans le texte) | Inter Regular 18 (`--mp-font-size-body-lg`) / 29, centré | muted `#5e5952` |
| 70:8913 | Libellé référence | `Référence de votre demande` | Inter Regular 14 / 20 | muted |
| 70:8914 | Valeur référence | `MP-2026-0142` | Inter SemiBold 14 / 20, ls 0.07px | main |
| I70:8916;4:43 | Bouton 1 | `Suivre sur WhatsApp` | Inter SemiBold 16 / 24 | `#1c1a18` |
| 4:19 (70:8918) | Bouton 2 | `Retour à l’accueil` (apostrophe ’) | Inter SemiBold 16 / 24 | main |

Aucun mot surligné en orange sur cette page.

## 3. Données
- **Format de référence** : `MP-AAAA-NNNN` → `MP-2026-0142` (préfixe `MP`, année sur 4 chiffres, compteur séquentiel sur 4 chiffres avec zéros).

## 4. Interactifs
| Libellé | Variante | Taille | Destination |
|---|---|---|---|
| `Suivre sur WhatsApp` | Button WhatsApp (fond `#25D366`, texte `#1c1a18`, px 24 / py 12, rayon 12) | 212 × 48 | wa.me (message pré-rempli avec la référence, à prévoir) |
| `Retour à l’accueil` | Button Outline (bordure 1,5 px `#cfcac3`, fond transparent, texte main, rayon 12) | 182 × 51 | `/` |

## 5. Visuels
- Icône de succès : `check` lucide 30 px blanche dans disque vert 60 sur halo vert clair 88.
- Pas d’illustration, pas d’ombre.
