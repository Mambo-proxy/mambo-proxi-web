# BO — Ajouter un service (91:10598)

Écran desktop 1440 × 3397 (page longue). Coque : voir `_shell.md` — élément actif **Services**. Éditeur de service (création) pré-rempli avec l’exemple « Visites guidées de Douala ».

## 1. Régions

| Région | Node | Position / taille | Détails |
|---|---|---|---|
| Barre latérale | 91:10599 | 264 × 3397 | identique `_shell.md` |
| Barre supérieure | 91:10722 | 1176 × 83 | fil d’Ariane 3 niveaux, boutons Aperçu + Publier |
| Contenu | 91:10755 | 1176 × 3314 | padding 32px |
| Rangée | 91:10756 | 1112 × 3250 | formulaire 748px + colonne latérale 340px, écart 24px |
| Formulaire | 91:10757 | 748 × 3250 | 7 cartes-sections empilées, écart 20px |
| Colonne latérale | 91:11111 | 340 × 994 | 3 cartes (Publication, Aperçu, Complétude), gap 16px |

Carte-section : fond #FFFFFF, bordure 1px #E4E1DC, radius 16px, padding 28px, gap 18px. En-tête de section : pastille numérotée 28 × 28 ronde fond `--mp-color-neutral-900` #1C1A18 (chiffre Inter SemiBold 12px blanc), gap 12px ; titre Inter SemiBold 16px / lh 24px #1C1A18 ; sous-titre Inter Regular 13px / lh 16px #5E5952.

Champ : libellé Inter SemiBold 14px / lh 20px #1C1A18 + astérisque `*` Inter Medium 14px `--mp-color-text-brand` #AD5300 (gap 4px) ; saisie fond #FFFFFF, bordure 1px `--mp-color-border-strong` #CFCAC3, radius 12px, padding 14px / 16px, valeur Inter Regular 16px / lh 24px #1C1A18 ; aide / compteur Inter Regular 12px / lh 16px #5E5952 ; gap 8px.

Élément de liste répétable : fond #F8F7F5, radius 12px, padding 14px, gap 12px ; icon/grip 18px ; sous-champs (fond #FFFFFF, bordure #E4E1DC, radius 8px, padding 10px / 12px, Inter Regular 14px #1C1A18) ; bouton supprimer 32 × 32 radius 8px icon/trash 16px. Bouton d’ajout : bordure 1px pointillée #CFCAC3, radius 12px, padding 12px, icon/plus 16px + Inter SemiBold 14px #1C1A18, centré, pleine largeur.

## 2. Textes, champs et valeurs

### Barre supérieure (91:10722)
| Texte | Node | Rôle / style |
|---|---|---|
| `Contenus du site` › `Services` › `Nouveau service` | 91:10725/91:10728/91:10731 | fil d’Ariane, Inter Regular 12px #5E5952 |
| `Nouveau service` | 91:10732 | titre, Poppins SemiBold 24px |
| `Rechercher…` / `⌘K` | | recherche (coque) |
| `Aperçu` | 91:10745 | bouton secondaire (icon/eye), fond blanc, bordure #CFCAC3, radius 10px, 104 × 42 |
| `Publier` | 91:10750 | bouton primaire (icon/check-circle), fond #FF7A00, texte #1C1A18, 100 × 40 |

### Section 1 — `Informations générales` (91:10758, 748 × 602)
Sous-titre : `Ce qui apparaît en haut de la page et sur la carte du service.`

| Champ (libellé exact) | Obligatoire | Type | Valeur affichée | Aide / compteur |
|---|---|---|---|---|
| `Nom du service` | oui `*` | texte (337px, demi-largeur) | `Visites guidées de Douala` | — |
| `Rubrique` | oui `*` | liste déroulante (icon/chevron-down 18px) | `Culture & événementiel` | — |
| `Phrase d’accroche` | oui `*` | texte pleine largeur | `Découvrez Douala avec un guide passionné, loin des circuits classiques.` | `Une phrase courte, affichée sous le titre. 72 / 120 caractères.` (max 120) |
| `Description courte (cartes et résultats)` | non | texte | `Balades commentées dans les quartiers historiques, marchés et lieux de création.` | — |
| `Visuels` | — | galerie | 2 visuels + zone d’ajout | voir ci-dessous |

Visuels (91:10794, gap 12px) :
- Visuel 1 : illustration scène « marche » 200 × 130, fond #FCE7D5, radius 12px (visuel principal).
- Visuel 2 : illustration scène « culture » 130 × 130, fond #FCE7D5, radius 12px.
- Zone d’ajout (91:10846) : fond #F8F7F5, bordure 1px pointillée #CFCAC3, radius 12px, hauteur 130 ; icon/image 22px ; `Glisser une photo` (Inter SemiBold 14px #1C1A18) ; `JPG ou PNG · 1600 px conseillé` (Inter Regular 12px #5E5952).

### Section 2 — `À qui s’adresse ce service ?` (91:10853, 748 × 428)
Sous-titre : `Une ligne par public. Affiché sous forme de liste cochée.`
Éléments (1 sous-champ texte chacun) :
1. `Aux visiteurs de passage et à la diaspora en séjour`
2. `Aux nouveaux arrivants qui veulent découvrir la ville`
3. `Aux groupes et aux entreprises`
Bouton : `Ajouter un public`

### Section 3 — `Ce que Mambo fait concrètement` (91:10912, 748 × 578)
Sous-titre : `Les étapes du service, dans l’ordre.`
Éléments (2 sous-champs : titre + texte) :
| # | Titre | Texte |
|---|---|---|
| 1 | `Échange sur vos envies` | `Durée, quartiers, centres d’intérêt, langue.` |
| 2 | `Proposition d’itinéraire et devis` | `Un parcours sur mesure, envoyé sous 24 h.` |
| 3 | `Visite avec un guide local` | `Accueil à votre hôtel ou à l’agence.` |
Bouton : `Ajouter une étape`

### Section 4 — `Les avantages pour le bénéficiaire` (91:10977, 748 × 426)
Pas de sous-titre.
| # | Titre | Texte |
|---|---|---|
| 1 | `Des guides locaux passionnés` | `Ils connaissent chaque rue et ses histoires.` |
| 2 | `Un parcours sur mesure` | `Adapté à votre rythme et à vos envies.` |
Bouton : `Ajouter un avantage`

### Section 5 — `Questions fréquentes` (91:11023, 748 × 302)
Sous-titre : `Facultatif.`
| # | Question | Réponse |
|---|---|---|
| 1 | `Combien de temps dure une visite ?` | `Entre 2 h et une journée complète, selon le parcours choisi.` |
Bouton : `Ajouter une question`

### Section 6 — `Services liés et témoignages` (91:11052, 748 × 324)
Sous-titre : `Affichés en bas de la page du service.`
- `Services liés` — puces sélectionnées (fond #1C1A18, bordure #1C1A18, radius 999px, padding 9px / 14px, icon/check 14px blanc, Inter Medium 14px #FFFFFF), retour à la ligne, gap 8px :
  - `Découverte du Cameroun`
  - `Activités culturelles, loisirs et sorties`
  - `Location de voiture`
- `Témoignages affichés` :
  - puce sélectionnée `Patrick E. · ★★★★★`
  - puce d’ajout `+ Choisir un avis publié` (fond #FFFFFF, bordure #CFCAC3, texte Inter Medium 14px #1C1A18)

### Section 7 — `Référencement (SEO)` (91:11083, 748 × 470)
Sous-titre : `Rempli automatiquement, modifiable si besoin.`
| Champ | Type | Valeur | Compteur |
|---|---|---|---|
| `Adresse de la page` | texte avec icon/globe 18px | `mamboproxi.com/services/culture/visites-guidees-douala` | — |
| `Titre pour Google` | texte | `Visites guidées de Douala | MAMBO Proxi` | `41 / 60 caractères` (max 60) |
| `Description pour Google` | zone de texte (hauteur 76) | `Découvrez Douala avec un guide local : quartiers historiques, marchés, lieux de création. Devis gratuit sous 24 h.` | `118 / 160 caractères` (max 160) |

Remarque : le slug ici (`visites-guidees-douala`) diffère de celui de la liste Services (`/services/culture/visites-douala`).

### Colonne latérale (91:11111)

**Carte `Publication`** (91:11112 ; padding 22px, gap 14px ; titre Inter SemiBold 16px) :
| Libellé | Contrôle | État |
|---|---|---|
| `Statut` (Inter Regular 14px #5E5952) | badge | `Brouillon` (fond #F1EFEC, texte #5E5952, pastille grise) |
| `Afficher dans le menu` | interrupteur | activé (#7DB928) |
| `Mettre en avant sur l’accueil` | interrupteur | désactivé (#CFCAC3) |
| `Bouton WhatsApp sur la page` | interrupteur | activé |
Libellés d’interrupteurs : Inter Regular 14px #1C1A18.
Boutons (égaux, gap 8px) : `Enregistrer` (secondaire, fond blanc, bordure #CFCAC3) · `Publier` (primaire, fond #FF7A00, texte #1C1A18). Inter SemiBold 14px, radius 10px, padding 10px / 14px.
Note : `Dernière sauvegarde automatique il y a 1 min` (Inter Regular 12px #7D776F).

**Carte `Aperçu de la carte`** (91:11137 ; padding 22px, gap 12px) :
- Lien `Ouvrir` + icon/arrow-up-right (Inter SemiBold 14px #AD5300).
- Carte service (91:11146) : bordure #E4E1DC, radius 16px ; illustration « marche » 150px de haut fond #FCE7D5 ; corps padding 14px gap 6px : titre `Visites guidées de Douala` (Inter SemiBold 15px / lh 24px #1C1A18), texte `Découvrez Douala avec un guide passionné, loin des circuits classiques.` (Inter Regular 12px #5E5952 — reprend la phrase d’accroche), lien `Voir le service` + icon/arrow-right (Inter SemiBold 14px #AD5300).

**Carte `Complétude`** (91:11184 ; padding 22px, gap 12px) :
- `Page complète à 86 %` (Inter SemiBold 16px) ; `6 sections sur 7` (Inter Regular 13px #5E5952).
- Barre de progression : piste 8px #F1EFEC radius 999px, remplissage `--mp-color-vert-500` #7DB928, 254/294 px (≈ 86 %).
- Liste de contrôle (Inter Regular 13px, gap 8px, icône 16px) :
| Élément | État | Icône / couleur texte |
|---|---|---|
| `Informations générales` | complet | icon/check-circle (vert) / #1C1A18 |
| `Public` | complet | idem |
| `Étapes` | complet | idem |
| `Avantages` | complet | idem |
| `Questions fréquentes` | complet | idem |
| `Services liés` | complet | idem |
| `Photo principale en haute définition` | manquant (avertissement) | icon/info / `--mp-color-orange-700` #AD5300 |

## 3. Données — entité Service (édition)

| Champ | Type | Contraintes |
|---|---|---|
| nom | string | requis |
| rubriqueId | enum rubriques | requis |
| accroche | string | requis, max 120 |
| descriptionCourte | string | facultatif |
| visuels[] | images (JPG/PNG, 1600 px conseillé) ; 1er = photo principale / illustration | |
| publics[] | string[] ordonnés | « liste cochée » |
| etapes[] | {titre, texte}[] ordonnés | |
| avantages[] | {titre, texte}[] ordonnés | |
| faq[] | {question, reponse}[] ordonnés | facultatif |
| servicesLies[] | ids de services | |
| temoignages[] | ids d’avis publiés (nom + note) | |
| seo.slug / urlPage | string | auto, modifiable (`mamboproxi.com/services/{rubrique}/{slug}`) |
| seo.titre | string | max 60 ; défaut `{nom} | MAMBO Proxi` |
| seo.description | string | max 160 |
| statut | brouillon / publie | |
| dansLeMenu | bool | |
| misEnAvantAccueil | bool | |
| boutonWhatsApp | bool | |
| derniereSauvegarde | datetime (autosave) | |
| completude | calcul : 7 critères (6 sections + photo HD) → % | |

## 4. Interactions

| Élément | Type |
|---|---|
| `Aperçu` (barre sup.) / `Ouvrir` (aperçu carte) | prévisualisation de la page |
| `Publier` (barre sup. + carte Publication) | publication (statut → Publié) |
| `Enregistrer` | sauvegarde du brouillon |
| Champs texte, liste déroulante Rubrique | saisie avec compteurs de caractères |
| Glisser une photo | upload image (glisser-déposer) |
| Poignées icon/grip | réordonner les éléments |
| icon/trash | supprimer un élément |
| `Ajouter un public` / `Ajouter une étape` / `Ajouter un avantage` / `Ajouter une question` | ajouter un élément |
| Puces services liés / témoignages | multi-sélection ; `+ Choisir un avis publié` ouvre un sélecteur |
| 3 interrupteurs | toggles |
| Liste de complétude | indicateur (lecture seule) |
