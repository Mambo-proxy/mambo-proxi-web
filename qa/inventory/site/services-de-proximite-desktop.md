# Inventaire — site/services-de-proximite-desktop

- Figma : frame `61:3356` « Services de proximité — Desktop 1440 », 1440 × 5724,5 px
- Gabarit « page rubrique » (styles : voir `experience-desktop.md`) + **une section spécifique « Réception de colis »** (fond sombre).
- Typographie : mélange d'apostrophes — **typographiques `’`** dans : `Envois depuis l’étranger`, `Vos colis et courriers reçus à l’agence, en toute sécurité.`, `L’agence reçoit le colis ou le courrier envoyé depuis l’extérieur.`, `Retrait à l’agence ou livraison à domicile, selon votre choix.`, `Le suivi des colis se fait directement avec l’agence.`, CTA `Besoin d’un coup de main` ; **droites `'`** dans : `Vos envois arrivent à l'agence, …`, `L'agence reçoit vos envois, …` (carte service). À conserver tel quel (ou harmoniser côté contenu, décision éditoriale).
- CTA : `sous 24 h.` coupé en fin de ligne dans le rendu ⇒ espace ordinaire (pas d'insécable) entre `24` et `h`.

## 1. Sections
| # | Node | Calque | Fond | Hauteur |
|---|------|--------|------|---------|
| 0 | 61:3357 / 61:3389 | TopBar + Header Desktop | composants | 36 + 85 |
| 1 | 61:3467 | Hero | neutral-50 | 568 |
| 2 | 61:3496 | Pour qui ? | #fff | 554 |
| 3 | 61:3528 | Services | neutral-50 | 850 |
| 4 | 61:3632 | Réception de colis | **neutral-900 #1c1a18** (rendu) | 656 |
| 5 | 61:3665 | Déroulé | #fff | 556 |
| 6 | 61:3694 | Témoignage | neutral-50 | 606 |
| 7 | 61:3718 | Autres rubriques | #fff | 458 |
| 8 | 61:3777 | Web/CTA — Desktop (**surchargé**) | gradient | 524 |
| 9 | 61:3798 | Web/Footer — Desktop | composant | 831,5 |
| — | 61:3910 | WhatsApp flottant | | 64 |

## 2. Textes

### Hero
- Fil d'Ariane : `Accueil` › `Nos services` › **`Services de proximité`**
- Eyebrow : `Services de proximité`
- H1 : `Votre quotidien simplifié, ` + **`chez vous.` (orange #ad5300)** (vérifié sur capture)
- Lead : `Repas livrés, courses faites, colis réceptionnés : nous prenons en charge les tâches du quotidien pour vous et pour vos proches.`
- Boutons : `Demander un devis gratuit` · `Écrire sur WhatsApp`
- Visuel : `Illustration — livraison` 560×440

### Pour qui ?
- Eyebrow `Pour qui ?` ; H2 `Pour les résidents et les familles, ici comme à distance.`

| Icône | Titre | Texte |
|-------|-------|-------|
| users | Résidents et familles locales | Gagnez du temps sur les tâches de tous les jours. |
| home-heart | Proches accompagnés | Vous êtes en France : nous veillons sur vos parents au Cameroun. |
| package | Envois depuis l’étranger | Vos colis et courriers reçus à l’agence, en toute sécurité. |

### Services
- Eyebrow `Nos services` ; H2 `3 services pour souffler au quotidien.` ; lead `Zones desservies communiquées lors du devis.`

| Service | Description | Icône | Illustration |
|---------|-------------|-------|--------------|
| Portage et livraison de repas | Des repas livrés au domicile de la personne accompagnée. | utensils | livraison |
| Livraison de courses et de commandes | Vos courses et achats effectués, puis livrés au bénéficiaire. | cart | livraison |
| Réception de colis et de courrier | L'agence reçoit vos envois, prévient le destinataire et organise le retrait ou la livraison. | package | **colis** |

### Réception de colis (61:3632) — section sombre (styles relevés sur capture)
- Fond neutral-900 ; eyebrow `Réception de colis et de courrier` (uppercase, orange clair ~#ff9a1f/`orange-400`) ; H2 blanc 48/56 `Vos envois arrivent à l'agence, nous nous occupons du reste.` (bloc 760).
- 3 cartes (426,7 × 206, gap 16), fond neutral-800 #2e2b28, radius ~20, p 28 ; pastille icône 48 radius 12 fond plus clair (neutral-700) icône orange 22 ; titre Poppins SemiBold ~19/28 blanc ; texte Inter 15/23 neutral-300.

| Étape | Icône | Texte |
|-------|-------|-------|
| 1. Réception | package | L’agence reçoit le colis ou le courrier envoyé depuis l’extérieur. |
| 2. On vous prévient | phone (smartphone) | Nous contactons le destinataire par téléphone ou WhatsApp. |
| 3. Retrait ou livraison | map-pin | Retrait à l’agence ou livraison à domicile, selon votre choix. |

- Note : icône `info` 18 + `Le suivi des colis se fait directement avec l’agence.` (Inter 14/20, neutral-400).

### Déroulé — identique au gabarit (4 étapes : Votre demande / Devis sur mesure / Intervention / Votre avis)

### Témoignage
| Citation | Auteur | Initiales | Sous-ligne | Illustration |
|----------|--------|-----------|-----------|--------------|
| « Ma mère reçoit ses repas chaque midi et ses courses le samedi. Depuis Paris, je suis rassurée et toujours informée. » | Clarisse N. | CN | Paris · Portage de repas | equipe |

### Autres rubriques
| Rubrique | Sous-ligne | Vignette |
|----------|-----------|----------|
| Expérience | Des moments sur mesure · 5 services | Illustration — accueil |
| Immobilier | Se loger en toute sérénité · 7 services | Illustration — logement |
| Culture & événementiel | Vivre le Cameroun · 4 services | Illustration — culture |

### CTA (61:3777) — surcharge (capture)
- Titre : `Besoin d’un coup de main` / `au quotidien ?`
- Texte : `Repas, courses ou colis : décrivez votre besoin, nous vous répondons sous 24 h.`
- Boutons : `Demander un devis gratuit` (+ arrow-right) ; `Écrire sur WhatsApp`.

## 3. Interactifs
Gabarit rubrique (fil d'Ariane, 2 boutons hero, 3 × `Voir le service` / `Devis`, 3 cartes autres rubriques, CTA, WhatsApp flottant). Section colis : non interactive (note informative).

## 4. Visuels
Illustrations : livraison (hero + 2 cartes), colis, equipe, accueil / logement / culture (vignettes). Icônes : users, home-heart, package, utensils, cart, phone, map-pin, info, quote, arrow-right, arrow-up-right, chevron-right.
