# BO — Services (88:10421)

Écran desktop 1440 × 1045. Coque : voir `_shell.md` — élément actif **Services** (groupe CONTENUS DU SITE). Barre supérieure 83px avec fil d’Ariane.

## 1. Régions

| Région | Node | Position / taille | Détails |
|---|---|---|---|
| Barre latérale | 88:10422 | 264 × 1045 | identique `_shell.md` |
| Barre supérieure | 88:10545 | 1176 × 83 | padding 16px / 32px |
| Contenu | 88:10569 | 1176 × 962 | padding 32px |
| Intro (encart info) | 88:10570 | x32 y32 · 1112 × 72 | fond `--mp-color-orange-50` #FDF4EC, radius 14px, padding 16px, gap 12px |
| Barre onglets + action | 88:10575 | y128 · 1112 × 42 | space-between |
| Tableau — Services | 88:10603 | y194 · 1112 × 736 | carte blanche, bordure #E4E1DC, radius 16px |

## 2. Textes et typographie

### Barre supérieure
| Texte | Node | Rôle | Typo |
|---|---|---|---|
| `Contenus du site` › `Services` | 88:10548 / 88:10551 | fil d’Ariane | Inter Regular 12px #5E5952, chevron 12px |
| `Services` | 88:10552 | titre | Poppins SemiBold 24px / lh 32px #1C1A18 |
| `Rechercher…` / `⌘K` | 88:10558 / 88:10559 | recherche | voir coque |
| `Ajouter un service` | 88:10568 | bouton primaire (icon/plus 16px), 177 × 40 | fond #FF7A00, radius 10px, padding 10px / 14px, Inter SemiBold 14px #1C1A18 |

### Intro (88:10570)
- icon/info 18px.
- `Chaque service publié obtient automatiquement sa page, sa carte dans la rubrique et son entrée dans le menu. Glissez les lignes pour changer l’ordre d’affichage.` — Inter Regular 14px / lh 20px, `--mp-color-orange-900` #612E00 (apostrophe ’).

### Onglets par rubrique (88:10576) — même composant que l’écran Demandes (conteneur #F1EFEC radius 12px ; actif fond blanc + ombre, compteur orange-50/orange-700 ; inactifs Inter Medium 13px #5E5952, compteur #E4E1DC)
| Onglet | Node | Compteur | État |
|---|---|---|---|
| `Tous` | 88:10577 | `19` | actif |
| `Expérience` | 88:10581 | `5` | inactif |
| `Immobilier` | 88:10585 | `7` | inactif |
| `Proximité` | 88:10589 | `3` | inactif |
| `Culture & événementiel` | 88:10593 | `4` | inactif |

(5 + 7 + 3 + 4 = 19.)

Bouton `Gérer les rubriques` (88:10597) : secondaire, icon/layout 16px, fond #FFFFFF, bordure 1px #CFCAC3, radius 10px, padding 10px / 14px, Inter SemiBold 14px #1C1A18.

### Tableau — Services (88:10603)
- En-tête fond #F8F7F5, padding 12px / 20px, gap 16px, Inter SemiBold 12px #5E5952.
- Colonnes : (poignée 20px, sans libellé) · `Service` (flexible) · `Rubrique` (170px) · `Demandes (30 j)` (120px) · `Statut` (120px) · `Dans le menu` (110px) · actions (110px, sans libellé, alignées à droite, gap 10px).
- Ligne : padding 14px / 20px, hauteur 71px, séparateur #E4E1DC.
- Cellule Service : vignette illustrée 56 × 42, radius 8px, fond #FCE7D5 (illustration vectorielle de scène) + nom Inter SemiBold 14px #1C1A18 + URL de page Inter Regular 12px `--mp-color-text-subtle` #7D776F.
- Rubrique et nombre de demandes : Inter Regular 14px #1C1A18.
- Interrupteur « Dans le menu » : 40 × 24, radius 999px, padding 3px, pastille blanche 18px ; **activé** fond `--mp-color-vert-500` #7DB928 (pastille à droite) ; **désactivé** fond `--mp-color-neutral-300` #CFCAC3 (pastille à gauche).
- Actions : 3 boutons icône 32 × 32 radius 8px : icon/eye (aperçu), icon/pencil (modifier), icon/more (menu).

| # | Poignée | Vignette (scène) | Service | URL de page | Rubrique | Demandes (30 j) | Statut | Dans le menu |
|---|---|---|---|---|---|---|---|---|
| 1 | icon/grip | chef | `Chef privé` | `/services/experience/chef-prive` | `Expérience` | `14` | `Publié` | activé |
| 2 | icon/grip | voiture | `Location de voiture` | `/services/experience/location-voiture` | `Expérience` | `6` | `Publié` | activé |
| 3 | icon/grip | photo | `Photographe` | `/services/experience/photographe` | `Expérience` | `3` | `Publié` | activé |
| 4 | icon/grip | massage | `Massage bien-être` | `/services/experience/massage` | `Expérience` | `4` | `Publié` | activé |
| 5 | icon/grip | evenement | `Services événementiels` | `/services/experience/evenementiel` | `Expérience` | `5` | `Publié` | activé |
| 6 | icon/grip | logement | `Recherche de logement` | `/services/immobilier/recherche-logement` | `Immobilier` | `9` | `Publié` | activé |
| 7 | icon/grip | equipe | `Gestion locative` | `/services/immobilier/gestion-locative` | `Immobilier` | `7` | `Publié` | activé |
| 8 | icon/grip | colis | `Réception de colis et de courrier` | `/services/proximite/reception-colis` | `Proximité` | `4` | `Publié` | activé |
| 9 | icon/grip | marche | `Visites guidées de Douala` | `/services/culture/visites-douala` | `Culture & événementiel` | `0` | `Brouillon` | désactivé |

Pied (88:11230) : `Affichage de 9 sur 19 services · 1 brouillon` (Inter Regular 12px #5E5952) ; pagination `‹` `1` (actif, fond #1C1A18 texte blanc) `2` `3` `›` (30 × 30, radius 8px, bordure #E4E1DC).

Remarque : les noms affichés ici peuvent différer des libellés de demandes (`Réception de colis et de courrier` vs `Réception de colis`). Les slugs d’URL ne reprennent pas toujours le nom complet (`location-voiture`, `massage`, `evenementiel`, `reception-colis`, `visites-douala`).

## 3. Données — entité Service (liste)

| Champ | Exemple |
|---|---|
| ordre (drag & drop) | 1…n |
| illustration (scène) | `chef`, `voiture`, `photo`, `massage`, `evenement`, `logement`, `equipe`, `colis`, `marche` |
| nom | `Chef privé` |
| urlPage (slug calculé `/services/{rubrique}/{slug}`) | `/services/experience/chef-prive` |
| rubrique | Expérience / Immobilier / Proximité / Culture & événementiel |
| demandes30j (calculé) | 14 |
| statut | publie / brouillon |
| dansLeMenu (booléen) | true |

Compteurs par rubrique : Tous 19, Expérience 5, Immobilier 7, Proximité 3, Culture & événementiel 4. 9 lignes par page affichées.

## 4. Interactions et badges

| Élément | Type |
|---|---|
| `Ajouter un service` | bouton primaire → éditeur de service |
| Onglets rubriques | filtre |
| `Gérer les rubriques` | bouton secondaire (gestion des rubriques) |
| Poignée icon/grip | glisser-déposer pour réordonner |
| Interrupteur « Dans le menu » | toggle on/off |
| icon/eye / icon/pencil / icon/more | aperçu de la page publique / modifier / menu (dupliquer, supprimer…) |
| Pagination | |

Badges de statut de service :
| Valeur | Libellé | Fond | Texte | Pastille |
|---|---|---|---|---|
| publie | `Publié` | #F6FAEF (vert-50) | #557E1B (vert-700) | vert |
| brouillon | `Brouillon` | #F1EFEC (neutral-100) | `--mp-color-neutral-600` #5E5952 | gris clair |
