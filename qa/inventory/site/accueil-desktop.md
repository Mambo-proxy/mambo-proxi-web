# Inventaire — site/accueil-desktop

- Figma : fileKey `lsun63JexZYvgYUVpmSYyg`, frame `47:151` « Accueil — Desktop 1440 »
- Dimensions : 1440 × 6574,5 px
- Typo : marque = Poppins (`--mp-font-family-brand`), UI = Inter (`--mp-font-family-ui`)
- Typographie des textes : apostrophes droites `'` (pas de `’`), guillemets « » avec espace ordinaire (pas d'insécable) ; aucun espace insécable/fine détecté avant `:` `?` `!` (ex. « Au choix : », « Vous êtes prestataire ? »). Points de suspension = caractère `…` (U+2026).

## 1. Sections (ordre)

| # | Node | Calque | Fond | Padding vertical | Hauteur |
|---|------|--------|------|------------------|---------|
| 0 | 47:152 | Web/TopBar — Desktop (instance) | voir components/top-bar.md | — | 36 |
| 0b | 47:184 | Web/Header — Desktop (instance) | voir components/header-desktop.md | — | 85 |
| 1 | 47:247 | Hero | `--mp-color-neutral-50` #f8f7f5 | pt 64 / pb 88 (px 64) | 792 |
| 2 | 49:280 | Bandeau services | `--mp-color-neutral-0` #fff, bordures haut+bas `--mp-color-border-default` #e4e1dc | py 22 | 74 |
| 3 | 49:333 | Nos univers | `--mp-color-neutral-0` #fff | py 112 (px 64) | 1464 |
| 4 | 50:357 | Comment ça marche | `--mp-color-neutral-50` #f8f7f5 | py 112 (px 64) | 806 |
| 5 | 50:410 | Pourquoi Mambo | `--mp-color-neutral-0` #fff | py 112 (px 64) | 787 |
| 6 | 52:389 | Avis clients | `--mp-color-neutral-50` #f8f7f5 | py 112 (px 64) | 815 |
| 7 | 52:490 | Partenaires | `--mp-color-neutral-0` #fff | py 80 (px 64) | 360 |
| 8 | 56:2093 | Web/CTA — Desktop (instance) | section #fff, bandeau dégradé `gradient/energie` | pb 112 (px 64) | 524 |
| 9 | 52:531 | Web/Footer — Desktop (instance) | voir components/footer-desktop.md | — | 831,5 |
| — | 47:329 | Web/WhatsApp flottant (instance) | positionné x 1348 / y 808, 64×64 | — | 64 |

## 2. Textes par section

### 1. Hero (47:247) — layout 2 colonnes, gap 56, items centrés
Colonne texte 640 px (47:248), gap 28.

| Rôle | Texte exact | Typo | Couleur |
|------|-------------|------|---------|
| Pastille — pays (47:251) | `France  ·  Cameroun` (deux espaces de chaque côté du point médian, whitespace-pre) | Inter SemiBold 13/20, ls 0.065px | `--mp-color-vert-700` #557e1b sur fond `--mp-color-vert-50` #f6faef (pill px10 py4) |
| Pastille — libellé (47:252) | `Conciergerie de proximité` | Inter Medium 14/20 (body-sm), ls 0.07px | `--mp-color-text-muted` #5e5952 |
| Titre H1 (47:253), 2 lignes explicites | Ligne 1 : `Mambo, ce n'est pas qu'un service.` / Ligne 2 : `C'est une expérience pensée pour vous.` | Poppins SemiBold 58/64, ls -1.45px | L1 `--mp-color-text-main` #1c1a18 ; **L2 surlignée orange #ad5300** (= text-brand) |
| Lead (47:254) | `Mobilité, chef privé, logement, courses, découvertes culturelles… Nous réunissons des prestataires de confiance pour vous simplifier la vie au Cameroun, que vous y viviez ou que vous prépariez votre venue.` | Inter Regular 19/31 | text-muted #5e5952 |
| Bouton primaire (47:256) | `Demander un devis gratuit` | Inter SemiBold 16/24 | `--mp-color-text-on-primary` #1c1a18 sur `--mp-color-brand-primary` #ff7a00 |
| Bouton secondaire (47:258) | `Créer mon compte` + icône arrow-right 18 | Inter SemiBold 16/24 | text-main sur #fff, bordure `--mp-color-border-strong` #cfcac3 |
| Preuve sociale (47:281) | `4,9/5 · plus de 150 projets accompagnés` | Inter Medium 14/20 | text-muted |

Pastille : fond #fff, bordure border-default, radius 999, pl 8 pr 16 py 8, gap 10.
Confiance (47:263) : 4 avatars ronds 40 px (bordure 3 px neutral-50, chevauchement -12 px) couleurs #f8b272, #bce08a, #f8cfaa, #a8a29a ; 5 étoiles 14 px (icon/star, orange) ; pt 8, gap 16.

Visuel (47:282) 616 × 640 :
- `Illustration — accueil` (79:10157) : 500 × 600, fond #fce7d5, radius 32, pos (40,20).
- `Illustration — chef` (79:10191) : 240 × 280, fond #fce7d5, bordure 6 px blanche, radius 24, ombre `0 20 40 -8 rgba(28,26,23,0.14)`, pos (376,340).
- Carte flottante — devis (47:305) pos (330,96), fond #fff, radius 20, ombre elevation/3, p 14/18 :
  - icône `check` 20 dans carré 40 radius 12 fond vert-50
  - `Devis envoyé en 24 h` — Inter SemiBold 14/20, text-main
  - `Chef privé · samedi 20h` — Inter Regular 12/16 (caption), text-muted
- Carte flottante — logement (47:312) pos (0,330), largeur 236, p 16, radius 20, ombre elevation/3 :
  - icône `key` 18 dans carré 36 radius 10 fond `--mp-color-orange-50` #fdf4ec
  - `Logement trouvé` — Inter SemiBold 14/20, text-main
  - `Bastos, Yaoundé` — Inter Regular 12/16, text-muted
  - barre de progression 6 px fond neutral-100 #f1efec, remplissage `--mp-color-vert-500` #7db928 largeur 170/204
  - `Installation prévue le 12 nov.` — Inter Regular 12/16, `--mp-color-text-subtle` #7d776f
- Sticker (47:325) pivoté +4°, fond `--mp-color-neutral-900` #1c1a18, radius 999, px 14 py 8 : icône `heart` 14 + `Pensé pour vous` (Inter SemiBold 12/16, blanc). Pos (67.8,44).

### 2. Bandeau services (49:280) — défilant (marquee), gap 28
Items texte Poppins SemiBold 22/28, text-main, séparés par icône `sparkles` 18 (orange) :

| # | Libellé |
|---|---------|
| 1 | Location de voiture |
| 2 | Chef privé |
| 3 | Massage bien-être |
| 4 | Photographe |
| 5 | Événementiel |
| 6 | Livraison de repas |
| 7 | Courses |
| 8 | Colis |
| 9 | Recherche de logement |
| 10 | Logement temporaire |
| 11 | Gestion locative |
| 12 | Découverte du Cameroun |
| 13 | Sorties culturelles |

### 3. Nos univers (49:333) — gap 48
En-tête (49:334) justify-between, align-end ; bloc titre 720 px gap 16.

| Rôle | Texte | Typo | Couleur |
|------|-------|------|---------|
| Eyebrow (49:336) | `Nos univers de services` (rendu en MAJUSCULES via uppercase) | Inter SemiBold 13/16, ls 1.04px (style `web/eyebrow`) | `--mp-color-text-brand` #ad5300 |
| Titre H2 (49:337) | `Tout ce dont vous avez besoin, réuni au même endroit.` | Poppins SemiBold 48/56, ls -0.96 (style `web/section`) | text-main |
| Lead (49:338) | `19 services regroupés en 4 univers. Choisissez, nous coordonnons tout avec des prestataires sélectionnés et suivis.` | Inter Regular 18/28 (body-lg) | text-muted |
| Lien (49:339) | `Voir tous les services` + arrow-right 18 | Inter SemiBold 16/24 | text-main, bouton pill bordure border-strong, px 22 py 14 |

Grille bento (49:344) : 2 rangées, gap 16 ; rangée 1 = 780 + 516 ; rangée 2 = 516 + 780 ; radius 32.

| Carte | Node | Taille | Style | Tag | Titre | Description | Chips services | Visuel |
|-------|------|--------|-------|-----|-------|-------------|----------------|--------|
| Univers — Expériences | 49:347 | 780×540 | illustration plein cadre + voile dégradé (transparent 25 % → rgba(28,26,23,0.82)), texte blanc, contenu pos (40,250) l 700 | pill blanche, icône `sparkles` 14 + `5 services` (Inter SemiBold 12/16, text-main) | `Des moments sur mesure` (Poppins Bold 40/46, ls -0.6, blanc) | `Se déplacer, se faire plaisir, immortaliser un moment : des prestataires triés sur le volet, réservés pour vous.` (Inter 16/24 blanc) | Location de voiture · Chef privé · Massage bien-être · Photographe · Prestataires événementiels (chips translucides blanc + blur 6, texte blanc Inter Medium 13/20) | `Illustration — chef` (79:10223) fond #fce7d5 ; bouton flèche rond 52 blanc icône `arrow-up-right` 22 pos (688,40) |
| Univers — Immobilier | 49:383 | 516×540 | fond neutral-50, bordure border-default ; illustration en haut 516×250 | — | `Immobilier` (Poppins SemiBold 30/40, ls -0.3, text-main) + bouton flèche rond 52 noir neutral-900 | `Trouver, s'installer, louer en toute sérénité, ou confier votre bien à une équipe sur place.` (Inter 16/24 text-muted) | Recherche de logement · Location & colocation · Logement temporaire · Gestion locative · +3 (chips fond blanc, bordure border-default, text-main 13/20) | `Illustration — logement` (79:10255) fond #f1efec ; contenu pt 28 pb 32 px 32 gap 14 |
| Univers — Proximité | 49:414 | 516×420 | fond `--mp-color-vert-50` #f6faef, bordure `--mp-color-vert-100` #eaf5db, p 36, gap 24 | — (3 icônes rondes 56 blanches bordure 3 vert-100, chevauchement -10 : `utensils`, `cart` (shopping-cart), `package`) + bouton flèche noir 52 | `Votre quotidien simplifié` (Poppins SemiBold 30/38, ls -0.3) | `Repas, courses, colis : on s'en charge, vous gagnez du temps.` | Livraison de repas · Courses · Colis | Carte « Statut livraison » pivotée +2°, fond blanc radius 16 ombre elevation/2 : pastille ronde vert-500 icône `check` 18 ; `Courses livrées à Akwa` (Inter SemiBold 14) / `Aujourd'hui · 18:40` (Inter Regular 12, text-muted) |
| Univers — Culture | 49:448 | 780×420 | fond `--mp-color-neutral-900` #1c1a18 ; colonne texte 400 p 40 ; image à droite 380 | pill fond `--mp-color-neutral-800` #2e2b28, icône `compass` 14 + `4 services` (blanc) | `Vivre le Cameroun` (Poppins SemiBold 30/40 blanc) | `Découvertes, sorties, événements et intégration locale : le pays vu de l'intérieur.` (Inter 16/24, `--mp-color-neutral-300` #cfcac3) | Découverte du Cameroun · Sorties & loisirs · Événements Mambo · Intégration locale (chips translucides) | `Illustration — marche` (79:10289) fond #eaf5db ; flèche ronde blanche 52 pos (296,32) |

### 4. Comment ça marche (50:357) — gap 56
| Rôle | Texte | Typo | Couleur |
|------|-------|------|---------|
| Eyebrow (50:359) | `Comment ça marche` (uppercase) | web/eyebrow | text-brand #ad5300 |
| Titre (50:360) | `Simple comme un message.` | Poppins SemiBold 48/56 centré | text-main |
| Lead (50:361) | `Trois étapes, un seul interlocuteur. Vous restez informé du début à la fin.` | Inter 18/28 centré | text-muted |
| Libellé canaux (50:392) | `Au choix :` | Inter Regular 14/20 | text-muted |

Étapes (50:362) : 3 cartes égales (flex 1), gap 24, fond #fff, bordure border-default, radius 28, p 32, gap 20. Icône 24 dans carré 52 radius 16 fond orange-50 ; numéro Poppins SemiBold 56/56 ls -1.12 couleur `--mp-color-orange-200` #f8cfaa ; titre Poppins SemiBold 22/30 text-main ; texte Inter 16/26 text-muted.

| N° | Icône | Titre | Texte |
|----|-------|-------|-------|
| 01 | file-text | Vous exprimez votre besoin | Via le formulaire de devis, sur WhatsApp ou lors d'un rendez-vous, en France comme au Cameroun. |
| 02 | mail | Vous recevez un devis sur mesure | Sous 24 h, une proposition claire et personnalisée, sans engagement de votre part. |
| 03 | shield | Nous nous occupons de tout | Nos prestataires sélectionnés interviennent. Vous êtes tenu informé à chaque étape. |

Canaux (50:391) — chips pill fond #fff bordure border-default px 14 py 8, icône 16 + texte Inter Medium 14/20 text-main :

| Libellé | Icône | Destination présumée |
|---------|-------|----------------------|
| Formulaire en ligne | file-text | /devis |
| WhatsApp | whatsapp (logo) | lien wa.me |
| Rendez-vous | calendar-check | prise de rendez-vous / contact |

### 5. Pourquoi Mambo (50:410) — 2 colonnes, gap 64
Colonne texte 560 (gap 32) :

| Rôle | Texte | Typo | Couleur |
|------|-------|------|---------|
| Eyebrow (50:413) | `Nos engagements` | web/eyebrow | text-brand |
| Titre (50:414) | `La proximité, c'est notre métier.` | Poppins SemiBold 48/56 | text-main |
| Lead (50:415) | `Une équipe présente des deux côtés, des prestataires choisis avec soin et une seule promesse : vous simplifier la vie.` | Inter 18/28 | text-muted |

Engagements (liste séparée par bordure haute border-default, py 20, gap 20 ; icône 22 dans carré 48 radius 14 fond vert-50 ; titre Poppins SemiBold 19/28 ; texte Inter 16/24 text-muted) :

| Icône | Titre | Texte |
|-------|-------|-------|
| users | Une équipe à vos côtés | Un interlocuteur unique qui vous accompagne pas à pas, en France comme au Cameroun. |
| shield | Des solutions concrètes et durables | Des prestataires vérifiés, suivis et évalués après chaque mission. |
| globe | Un pont entre la France et le Cameroun | Préparez votre venue depuis la France, nous agissons sur place. |

Chiffres (50:442) : 2 colonnes gap 16.
- Colonne A : `Illustration — equipe` (79:10318) 330 h, fond #eaf5db, radius 28 ; puis Stat 1.
- Colonne B : Stat 2, Stat 3, Stat 4.
Cartes stats radius 28, p 28, gap 6 ; valeur Poppins SemiBold 56/60 ls -1.12 (style `web/stat`) ; libellé Inter 14/20.

| Stat | Valeur | Libellé | Fond | Couleur texte |
|------|--------|---------|------|---------------|
| 1 (50:455) | 150+ | projets accompagnés | neutral-50 #f8f7f5 | valeur text-main, libellé text-muted |
| 2 (50:459) | 40+ | partenaires engagés | dégradé `gradient/energie` (145.8° : #ff9a1f 14.6 % → #ff7a00 53.5 % → #f0550f 85.4 %), + espace vide 80 px | neutral-900 #1c1a18 |
| 3 (50:463) | 19 | services réunis en 4 rubriques | neutral-900 #1c1a18 | valeur blanc, libellé neutral-300 #cfcac3 |
| 4 (50:466) | 2 pays | couverts : France et Cameroun | vert-50 #f6faef | `--mp-color-vert-800` #426215 ; valeur Poppins SemiBold 48/56 ls -0.96 |

### 6. Avis clients (52:389) — gap 48
| Rôle | Texte | Typo | Couleur |
|------|-------|------|---------|
| Eyebrow (52:392) | `Avis clients` | web/eyebrow | text-brand |
| Titre (52:393) | `Ils nous ont fait confiance, ils en parlent.` | Poppins SemiBold 48/56 (bloc 640) | text-main |
| Note globale (52:395) | `4,9` | Poppins SemiBold 44/48 ls -0.88 | text-main |
| Note — libellé (52:408) | `Note moyenne · 120 avis` | Inter 14/20 | text-muted |
| Lien (52:486) | `Lire tous les avis` + arrow-right 18 (centré) | Inter SemiBold 16/24 | text-main |

Bloc note : fond #fff, bordure border-default, radius 20, px 24 py 16, 5 étoiles 16.
Cartes (52:409) : 3 colonnes égales, gap 24, hauteur 327, fond #fff, bordure border-default, radius 28, p 32, gap 24. Icône `quote` 32 (orange) + 5 étoiles 16 ; citation Inter Regular 18/29 text-main ; pied séparé par bordure haute (pt 20) : avatar rond 44 avec initiales (Inter SemiBold 15/24), nom (Inter SemiBold 15/24), origine (Inter 13/16 ls 0.13 text-muted), pill service (fond orange-50, texte `--mp-color-orange-700` #ad5300 Inter SemiBold 12/16, px 10 py 6).

| Node | Citation | Auteur | Initiales | Couleur avatar | Origine | Service | Note |
|------|----------|--------|-----------|----------------|---------|---------|------|
| 52:410 | « Arrivée à Douala sans stress : logement prêt, chauffeur à l'aéroport et même les courses faites. On s'est sentis attendus. » | Aurélie K. | AK | #f8cfaa | Paris → Douala | Logement temporaire | 5 |
| 52:435 | « Le chef privé a régalé nos invités pour l'anniversaire de ma mère. Service impeccable, équipe aux petits soins du début à la fin. » | Jean-Marc T. | JT | #d5eab8 | Yaoundé | Chef privé | 5 |
| 52:460 | « Je vis en France et Mambo gère mon appartement à Bonapriso. Comptes rendus réguliers, locataires suivis : je suis enfin serein. » | Sandrine M. | SM | #e4e1dc | Lyon | Gestion locative | 5 |

### 7. Partenaires (52:490) — centré, gap 32
| Rôle | Texte | Typo | Couleur |
|------|-------|------|---------|
| Titre (52:491) | `Ils travaillent à nos côtés` | Inter SemiBold 16/24 | text-muted |
| Placeholder logo ×6 | `Logo partenaire` | Inter SemiBold 14/20 ls 0.07 | `--mp-color-neutral-400` #a8a29a |
| Lien (52:506) | `Vous êtes prestataire ? Devenez partenaire` + arrow-right 18 | Inter SemiBold 16/24 | text-brand #ad5300 |

Logos : 6 cases égales (flex 1), hauteur 88, fond neutral-50, radius 20, gap 16.

| # | Node | Nom | Logo |
|---|------|-----|------|
| 1 | 52:493 | Logo partenaire 1 | placeholder |
| 2 | 52:495 | Logo partenaire 2 | placeholder |
| 3 | 52:497 | Logo partenaire 3 | placeholder |
| 4 | 52:499 | Logo partenaire 4 | placeholder |
| 5 | 52:501 | Logo partenaire 5 | placeholder |
| 6 | 52:503 | Logo partenaire 6 | placeholder |

### 8. CTA (56:2093, instance de Web/CTA — Desktop 56:2092)
Contenu identique au composant (voir components/cta-desktop.md) :
- Titre 2 lignes : `Un projet, une question ?` / `Parlons-en.` (Poppins SemiBold 52/58, ls -1.04, neutral-900)
- Texte : `Devis gratuit et sans engagement, réponse sous 24 h. Ou écrivez-nous directement sur WhatsApp.` (Inter 19/30, neutral-900)
- Boutons : `Demander un devis gratuit` (fond neutral-900, texte blanc, arrow-right 18, px 24 py 14, radius 12) ; `Écrire sur WhatsApp` (Button variante WhatsApp, fond #25d366, texte #1c1a18)
- Filigrane : Symbole M-Lien 384×291,8 opacité 22 %, pos (968,-20)

### 9. Footer (52:531) — voir components/footer-desktop.md

## 3. Données répétées (récap)
- Bandeau services : 13 libellés (section 2).
- Univers : 4 cartes (section 3) — compteurs « 5 services » (Expériences), « 4 services » (Culture) ; Immobilier montre 4 chips + « +3 » (=7 services) ; Proximité 3 services. Total annoncé : « 19 services regroupés en 4 univers ».
- Étapes : 3 (section 4). Canaux : 3.
- Engagements : 3 ; Stats : 4 (section 5).
- Avis : 3 + note globale 4,9 / 120 avis (section 6). Hero : « 4,9/5 · plus de 150 projets accompagnés ».
- Partenaires : 6 placeholders.

## 4. Éléments interactifs
| Libellé | Variante | Icône | Destination présumée |
|---------|----------|-------|----------------------|
| Demander un devis gratuit (hero) | Button Primary (orange #ff7a00, texte #1c1a18, h 48, radius 12, px 24 py 12) | — | /devis |
| Créer mon compte | secondaire blanc bordé (border-strong, radius 12, px 22 py 13) | arrow-right | /inscription (espace client) |
| Voir tous les services | lien pill bordé (radius 999) | arrow-right | /nos-services |
| Cartes univers (×4) | carte cliquable + bouton flèche rond 52 | arrow-up-right | /experience, /immobilier, /services-de-proximite, /culture-evenementiel |
| Chips services dans cartes | chips (non nécessairement cliquables) | — | fiches service |
| Formulaire en ligne / WhatsApp / Rendez-vous | chips canaux | file-text / whatsapp / calendar-check | /devis, WhatsApp, rendez-vous |
| Lire tous les avis | lien texte | arrow-right | /avis |
| Vous êtes prestataire ? Devenez partenaire | lien texte orange | arrow-right | /devenir-partenaire |
| CTA : Demander un devis gratuit | bouton sombre | arrow-right | /devis |
| CTA : Écrire sur WhatsApp | Button WhatsApp #25d366 | — | wa.me |
| WhatsApp flottant | bouton rond 64 | whatsapp | wa.me |

Aucun formulaire ni onglet sur cette page.

## 5. Éléments visuels
- Illustrations : `Illustration — accueil` (hero principal), `Illustration — chef` (hero vignette + carte Expériences), `Illustration — logement` (carte Immobilier), `Illustration — marche` (carte Culture), `Illustration — equipe` (stats).
- Icônes (lucide) : arrow-right, star, check, key, heart, sparkles, arrow-up-right, utensils, shopping-cart (`icon/cart`), package, compass, file-text, mail, shield, whatsapp (logo, hors lucide), calendar-check, users, globe, quote.
- Rayons : boutons 12 ; pills 999 ; cartes univers 32 ; étapes / avis / stats 28 ; bloc note & logos 20 ; cartes flottantes hero 20 ; illustration hero 32 / 24.
- Ombres : `elevation/3` = 0 12 24 -4 #3815361F + 0 4 8 -4 #3815360F (cartes flottantes) ; `elevation/2` = 0 4 8 -2 #3815361A + 0 2 4 -2 #3815360F (statut livraison) ; vignette chef 0 20 40 -8 rgba(28,26,23,0.14).
- Grilles : contenu 1312 px (1440 − 2×64). Univers bento 780/516. Étapes 3 col gap 24. Avis 3 col gap 24. Logos 6 col gap 16. Stats 2 col gap 16.
- Dégradé `gradient/energie` : #ff9a1f → #ff7a00 → #f0550f.
