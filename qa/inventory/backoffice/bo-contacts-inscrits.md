# BO — Contacts & inscrits (93:22874)

Écran desktop 1440 × 900. Coque : voir `_shell.md` — élément actif **Contacts & inscrits** (groupe RELATIONS). Barre supérieure 83px.
Composants identiques aux écrans précédents (KPI du tableau de bord, onglets segmentés à compteurs, filtres déroulants et tableau paginé de `bo-demandes.md`).

## 1. Régions

| Région | Node | Position / taille | Détails |
|---|---|---|---|
| Barre latérale | 93:22875 | 264 × 900 | identique `_shell.md` |
| Barre supérieure | 93:22998 | 1176 × 83 | |
| Contenu | 93:23024 | 1176 × 809 | padding 32px |
| Rangée KPI | 93:23025 | y32 · 1112 × 156 | 4 cartes 266 × 156 |
| Barre onglets + filtres | 93:23067 | y212 · 1112 × 42 | |
| Tableau — Contacts | 93:23090 | y278 · 1112 × 499 | 6 lignes + pied paginé |

## 2. Textes et typographie

### Barre supérieure
| Texte | Node | Rôle / style |
|---|---|---|
| `Relations` › `Contacts & inscrits` | 93:23001 / 93:23004 | fil d’Ariane |
| `Contacts & inscrits` | 93:23005 | titre Poppins SemiBold 24px |
| `Exporter (CSV)` | 93:23018 | bouton secondaire (icon/download), 158 × 42, fond blanc, bordure #CFCAC3 |

### KPI (93:23025)
| KPI | Icône | Valeur | Évolution | Légende |
|---|---|---|---|---|
| `Contacts` | icon/users | `1 486` | `+64` (badge vert) | `ce mois-ci` |
| `Particuliers` | icon/user | `1 312` | — | — |
| `Professionnels / partenaires` | icon/briefcase | `174` | — | — |
| `France / Cameroun` | icon/globe | `58 % / 39 %` | — | — |

### Onglets (93:23068)
| Onglet | Compteur (verbatim, sans séparateur de milliers) | État |
|---|---|---|
| `Tous` | `1486` | actif |
| `Particuliers` | `1312` | inactif |
| `Professionnels` | `174` | inactif |

### Filtres (93:23081) — menus déroulants
`Tous les pays` · `Toutes les rubriques`

### Tableau — Contacts (93:23090)
Colonnes : `Nom` (274px) · `Profil` (120px) · `Localisation` (150px) · `Intérêts` (200px) · `Demandes` (90px) · `Newsletter` (100px) · actions (40px, icon/more).
Cellule Nom : avatar 32px (initiales) + nom Inter SemiBold 14px + e-mail Inter Regular 12px #5E5952.

| # | Avatar | Nom | E-mail | Profil | Localisation | Intérêts | Demandes | Newsletter |
|---|---|---|---|---|---|---|---|---|
| 1 | `AK` | `Aurélie Kamga` | `aurelie.k@email.com` | `Particulier` | `Paris, France` | `Immobilier, Proximité` | `3` | `Abonné` |
| 2 | `SD` | `Saveurs de Douala` | `contact@saveurs-dla.cm` | `Professionnel` | `Douala` | `Expérience` | `0` | `Abonné` |
| 3 | `PE` | `Patrick Essama` | `p.essama@email.com` | `Particulier` | `Marseille, France` | `Culture & événementiel` | `1` | `Non` |
| 4 | `SM` | `Sandrine Mballa` | `s.mballa@email.com` | `Particulier` | `Lyon, France` | `Immobilier` | `2` | `Abonné` |
| 5 | `SL` | `Studio Lumière` | `hello@studiolumiere.cm` | `Professionnel` | `Yaoundé` | `Expérience` | `0` | `Non` |
| 6 | `HD` | `Hervé Dikoume` | `h.dikoume@email.com` | `Particulier` | `Douala` | `Proximité` | `4` | `Abonné` |

Pied : `Affichage de 1 à 6 sur 1 486 contacts` ; pagination `‹ 1 2 3 ›` (page 1 active).

Badges Newsletter (composant badge de statut réutilisé) :
| Valeur | Libellé | Variante de composant | Couleurs |
|---|---|---|---|
| abonne | `Abonné` | « Statut — Confirmé » | vert : fond #F6FAEF, texte #557E1B, pastille verte (variante « confirmé » = vert, cf. jeu de statuts) |
| non | `Non` | « Statut — Brouillon » | gris : fond #F1EFEC, texte #5E5952, pastille grise |

Remarque : le compteur global de la newsletter au tableau de bord est `1 248` inscrits.

## 3. Données — entité Contact

| Champ | Exemple |
|---|---|
| nom complet / raison sociale | `Aurélie Kamga`, `Saveurs de Douala` |
| initiales / couleur avatar | `AK` |
| email | `aurelie.k@email.com` |
| profil | `Particulier` / `Professionnel` (KPI : « Professionnels / partenaires ») |
| localisation (ville, pays) | `Paris, France`, `Douala` |
| pays (pour KPI France / Cameroun) | France, Cameroun, autre |
| interets[] (rubriques) | `Immobilier`, `Proximité`, `Expérience`, `Culture & événementiel` |
| nbDemandes | 3 |
| newsletter | abonné / non |
| dateCreation (KPI « +64 ce mois-ci ») | |

KPI : total 1 486 (+64 ce mois), particuliers 1 312, professionnels/partenaires 174, répartition pays France 58 % / Cameroun 39 %.

## 4. Interactions

| Élément | Type |
|---|---|
| `Exporter (CSV)` | export de la liste filtrée |
| Onglets Tous / Particuliers / Professionnels | filtre profil |
| `Tous les pays`, `Toutes les rubriques` | filtres déroulants (pays, intérêt) |
| icon/more | menu ligne (voir fiche, désinscrire, supprimer…) |
| Pagination | 6 par page |
