# Inventaire — site/s-inscrire-particulier-desktop

- Frame : `70:10558` « S'inscrire — Particulier — Desktop 1440 » — 1440 × 2054,5 px
- Note espaces : une espace précède `:` et `?` dans les textes (« une fois : », « Une question ? ») ; à rendre en espace insécable.

## 1. Structure
| # | Node | Calque | Fond | Paddings / gap | Taille | Rayon |
|---|---|---|---|---|---|---|
| 1 | 70:10559 | Web/TopBar — Desktop | `#1c1a18` | — | 1440 × 36 | — |
| 2 | 70:10591 | Web/Header — Desktop | blanc | — | 1440 × 85 | — |
| 3 | 70:10664 | Inscription (2 colonnes) | `--mp-color-neutral-50` `#f8f7f5` | — | 1440 × 1102 | — |
| 3.1 | 70:10665 | Visuel (colonne gauche, 600 px) | illustration sur `#fce7d5` + dégradé | — | 600 × 980 (n’occupe pas toute la hauteur → panneau collant/sticky probable) | 0 |
| 3.1.a | 79:14132 | Illustration — accueil | `#fce7d5` ; « Art » 1306,7 × 980 centré, recadré | — | 600 × 980 | 0 |
| 3.1.b | 70:10677 | Rectangle (voile) | dégradé vertical `rgba(28,26,23,0)` à 35 % → `rgba(28,26,23,0.85)` en bas | — | 600 × 980 | 0 |
| 3.1.c | 70:10678 | Logo (version blanche) | — | x 56 / y 56 | 158,9 × 43,5 | — |
| 3.1.d | 70:10689 | Texte (témoignage) | — | x 56 / y 760, colonne gap 16, largeur 488 | 488 × 164 | — |
| 3.2 | 70:10695 | Contenu (colonne droite) | transparent (neutral-50) | pt 64, pb 80, px 88 ; colonne gap 24 | 840 × 1102 (contenu 664 de large) | — |
| 3.2.1 | 70:10703 | Profil (segmented control) | `--mp-color-neutral-100` `#f1efec` | p 5, gap 4 | 664 × 52 | 999 |
| 3.2.2 | 70:10708 | Formulaire (carte) | blanc ; bordure 1 px `#e4e1dc` | p 32, gap 18 | 664 × 646 | 24 |
| 3.2.3 | 70:10780 | Déjà (ligne d’aide centrée) | — | gap 6 | 664 × 20 | — |
| 4 | 70:10787 | Web/Footer — Desktop | — | — | 1440 × 831,5 | — |
| 5 | 70:10899 | Web/WhatsApp flottant | `#25D366` | — | 64 × 64 | cercle |

## 2. Textes
| Node | Rôle | Texte verbatim | Typo | Couleur |
|---|---|---|---|---|
| I70:10678;17:82 | Logo « Nom » | `Mambo` | Poppins Bold 24,2, ls −0.726px, lh 1 | blanc |
| I70:10678;17:83 | Logo | `Proxi` | Poppins Medium 15,4, lh 1 | blanc |
| 70:10693 | Citation | `« On s’est sentis attendus dès notre arrivée. Tout était prêt. »` (guillemets « » + apostrophe ’) | Poppins Medium 28 / 38 | blanc |
| 70:10694 | Auteur | `Aurélie K. · Paris → Douala` (point médian · et flèche →) | Inter Medium 14 / 20, ls 0.07px | blanc |
| 70:10697 | Fil d’Ariane | `Accueil` | Inter Regular 13 / 16, ls 0.13px | muted `#5e5952` |
| 70:10700 | Fil d’Ariane courant | `S'inscrire` (apostrophe droite ' dans le fichier) | Inter SemiBold 13 / 16 | main |
| 70:10701 | H1 | `Créer mon compte Mambo` | Poppins SemiBold 44 / 52, ls −1.1px | main `#1c1a18` (aucun mot orange) |
| 70:10702 | Chapô | `Enregistrez vos informations une fois : vos prochaines demandes seront plus rapides et mieux suivies.` | Inter Regular 17 / 26 | muted |
| 70:10705 | Onglet actif | `Je suis un particulier` | Inter SemiBold 14 / 20, ls 0.07px | main |
| 70:10707 | Onglet inactif | `Je suis un professionnel / partenaire` | Inter Medium 14 / 20, ls 0.07px | muted |
| 70:10712/13 | Label requis | `Prénom` `*` | Inter SemiBold 14/20 main + `*` Inter Medium `#ad5300` (gap 4) | |
| 70:10715 | Placeholder | `Votre prénom` | Inter Regular 16 / 24 | subtle `#7d776f` |
| 70:10718/19 | Label requis | `Nom` `*` | | |
| 70:10721 | Placeholder | `Votre nom` | | subtle |
| 70:10725/26 | Label requis | `E-mail` `*` | | |
| 70:10731 | Placeholder | `vous@exemple.com` | | subtle |
| 70:10734/35 | Label requis | `Téléphone / WhatsApp` `*` | | |
| 70:10740 | Placeholder | `+33 6 00 00 00 00` | | subtle |
| 70:10744/45 | Label requis | `Pays de résidence` `*` | | |
| 70:10747 | Valeur select | `France` | Inter Regular 16 / 24 | **main** (valeur remplie) |
| 70:10752 | Label | `Ville` (non requis) | Inter SemiBold 14 / 20 | main |
| 70:10754 | Valeur | `Paris` | Inter Regular 16 / 24 | main |
| 70:10756 | Label groupe | `Les services qui vous intéressent` | Inter SemiBold 14 / 20 | main |
| 70:10772 | Consentement | `J'accepte que Mambo Proxi traite mes données pour répondre à ma demande, conformément à la politique de confidentialité.` (apostrophe droite) | Inter Regular 14 / 20 | muted |
| 70:10777 | Newsletter | `Je souhaite recevoir la lettre Mambo (une fois par mois).` | Inter Regular 14 / 20 | muted |
| 4:3 (70:10778) | Bouton | `Créer mon compte` | Inter SemiBold 16 / 24 | `#1c1a18` |
| 70:10781 | Aide | `Une question ?` | Inter Regular 14 / 20 | muted |
| 70:10783 | Lien | `Contactez-nous` + icône `arrow-right` 16 | Inter SemiBold 14 / 20, ls 0.07px | `--mp-color-text-brand` `#ad5300` |

## 3. Données répétées
### Puces « Les services qui vous intéressent » (multi-sélection) — px 14 / py 9, rayon 999, gap 8, wrap
| Node | Libellé | État |
|---|---|---|
| 70:10758 | `Expérience` | non sélectionnée (blanc, bordure `#cfcac3`) |
| 70:10760 | `Immobilier` | **sélectionnée** (fond `#1c1a18`, check blanc 14, texte blanc) |
| 70:10764 | `Services de proximité` | **sélectionnée** |
| 70:10768 | `Culture & événementiel` | non sélectionnée (2e ligne) |

## 4. Interactifs
### Contrôle segmenté Profil
| Onglet | État | Style | Destination |
|---|---|---|---|
| `Je suis un particulier` | **actif** | fond blanc, rayon 999, px 12 / py 11, ombre `elevation/1` (0 1 2 `#3815360F` + 0 1 3 `#3815361A`) | page courante |
| `Je suis un professionnel / partenaire` | inactif | transparent | `site/s-inscrire-professionnel` |

### Formulaire (particulier)
| Label | Placeholder / valeur | Type | Requis | Icône |
|---|---|---|---|---|
| Prénom | `Votre prénom` | text | oui | — |
| Nom | `Votre nom` | text | oui | — |
| E-mail | `vous@exemple.com` | email | oui | mail |
| Téléphone / WhatsApp | `+33 6 00 00 00 00` | tel | oui | phone |
| Pays de résidence | (valeur) `France` | select | oui | chevron-down |
| Ville | (valeur) `Paris` | text | non | — |
| Les services qui vous intéressent | — | multi-choix (puces) | non | — | options : Expérience, Immobilier, Services de proximité, Culture & événementiel |
| Consentement | — | checkbox (décochée, 20 px, bordure 1,5 `#cfcac3`, rayon 6) | oui | texte verbatim ci-dessus |
| Newsletter | — | checkbox (**cochée** : fond `#ff7a00`, check 14 foncé, rayon 6) | non | `Je souhaite recevoir la lettre Mambo (une fois par mois).` |

Rangées 2 colonnes, gap 16 ; saisies h 54, rayon 12, bordure `#cfcac3`. Pas de mention anti-spam sur ce formulaire.

### Boutons / liens
| Libellé | Variante | Taille | Destination |
|---|---|---|---|
| `Créer mon compte` | Primary pleine largeur | 598 × 48 | soumission (création compte particulier) |
| `Contactez-nous →` | lien texte brand | — | page Contact |
| `Accueil` | lien fil d’Ariane | — | `/` |

## 5. Visuels
- Illustration « accueil » (maison orange, 2 personnages, valise, palmier, soleil) en plein panneau, voile dégradé sombre vers le bas.
- Icônes lucide : quote (36 px, orange clair), chevron-right, mail, smartphone/phone, chevron-down, check, arrow-right.
- Logo Mambo Proxi blanc (symbole « M-Lien » 57,2 × 43,5 + lettrage).
- Rayons : carte formulaire 24 ; saisies/bouton 12 ; checkbox 6 ; segmented/puces 999.
- Ombre : `elevation/1` sur l’onglet actif uniquement.
