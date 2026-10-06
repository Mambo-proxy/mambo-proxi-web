# BO — Avis clients (93:10935)

Écran desktop 1440 × 1150. Coque : voir `_shell.md` — élément actif **Avis clients** (compteur `4`). Barre supérieure 83px.

## 1. Régions

| Région | Node | Position / taille | Détails |
|---|---|---|---|
| Barre latérale | 93:10936 | 264 × 1150 | identique `_shell.md` |
| Barre supérieure | 93:11059 | 1176 × 83 | |
| Contenu | 93:11083 | 1176 × 1067 | padding 32px |
| Rangée KPI | 93:11084 | y32 · 1112 × 156 | 4 cartes KPI (même composant que le tableau de bord) |
| Barre onglets + filtre | 93:11132 | y212 · 1112 × 42 | |
| Rangée | 93:11150 | y278 · 1112 × 757 | liste d’avis 752px + colonne latérale 340px, écart 20px |
| Liste | 93:11151 | 752 × 757 | 3 cartes d’avis, écart 14px |
| Latéral | 93:11303 | 340 × 631 | Questionnaire + Répartition, gap 16px |

## 2. Textes et typographie

### Barre supérieure
| Texte | Node | Rôle / style |
|---|---|---|
| `Contenus du site` › `Avis clients` | 93:11062 / 93:11065 | fil d’Ariane |
| `Avis clients` | 93:11066 | titre Poppins SemiBold 24px |
| `Ajouter un avis` | 93:11079 | bouton (icon/plus), 157 × 42 — hauteur 42 = variante secondaire (fond blanc, bordure #CFCAC3) |

### KPI (93:11084) — style identique aux KPI du tableau de bord (libellé Inter Medium 13px #5E5952, valeur Poppins SemiBold 32px, badge vert-50/vert-700)
| KPI | Node | Icône | Valeur | Évolution | Légende |
|---|---|---|---|---|---|
| `Note moyenne` | 93:11085 | icon/star | `4,8 / 5` | `+0,1` | `sur 30 jours` |
| `Recommandation` | 93:11099 | icon/users | `92 %` | `+3 pts` | `notes de 9 ou 10` |
| `Taux de réponse` | 93:11115 | icon/file-text | `68 %` | — | — |
| `Avis publiés` | 93:11124 | icon/check-circle | `112` | — | — |

### Onglets (93:11133) — composant segmenté (fond #F1EFEC ; actif fond blanc + ombre, compteur orange-50/orange-700)
| Onglet | Node | Compteur | État |
|---|---|---|---|
| `À valider` | 93:11134 | `4` | actif |
| `Publiés` | 93:11138 | `112` | inactif |
| `Masqués` | 93:11142 | `9` | inactif |
Filtre déroulant `Tous les services` (93:11146) : fond blanc, bordure #E4E1DC, radius 10px, Inter Medium 13px, icon/chevron-down 14px.

Remarque : 4 + 112 + 9 = 125 ; la carte Répartition indique `120 avis`.

### Cartes d’avis (93:11151)
Carte : fond #FFFFFF, bordure #E4E1DC, radius 16px, padding 22px, gap 14px.
- En-tête (gap 12px) : avatar 40px rond (initiales Inter SemiBold 14px #1C1A18) ; `Nom · Ville` Inter SemiBold 14px #1C1A18 ; `Service · prestation du J mois.` Inter Regular 12px #5E5952 ; 5 étoiles 16px (gap 2px) : pleines orange #FF7A00, vides en contour gris.
- Texte de l’avis : Inter Regular 15px / lh 24px #1C1A18, entre guillemets « ».
- Réponses au questionnaire : puces fond #F8F7F5, radius 8px, padding 6px / 10px, gap 6px ; question Inter Regular 12px #5E5952 (avec « : » précédé d’une espace), réponse Inter SemiBold 12px #1C1A18.
- Pied : séparateur haut #E4E1DC, padding-top 12px ; badge de consentement à gauche ; actions à droite (gap 8px, boutons radius 10px, padding 10px / 14px, Inter SemiBold 14px, icônes 16px).

| # | Node | Avatar | Auteur (verbatim) | Service · date | Étoiles | Texte (verbatim) |
|---|---|---|---|---|---|---|
| 1 | 93:11152 | `AK` | `Aurélie K. · Paris` | `Logement temporaire · prestation du 2 oct.` | 5/5 | `« Arrivée à Douala sans stress : logement prêt, chauffeur à l'aéroport et même les courses faites. On s'est sentis attendus. »` (apostrophes droites ' dans la maquette) |
| 2 | 93:11202 | `HD` | `Hervé D. · Douala` | `Réception de colis · prestation du 2 oct.` | 5/5 (5 icônes ; remplissage non vérifié) | `« Colis reçu à l’agence, on m’a appelé le jour même et livré le lendemain. Très pro. »` |
| 3 | 93:11252 | `MO` (fond #E4E1DC) | `Marc O. · Lyon` | `Location de voiture · prestation du 2 oct.` | **3/5** (3 pleines, 2 vides) | `« Bon chauffeur mais 20 minutes de retard à l’aéroport. Le reste était parfait. »` |

Réponses au questionnaire :
| # | `Ponctualité :` | `Information :` | `Recommandation :` |
|---|---|---|---|
| 1 | `Oui, tout à fait` | `Oui, tout à fait` | `10/10` |
| 2 | `Oui, tout à fait` | `Plutôt oui` | `9/10` |
| 3 | `Plutôt non` | `Oui, tout à fait` | `7/10` |

Consentement et actions :
| # | Badge consentement | Actions |
|---|---|---|
| 1 | `Publication acceptée par le client` — icon/check-circle 14px, fond #F6FAEF, texte Inter SemiBold 12px #557E1B | `Répondre` (secondaire, icon/message) · `Masquer` (secondaire, icon/eye) · `Publier` (primaire #FF7A00, icon/check-circle, texte #1C1A18) |
| 2 | `Publication acceptée par le client` | `Répondre` · `Masquer` · `Publier` |
| 3 | `Publication non autorisée` — icon/lock 14px, fond #F1EFEC, texte Inter SemiBold 12px #5E5952 | `Répondre` · `Masquer` · `Suivi interne` (bouton sombre : fond #1C1A18, texte #FFFFFF, icon/file-text) |

Règle implicite : sans consentement, l’action `Publier` est remplacée par `Suivi interne`.

### Questionnaire de satisfaction (93:11304)
Carte padding 22px, gap 12px. Titre `Questionnaire de satisfaction` (Inter SemiBold 16px) ; sous-titre `Envoyé automatiquement après chaque prestation` (Inter Regular 13px #5E5952).
Questions : ligne padding 8px 0, séparateur bas #E4E1DC, pastille 22px fond #F1EFEC (numéro Inter SemiBold 11px), texte Inter Regular 13px / lh 20px #1C1A18.
| # | Question (verbatim) | Type déduit |
|---|---|---|
| 1 | `Note globale (1 à 5 étoiles)` | note 1–5 |
| 2 | `Ponctualité et professionnalisme` | échelle (Oui, tout à fait / Plutôt oui / Plutôt non / …) |
| 3 | `Qualité de l’information` | échelle idem |
| 4 | `Recommandation (0 à 10)` | NPS 0–10 |
| 5 | `Commentaire libre` | texte |
Bouton secondaire `Modifier les questions` (icon/pencil).

### Répartition des notes (93:11334)
Titre `Répartition des notes` ; sous-titre `120 avis`. Lignes : libellé Inter SemiBold 12px #1C1A18, piste 8px #F1EFEC, remplissage #FF7A00, pourcentage Inter Regular 12px #5E5952.
| Note | Pourcentage | Largeur barre |
|---|---|---|
| `5 ★` | `86 %` | 189 / 225 |
| `4 ★` | `10 %` | 22 / 227 |
| `3 ★` | `3 %` | 7 / 232 |
| `2 ★` | `1 %` | 4 / 235 |
| `1 ★` | `0 %` | 0 |

## 3. Données — entité Avis

| Champ | Exemple |
|---|---|
| auteur (prénom + initiale), initiales, couleur avatar | `Aurélie K.`, `AK` |
| ville | `Paris` |
| service | `Logement temporaire` |
| datePrestation | `2 oct.` |
| note (1–5) | 5 |
| texte (commentaire libre) | « … » |
| reponses : ponctualite, information (échelle verbale), recommandation (0–10) | `Oui, tout à fait`, `Plutôt oui`, `Plutôt non`, `10/10` |
| consentementPublication (bool) | accepté / non autorisé |
| statut | a_valider / publie / masque |
| reponseAdmin (via `Répondre`) | — |
| demandeId / prestation liée | (lien implicite) |

KPI : note moyenne 4,8/5 (+0,1 sur 30 j) ; recommandation 92 % (+3 pts, part de notes 9–10) ; taux de réponse au questionnaire 68 % ; avis publiés 112. Répartition 5★ 86 %, 4★ 10 %, 3★ 3 %, 2★ 1 %, 1★ 0 % (120 avis).

## 4. Interactions et badges

| Élément | Type |
|---|---|
| `Ajouter un avis` | création manuelle |
| Onglets À valider / Publiés / Masqués | filtre par statut |
| `Tous les services` | filtre déroulant |
| `Répondre` | réponse publique / message au client |
| `Masquer` | statut → masqué |
| `Publier` | statut → publié (si consentement) |
| `Suivi interne` | traitement interne (avis non publiable) |
| `Modifier les questions` | édition du questionnaire |

Statuts d’avis (onglets) : `À valider`, `Publiés`, `Masqués`.
Badges de consentement :
| Valeur | Libellé | Fond | Texte | Icône |
|---|---|---|---|---|
| accepte | `Publication acceptée par le client` | #F6FAEF | #557E1B | icon/check-circle |
| refuse | `Publication non autorisée` | #F1EFEC | #5E5952 | icon/lock |
