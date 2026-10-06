# BO — Recrutement (93:21723)

Écran desktop 1440 × 988. Coque : voir `_shell.md` — élément actif **Recrutement** (compteur `2`). Barre supérieure 83px.

## 1. Régions

| Région | Node | Position / taille | Détails |
|---|---|---|---|
| Barre latérale | 93:21724 | 264 × 988 | identique `_shell.md` |
| Barre supérieure | 93:21847 | 1176 × 83 | |
| Contenu | 93:21871 | 1176 × 905 | padding 32px |
| Onglets | 93:21872 | x32 y32 · 245 × 42 | segmenté |
| Tableau — Offres | 93:21881 | y98 · 1112 × 377 | carte tableau standard (radius 16px) |
| En-tête « Dernières candidatures » | 93:22039 | y499 · 1112 × 24 | titre + lien |
| Tableau — Candidatures | 93:22046 | y547 · 1112 × 326 | carte tableau standard |

## 2. Textes et typographie

### Barre supérieure
| Texte | Node | Rôle / style |
|---|---|---|
| `Contenus du site` › `Recrutement` | 93:21850 / 93:21853 | fil d’Ariane |
| `Recrutement` | 93:21854 | titre Poppins SemiBold 24px |
| `Nouvelle offre` | 93:21867 | bouton primaire (icon/plus), 149 × 40, fond #FF7A00 |

### Onglets (93:21872) — segmenté (actif fond blanc + ombre, compteur orange-50/orange-700)
| Onglet | Compteur | État |
|---|---|---|
| `Offres` | `5` | actif |
| `Candidatures` | `14` | inactif |

### Tableau — Offres (93:21881)
Colonnes (en-tête fond #F8F7F5, Inter SemiBold 12px #5E5952) : `Offre` (390px) · `Lieu` (150px) · `Contrat` (120px) · `Candidatures` (110px) · `Statut` (110px) · actions (110px).
Ligne : padding 14px / 20px ; intitulé Inter SemiBold 14px #1C1A18 + méta Inter Regular 12px #5E5952 ; autres cellules Inter Regular 14px #1C1A18 ; actions icon/eye, icon/pencil, icon/more (32 × 32).

| # | Offre | Méta | Lieu | Contrat | Candidatures | Statut |
|---|---|---|---|---|---|---|
| 1 | `Coordinateur·rice de services` | `Publiée le 2 oct. · expire le 2 déc.` | `Douala` | `CDI` | `6 · 2 nouvelles` | `Publié` |
| 2 | `Chargé·e de relation clients diaspora` | `Publiée le 25 sept.` | `France · télétravail` | `CDD 12 mois` | `4` | `Publié` |
| 3 | `Agent·e d’entretien des logements` | `Publiée le 18 sept.` | `Yaoundé` | `Temps partiel` | `3` | `Publié` |
| 4 | `Chauffeur·euse partenaire` | `Publiée le 11 sept.` | `Douala` | `Freelance` | `1` | `Publié` |
| 5 | `Assistant·e administratif·ve` | `Non publiée` | `Douala` | `Stage` | `—` | `Brouillon` |

(Écriture inclusive avec point médian « · » U+00B7 dans les intitulés.)

### Dernières candidatures
- Titre `Dernières candidatures` (Inter SemiBold 16px #1C1A18).
- Lien `Toutes les candidatures` + icon/arrow-right (Inter SemiBold 14px #AD5300).

### Tableau — Candidatures (93:22046)
Colonnes : `Candidat·e` (flexible, 436px) · `Poste visé` (240px) · `Reçue` (100px) · `CV` (120px) · `Statut` (110px).
Ligne : padding 14px / 20px ; avatar 32px (initiales Inter SemiBold 12px) ; nom Inter SemiBold 14px ; sous-ligne Inter Regular 12px #5E5952 ; bouton CV secondaire (fond blanc, bordure #CFCAC3, radius 10px, padding 10px / 14px, icon/download 16px, Inter SemiBold 14px `CV.pdf`).

| # | Avatar | Candidat·e | Sous-ligne | Poste visé | Reçue | CV | Statut |
|---|---|---|---|---|---|---|---|
| 1 | `GN` (#FCE7D5) | `Grace Nkoulou` | `Douala · +237 6 …` | `Coordinateur·rice de services` | `Aujourd’hui` | `CV.pdf` | `Nouveau` |
| 2 | `YT` | `Yannick Tchoua` | `Douala` | `Coordinateur·rice de services` | `Hier` | `CV.pdf` | `Nouveau` |
| 3 | `AM` | `Amélie Moreau` | `Paris` | `Candidature spontanée` | `2 oct.` | `CV.pdf` | `Lu` |
| 4 | `BE` | `Boris Essomba` | `Yaoundé` | `Agent·e d’entretien des logements` | `29 sept.` | `CV.pdf` | `Retenu` |

## 3. Données

**Offre d’emploi** : intitulé, lieu (ville ou `France · télétravail`), typeContrat (`CDI`, `CDD 12 mois`, `Temps partiel`, `Freelance`, `Stage`), datePublication, dateExpiration (facultative), nbCandidatures, nbNouvelles, statut (publie / brouillon).
**Candidature** : candidat (nom, initiales, ville, téléphone), offreId ou « Candidature spontanée », dateReception, fichier CV (PDF), statut (nouveau / lu / retenu / …).
Compteurs : 5 offres, 14 candidatures ; 2 candidatures non lues (badge barre latérale = statut Nouveau).

## 4. Interactions et badges

| Élément | Type |
|---|---|
| `Nouvelle offre` | création |
| Onglets Offres / Candidatures | navigation |
| icon/eye / icon/pencil / icon/more | aperçu / modifier / menu |
| `Toutes les candidatures` | lien vers l’onglet Candidatures |
| `CV.pdf` | téléchargement |

Statuts d’offre : `Publié` (#F6FAEF / #557E1B, pastille verte) · `Brouillon` (#F1EFEC / #5E5952, pastille grise).
Statuts de candidature :
| Valeur | Libellé | Fond | Texte | Pastille |
|---|---|---|---|---|
| nouveau | `Nouveau` | #FDF4EC | #AD5300 | orange |
| lu | `Lu` | #F1EFEC | #5E5952 | gris |
| retenu | `Retenu` | #F6FAEF | #557E1B | vert |
