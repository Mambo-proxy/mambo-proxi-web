# BO — Formations (93:22450)

Écran desktop 1440 × 1012. Coque : voir `_shell.md` — élément actif **Formations**. Barre supérieure 83px.
Les composants (onglets segmentés, cartes tableau, badges, boutons d’action, lien « Tout voir ») sont structurellement identiques à ceux documentés dans `bo-demandes.md`, `bo-services.md` et `bo-recrutement.md` (mêmes dimensions de nœuds) ; styles repris de ces écrans.

## 1. Régions

| Région | Node | Position / taille | Détails |
|---|---|---|---|
| Barre latérale | 93:22451 | 264 × 1012 | identique `_shell.md` |
| Barre supérieure | 93:22574 | 1176 × 83 | |
| Contenu | 93:22598 | 1176 × 929 | padding 32px |
| Onglets | 93:22599 | x32 y32 · 333 × 42 | segmenté avec compteurs |
| Tableau — Formations | 93:22608 | y98 · 1112 × 484 | carte tableau (radius 16px) |
| En-tête demandes | 93:22809 | y606 · 1112 × 24 | titre + lien |
| Tableau — Demandes de formation | 93:22816 | y654 · 1112 × 243 | carte tableau |

## 2. Textes et typographie

### Barre supérieure
| Texte | Node | Rôle / style |
|---|---|---|
| `Contenus du site` › `Formations` | 93:22577 / 93:22580 | fil d’Ariane |
| `Formations` | 93:22581 | titre Poppins SemiBold 24px |
| `Nouvelle formation` | 93:22594 | bouton primaire (icon/plus), 182 × 40, fond #FF7A00 |

### Onglets (93:22599)
| Onglet | Compteur | État |
|---|---|---|
| `Catalogue` | `6` | actif |
| `Demandes de formation` | `4` | inactif |

### Tableau — Formations (93:22608)
Colonnes : `Formation` (264px) · `Catégorie` (150px) · `Durée` (90px) · `Format` (160px) · `Demandes` (90px) · `Statut` (110px) · actions (110px : icon/eye, icon/pencil, icon/more).
Cellule Formation : intitulé Inter SemiBold 14px #1C1A18 (peut tenir sur 2 lignes) + programme Inter Regular 12px #5E5952.

| # | Formation | Programme | Catégorie | Durée | Format | Demandes | Statut |
|---|---|---|---|---|---|---|---|
| 1 | `Accueil et relation client` | `Formation des professionnels` | `Professionnels` | `1 jour` | `Présentiel · Douala` | `3` | `Publié` |
| 2 | `Hygiène et sécurité en cuisine` | `Formation des professionnels` | `Professionnels` | `2 jours` | `Présentiel · Douala` | `2` | `Publié` |
| 3 | `Entretien professionnel des logements` | `Formation des professionnels` | `Professionnels` | `1 jour` | `Présentiel · Yaoundé` | `1` | `Publié` |
| 4 | `Gestion locative : les fondamentaux` | `Formation des professionnels` | `Professionnels` | `2 jours` | `En ligne` | `0` | `Publié` |
| 5 | `Bien préparer son installation au Cameroun` | `Ateliers & sensibilisation` | `Ateliers` | `2 heures` | `En ligne` | `4` | `Publié` |
| 6 | `Accompagner un proche âgé à domicile` | `Ateliers & sensibilisation` | `Sensibilisation` | `3 heures` | `Présentiel · Douala` | `1` | `Publié` |

Badge `Publié` : fond #F6FAEF, texte #557E1B, pastille verte.

### Demandes de formation récentes
- Titre `Demandes de formation récentes` (Inter SemiBold 16px) ; lien `Tout voir` + icon/arrow-right (Inter SemiBold 14px #AD5300).
- Colonnes : `Structure` (366px) · `Formation souhaitée` (280px) · `Participants` (110px) · `Période` (140px) · `Statut` (110px).
- Cellule Structure : nom Inter SemiBold 14px + `Contact · Ville` Inter Regular 12px #5E5952.

| # | Structure | Contact · ville | Formation souhaitée | Participants | Période | Statut |
|---|---|---|---|---|---|---|
| 1 | `Hôtel La Falaise` | `Mme Ekambi · Douala` | `Accueil et relation client` | `12` | `Janvier 2027` | `Nouvelle` |
| 2 | `Association Femmes d’Akwa` | `M. Tchakounté · Douala` | `Accompagner un proche âgé` | `20` | `Décembre 2026` | `En cours` |
| 3 | `Résidences Bastos` | `Mme Owona · Yaoundé` | `Entretien professionnel des logements` | `6` | `Novembre 2026` | `Nouvelle` |

Remarques : l’onglet indique 4 demandes, 3 lignes affichées (« récentes »). La formation souhaitée de la ligne 2 est un libellé abrégé (`Accompagner un proche âgé` vs `Accompagner un proche âgé à domicile`).

## 3. Données

**Formation** : intitulé, programme (`Formation des professionnels` / `Ateliers & sensibilisation`), catégorie (`Professionnels` / `Ateliers` / `Sensibilisation`), durée (texte : `1 jour`, `2 jours`, `2 heures`, `3 heures`), format (`Présentiel · {ville}` / `En ligne`), nbDemandes, statut (publie / brouillon).
**Demande de formation** : structure, contact (civilité + nom), ville, formationId ou libellé, participants (nombre), période souhaitée (mois année), statut (nouvelle / en_cours / …).

## 4. Interactions et badges

| Élément | Type |
|---|---|
| `Nouvelle formation` | création |
| Onglets Catalogue / Demandes de formation | navigation |
| icon/eye / icon/pencil / icon/more | aperçu / modifier / menu |
| `Tout voir` | onglet Demandes de formation |

Badges : formations `Publié` (vert) ; demandes de formation `Nouvelle` (#FDF4EC / #AD5300, pastille orange) et `En cours` (#F1EFEC / #2E2B28, pastille gris foncé) — même jeu que les demandes clients.
