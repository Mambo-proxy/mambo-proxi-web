# Back-office — Coque partagée (barre latérale + barre supérieure)

Source Figma : fichier `lsun63JexZYvgYUVpmSYyg`, page `84:10293`. Référence mesurée sur `BO — Tableau de bord` (85:10235, 1440 × 1372). La même coque est réutilisée sur tous les écrans desktop du back-office (seuls l’élément actif de la navigation, le titre de la barre supérieure et le bouton principal changent — voir chaque fiche écran).

Polices : `--mp-font-family-ui` = Inter ; `--mp-font-family-brand` = Poppins.
Tailles : `--mp-font-size-caption` 12px / lh 16px ; `--mp-font-size-body-sm` 14px / lh 20px ; `--mp-font-size-h3` 24px / lh 32px.

## Grille globale

| Région | Node | Taille | Fond | Détails |
|---|---|---|---|---|
| Écran | 85:10235 | 1440 × 1372 | — | 2 colonnes : barre latérale 264px + zone principale 1176px |
| Barre latérale | 85:10236 | 264 × 1372 (pleine hauteur) | `--mp-color-neutral-0` #FFFFFF | bordure droite 1px `--mp-color-border-default` #E4E1DC ; padding 20px vertical / 14px horizontal ; colonne, gap 2px |
| Principal | 85:10358 | 1176 × 1372 | (fond de page, voir écran) | |
| Barre supérieure | 85:10359 | 1176 × 75 | #FFFFFF | bordure basse 1px #E4E1DC ; padding 16px / 32px ; flex space-between, centré verticalement |
| Contenu | 85:10378 | 1176 × reste | — | padding 32px |

## Barre latérale (85:10236)

### Logo (85:10237) — 235 × 57
- padding : top 4px, bottom 20px, horizontal 8px ; gap 10px.
- Instance `Logo` (composant 17:122) 121,56 × 33,20 : symbole « M-Lien » (43,68 × 33,20, SVG multicolore) + nom en colonne :
  - « Mambo » — Poppins Bold 18,48px, letter-spacing −0,5544px, texte en dégradé `gradient/energie` (165,49° : #FF9A1F 14,6 % → #FF7A00 53,5 % → #F0550F 85,4 %).
  - « Proxi » — Poppins Medium 11,76px, `--mp-color-vert-600` #699B22.
- Tag « Admin » (85:10249) : fond `--mp-color-neutral-100` #F1EFEC, radius 6px, padding 3px / 8px ; texte Inter SemiBold 11px / lh 16px, tracking 0,11px, `--mp-color-text-muted` #5E5952.

### Groupes de navigation

Chaque groupe : colonne gap 2px, padding top 12px, bottom 4px. Titre de groupe : padding bottom 6px, horizontal 12px ; Inter SemiBold 11px / lh 16px, tracking 0,11px, MAJUSCULES, `--mp-color-text-subtle` #7D776F.

Élément de navigation (235 × 38) : padding 9px / 12px, radius 10px, gap 12px ; icône 18 × 18 ; libellé Inter Medium 14px / lh 20px, tracking 0,07px, `--mp-color-neutral-700` #46423D.
**État actif** : fond `--mp-color-orange-50` #FDF4EC ; libellé Inter SemiBold 14px, `--mp-color-text-main` #1C1A18 ; icône teintée orange (rendu capture : icône orange brand).
Compteur (badge) : fond `--mp-color-neutral-100` #F1EFEC, radius 999px, padding 2px / 8px ; Inter SemiBold 11px / lh 16px, tracking 0,11px, #1C1A18.

| Groupe (texte exact) | Node groupe | Élément | Node | Icône | Compteur (valeur affichée) |
|---|---|---|---|---|---|
| `PILOTAGE` | 85:10251 | Tableau de bord | 85:10254 | icon/grid | — |
| | | Demandes | 85:10261 | icon/file-text | `12` |
| | | Rendez-vous | 85:10269 | icon/calendar | `3` |
| `CONTENUS DU SITE` | 85:10276 | Services | 85:10279 | icon/sparkles | — |
| | | Pages & textes | 85:10284 | icon/layout | — |
| | | Avis clients | 85:10290 | icon/star | `4` |
| | | Partenaires | 85:10296 | icon/handshake | — |
| | | Formations | 85:10304 | icon/graduation | — |
| | | Recrutement | 85:10309 | icon/briefcase | `2` |
| `RELATIONS` | 85:10316 | Contacts & inscrits | 85:10319 | icon/users | — |
| | | Newsletter | 85:10325 | icon/mail | — |
| `RÉGLAGES` | 85:10330 | Paramètres | 85:10333 | icon/settings | — |

Sémantique des compteurs (déduite du tableau de bord) : Demandes = nouvelles demandes (12) ; Rendez-vous = rendez-vous à confirmer (3) ; Avis clients = avis à valider (4) ; Recrutement = candidatures non lues (2).

### Espaceur (85:10338)
flex-grow 1 — pousse « Voir le site » et la carte utilisateur en bas.

### « Voir le site » (85:10339) — 235 × 44
- Fond `--mp-color-neutral-50` #F8F7F5, radius 12px, padding 12px, gap 10px.
- icon/globe 18px · libellé « Voir le site » Inter SemiBold 14px / lh 20px, tracking 0,07px, #1C1A18 · icon/arrow-up-right 16px (lien externe vers le site public, nouvel onglet).

### Carte utilisateur (85:10348) — 235 × 50
- padding top 14px, horizontal 6px, gap 10px.
- Avatar 36 × 36 rond, fond `--mp-color-orange-100` #FCE7D5, initiales « MB » Inter SemiBold 12px / lh 16px, tracking 0,12px, `--mp-color-orange-800` #874100.
- Nom « Mireille Bell » Inter SemiBold 14px / lh 20px, #1C1A18.
- Rôle « Administratrice » Inter Regular 12px / lh 16px, #5E5952.
- icon/logout 18px (déconnexion).

## Barre supérieure (85:10359)

| Élément | Node | Détails |
|---|---|---|
| Titre de page | 85:10360/85:10361 | Poppins SemiBold 24px / lh 32px, #1C1A18. Valeur = nom de l’écran (ici « Tableau de bord ») |
| Groupe outils | 85:10362 | flex, gap 10px |
| Recherche | 85:10363 | 260 × 42 ; fond #F8F7F5, bordure 1px #E4E1DC, radius 10px, padding 10px / 14px, gap 8px ; icon/search 16px ; placeholder « Rechercher… » (avec caractère « … » U+2026) Inter Regular 14px / lh 20px `--mp-color-text-subtle` #7D776F ; raccourci « ⌘K » Inter Regular 12px / lh 16px #7D776F |
| Notifications | 85:10369 | bouton 40 × 40 (bordure + fond blanc, radius 10px), icon/bell 18px, pastille 8 × 8 orange (#FF7A00) en haut à droite = notifications non lues |
| Bouton principal | 85:10374 | « Nouveau service » ; fond `--mp-color-brand-primary` #FF7A00, radius 10px, padding 10px / 14px, gap 8px ; icon/plus 16px ; texte Inter SemiBold 14px / lh 20px, tracking 0,07px, `--mp-color-neutral-900` #1C1A18 (texte foncé sur orange) |

## Tokens de couleur rencontrés (coque)

| Token | Hex |
|---|---|
| --mp-color-neutral-0 | #FFFFFF |
| --mp-color-neutral-50 | #F8F7F5 |
| --mp-color-neutral-100 | #F1EFEC |
| --mp-color-neutral-700 | #46423D |
| --mp-color-neutral-900 / --mp-color-text-main | #1C1A18 |
| --mp-color-text-muted | #5E5952 |
| --mp-color-text-subtle | #7D776F |
| --mp-color-border-default | #E4E1DC |
| --mp-color-orange-50 | #FDF4EC |
| --mp-color-orange-100 | #FCE7D5 |
| --mp-color-orange-800 | #874100 |
| --mp-color-brand-primary | #FF7A00 |
| --mp-color-vert-600 | #699B22 |
