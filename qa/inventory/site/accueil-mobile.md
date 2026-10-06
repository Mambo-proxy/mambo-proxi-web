# Inventaire — site/accueil-mobile (différences vs desktop)

- Figma : frame `53:530` « Accueil — Mobile 390 », 390 × 7093,5 px
- Référence complète : `accueil-desktop.md`. Ce fichier ne liste que les écarts.
- Gouttière latérale 20 px ; sections py 64.

## Ordre des sections

| # | Node | Calque | Fond | Padding | Hauteur |
|---|------|--------|------|---------|---------|
| 0 | 53:531 | Web/Header — Mobile (instance) — **pas de TopBar sur mobile** | — | — | 69 |
| 1 | 53:551 | Hero | neutral-50 #f8f7f5 | pt 28 / pb 40, px 20, gap 22 | 1041 |
| 2 | 53:595 | Bandeau services | #fff (bordures haut/bas) | — | 62 |
| 3 | 53:616 | Nos univers | #fff | py 64, px 20, gap 28 | 1570 |
| 4 | 54:606 | Comment ça marche | neutral-50 | py 64, px 20, gap 24 | 738 |
| 5 | 54:639 | Pourquoi Mambo | #fff | py 64 | 782 |
| 6 | 54:683 | Avis clients | neutral-50 | py 64, pl 20 (carrousel déborde à droite), gap 24 | 532 |
| 7 | 54:753 | Partenaires | #fff | — | 316 |
| 8 | 56:2133 | Web/CTA — Mobile (instance) | — | — | 392 |
| 9 | 54:790 | Web/Footer — Mobile (instance) | — | — | 1591,5 |
| — | 54:893 | Web/WhatsApp flottant — **56×56** (desktop 64), pos (318,772) | — | — | 56 |

Ordre identique au desktop.

## 1. Hero (53:551) — une colonne, visuel sous le texte
| Élément | Mobile | Desktop |
|---------|--------|---------|
| Pastille pays | `France · Cameroun` (espaces simples) Inter SemiBold 12/16 ls 0.12, pill px 8 py 3 | `France  ·  Cameroun` (doubles espaces) 13/20 |
| Pastille libellé | `Conciergerie de proximité` Inter **Regular 13/16** ls 0.13 | Inter Medium 14/20 |
| H1 | mêmes 2 lignes (`Mambo, ce n'est pas qu'un service.` / `C'est une expérience pensée pour vous.` en #ad5300) — **Poppins SemiBold 36/42, ls -0.72** | 58/64 |
| Lead | **`Mobilité, chef privé, logement, courses, découvertes… Des prestataires de confiance pour vous simplifier la vie au Cameroun.`** Inter 16/25 | texte plus long, 19/31 |
| Boutons | empilés pleine largeur 350 (gap 10) : `Demander un devis gratuit` (Primary) puis `Créer mon compte` + arrow-right (centré) | côte à côte |
| Confiance | **3 avatars** 32 px (bordure 2, -10) #f8b272 #bce08a #f8cfaa ; **pas d'étoiles** ; `4,9/5 · plus de 150 projets accompagnés` Inter Medium 13/20 | 4 avatars 40 + 5 étoiles |
| Visuel | 350×400 : `Illustration — accueil` seule (radius 28, fond #fce7d5) ; **une seule carte flottante** (devis : `Devis envoyé en 24 h` Inter SemiBold 13/20, `Chef privé · samedi 20h` Inter 11/16 ; radius 16 ; icône check 18 dans 34 radius 10) pos (16,20) ; sticker `Pensé pour vous` (Inter SemiBold 11/16, heart 12) pos (208,300) rot 4° | + vignette chef, carte logement |

Absents sur mobile : carte « Logement trouvé / Bastos, Yaoundé / Installation prévue le 12 nov. », vignette `Illustration — chef`.

## 2. Bandeau services (53:595) — liste réduite, défilement horizontal
Items (Poppins SemiBold, h 28 ; icône sparkles **14**) : `Chef privé` · `Logement` · `Massage bien-être` · `Courses` · `Découverte du Cameroun` (5 items ; libellé `Logement` n'existe pas sur desktop).

## 3. Nos univers (53:616)
- Eyebrow `Nos univers de services` Inter SemiBold **12/16 ls 0.96** uppercase, text-brand.
- Titre `Tout ce dont vous avez besoin, réuni au même endroit.` — **Poppins SemiBold 30/36 ls -0.45** (style `web/section-mobile`).
- Lead raccourci : **`19 services regroupés en 4 univers.`** Inter 16/24.
- **Pas de lien « Voir tous les services »**.
- Cartes : **pile verticale de 4 cartes identiques** 350×300, radius 24, gap 14 ; illustration plein cadre + voile (transparent 20 % → rgba(28,26,23,0.85)) ; tag pill blanc (Inter SemiBold 11/16, **sans icône**) ; titre Poppins SemiBold 24/30 (`--mp-font-size-h3`) blanc ; description Inter 14/20 blanc ; flèche ronde blanche 40 (arrow-up-right 18) pos (294,16). **Pas de chips de services.**

| Carte | Tag | Titre | Description mobile | Illustration |
|-------|-----|-------|--------------------|--------------|
| Expériences (53:622) | 5 services | Des moments sur mesure | Voiture, chef privé, massage, photographe, événementiel. | Illustration — chef (#fce7d5) |
| Immobilier (53:644) | **7 services** (desktop : pas de tag) | Immobilier | Trouver, louer, s'installer ou confier votre bien. | Illustration — logement (#f1efec) |
| Proximité (53:666) | **3 services** | Votre quotidien simplifié | Repas, courses et colis livrés pour vous. | **Illustration — livraison** (#eaf5db) — desktop n'a pas d'illustration (icônes + carte statut) |
| Culture (53:688) | 4 services | Vivre le Cameroun | Découvertes, sorties, événements, intégration locale. | Illustration — marche (#eaf5db) |

## 4. Comment ça marche (54:606)
- Eyebrow 12/16 ; titre `Simple comme un message.` Poppins 30/36 centré ; lead raccourci **`Trois étapes, un seul interlocuteur.`** Inter 16/24 centré.
- Étapes = **cartes horizontales** (icône 22 dans 48 radius 14 | texte | numéro à droite), fond #fff, bordure, radius 20, p 20, gap 16. Titre **Inter SemiBold 16/24** (desktop Poppins 22/30) ; texte Inter 14/20 ; numéro Poppins SemiBold 28/32 #f8cfaa.

| N° | Titre | Texte mobile |
|----|-------|--------------|
| 01 | Vous exprimez votre besoin | Formulaire, WhatsApp ou rendez-vous. |
| 02 | Vous recevez un devis sur mesure | Sous 24 h, sans engagement. |
| 03 | Nous nous occupons de tout | Vous êtes informé à chaque étape. |

- **Pas de ligne « Au choix : » / chips canaux.**

## 5. Pourquoi Mambo (54:639)
- Eyebrow `Nos engagements`, titre `La proximité, c'est notre métier.` (30/36). **Pas de lead.**
- Engagements : icône 20 dans carré 44, pas de bordure séparatrice visible dans la structure (gap 24). Titres/texte identiques au desktop ; **3e icône = `sparkles`** (desktop : globe). Calques nommés « Proximité », « Confiance », « Sur mesure ».
- **Pas d'illustration équipe.**
- Chiffres : **grille 2×2**, gap 12, cartes radius 20 p 20 ; valeur Poppins SemiBold **34/40 ls -0.68** ; libellé Inter 13/20.

| Valeur | Libellé mobile | Fond |
|--------|----------------|------|
| 150+ | projets accompagnés | neutral-50 |
| 40+ | partenaires engagés | gradient/energie |
| 19 | **services, 4 rubriques** | neutral-900 (texte blanc / neutral-300) |
| 2 pays | **France et Cameroun** | vert-50 (texte vert-800) |

## 6. Avis clients (54:683) — **carrousel**
- Eyebrow `Avis clients` ; titre raccourci **`Ils en parlent.`** (30/36).
- Note en ligne : `4,9` (Inter SemiBold 18/24) + 5 étoiles 14 + `· 120 avis` (Inter 14/20 muted). Pas de cadre.
- Carrousel horizontal (overflow), cartes 300 px, gap 12, radius 24, p 24, gap 18 ; quote 26 ; citation Inter 16/25 ; avatar 38 (initiales Inter Medium 14/20) ; nom Inter SemiBold 14/20 ; ligne `origine · service` Inter 12/16 muted (pas de pill service, pas de bordure séparatrice).

| Auteur | Citation mobile (raccourcie) | Sous-ligne |
|--------|------------------------------|-----------|
| Aurélie K. (AK, #f8cfaa) | « Arrivée à Douala sans stress : logement prêt, chauffeur à l'aéroport et même les courses faites. » | Paris → Douala · Logement temporaire |
| Jean-Marc T. (JT, #d5eab8) | « Le chef privé a régalé nos invités. Service impeccable du début à la fin. » | Yaoundé · Chef privé |

- Pagination 3 points : actif = barre 20×6 neutral-900, inactifs 6×6 neutral-300, gap 6.
- **Pas de lien « Lire tous les avis ».** 3e avis (Sandrine M.) non visible (3 points de pagination ⇒ 3 avis).

## 7. Partenaires (54:753)
- Titre `Ils travaillent à nos côtés` centré.
- Logos : **grille 3×2**, cases 110×60, gap 10 (horiz.) / 20 (vert.), placeholder texte **`Logo`**.
- Lien raccourci **`Devenez partenaire`** + arrow-right **16** (desktop : « Vous êtes prestataire ? Devenez partenaire »).

## 8–9. CTA / Footer
Instances `Web/CTA — Mobile` (voir components/cta-mobile.md) et `Web/Footer — Mobile` (components/footer-mobile.md).

## Tailles de titres mobile (récap)
| Rôle | Mobile | Desktop |
|------|--------|---------|
| H1 hero | Poppins SemiBold 36/42 ls -0.72 | 58/64 ls -1.45 |
| H2 section (`web/section-mobile`) | Poppins SemiBold 30/36 ls -0.45 | 48/56 ls -0.96 |
| Eyebrow | Inter SemiBold 12/16 ls 0.96 | 13/16 ls 1.04 |
| Titre carte univers | Poppins SemiBold 24/30 | 40/46 (Expériences) ou 30 |
| Stat | Poppins SemiBold 34/40 | 56/60 |
