# BO — Tableau de bord (85:10235)

Écran desktop 1440 × 1372. Coque : voir `_shell.md` (élément actif : **Tableau de bord** ; titre barre supérieure « Tableau de bord » ; bouton principal « Nouveau service »).
Zone de contenu 85:10378 : 1176 × 1297, padding 32px, sections empilées avec 24px d’écart ; fond de page clair (capture ≈ `--mp-color-neutral-50` #F8F7F5).

Conventions de carte : fond #FFFFFF, bordure 1px `--mp-color-border-default` #E4E1DC, radius 16px.

## 1. Régions

| Région | Node | Position / taille | Détails |
|---|---|---|---|
| Accueil | 85:10379 | x32 y32 · 1112 × 64 | flex space-between |
| Rangée KPI | 85:10390 | y120 · 1112 × 156 | 4 cartes, gap 16px, padding carte 20px, gap interne 12px |
| Rangée graphiques | 85:10444 | y300 · 1112 × 362 | carte « Demandes reçues » 696 × 362 (padding 24px, gap 20px) + carte « Par rubrique » 400 × 342 (padding 24px, gap 18px) |
| Rangée tableau / à faire | 85:10519 | y686 · 1112 × 427 | « Dernières » 696 × 413 + « À faire » 400 × 427 (padding 24px, gap 6px) |
| Rangée indicateurs secondaires | 85:10702 | y1137 · 1112 × 128 | 3 cartes 360 × 128, padding 20px, gap 8px |

## 2. Textes verbatim et typographie

### Accueil (85:10379)
| Texte | Node | Rôle | Typo |
|---|---|---|---|
| `Bonjour Mireille` | 85:10381 | titre de bienvenue (prénom de l’utilisateur connecté) | Poppins SemiBold 28px / lh 36px, tracking −0,28px, #1C1A18 |
| `Lundi 5 octobre 2026 · voici ce qui se passe sur Mambo Proxi.` | 85:10382 | sous-titre (date du jour en toutes lettres + « · ») | Inter Regular 16px / lh 24px (`body/md`), #5E5952 |

Sélecteur de période (85:10383) : conteneur fond #F1EFEC, radius 12px, padding 4px, gap 4px. Onglets 34px de haut, padding 7px / 12px, radius 9px, texte 13px / lh 20px, tracking 0,065px.
| Onglet | Node | État |
|---|---|---|
| `7 jours` | 85:10384 | inactif — Inter Medium 13px #5E5952, sans fond |
| `30 jours` | 85:10386 | **actif** — fond #FFFFFF + ombre `elevation/1` (0 1 2 #3815360F ; 0 1 3 #3815361A), Inter SemiBold 13px #1C1A18 |
| `12 mois` | 85:10388 | inactif |

### Cartes KPI (85:10390)
Libellé : Inter Medium 13px / lh 20px #5E5952. Icône dans pastille 32 × 32 fond #F8F7F5 radius 9px (icône 16px). Valeur : Poppins SemiBold 32px / lh 38px, tracking −0,64px, #1C1A18. Badge d’évolution : fond `--mp-color-vert-50` #F6FAEF, radius 6px, padding 2px / 6px, icon/trend 12px + texte Inter SemiBold 12px / lh 16px `--mp-color-vert-700` #557E1B ; légende Inter Regular 12px #5E5952.

| KPI | Node | Icône | Valeur | Évolution | Légende |
|---|---|---|---|---|---|
| `Nouvelles demandes` | 85:10391 | icon/file-text | `12` | `+4` | `vs semaine dernière` |
| `Devis en cours` | 85:10407 | icon/mail | `18` | — (aucun badge) | — |
| `Prestations réalisées` | 85:10415 | icon/check-circle | `27` | `+12 %` | `ce mois-ci` |
| `Satisfaction moyenne` | 85:10430 | icon/star | `4,8 / 5` | `+0,1` | `sur 30 jours` |

### Graphique « Demandes reçues » (85:10445)
- Titre `Demandes reçues` — Inter SemiBold 16px / lh 24px #1C1A18.
- Sous-titre `Par semaine, toutes rubriques confondues` — Inter Regular 13px / lh 16px, tracking 0,13px, #5E5952.
- Légende : carré 10 × 10 radius 3px #FF7A00 + `Demandes` (Inter Regular 12px #5E5952).
- Zone 648 × 250 : axe Y graduations `0`, `5`, `10`, `15` (Inter Regular 11px #7D776F), lignes 1px #E4E1DC, largeur 608px. Barres 30,4px de large, coins supérieurs 4px ; couleur `--mp-color-orange-300` #F8B272, barre mise en évidence (survol / semaine courante) `--mp-color-brand-primary` #FF7A00.
- Infobulle (85:20777) : fond `--mp-color-neutral-900` #1C1A18, radius 10px, padding 8px / 12px ; `Semaine 40` (Inter Regular 11px `--mp-color-neutral-300` #CFCAC3) ; `14 demandes` (Inter SemiBold 14px #FFFFFF).

Série (valeurs déduites de la hauteur : 220px = 15) :

| Semaine (libellé axe X) | Valeur | Mise en évidence |
|---|---|---|
| `S30` | 5 | non |
| `S31` | 8 | non |
| `S32` | 6 | non |
| `S33` | 9 | non |
| `S34` | 11 | non |
| `S35` | 7 | non |
| `S36` | 10 | non |
| `S37` | 13 | non |
| `S38` | 12 | non |
| `S39` | 9 | non |
| `S40` | 14 | **oui** (orange plein, infobulle) |
| `S41` | 12 | non |

### Graphique « Demandes par rubrique » (85:10489)
- Titre `Demandes par rubrique` (Inter SemiBold 16px), sous-titre `30 derniers jours` (Inter Regular 13px #5E5952).
- Chaque ligne : libellé Inter Regular 14px #1C1A18, valeur Inter SemiBold 14px ; piste 8px fond #F1EFEC radius 999px ; remplissage #FF7A00 (largeur proportionnelle au maximum).

| Rubrique | Node | Valeur | Largeur barre (/350) |
|---|---|---|---|
| `Immobilier` | 85:10494 | `21` | 350 (100 %) |
| `Expérience` | 85:10500 | `17` | 283 |
| `Services de proximité` | 85:10506 | `9` | 150 |
| `Culture & événementiel` | 85:10512 | `6` | 100 |

Pied : `53 demandes au total · Immobilier en tête` (Inter Regular 12px #5E5952).

### Dernières demandes (85:10520)
- Titre `Dernières demandes` (Inter SemiBold 16px #1C1A18).
- Lien `Tout voir` + icon/arrow-right 16px — Inter SemiBold 14px `--mp-color-text-brand` #AD5300 (vers l’écran Demandes).
- Tableau (85:10528) : carte radius 16px, overflow masqué. En-tête : fond #F8F7F5, bordure basse #E4E1DC, padding 12px / 20px, gap 16px ; libellés Inter SemiBold 12px #5E5952.
- Colonnes : `Client` (flexible) · `Service` (190px) · `Reçue` (90px) · `Statut` (150px) · colonne actions (32px, sans libellé).
- Lignes : fond #FFFFFF, padding 14px / 20px, séparateur bas #E4E1DC (sauf dernière). Avatar 32px rond, initiales Inter SemiBold 12px #1C1A18 ; nom Inter SemiBold 14px ; lieu Inter Regular 12px #5E5952 ; service et date Inter Regular 14px #1C1A18. Bouton action 32 × 32 radius 8px, icon/more 16px (menu contextuel).

| # | Avatar (initiales / fond) | Client | Lieu | Service | Reçue | Statut |
|---|---|---|---|---|---|---|
| 1 | `AK` / #F8CFAA | `Aurélie K.` | `Paris, France` | `Chef privé` | `Il y a 2 h` | `Nouvelle` |
| 2 | `PE` / #D5EAB8 | `Patrick E.` | `Marseille, France` | `Découverte du Cameroun` | `Il y a 5 h` | `Nouvelle` |
| 3 | `SM` / #E4E1DC | `Sandrine M.` | `Lyon, France` | `Gestion locative` | `Hier` | `En cours` |
| 4 | `HD` / #FCE7D5 | `Hervé D.` | `Douala` | `Réception de colis` | `Hier` | `Prestation réalisée` |
| 5 | `CN` / #EAF5DB | `Clarisse N.` | `Paris, France` | `Portage de repas` | `3 oct.` | `En cours` |

Format « Reçue » : relatif (`Il y a N h`, `Hier`) puis date courte (`3 oct.`).

### À faire aujourd’hui (85:10644)
- Titre `À faire aujourd’hui` (apostrophe typographique ’) — Inter SemiBold 16px #1C1A18.
- Sous-titre `5 actions en attente` — Inter Regular 13px #5E5952.
- Lignes : padding 12px / 4px, séparateur bas #E4E1DC, gap 12px ; pastille icône 36 × 36 radius 10px ; libellé Inter Regular 14px #1C1A18 ; compteur fond `--mp-color-neutral-900` #1C1A18, radius 999px, padding 2px / 9px, texte Inter SemiBold 12px #FFFFFF ; icon/chevron-right 16px.

| Libellé | Node | Icône | Fond pastille | Compteur | Cible |
|---|---|---|---|---|---|
| `Avis clients à valider` | 85:10649 | icon/star | #FDF4EC (orange-50) | `4` | Avis clients |
| `Candidatures non lues` | 85:10658 | icon/briefcase | #F1EFEC | `2` | Recrutement |
| `Rendez-vous à confirmer` | 85:10668 | icon/calendar | #FDF4EC | `3` | Rendez-vous |
| `Demande de partenariat` | 85:10678 | icon/handshake | #F1EFEC | `1` | Partenaires |
| `Nouveaux inscrits` | 85:10691 | icon/users | #F1EFEC | `5` | Contacts & inscrits |

### Indicateurs secondaires (85:10702)
En-tête : icône 16px + libellé Inter Medium 13px #5E5952 ; valeur Poppins SemiBold 28px / lh 34px, tracking −0,56px ; légende Inter Regular 12px #5E5952.

| Carte | Node | Icône | Valeur | Légende |
|---|---|---|---|---|
| `Questionnaires de satisfaction` | 85:10703 | icon/file-text | `68 %` | `taux de réponse · 23 réponses ce mois` |
| `Newsletter` | 85:10712 | icon/mail | `1 248` | `inscrits · +56 ce mois` |
| `Visites du site` | 85:10720 | icon/globe | `4 320` | `sur 30 jours · source Google Analytics` |

Note : les nombres utilisent le séparateur de milliers espace (`1 248`, `4 320`) et l’espace avant `%` (`+12 %`, `68 %`) — à rendre avec espace insécable / fine insécable (format fr-FR).

## 3. Données (modèle)

- KPI période sélectionnable : 7 jours / 30 jours / 12 mois.
- `nouvellesDemandes` = 12, delta +4 vs semaine précédente.
- `devisEnCours` = 18 (pas de delta).
- `prestationsRealisees` = 27, delta +12 % sur le mois.
- `satisfactionMoyenne` = 4,8 / 5, delta +0,1 sur 30 jours.
- Série hebdomadaire des demandes (S30→S41) : 5, 8, 6, 9, 11, 7, 10, 13, 12, 9, 14, 12.
- Répartition par rubrique (30 j) : Immobilier 21, Expérience 17, Services de proximité 9, Culture & événementiel 6 — total 53.
- 5 dernières demandes (voir tableau).
- À faire : avis à valider 4, candidatures non lues 2, RDV à confirmer 3, demandes de partenariat 1, nouveaux inscrits 5 (total « 5 actions » = nombre de lignes).
- Questionnaires : taux de réponse 68 %, 23 réponses ce mois. Newsletter : 1 248 inscrits, +56 ce mois. Visites : 4 320 sur 30 jours (Google Analytics).

## 4. Éléments interactifs et badges

| Élément | Type | Détails |
|---|---|---|
| Onglets 7 jours / 30 jours / 12 mois | segmented control | actif = fond blanc + ombre |
| Barres du graphique | survol | infobulle « Semaine N » / « N demandes » ; barre active orange plein |
| `Tout voir` | lien texte brand + flèche | vers Demandes |
| `…` (icon/more) par ligne | bouton icône 32px | menu d’actions de la demande |
| Lignes « À faire » | lignes cliquables avec chevron | navigation vers la section correspondante |

Badges de statut de demande (pilule radius 999px, padding 4px / 10px, gap 6px, pastille 6px, texte Inter SemiBold 12px / lh 16px) :

| Statut | Fond | Texte | Pastille |
|---|---|---|---|
| `Nouvelle` | `--mp-color-orange-50` #FDF4EC | `--mp-color-orange-700` #AD5300 | orange (#FF7A00) |
| `En cours` | `--mp-color-neutral-100` #F1EFEC | `--mp-color-neutral-800` #2E2B28 | gris foncé |
| `Prestation réalisée` | `--mp-color-vert-50` #F6FAEF | `--mp-color-vert-700` #557E1B | vert |
