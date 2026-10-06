# Inventaire — site/questionnaire-merci-desktop

- Frame : `82:9847` « Questionnaire — Merci — Desktop 1440 » — fond `#f8f7f5`.
- Même gabarit autonome que le questionnaire : barre logo seule, **pas de header/footer/WhatsApp flottant**.

## 1. Structure
| # | Node | Calque | Fond | Paddings / gap | Taille | Rayon |
|---|---|---|---|---|---|---|
| 1 | 82:9848 | Barre (logo centré, couleur) | blanc ; bordure basse 1 px `#e4e1dc` | px 20 / py 18 | 1440 × ~76 | 0 |
| 2 | 82:9860 | Contenu | `#f8f7f5` | pt 56, pb 96, centré | 1440 | — |
| 2.1 | 82:9861 | Carte (contenu centré) | blanc ; bordure 1 px `#e4e1dc` | p 48, gap 28, items centrés | 720 | 28 |
| 2.1.1 | 82:9862 | Icône (halo) | `--mp-color-vert-100` `#eaf5db` | — | 80 × 80 | 999 |
| 2.1.2 | 82:9863 | i (disque) | `--mp-color-vert-500` `#7db928` | — | 54 × 54, icône `check` 28 blanche | 999 |
| 2.1.3 | 82:9868 | Actions | — | rangée gap 10 | — | — |

## 2. Textes
| Node | Rôle | Texte verbatim | Typo | Couleur |
|---|---|---|---|---|
| I82:9849;17:22 / 17:23 | Logo | `Mambo` / `Proxi` | Poppins Bold 22 (dégradé énergie) / Poppins Medium 14 `#699b22` | |
| 82:9866 | H1 centré | `Merci pour votre avis !` | Poppins SemiBold 40 / 48, ls −1px | main `#1c1a18` |
| 82:9867 | Paragraphe centré | `Vos réponses nous aident à améliorer chaque prestation. Si vous l’avez accepté, votre avis pourra être publié sur le site après validation.` | Inter Regular 18 / 29 | muted `#5e5952` |
| 4:3 | Bouton 1 | `Découvrir nos services` | Inter SemiBold 16 / 24 | `#1c1a18` |
| 4:19 | Bouton 2 | `Retour à l’accueil` | Inter SemiBold 16 / 24 | main |

## 3. Données répétées
Aucune.

## 4. Interactifs
| Libellé | Variante | Destination |
|---|---|---|
| `Découvrir nos services` | Button Primary (orange, h 48) | page Services / rubriques |
| `Retour à l’accueil` | Button Outline (bordure 1,5 `#cfcac3`, h 51) | `/` |

## 5. Visuels
Icône de succès check (même motif que la confirmation de devis, en 80/54/28 au lieu de 88/60/30). Pas d’illustration, pas d’ombre.
