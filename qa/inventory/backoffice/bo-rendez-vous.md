# BO — Rendez-vous (93:11364)

Écran desktop 1440 × 900. Coque : voir `_shell.md` — élément actif **Rendez-vous** (compteur `3`). Barre supérieure 83px.

## 1. Régions

| Région | Node | Position / taille | Détails |
|---|---|---|---|
| Barre latérale | 93:11365 | 264 × 900 | identique `_shell.md` |
| Barre supérieure | 93:11488 | 1176 × 83 | |
| Contenu | 93:11517 | 1176 × 737 | padding 32px |
| Barre semaine + vue | 93:11518 | 1112 × 42 | space-between |
| Rangée | 93:11534 | y98 · 1112 × 607 | calendrier 752px + colonne « À confirmer » 340px, écart 20px |
| Calendrier | 93:11535 | 752 × 607 | carte (bordure #E4E1DC, radius 16px) : en-tête jours 45px + grille 560px |
| À confirmer | 93:11650 | 340 × 604 | titre + 3 cartes + encart info, gap 12px |

## 2. Textes et typographie

### Barre supérieure
| Texte | Node | Rôle / style |
|---|---|---|
| `Pilotage` › `Rendez-vous` | 93:11491 / 93:11494 | fil d’Ariane |
| `Rendez-vous` | 93:11495 | titre Poppins SemiBold 24px |
| `Créneaux disponibles` | 93:11508 | bouton secondaire (icon/clock 16px), 203 × 42, fond blanc, bordure #CFCAC3 |
| `Ajouter` | 93:11513 | bouton primaire (icon/plus), 103 × 40, fond #FF7A00, texte #1C1A18 |

### Barre semaine (93:11518)
- Bouton précédent 32 × 32 radius 8px (icon/arrow-left 16px) · libellé `Semaine du 9 au 14 novembre 2026` (Inter SemiBold 16px / lh 24px #1C1A18) · bouton suivant (icon/chevron-right 16px). Remarque : icônes précédent/suivant non symétriques dans la maquette (arrow-left vs chevron-right).
- Sélecteur de vue (segmenté, fond #F1EFEC radius 12px) : `Jour` (inactif) · `Semaine` (**actif**, fond blanc + ombre, Inter SemiBold 13px) · `Mois` (inactif, Inter Medium 13px #5E5952).

### Calendrier (93:11535)
- En-têtes de jours (93:11536, 44px) : colonne heures 56px vide puis 6 colonnes de 115,67px : `Lun 9`, `Mar 10`, `Mer 11`, `Jeu 12`, `Ven 13`, `Sam 14` (pas de dimanche).
- Colonne heures : `08:00`, `09:00`, `10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00` (56px par heure, libellés Inter 12px #5E5952 en haut de case).
- Colonnes jour : bordure gauche 1px #E4E1DC ; lignes horaires 1px `--mp-color-neutral-100` #F1EFEC.
- Événement : position left 3px, largeur 107,67px, radius 8px, padding 6px / 8px, gap 2px, **bordure gauche 3px** ; titre Inter SemiBold 11px / lh 16px #1C1A18 ; sous-ligne Inter Regular 10px / lh 16px #5E5952.
  - **À confirmer** : fond `--mp-color-orange-50` #FDF4EC, bordure gauche #FF7A00.
  - **Confirmé** : fond `--mp-color-vert-50` #F6FAEF, bordure gauche `--mp-color-vert-500` #7DB928.

| Jour | Heure | Titre (motif · nom) | Sous-ligne (heure · format/lieu) | Hauteur | État |
|---|---|---|---|---|---|
| Lun 9 | 09:00 | `Devis · Chef privé` | `09:00 · Téléphone` | 52 (≈1 h) | confirmé (vert) |
| Mar 10 | 10:00 | `Immobilier · Ruth A.` | `10:00 · Agence Douala` | 80 (≈1 h 30) | confirmé (vert) |
| Mer 11 | — | (aucun) | | | |
| Jeu 12 | 14:00 | `Immobilier · Sandrine M.` | `14:00 · Visio` | 52 | à confirmer (orange) |
| Ven 13 | 09:00 | `Partenariat · Saveurs de Douala` | `09:00 · Agence` | 52 (texte débordant sur 3 lignes) | à confirmer (orange) |
| Ven 13 | 15:00 | `Recrutement · entretien` | `15:00 · Visio` | 52 | confirmé (vert) |
| Sam 14 | 10:00 | `Devis · Événement` | `10:00 · Téléphone` | 52 | à confirmer (orange) |

### Colonne « À confirmer » (93:11650)
- En-tête : `À confirmer` (Inter SemiBold 16px) + compteur `3` (pilule).
- Carte : fond blanc, bordure #E4E1DC, radius 16px, padding 18px, gap 10px ; nom Inter SemiBold 14px #1C1A18 ; motif · format Inter Regular 12px #5E5952 ; date icon/calendar 14px + Inter Medium 13px #1C1A18 ; 2 boutons égaux (gap 8px) : `Confirmer` (primaire #FF7A00, icon/check 16px, texte #1C1A18) et `Autre créneau` (secondaire, fond blanc, bordure #CFCAC3).

| Nom | Motif · format | Date · heure |
|---|---|---|
| `Sandrine M.` | `Immobilier · Visio` | `Jeu 12 nov. · 14:00` |
| `Saveurs de Douala` | `Partenariat · Agence` | `Ven 13 nov. · 09:00` |
| `Famille Ndzana` | `Devis · Événement · Téléphone` | `Sam 14 nov. · 10:00` |

- Encart info (93:11703, icon/info 16px) : `À la confirmation, le client reçoit automatiquement un e-mail et un rappel la veille.` (Inter Regular 12px, style encart d’information identique à l’écran Demandes : fond clair radius 12px padding 12px).

## 3. Données — entité Rendez-vous

| Champ | Valeurs observées |
|---|---|
| date / heureDebut / durée | 9–14 nov. 2026, 09:00–15:00, 1 h (1 h 30 pour Ruth A.) |
| motif (catégorie) | `Devis`, `Immobilier`, `Partenariat`, `Recrutement` |
| objet (service / précision) | `Chef privé`, `Événement`, `entretien` |
| contact (nom) | `Ruth A.`, `Sandrine M.`, `Saveurs de Douala` (partenaire), `Famille Ndzana` |
| format / lieu | `Téléphone`, `Visio`, `Agence`, `Agence Douala` |
| statut | a_confirmer (orange) / confirme (vert) |
| lien éventuel | demande, partenaire, candidature |

Disponibilités : gérées via `Créneaux disponibles` (plage visible 08:00–17:00, lundi→samedi). Notification : e-mail de confirmation + rappel la veille.

## 4. Interactions

| Élément | Type |
|---|---|
| ‹ / › semaine | navigation temporelle |
| Jour / Semaine / Mois | changement de vue |
| `Créneaux disponibles` | gestion des disponibilités |
| `Ajouter` | création de rendez-vous |
| Événement du calendrier | ouverture du détail |
| `Confirmer` | statut → confirmé (envoi e-mail + rappel J-1) |
| `Autre créneau` | proposer un autre créneau |

Statuts de rendez-vous :
| Valeur | Libellé | Fond | Bordure gauche |
|---|---|---|---|
| a_confirmer | `À confirmer` | #FDF4EC | #FF7A00 |
| confirme | (confirmé) | #F6FAEF | #7DB928 |
