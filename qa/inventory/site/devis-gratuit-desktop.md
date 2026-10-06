# Inventaire — site/devis-gratuit-desktop

- Frame Figma : `70:8077` « Devis gratuit — Desktop 1440 » — 1440 × 2944,5 px
- Fichier : `lsun63JexZYvgYUVpmSYyg`
- Conventions : tokens `--mp-*` (valeur de repli entre parenthèses). Polices : `--mp-font-family-brand` = Poppins, `--mp-font-family-ui` = Inter.
- Note espaces : la typographie française du fichier utilise une espace avant `?` / `:` (ex. « Quel service vous intéresse ? »). L’export ne permet pas de distinguer espace normale / insécable ; à implémenter en espace insécable (U+00A0 ou U+202F) pour éviter les retours à la ligne orphelins.

## 1. Structure (ordre vertical)

| # | Node | Calque | Fond | Paddings / gap | Taille | Rayon |
|---|---|---|---|---|---|---|
| 1 | 70:8078 | Web/TopBar — Desktop (instance partagée) | neutral-900 `#1c1a18` | — | 1440 × 36 | 0 |
| 2 | 70:8110 | Web/Header — Desktop (instance partagée) | blanc | — | 1440 × 85 | 0 |
| 3 | 70:8183 | Hero | `--mp-color-neutral-50` `#f8f7f5` | px 64 / py 48, gap 16 (colonne) | 1440 × 278 | 0 |
| 4 | 70:8207 | Contenu | `--mp-color-neutral-50` `#f8f7f5` (continuité visuelle avec le hero) | pt 48, px 64, pb 96 ; 2 colonnes : Formulaire 880 px + gap 32 + Récapitulatif 400 px | 1440 × 1714 | 0 |
| 4.1 | 70:8208 | Formulaire | — | colonne, gap 16 entre étapes | 880 × 1570 | — |
| 4.1.1 | 70:8209 | Étape 1 (terminée) | blanc `--mp-color-neutral-0` ; bordure 1 px `--mp-color-border-default` `#e4e1dc` | p 36, gap 20 | 880 × 380 | 28 |
| 4.1.2 | 70:8262 | Étape 2 (active) | blanc ; bordure **2 px** `--mp-color-brand-primary` `#ff7a00` | p 36, gap 20 | 880 × 576 | 28 |
| 4.1.3 | 70:8318 | Étape 3 (à venir, affichée ouverte) | blanc ; bordure 1 px `#e4e1dc` | p 36, gap 20 | 880 × 582 | 28 |
| 4.2 | 70:8325 | Récapitulatif (colonne droite, sticky probable) | — | colonne gap 16 | 400 × 472 | — |
| 4.2.1 | 70:8326 | Carte « Votre demande » | blanc ; bordure 1 px `#e4e1dc` | p 28, gap 16 | 400 × 292 | 24 |
| 4.2.2 | 70:8360 | Aide | `--mp-color-neutral-900` `#1c1a18` | p 24, gap 12 | 400 × 164 | 24 |
| 5 | 70:8365 | Web/Footer — Desktop (instance partagée) | neutral-900 (liseré dégradé en haut) | — | 1440 × 831,5 | 0 |
| 6 | 70:8477 | Web/WhatsApp flottant (instance) | `#25D366` | — | 64 × 64, position x 1348 / y 808 (fixe, bas-droite) | cercle |

Header / TopBar / Footer : composants globaux (voir inventaires des pages précédentes). Header : CTA « Devis gratuit » (orange), bouton « S’inscrire » (icône user).

## 2. Textes (verbatim)

### Hero (70:8183)
| Node | Rôle | Texte | Typo | Couleur |
|---|---|---|---|---|
| 70:8185 | Fil d’Ariane, lien | `Accueil` | Inter Regular 13 / 16, ls 0.13px | `--mp-color-text-muted` `#5e5952` |
| 70:8186 | séparateur | icône `chevron-right` 14 px | — | muted |
| 70:8188 | Fil d’Ariane, page courante | `Devis gratuit` | Inter SemiBold 13 / 16, ls 0.13px | `--mp-color-text-main` `#1c1a18` |
| 70:8189 | H1 | `Votre devis gratuit ` + **`en 3 minutes.`** (surligné orange) | Poppins SemiBold 52 / 58, ls −1.3px | main `#1c1a18` ; « en 3 minutes. » en `#ad5300` (`--mp-color-text-brand`) |
| 70:8190 | Chapô | `Sans engagement. Réponse personnalisée sous 24 h, par e-mail ou WhatsApp.` | Inter Regular 19 / 32 | muted `#5e5952` |

### Indicateur de progression (70:8191) — rangée gap 12, pleine largeur
| Ordre | Node | Libellé | État | Pastille (28 × 28, rayon 999) | Libellé typo/couleur | Trait suivant (2 px, flex) |
|---|---|---|---|---|---|---|
| 1 | 70:8192 | `Service` | **fait** | fond `--mp-color-vert-500` `#7db928`, icône `check` 14 px blanche | Inter SemiBold 14 / 20, ls 0.07px, main | 70:8197 vert-500 `#7db928` |
| 2 | 70:8198 | `Votre besoin` | **actif** | fond `--mp-color-brand-primary` `#ff7a00`, chiffre `2` Inter SemiBold 12 / 16 couleur neutral-900 | Inter SemiBold 14 / 20, main | 70:8202 `--mp-color-neutral-200` `#e4e1dc` |
| 3 | 70:8203 | `Coordonnées` | **à venir** | fond neutral-200 `#e4e1dc`, chiffre `3` Inter SemiBold 12 / 16 muted | Inter SemiBold 14 / 20, muted `#5e5952` | — |

### Étape 1 (70:8209) — « fait »
| Node | Rôle | Texte | Typo | Couleur |
|---|---|---|---|---|
| 70:8211 | pastille étape | icône `check` 18 px blanche sur cercle 36 vert-500 `#7db928` | — | — |
| 70:8215 | Titre d’étape (H2/H3) | `Quel service vous intéresse ?` | Poppins SemiBold 21 / 28 | main |
| 70:8216 | Sous-titre | `Choisissez une rubrique puis un service.` | Inter Regular 14 / 20 | muted |
| 70:8248 | Label groupe | `Service` | Inter SemiBold 14 / 20, ls 0.07px | main |

En-tête d’étape : rangée gap 14, pastille 36 + bloc texte (gap 2).

### Étape 2 (70:8262) — « actif »
| Node | Rôle | Texte | Typo | Couleur |
|---|---|---|---|---|
| 70:8264/8265 | pastille | `2` (cercle 36 neutral-900 `#1c1a18`) | Inter SemiBold 16 / 24 | blanc |
| 70:8267 | Titre | `Parlez-nous de votre besoin` | Poppins SemiBold 21 / 28 | main |
| 70:8271 | Label | `Date souhaitée` | Inter SemiBold 14 / 20 | main |
| 70:8276 | Valeur saisie | `Samedi 14 novembre 2026` | Inter Regular 16 / 24 | main |
| 70:8279 | Label | `Ville` | Inter SemiBold 14 / 20 | main |
| 70:8284 | Valeur | `Douala` | Inter Regular 16 / 24 | main |
| 70:8290 | Label | `Nombre de personnes` | Inter SemiBold 14 / 20 | main |
| 70:8296 | Valeur | `12` | Inter Regular 16 / 24 | main |
| 70:8299 | Label | `Type d’occasion` (apostrophe typographique ’) | Inter SemiBold 14 / 20 | main |
| 70:8301 | Valeur | `Anniversaire` | Inter Regular 16 / 24 | main |
| 70:8306 + 70:8307 | Label requis | `Décrivez votre besoin` + `*` | label Inter SemiBold 14/20 main ; `*` Inter Medium 14/20 `--mp-color-text-brand` `#ad5300`, gap 4 | — |
| 70:8309 | Valeur textarea | `Dîner pour les 60 ans de ma mère, cuisine camerounaise revisitée, un invité végétarien…` (points de suspension « … » U+2026) | Inter Regular 16 / 24 | main |
| 70:8310 | Aide | `Plus votre description est précise, plus le devis sera juste.` | Inter Regular 12 / 16, ls 0.12px | muted |
| 70:8313 | Lien retour | `Retour` | Inter SemiBold 14 / 20 | muted |
| 70:8316 | Bouton | `Continuer` | Inter SemiBold 16 / 24 | `--mp-color-text-on-primary` `#1c1a18` |

### Étape 3 (70:8318) — « à venir »
| Node | Rôle | Texte | Typo | Couleur |
|---|---|---|---|---|
| 70:8320/8321 | pastille | `3` (cercle 36 neutral-900) | Inter SemiBold 16 / 24 | blanc |
| 70:8323 | Titre | `Vos coordonnées` | Poppins SemiBold 21 / 28 | main |
| 70:8324 | Sous-titre | `Nom, e-mail, téléphone et pays.` | Inter Regular 14 / 20 | muted |
| 70:10445/10446 | Label requis | `Nom et prénom` + `*` | idem labels requis | — |
| 70:10451 | Placeholder | `Votre nom complet` | Inter Regular 16 / 24 | `--mp-color-text-subtle` `#7d776f` |
| 70:10454/10455 | Label requis | `E-mail` + `*` | | |
| 70:10460 | Placeholder | `vous@exemple.com` | Inter Regular 16 / 24 | subtle `#7d776f` |
| 70:10464/10465 | Label requis | `Téléphone / WhatsApp` + `*` | | |
| 70:10470 | Placeholder | `+237 6 00 00 00 00` | Inter Regular 16 / 24 | subtle |
| 70:10473/10474 | Label requis | `Pays de résidence` + `*` | | |
| 70:10476 | Placeholder select | `Choisir` | Inter Regular 16 / 24 | subtle |
| 70:10480 | Label groupe | `Comment préférez-vous être recontacté ?` | Inter SemiBold 14 / 20, ls 0.07px | main |
| 70:10492 | Consentement | `J'accepte que Mambo Proxi traite mes données pour répondre à ma demande, conformément à la politique de confidentialité.` (apostrophe droite `'` telle que dans le fichier) | Inter Regular 14 / 20 | muted `#5e5952` |
| 70:10497 | Mention anti-spam | `Formulaire protégé contre les envois automatiques` | Inter Regular 12 / 16, ls 0.12px | muted |
| 70:10498 | Bouton submit | `Envoyer ma demande de devis` | Inter SemiBold 16 / 24 | on-primary `#1c1a18` |

### Récapitulatif (70:8325)
| Node | Rôle | Texte | Typo | Couleur |
|---|---|---|---|---|
| 70:8327 | Titre carte | `Votre demande` | Inter SemiBold 16 / 24 | main |
| 70:8341 | Service choisi | `Chef privé` | Inter SemiBold **15** / 24 | main |
| 70:8342 | Rubrique du service | `Expérience` | Inter Regular 12 / 16, ls 0.12px | muted |
| 70:8349 | Garantie 1 | `Devis gratuit et sans engagement` | Inter Regular 14 / 20 | main |
| 70:8354 | Garantie 2 | `Réponse sous 24 h` | Inter Regular 14 / 20 | main |
| 70:8359 | Garantie 3 | `Tarif communiqué sur devis` | Inter Regular 14 / 20 | main |
| 70:8361 | Titre aide | `Une question avant de remplir ?` | Inter SemiBold 15 / 24 | blanc |
| 70:8362 | Texte aide | `Échangez directement avec un conseiller.` | Inter Regular 14 / 20 | `--mp-color-neutral-300` `#cfcac3` |
| I70:8363;4:43 | Bouton WhatsApp | `Écrire sur WhatsApp` | Inter SemiBold 16 / 24 | `#1c1a18` |

## 3. Données répétées

### Étapes du stepper de devis
| N° | Libellé stepper | Titre de carte | Sous-titre de carte | État dans la maquette |
|---|---|---|---|---|
| 1 | Service | Quel service vous intéresse ? | Choisissez une rubrique puis un service. | fait (coche verte) |
| 2 | Votre besoin | Parlez-nous de votre besoin | — (aucun) | actif (bordure orange 2 px, pastille noire « 2 » dans la carte, pastille orange dans le stepper) |
| 3 | Coordonnées | Vos coordonnées | Nom, e-mail, téléphone et pays. | à venir (pastille noire « 3 » dans la carte, grise dans le stepper) |

### Cartes rubriques (70:8217) — flex-wrap gap 10 ; carte 178 × 136, p 16, gap 10, rayon 18
| Node | Rubrique | Compteur | Icône (lucide) | État | Style |
|---|---|---|---|---|---|
| 70:8218 | `Expérience` | `5 services` | `sparkles` | **sélectionnée** | fond `--mp-color-orange-50` `#fdf4ec`, bordure 2 px `#ff7a00`, pastille icône fond blanc |
| 70:8225 | `Immobilier` | `7 services` | `building` (building-2) | normale | fond blanc, bordure 1 px `#e4e1dc`, pastille icône `#f8f7f5` |
| 70:8233 | `Services de proximité` | `3 services` | `cart` (shopping-cart) | normale | idem |
| 70:8241 | `Culture & événementiel` | `4 services` | `compass` | normale | idem |

Pastille icône : 36 × 36, rayon 11, icône 17 px. Nom : Inter SemiBold 14/20 main ; compteur : Inter Regular 12/16 muted.

### Puces services de la rubrique « Expérience » (70:8249) — flex-wrap gap 8 ; puce px 14 / py 9, rayon 999, hauteur 40
| Node | Service | État |
|---|---|---|
| 70:8250 | `Location de voiture` | normal (fond blanc, bordure 1 px `--mp-color-border-strong` `#cfcac3`, texte Inter Medium 14/20 main) |
| 70:8252 | `Photographe` | normal |
| 70:8254 | `Chef privé` | **sélectionné** (fond + bordure neutral-900 `#1c1a18`, icône `check` 14 px blanche, gap 6, texte blanc) |
| 70:8258 | `Massage bien-être` | normal |
| 70:8260 | `Services événementiels` | normal |

### Champs dynamiques « besoin » montrés (service Chef privé / rubrique Expérience)
| Champ | Type | Icône | Valeur d’exemple | Requis |
|---|---|---|---|---|
| Date souhaitée | date | `calendar` | Samedi 14 novembre 2026 | non (pas d’astérisque) |
| Ville | select | `map-pin` + `chevron-down` | Douala | non |
| Nombre de personnes | nombre | `users` | 12 | non |
| Type d’occasion | select | `chevron-down` | Anniversaire | non |
| Décrivez votre besoin | textarea (h 120) | — | Dîner pour les 60 ans de ma mère, cuisine camerounaise revisitée, un invité végétarien… | **oui** |

Aucune autre variante de champs par rubrique n’est montrée dans ce frame.

### Récapitulatif — garanties (icône `check` 14 px vert sur cercle 22 `--mp-color-vert-50` `#f6faef`, gap 10)
1. `Devis gratuit et sans engagement`
2. `Réponse sous 24 h`
3. `Tarif communiqué sur devis`

### Récapitulatif — service choisi (70:8328)
Bloc fond `#f8f7f5`, p 12, gap 12, rayon 16 : vignette illustration 56 × 56 fond `#fce7d5` rayon 12 (illustration « accueil » : maison + personnages, `Art` 74,7 × 56 centré) ; nom `Chef privé` ; rubrique `Expérience` ; icône `close` (x) 18 px pour retirer.

## 4. Éléments interactifs

### Boutons / liens
| Libellé | Variante | Taille | Destination / action |
|---|---|---|---|
| `Accueil` (fil d’Ariane) | lien texte | — | `/` |
| `Retour` + icône `arrow-left` 16 (icône placée APRÈS le texte) | lien texte muted | — | étape précédente (1) |
| `Continuer` | Button Primary (fond `#ff7a00`, texte `#1c1a18`, px 24 / py 12, rayon 12 `--mp-radius-md`, h 48) | 125 × 48, aligné à droite | étape suivante (3) |
| `Envoyer ma demande de devis` | Button Primary | 284 × 48, aligné à gauche | soumission → page confirmation devis |
| `Écrire sur WhatsApp` | Button WhatsApp (fond `#25D366`, texte `#1c1a18`) pleine largeur | 352 × 48 | lien WhatsApp (wa.me) |
| icône `close` dans service choisi | bouton icône | 18 px | désélectionner le service |
| WhatsApp flottant | FAB vert | 64 × 64 | wa.me |

### Champs de formulaire
| Étape | Label | Placeholder / valeur | Type | Requis | Icône | Options |
|---|---|---|---|---|---|---|
| 1 | (rubrique) | — | cartes radio | oui (implicite) | — | Expérience, Immobilier, Services de proximité, Culture & événementiel |
| 1 | `Service` | — | puces radio | oui (implicite) | — | Location de voiture, Photographe, Chef privé, Massage bien-être, Services événementiels (pour Expérience) |
| 2 | `Date souhaitée` | (valeur) Samedi 14 novembre 2026 | date | non | calendar | — |
| 2 | `Ville` | (valeur) Douala | select | non | map-pin | non montrées (Douala visible) |
| 2 | `Nombre de personnes` | (valeur) 12 | number | non | users | — |
| 2 | `Type d’occasion` | (valeur) Anniversaire | select | non | — | non montrées |
| 2 | `Décrivez votre besoin` | (valeur) Dîner pour… | textarea | **oui** | — | helper : `Plus votre description est précise, plus le devis sera juste.` |
| 3 | `Nom et prénom` | `Votre nom complet` | text | **oui** | user | — |
| 3 | `E-mail` | `vous@exemple.com` | email | **oui** | mail | — |
| 3 | `Téléphone / WhatsApp` | `+237 6 00 00 00 00` | tel | **oui** | phone (smartphone) | — |
| 3 | `Pays de résidence` | `Choisir` | select | **oui** | chevron-down | non montrées |
| 3 | `Comment préférez-vous être recontacté ?` | — | puces radio | non marqué | — | `WhatsApp` (sélectionné), `Téléphone`, `E-mail` |
| 3 | Consentement | — | checkbox (20 × 20, bordure 1,5 px `#cfcac3`, rayon 6, décochée) | requis (logique RGPD) | — | texte ci-dessus |

Style des saisies : fond blanc, bordure 1 px `#cfcac3`, rayon 12, px 16 / py 14, gap 10, hauteur 54, icône 18 px à gauche ; état focus/actif (textarea) : bordure 2 px `#ff7a00`. Label → saisie gap 8. Rangées de 2 champs gap 16. Pas de case newsletter sur ce formulaire.

Anti-spam : icône `lock` 16 px + `Formulaire protégé contre les envois automatiques` (pas de captcha visible).

## 5. Visuels
- Icônes lucide : chevron-right, check, sparkles, building(-2), shopping-cart, compass, calendar, map-pin, chevron-down, users, arrow-left, user, mail, smartphone/phone, lock, x (close).
- Illustration : vignette « Illustration — accueil » (maison orange + 2 personnages + palmier) sur fond `#fce7d5`.
- Rayons : cartes d’étape 28 ; carte récap et aide 24 ; cartes rubrique 18 ; bloc service choisi 16 ; saisies et boutons 12 ; pastille icône 11 ; checkbox 6 ; puces/pastilles 999.
- Ombres : aucune visible (bordures uniquement).
