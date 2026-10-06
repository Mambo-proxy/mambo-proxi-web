# Inventaire — site/s-inscrire-professionnel-desktop

- Frame : `70:11134` « S'inscrire — Professionnel — Desktop 1440 » — 1440 × 2154,5 px
- Même gabarit que `s-inscrire-particulier-desktop.md` (mêmes tokens, paddings, rayons, styles de champs). Ci-dessous l’inventaire complet des contenus, avec les écarts signalés **(≠ particulier)**.

## 1. Structure
| # | Node | Calque | Fond | Paddings / gap | Taille | Rayon |
|---|---|---|---|---|---|---|
| 1 | 70:11135 | Web/TopBar — Desktop | `#1c1a18` | — | 1440 × 36 | — |
| 2 | 70:11167 | Web/Header — Desktop | blanc | — | 1440 × 85 | — |
| 3 | 70:11240 | Inscription | `#f8f7f5` | — | 1440 × **1202** | — |
| 3.1 | 70:11241 | Visuel (gauche) | — | — | 600 × 980 | 0 |
| 3.1.a | 79:14166 | **Illustration — equipe** (≠) | `#eaf5db` (vert-100) ; Art 1306,7 × 980 centré | — | 600 × 980 | 0 |
| 3.1.b | 70:11253 | Rectangle (voile dégradé) | `rgba(28,26,23,0)` 35 % → `rgba(28,26,23,0.85)` | — | 600 × 980 | — |
| 3.1.c | 70:11254 | Logo blanc | — | x 56 / y 56 | 158,9 × 43,5 | — |
| 3.1.d | 70:11265 | Texte (témoignage) | — | x 56 / **y 722**, gap 16, largeur 488 | 488 × 202 | — |
| 3.2 | 70:11271 | Contenu | — | pt 64, pb 80, px 88, gap 24 | 840 × 1202 | — |
| 3.2.1 | 70:11279 | Profil (segmented) | `#f1efec` | p 5, gap 4 | 664 × 52 | 999 |
| 3.2.2 | 70:11284 | Formulaire | blanc ; bordure 1 px `#e4e1dc` | p 32, gap 18 | 664 × **746** | 24 |
| 3.2.3 | 70:11369 | Déjà | — | gap 6, centré | 664 × 20 | — |
| 4 | 70:11376 | Web/Footer — Desktop | — | — | 1440 × 831,5 | — |
| 5 | 70:11488 | Web/WhatsApp flottant | `#25D366` | — | 64 × 64 | cercle |

## 2. Textes
| Node | Rôle | Texte verbatim | Typo | Couleur |
|---|---|---|---|---|
| 70:11269 | Citation (≠) | `« Depuis que je suis partenaire, je reçois des demandes claires et des clients qui reviennent. »` | Poppins Medium 28 / 38 | blanc |
| 70:11270 | Auteur (≠) | `Chef partenaire · Douala` | Inter Medium 14 / 20, ls 0.07px | blanc |
| 70:11273 / 70:11276 | Fil d’Ariane | `Accueil` › `S'inscrire` | Inter 13/16 (Regular muted / SemiBold main) | |
| 70:11277 | H1 | `Créer mon compte Mambo` | Poppins SemiBold 44 / 52, ls −1.1px | main |
| 70:11278 | Chapô (≠) | `Proposez vos services, recevez des demandes et rejoignez notre réseau de partenaires.` | Inter Regular 17 / 26 | muted |
| 70:11281 | Onglet inactif | `Je suis un particulier` | Inter Medium 14 / 20 | muted |
| 70:11283 | Onglet **actif** | `Je suis un professionnel / partenaire` | Inter SemiBold 14 / 20 | main, fond blanc + ombre elevation/1 |
| 70:11288/89 | Label requis (≠) | `Nom de la structure` `*` | Inter SemiBold 14/20 + `*` `#ad5300` | |
| 70:11291 | Placeholder (≠) | `Ex. : Saveurs de Douala` | Inter Regular 16 / 24 | subtle `#7d776f` |
| 70:11294/95 | Label requis (≠) | `Activité principale` `*` | | |
| 70:11297 | Placeholder select | `Choisir` | Inter Regular 16 / 24 | subtle |
| 70:11303/04 | Label requis | `Prénom` `*` | | |
| 70:11306 | Placeholder | `Votre prénom` | | subtle |
| 70:11309/10 | Label requis | `Nom` `*` | | |
| 70:11312 | Placeholder | `Votre nom` | | subtle |
| 70:11316/17 | Label requis | `E-mail` `*` | | |
| 70:11322 | Placeholder | `vous@exemple.com` | | subtle |
| 70:11325/26 | Label requis | `Téléphone / WhatsApp` `*` | | |
| 70:11331 | Placeholder | `+33 6 00 00 00 00` | | subtle |
| 70:11335/36 | Label requis | `Pays de résidence` `*` | | |
| 70:11338 | Valeur | `France` | | main |
| 70:11343 | Label | `Ville` | | main |
| 70:11345 | Valeur | `Paris` | | main |
| 70:11347 | Label groupe (≠) | `Rubriques dans lesquelles vous intervenez` | Inter SemiBold 14 / 20 | main |
| 70:11361 | Consentement | `J'accepte que Mambo Proxi traite mes données pour répondre à ma demande, conformément à la politique de confidentialité.` | Inter Regular 14 / 20 | muted |
| 70:11366 | Newsletter | `Je souhaite recevoir la lettre Mambo (une fois par mois).` | Inter Regular 14 / 20 | muted |
| 70:11367 | Bouton (≠) | `Envoyer ma demande d’inscription` (apostrophe ’) | Inter SemiBold 16 / 24 | `#1c1a18` |
| 70:11370 | Aide | `Une question ?` | Inter Regular 14 / 20 | muted |
| 70:11372 | Lien | `Contactez-nous` + `arrow-right` | Inter SemiBold 14 / 20 | `#ad5300` |

## 3. Données répétées — puces « Rubriques dans lesquelles vous intervenez » (multi-choix)
| Node | Libellé | État |
|---|---|---|
| 70:11349 | `Expérience` | **sélectionnée** (fond `#1c1a18`, check blanc) |
| 70:11353 | `Immobilier` | non sélectionnée |
| 70:11355 | `Services de proximité` | non sélectionnée |
| 70:11357 | `Culture & événementiel` | non sélectionnée (2e ligne) |

## 4. Interactifs
### Formulaire professionnel / partenaire
| Label | Placeholder / valeur | Type | Requis | Icône | Options |
|---|---|---|---|---|---|
| Nom de la structure | `Ex. : Saveurs de Douala` | text | oui | — | — |
| Activité principale | `Choisir` | select | oui | chevron-down | non montrées |
| Prénom | `Votre prénom` | text | oui | — | — |
| Nom | `Votre nom` | text | oui | — | — |
| E-mail | `vous@exemple.com` | email | oui | mail | — |
| Téléphone / WhatsApp | `+33 6 00 00 00 00` | tel | oui | phone | — |
| Pays de résidence | `France` | select | oui | chevron-down | non montrées |
| Ville | `Paris` | text | non | — | — |
| Rubriques dans lesquelles vous intervenez | — | multi-choix puces | non marqué | — | Expérience, Immobilier, Services de proximité, Culture & événementiel |
| Consentement | — | checkbox (décochée) | oui | — | texte verbatim |
| Newsletter | — | checkbox (**cochée**, orange) | non | — | `Je souhaite recevoir la lettre Mambo (une fois par mois).` |

### Boutons / liens
| Libellé | Variante | Taille | Destination |
|---|---|---|---|
| `Envoyer ma demande d’inscription` | Primary pleine largeur | 598 × 48 | soumission (demande partenaire, validation manuelle implicite) |
| Onglet `Je suis un particulier` | segmented inactif | — | `site/s-inscrire-particulier` |
| `Contactez-nous →` | lien brand | — | Contact |

## 5. Visuels
- Illustration « equipe » : 3 personnages autour d’un ordinateur portable, fond vert clair `#eaf5db`, voile sombre en bas.
- Icônes : quote, chevron-right, chevron-down, mail, phone, check, arrow-right.
- Rayons / ombres identiques à la version particulier.
