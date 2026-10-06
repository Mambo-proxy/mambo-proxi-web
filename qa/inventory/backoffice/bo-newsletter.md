# BO — Newsletter (94:11509)

Écran desktop 1440 × 1030. Coque : voir `_shell.md` — élément actif **Newsletter** (groupe RELATIONS). Barre supérieure 83px.

## 1. Régions

| Région | Node | Position / taille | Détails |
|---|---|---|---|
| Barre latérale | 94:11510 | 264 × 1030 | identique `_shell.md` |
| Barre supérieure | 94:11633 | 1176 × 83 | |
| Contenu | 94:11664 | 1176 × 947 | padding 32px |
| Rangée KPI | 94:11665 | y32 · 1112 × 156 | 4 cartes KPI |
| Rangée | 94:11714 | y212 · 1112 × 703 | Envois 652px + Composer 440px, écart 20px |
| Envois | 94:11715 | 652 × 406 | titre + tableau |
| Composer (Nouvel envoi) | 94:11779 | 440 × 703 | carte blanche, bordure #E4E1DC, radius 16px, padding 24px |

## 2. Textes et typographie

### Barre supérieure
| Texte | Node | Rôle / style |
|---|---|---|
| `Relations` › `Newsletter` | 94:11636 / 94:11639 | fil d’Ariane |
| `Newsletter` | 94:11640 | titre Poppins SemiBold 24px |
| `Exporter les inscrits` | 94:11653 | bouton secondaire (icon/download), 191 × 42 |
| `Nouvel envoi` | 94:11659 | bouton primaire (icon/mail), 140 × 40, fond #FF7A00 |

### KPI (94:11665) — composant KPI standard
| KPI | Icône | Valeur | Évolution | Légende |
|---|---|---|---|---|
| `Inscrits` | icon/users | `1 248` | `+56` | `ce mois-ci` |
| `Taux d’ouverture` | icon/eye | `46 %` | `+4 pts` | `dernier envoi` |
| `Taux de clic` | icon/arrow-up-right | `9 %` | — | — |
| `Désinscriptions` | icon/logout | `0,4 %` | — | — |

### Envois (94:11715)
Titre `Envois` (Inter SemiBold 16px). Tableau : colonnes `Objet` (232px) · `Destinataires` (120px) · `Ouverture` (90px) · `Statut` (120px). Objet : Inter SemiBold 14px (2 lignes possibles) + méta Inter Regular 12px #5E5952.

| # | Objet | Méta | Destinataires | Ouverture | Statut |
|---|---|---|---|---|---|
| 1 | `Novembre : sorties culturelles et nouveaux services` | `Programmée le 2 nov. · 09:00` | `1 248` | `—` | `Programmée` |
| 2 | `Octobre : préparer son installation au Cameroun` | `Envoyée le 5 oct.` | `1 192` | `46 %` | `Envoyée` |
| 3 | `Septembre : la rentrée avec Mambo` | `Envoyée le 7 sept.` | `1 130` | `42 %` | `Envoyée` |
| 4 | `Brouillon sans titre` | `Modifié hier` | `—` | `—` | `Brouillon` |

### Composer — `Nouvel envoi` (94:11779)
- Titre `Nouvel envoi` (Inter SemiBold 16px) ; sous-titre `Rédigez, prévisualisez, programmez` (Inter Regular 13px #5E5952).
- Champ `Objet` `*` (astérisque #AD5300) — zone de saisie 390 × 78 (bordure #CFCAC3, radius 12px, Inter Regular 16px) : `Novembre : sorties culturelles et nouveaux services`.
- `Destinataires` — puces de segments (style puces de l’éditeur de service : sélectionnée fond #1C1A18 texte blanc + icon/check 14px ; non sélectionnée fond blanc, bordure #CFCAC3) :
  | Segment | État |
  |---|---|
  | `Tous les inscrits (1 248)` | sélectionné |
  | `France` | non |
  | `Cameroun` | non |
  | `Professionnels` | non |
- Barre d’outils (94:11803) : fond #F8F7F5, radius 10px, padding 6px, gap 4px ; boutons fond blanc radius 6px padding 6px / 10px, Inter SemiBold 12px #1C1A18 : `B` · `I` · `Lien` · `Image` · `Bouton`.
- Contenu (94:11814) : bordure 1px #CFCAC3, radius 12px, padding 16px, gap 10px :
  - `Bonjour {prénom},` (Inter Regular 14px #1C1A18 ; variable de fusion `{prénom}`)
  - `Ce mois-ci, découvrez nos nouvelles sorties culturelles à Douala et Kribi, et notre nouveau service de visites guidées…` (Inter Regular 14px / lh 21px #5E5952)
  - bloc image 356 × 90, fond #F8F7F5, radius 10px, icon/image 20px.
- Actions : `Aperçu` (secondaire, icon/eye) · `Test` (secondaire, icon/send) · `Programmer` (primaire #FF7A00, icon/calendar, 186 × 40).

## 3. Données

**Campagne (envoi)** : objet, contenu (riche : gras, italique, lien, image, bouton ; variable `{prénom}`), segment(s) destinataires, nbDestinataires, tauxOuverture, (tauxClic), statut (brouillon / programmee / envoyee), dateProgrammation, dateEnvoi, dateModification.
**Segments** : tous les inscrits (1 248), France, Cameroun, Professionnels.
**Abonné** : voir Contact (champ newsletter).
KPI : inscrits 1 248 (+56 ce mois) ; ouverture 46 % (+4 pts vs envoi précédent) ; clic 9 % ; désinscriptions 0,4 %.

## 4. Interactions et badges

| Élément | Type |
|---|---|
| `Exporter les inscrits` | export CSV |
| `Nouvel envoi` | ouvre / réinitialise le composeur |
| Ligne d’envoi | ouvrir / dupliquer |
| Puces destinataires | multi-sélection de segments |
| B / I / Lien / Image / Bouton | mise en forme |
| `Aperçu` / `Test` / `Programmer` | prévisualiser / envoi test / planifier |

Statuts d’envoi :
| Valeur | Libellé | Fond | Texte | Pastille |
|---|---|---|---|---|
| programmee | `Programmée` | #FDF4EC | #AD5300 | orange |
| envoyee | `Envoyée` | #F6FAEF | #557E1B | vert |
| brouillon | `Brouillon` | #F1EFEC | #5E5952 | gris |
