# BO — Tableau de bord — Mobile 390 (95:11777)

Écran mobile, largeur 390px. Fond `--mp-color-neutral-50` #F8F7F5. Pas de barre latérale : barre supérieure compacte + navigation basse fixe.

## 1. Régions

| Région | Node | Détails |
|---|---|---|
| Barre | 95:11778 | fond #FFFFFF, bordure basse #E4E1DC, padding 14px / 16px, space-between |
| Contenu | 95:11797 | colonne gap 16px, padding 18px haut / 16px côtés / 100px bas (réserve pour la navigation) |
| Navigation basse | 95:11876 | position absolue (top 761px), 390px de large, fond #FFFFFF, bordure haute #E4E1DC, padding 10px haut / 18px côtés / 24px bas, 5 éléments en space-between |

## 2. Textes et typographie

### Barre (95:11778)
- Logo : symbole M-Lien 41,6 × 31,6 ; « Mambo » Poppins Bold 17,6px (tracking −0,528px, dégradé `gradient/energie`) ; « Proxi » Poppins Medium 11,2px #699B22.
- Bouton notifications 38 × 38 : bordure 1px #E4E1DC, radius 10px, icon/bell 18px.
- Avatar 38 × 38 rond fond #FCE7D5 : `MB` Inter SemiBold 14px #1C1A18.

### Contenu (95:11797)
- `Bonjour Mireille` — Poppins SemiBold 22px / lh 32px #1C1A18.

KPI (95:11799) — grille 2 × 2 (cartes 174px, gap 10px ; fond blanc, bordure #E4E1DC, radius 16px, padding 14px, gap 6px ; icône 14px + libellé Inter Regular 12px #5E5952 ; valeur Poppins SemiBold 24px / lh 30px, tracking −0,48px) :
| Libellé (verbatim) | Icône | Valeur |
|---|---|---|
| `Nouvelles demandes` | icon/file-text | `12` |
| `Devis en cours` | icon/mail | `18` |
| `Réalisées (mois)` | icon/check-circle | `27` |
| `Satisfaction` | icon/star | `4,8 / 5` |
(Pas de badges d’évolution en mobile.)

À faire (95:11828) — carte padding 14px, gap 4px ; titre `À faire aujourd’hui` Inter SemiBold 15px / lh 24px ; lignes padding 10px 0, séparateur #E4E1DC, libellé Inter Regular 14px #1C1A18, compteur fond #1C1A18 radius 999px padding 2px / 8px Inter SemiBold 12px blanc, icon/chevron-right 16px :
| Libellé | Compteur |
|---|---|
| `Avis à valider` | `4` |
| `Rendez-vous à confirmer` | `3` |
| `Candidatures non lues` | `2` |
(Libellé mobile `Avis à valider` vs desktop `Avis clients à valider` ; 3 lignes au lieu de 5.)

`Dernières demandes` — Inter SemiBold 15px. Cartes (fond blanc, bordure #E4E1DC, radius 16px, padding 14px, gap 12px) : avatar 38px (initiales Inter SemiBold 14px), nom Inter SemiBold 14px, `Service · Reçue` Inter Regular 12px #5E5952, badge de statut à droite.
| Avatar / fond | Nom | Sous-ligne | Statut |
|---|---|---|---|
| `AK` / #F8CFAA | `Aurélie K.` | `Chef privé · Il y a 2 h` | `Nouvelle` (#FDF4EC / #AD5300) |
| `PE` / #D5EAB8 | `Patrick E.` | `Découverte du Cameroun · Il y a 5 h` | `Nouvelle` |
| `SM` / #E4E1DC | `Sandrine M.` | `Gestion locative · Hier` | `En cours` (#F1EFEC / #2E2B28) |

### Navigation basse (95:11876)
Élément : colonne gap 4px ; pastille icône padding 4px / 14px radius 999px, icône 20px ; libellé 11px / lh 16px.
| Libellé | Icône | État |
|---|---|---|
| `Accueil` | icon/grid | **actif** : pastille fond #FDF4EC, libellé Inter SemiBold #1C1A18 |
| `Demandes` | icon/file-text | inactif : Inter Medium #5E5952 |
| `Agenda` | icon/calendar | inactif |
| `Avis` | icon/star | inactif |
| `Plus` | icon/more | inactif (accès aux autres sections) |

## 3. Données

Mêmes sources que le tableau de bord desktop : KPI (nouvelles demandes 12, devis en cours 18, réalisées ce mois 27, satisfaction 4,8/5), compteurs « à faire » (avis 4, RDV 3, candidatures 2), 3 dernières demandes (client, service, date relative, statut).

## 4. Interactions

| Élément | Type |
|---|---|
| Notifications | ouverture du panneau de notifications |
| Avatar | menu utilisateur (profil / déconnexion) |
| Lignes « À faire » | navigation vers la section |
| Cartes de demande | ouverture du détail |
| Navigation basse | Accueil / Demandes / Agenda (Rendez-vous) / Avis / Plus |
