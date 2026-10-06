# BO — Demandes (87:10782)

Écran desktop 1440 × 1173. Coque : voir `_shell.md` — élément actif **Demandes** (fond #FDF4EC). Barre supérieure spécifique (83px de haut) avec fil d’Ariane et bouton secondaire « Exporter » à la place de « Nouveau service ».

## 1. Régions

| Région | Node | Position / taille | Détails |
|---|---|---|---|
| Barre latérale | 87:10783 | 264 × 1173 | identique `_shell.md` ; compteurs 12 / 3 / 4 / 2 |
| Barre supérieure | 87:10906 | 1176 × 83 | padding 16px / 32px, bordure basse #E4E1DC |
| Contenu | 87:10932 | 1176 × 1090 | padding 32px |
| Barre onglets + filtres | 87:10933 | x32 y32 · 1112 × 42 | space-between |
| Rangée | 87:10968 | y98 · 1112 × 960 | liste 672px + panneau détail 420px, écart 20px |
| Tableau — Demandes | 87:10970 | 672 × 633 | carte blanche, bordure #E4E1DC, radius 16px, overflow masqué |
| Détail de la demande | 87:11129 | 420 × 960 | carte blanche, bordure #E4E1DC, radius 16px, padding 24px, gap 20px |

## 2. Textes et typographie

### Barre supérieure (87:10906)
| Texte | Node | Rôle | Typo |
|---|---|---|---|
| `Pilotage` › `Demandes` | 87:10909 / 87:10912 | fil d’Ariane (groupe › page), séparateur icon/chevron-right 12px, gap 6px | Inter Regular 12px / lh 16px, #5E5952 |
| `Demandes` | 87:10913 | titre de page | Poppins SemiBold 24px / lh 32px, #1C1A18 |
| `Rechercher…` / `⌘K` | 87:10919 / 87:10920 | recherche globale (identique coque) | |
| `Exporter` | 87:10931 | bouton secondaire, icon/download 16px | fond #FFFFFF, bordure 1px `--mp-color-border-strong` #CFCAC3, radius 10px, padding 10px / 14px ; Inter SemiBold 14px #1C1A18 |

### Onglets de statut (87:10934)
Conteneur fond #F1EFEC, radius 12px, padding 4px, gap 4px. Onglet : padding 7px / 12px, radius 9px, gap 6px, texte 13px / lh 20px. Compteur : pilule radius 999px, padding 1px / 7px, Inter SemiBold 11px / lh 16px.

| Onglet | Node | Compteur | État / style |
|---|---|---|---|
| `Toutes` | 87:10935 | `58` | **actif** : fond #FFFFFF + ombre elevation/1, texte Inter SemiBold #1C1A18 ; compteur fond #FDF4EC texte `--mp-color-orange-700` #AD5300 |
| `Nouvelles` | 87:10939 | `12` | inactif : Inter Medium #5E5952 ; compteur fond `--mp-color-neutral-200` #E4E1DC, texte #5E5952 |
| `En cours` | 87:10943 | `18` | inactif |
| `Prestation réalisée` | 87:10947 | `21` | inactif |
| `Clôturées` | 87:10951 | `7` | inactif |

(12 + 18 + 21 + 7 = 58.)

### Filtres (87:10955) — menus déroulants
Bouton : fond #FFFFFF, bordure 1px #E4E1DC, radius 10px, padding 9px / 12px, gap 8px ; Inter Medium 13px / lh 20px #1C1A18 ; icon/chevron-down 14px. Gap 8px.
| Libellé par défaut | Node | Filtre |
|---|---|---|
| `Toutes les rubriques` | 87:10956 | rubrique |
| `Tous les pays` | 87:10960 | pays |
| `30 derniers jours` | 87:10964 | période |

### Tableau — Demandes (87:10970)
- En-tête : fond #F8F7F5, bordure basse #E4E1DC, padding 12px / 20px, gap 16px ; Inter SemiBold 12px / lh 16px #5E5952.
- Colonnes : `Client` (flexible) · `Service` (200px) · `Reçue le` (110px) · `Statut` (150px). Pas de colonne d’actions sur cet écran.
- Ligne : padding 14px / 20px, gap 16px, séparateur bas #E4E1DC ; **ligne sélectionnée** (ligne 1) fond `--mp-color-orange-50` #FDF4EC ; autres fond #FFFFFF.
- Client : avatar 32px rond (initiales Inter SemiBold 12px #1C1A18), nom Inter SemiBold 14px #1C1A18, localisation Inter Regular 12px #5E5952.
- Service : nom Inter SemiBold 14px #1C1A18 + rubrique Inter Regular 12px #5E5952.
- Reçue le : Inter Regular 14px #1C1A18, format `J mois. · HH:MM`.

| # | Avatar / fond | Client | Localisation | Service | Rubrique | Reçue le | Statut |
|---|---|---|---|---|---|---|---|
| 1 (sélectionnée) | `AK` / #F8CFAA | `Aurélie K.` | `Paris, France` | `Chef privé` | `Expérience` | `5 oct. · 09:12` | `Nouvelle` |
| 2 | `PE` / #D5EAB8 | `Patrick E.` | `Marseille, France` | `Découverte du Cameroun` | `Culture` | `5 oct. · 06:40` | `Nouvelle` |
| 3 | `RA` / #FCE7D5 | `Ruth A.` | `Bruxelles, Belgique` | `Logement temporaire` | `Immobilier` | `4 oct. · 18:05` | `Nouvelle` |
| 4 | `SM` / #E4E1DC | `Sandrine M.` | `Lyon, France` | `Gestion locative` | `Immobilier` | `4 oct. · 11:30` | `En cours` |
| 5 | `HD` / #FCE7D5 | `Hervé D.` | `Douala` | `Réception de colis` | `Proximité` | `4 oct. · 09:02` | `Prestation réalisée` |
| 6 | `CN` / #EAF5DB | `Clarisse N.` | `Paris, France` | `Portage de repas` | `Proximité` | `3 oct. · 15:44` | `En cours` |
| 7 | `JT` / #D5EAB8 | `Jean-Marc T.` | `Yaoundé` | `Chef privé` | `Expérience` | `2 oct. · 20:10` | `Prestation réalisée` |
| 8 | `LB` / #F1EFEC | `Laure B.` | `Douala` | `Services événementiels` | `Expérience` | `1 oct. · 13:25` | `Clôturée` |

Remarques : libellés de rubrique courts dans la liste (`Culture`, `Proximité`) vs libellés longs du tableau de bord (`Culture & événementiel`, `Services de proximité`). Les localisations camerounaises n’ont que la ville (`Douala`, `Yaoundé`). Sur la capture, `Bruxelles, Belgique` et `Marseille, France` débordent la colonne Client (troncature à prévoir).

Pied (87:11116) : bordure haute #E4E1DC, padding 12px / 20px.
- `Affichage de 1 à 8 sur 58 demandes` — Inter Regular 12px #5E5952.
- Pagination : boutons 30 × 30, radius 8px, gap 6px, Inter SemiBold 12px : `‹`, `1` (**actif** : fond #1C1A18, texte #FFFFFF), `2`, `3`, `›` (inactifs : fond #FFFFFF, bordure #E4E1DC, texte #1C1A18).

### Panneau « Détail de la demande » (87:11129)
| Texte | Node | Rôle | Typo |
|---|---|---|---|
| `MP-2026-0142` | 87:11132 | référence de la demande | Inter Regular 12px #5E5952 |
| `Chef privé` | 87:11133 | titre = service demandé | Poppins SemiBold 20px / lh 28px (`h4`), #1C1A18 |
| (icône) | 87:11134 | bouton fermer, icon/close 16px, 32 × 32 radius 8px | |

Bloc client (87:11137) : fond #F8F7F5, radius 14px, padding 14px, gap 12px.
| Texte | Node | Typo |
|---|---|---|
| Avatar `AK` (40px, fond #F8CFAA) | 87:11139 | Inter SemiBold 14px #1C1A18 |
| `Aurélie Kamga` | 87:11141 | Inter SemiBold 14px #1C1A18 (nom complet) |
| `aurelie.k@email.com · +33 6 12 34 56 78` | 87:11142 | Inter Regular 12px #5E5952 |
| `Paris, France · contact préféré : WhatsApp` | 87:11143 | Inter Regular 12px #5E5952 (espace avant « : » à la française) |

Actions rapides (87:11144) — 3 boutons secondaires égaux (flex 1), gap 8px ; fond #FFFFFF, bordure 1px #CFCAC3, radius 10px, padding 10px / 14px ; Inter SemiBold 14px #1C1A18 :
| Libellé | Icône | Node |
|---|---|---|
| `WhatsApp` | icon/whatsapp | 87:11145 |
| `E-mail` | icon/mail | 87:11150 |
| `Appeler` | icon/phone | 87:11155 |

Informations (87:11160) — lignes clé/valeur, gap 10px ; clé Inter Regular 14px #5E5952, valeur Inter SemiBold 14px #1C1A18 alignée à droite :
| Clé | Valeur |
|---|---|
| `Rubrique` | `Expérience` |
| `Date souhaitée` | `Samedi 14 nov. 2026` |
| `Ville` | `Douala` |
| `Personnes` | `12` |
| `Occasion` | `Anniversaire` |

Besoin (87:11176) : bordure 1px #E4E1DC, radius 12px, padding 14px, gap 6px.
- `Besoin exprimé` — Inter SemiBold 12px #5E5952.
- `« Dîner pour les 60 ans de ma mère, cuisine camerounaise revisitée, un invité végétarien. »` — Inter Regular 14px / lh 21px #1C1A18 (guillemets français « » avec espaces).

Statut (87:11179) :
- `Statut de la demande` — Inter SemiBold 14px #1C1A18.
- Sélecteur d’étapes (87:11181), 4 segments égaux, gap 4px, padding 8px / 4px, radius 8px, Inter SemiBold 12px :
  | Étape | Node | État |
  |---|---|---|
  | `Nouvelle` | 87:11182 | **courante** : fond #1C1A18, texte #FFFFFF |
  | `En cours` | 87:11184 | fond #FFFFFF, bordure #E4E1DC, texte #1C1A18 |
  | `Réalisée` | 87:11186 | idem |
  | `Clôturée` | 87:11188 | idem |
- Encart info (87:11190) : fond `--mp-color-vert-50` #F6FAEF, radius 12px, padding 12px, icon/info 16px ; texte `En passant à « Prestation réalisée », le questionnaire de satisfaction est envoyé automatiquement au client.` Inter Regular 12px / lh 17px `--mp-color-vert-800` #426215.

Notes internes (87:11195) :
- Libellé `Notes internes` Inter SemiBold 14px #1C1A18.
- Zone de saisie 370 × 72 : fond #FFFFFF, bordure 1px #CFCAC3, radius 12px, padding 14px / 16px ; placeholder `Ajouter une note pour l’équipe…` Inter Regular 16px / lh 24px #7D776F.

Historique (87:11200) — `Historique` (Inter SemiBold 14px) puis entrées (puce 8px orange, texte Inter Regular 12px #1C1A18, horodatage Inter Regular 12px #7D776F à droite) :
| Événement | Horodatage |
|---|---|
| `Demande reçue via le formulaire` | `5 oct. · 09:12` |
| `Accusé de réception envoyé au client` | `5 oct. · 09:12` |

Pied (87:11210) :
- `Préparer le devis` — bouton primaire pleine largeur (flex 1), fond #FF7A00, radius 10px, padding 10px / 14px, icon/file-text 16px, Inter SemiBold 14px #1C1A18.
- Bouton icône 38 × 38 (icon/more), fond #FFFFFF, bordure #CFCAC3, radius 10px — menu d’actions supplémentaires.

## 3. Données — entité Demande

| Champ | Exemple | Source affichage |
|---|---|---|
| reference | `MP-2026-0142` | panneau |
| client.prenom/nom | `Aurélie Kamga` (liste : `Aurélie K.`) | liste + panneau |
| client.initiales / couleur avatar | `AK` / #F8CFAA | |
| client.email | `aurelie.k@email.com` | panneau |
| client.telephone | `+33 6 12 34 56 78` | panneau |
| client.localisation (ville, pays) | `Paris, France` | liste + panneau |
| client.contactPrefere | `WhatsApp` | panneau |
| service (nom) | `Chef privé` | liste + titre panneau |
| rubrique | `Expérience` | liste + panneau |
| recueLe (datetime) | `5 oct. · 09:12` | liste |
| statut | `Nouvelle` / `En cours` / `Prestation réalisée` / `Clôturée` | badge |
| champs spécifiques au service : dateSouhaitee, ville, personnes, occasion | `Samedi 14 nov. 2026`, `Douala`, `12`, `Anniversaire` | panneau |
| besoin (texte libre) | « Dîner pour les 60 ans… » | panneau |
| notesInternes | (vide) | panneau |
| historique[] (libellé, horodatage) | 2 entrées | panneau |

Compteurs par statut : Toutes 58 · Nouvelles 12 · En cours 18 · Prestation réalisée 21 · Clôturées 7. Pagination 8 par page (3 pages affichées).

## 4. Interactions et badges

| Élément | Type |
|---|---|
| Onglets de statut avec compteurs | filtre segmenté |
| `Toutes les rubriques`, `Tous les pays`, `30 derniers jours` | menus déroulants (filtres) |
| Ligne du tableau | sélection → ouvre le panneau détail (ligne surlignée #FDF4EC) |
| Pagination ‹ 1 2 3 › | navigation pages |
| `Exporter` | export (CSV) de la liste filtrée |
| Fermer (×) | ferme le panneau |
| `WhatsApp` / `E-mail` / `Appeler` | liens wa.me / mailto / tel |
| Étapes de statut | changement de statut (étape courante en noir) ; passage à « Prestation réalisée » déclenche l’envoi du questionnaire |
| `Notes internes` | textarea |
| `Préparer le devis` | action primaire |
| `…` | menu secondaire |

Badges de statut (pilule, pastille 6px, Inter SemiBold 12px) :
| Valeur | Libellé | Fond | Texte | Pastille |
|---|---|---|---|---|
| nouvelle | `Nouvelle` | #FDF4EC (orange-50) | #AD5300 (orange-700) | orange #FF7A00 |
| en_cours | `En cours` | #F1EFEC (neutral-100) | #2E2B28 (neutral-800) | gris foncé |
| realisee | `Prestation réalisée` (étape : `Réalisée`) | #F6FAEF (vert-50) | #557E1B (vert-700) | vert |
| cloturee | `Clôturée` | #F1EFEC (neutral-100) | #7D776F (neutral-500) | gris clair |
