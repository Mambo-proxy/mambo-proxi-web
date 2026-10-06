# BO — Partenaires (93:22147)

Écran desktop 1440 × 921. Coque : voir `_shell.md` — élément actif **Partenaires**. Barre supérieure 83px.

## 1. Régions

| Région | Node | Position / taille | Détails |
|---|---|---|---|
| Barre latérale | 93:22148 | 264 × 921 | identique `_shell.md` |
| Barre supérieure | 93:22271 | 1176 × 83 | |
| Contenu | 93:22295 | 1176 × 838 | padding 32px |
| Barre (2 groupes d’onglets) | 93:22296 | 1112 × 42 | space-between |
| Grille | 93:22315 | y98 · 1112 × 708 | 4 colonnes de 266px, écart 16px horizontal / 16px vertical ; 8 cartes + tuile d’ajout |

## 2. Textes et typographie

### Barre supérieure
| Texte | Node | Rôle / style |
|---|---|---|
| `Contenus du site` › `Partenaires` | 93:22274 / 93:22277 | fil d’Ariane |
| `Partenaires` | 93:22278 | titre Poppins SemiBold 24px |
| `Ajouter un partenaire` | 93:22291 | bouton primaire (icon/plus), 198 × 40, fond #FF7A00 |

### Onglets de vue (93:22297) — segmenté avec compteurs
| Onglet | Compteur | État |
|---|---|---|
| `Logos affichés` | `12` | actif |
| `Demandes de partenariat` | `3` | inactif |

### Filtre par catégorie (93:22306) — segmenté sans compteurs
| Onglet | État |
|---|---|
| `Tous` | actif (fond blanc + ombre, Inter SemiBold 13px #1C1A18) |
| `Prestataires Expérience` | inactif (Inter Medium 13px #5E5952) |
| `Immobilier` | inactif |
| `Entreprises & prestataires` | inactif |

### Cartes partenaires (93:22315)
Carte 266 × 220 : fond #FFFFFF, bordure #E4E1DC, radius 16px, padding 16px, gap 12px.
- En-tête : icon/grip 16px (gauche) + interrupteur de visibilité 40 × 24 (droite ; activé #7DB928, désactivé #CFCAC3).
- Zone logo 232 × 84 : fond #F8F7F5, radius 12px, placeholder `Logo` (Inter SemiBold 14px `--mp-color-neutral-400` #A8A29A).
- Nom : Inter SemiBold 14px / lh 20px #1C1A18.
- Catégorie : pilule fond #F1EFEC, radius 999px, padding 3px / 8px, Inter Regular 11px #5E5952.

| # | Node | Nom | Catégorie | Visible |
|---|---|---|---|---|
| 1 | 93:22316 | `Saveurs de Douala` | `Prestataires Expérience` | oui |
| 2 | 93:22332 | `Immo Bonapriso` | `Immobilier` | oui |
| 3 | 93:22348 | `Kribi Évasion` | `Entreprises & prestataires` | oui |
| 4 | 93:22364 | `Studio Lumière` | `Prestataires Expérience` | oui |
| 5 | 93:22380 | `Résidences Akwa` | `Immobilier` | oui |
| 6 | 93:22396 | `DLA Transports` | `Entreprises & prestataires` | **non** (interrupteur désactivé) |
| 7 | 93:22412 | `Atelier Bamoun` | `Prestataires Expérience` | oui |
| 8 | 93:22428 | `Cabinet Ndoumbe` | `Immobilier` | oui |

Tuile d’ajout (93:22444, 266 × 236) : bordure 1px pointillée #CFCAC3, radius 16px ; icon/plus 22px ; `Ajouter un logo` (Inter SemiBold 14px #1C1A18) ; `PNG ou SVG, fond transparent` (Inter Regular 12px #5E5952).

Remarques : le compteur `Logos affichés` vaut 12 alors que 8 cartes sont dessinées (dont 1 masquée) ; l’onglet `Demandes de partenariat` affiche 3 alors que le tableau de bord indique `Demande de partenariat` = 1 (et l’agenda contient un RDV « Partenariat · Saveurs de Douala »). Le contenu de l’onglet Demandes de partenariat n’est pas maquetté.

## 3. Données

**Partenaire** : nom, logo (PNG/SVG fond transparent), catégorie (`Prestataires Expérience` / `Immobilier` / `Entreprises & prestataires`), visible (bool), ordre (glisser-déposer).
**Demande de partenariat** (onglet, non détaillé) : compteur 3.

## 4. Interactions

| Élément | Type |
|---|---|
| `Ajouter un partenaire` / tuile `Ajouter un logo` | création + upload logo |
| Onglets Logos affichés / Demandes de partenariat | navigation |
| Onglets catégories | filtre |
| icon/grip | réordonner (ordre d’affichage sur le site) |
| Interrupteur | afficher / masquer le logo sur le site |
| Clic carte | édition (implicite) |
