# Inventaire — site/culture-evenementiel-desktop

- Figma : frame `61:5620` « Culture & événementiel — Desktop 1440 », 1440 × 6128,5 px
- Gabarit « page rubrique » (styles : voir `experience-desktop.md`) + **section spécifique « Agenda »** (événements).
- Typographie : **apostrophes typographiques `’`** dans `Vivre le Cameroun, de l’intérieur.`, `Voir tout l’agenda`, `Visite des ateliers d’artisans` ; **droites `'`** dans le lead hero (`l'intégration`, `s'y`), la carte `l'agenda culturel`, les titres `Organisation d'activités et d'événements`.

## 1. Sections
| # | Node | Calque | Fond | Hauteur |
|---|------|--------|------|---------|
| 0 | 61:5621 / 61:5653 | TopBar + Header Desktop | composants | 36 + 85 |
| 1 | 61:5731 | Hero | neutral-50 | 568 |
| 2 | 61:5760 | Pour qui ? | #fff | 554 |
| 3 | 61:5789 | Services | neutral-50 | 1236 |
| 4 | 61:5921 | Agenda | #fff (rendu) | 704 |
| 5 | 61:6028 | Déroulé | #fff | 556 |
| 6 | 61:6057 | Témoignage | neutral-50 | 606 |
| 7 | 61:6081 | Autres rubriques | #fff | 458 |
| 8 | 61:6140 | Web/CTA — Desktop (**surchargé**) | gradient | 494 |
| 9 | 61:6161 | Web/Footer — Desktop | composant | 831,5 |
| — | 61:6273 | WhatsApp flottant | | 64 |

## 2. Textes

### Hero
- Fil d'Ariane : `Accueil` › `Nos services` › **`Culture & événementiel`**
- Eyebrow : `Culture & événementiel`
- H1 : `Vivre le Cameroun, ` + **`de l’intérieur.` (orange #ad5300)** (vérifié sur capture)
- Lead : `Découvertes, sorties culturelles, événements organisés par Mambo et accompagnement à l'intégration : pour découvrir le pays ou s'y sentir chez soi.`
- Boutons : `Demander un devis gratuit` · `Écrire sur WhatsApp`
- Visuel : `Illustration — culture` 560×440

### Pour qui ?
- Eyebrow `Pour qui ?` ; H2 `Pour les curieux, les nouveaux arrivants et la diaspora.`

| Icône | Titre | Texte |
|-------|-------|-------|
| plane | Visiteurs et diaspora | Vous venez quelques semaines : profitez du pays sans rien organiser. |
| map-pin | Nouveaux arrivants | Vous vous installez : repères, rencontres et bonnes adresses. |
| users | Groupes et entreprises | Sorties, activités et événements sur mesure pour vos équipes. |

### Services
- Eyebrow `Nos services` ; H2 `4 façons de découvrir et de vivre le pays.` (pas de lead)

| Service | Description | Icône | Illustration |
|---------|-------------|-------|--------------|
| Découverte du Cameroun | Circuits et visites pour découvrir le pays autrement. | compass | culture |
| Activités culturelles, loisirs et sorties | Concerts, expositions, sorties : l'agenda culturel à portée de main. | sparkles | culture |
| Organisation d'activités et d'événements | Des sorties et des événements conçus et organisés par Mambo. | calendar-check | evenement |
| Découverte et intégration locale | Repères, rencontres et conseils pour vous sentir chez vous. | globe | culture |

### Agenda (61:5921) — styles relevés sur capture
- En-tête : eyebrow `Agenda Mambo` ; H2 `Prochaines sorties et événements` (48/56, 1 ligne) ; lien à droite `Voir tout l’agenda` + arrow-right 16 (Inter SemiBold 14/20 text-main).
- 3 cartes événement (424 × 376, gap 20), fond #fff, bordure border-default, radius 24 ; visuel 422×200 (illustration) avec **badge date** blanc 54×56 radius ~10 en (16,16) : jour Poppins SemiBold ~20/24 text-main + mois Inter SemiBold 11/16 uppercase text-brand ; contenu p 24 : tag pill (fond vert-50, texte vert-700 Inter SemiBold 12/16), titre Poppins SemiBold ~19/26, lieu (icône map-pin 16 + Inter 14/20 text-muted), actions : `Je participe` + arrow-right (Inter SemiBold 14/20 text-brand) à gauche, `Places limitées` (Inter 12/16 text-subtle) à droite.

| # | Jour | Mois | Tag | Titre | Lieu | Mention | Illustration |
|---|------|------|-----|-------|------|---------|--------------|
| 1 | 14 | NOV. | Gastronomie | Nuit des saveurs camerounaises | Douala · Akwa | Places limitées | chef |
| 2 | 22 | NOV. | Nature | Randonnée et cascades de la Lobé | Kribi · journée | Places limitées | culture |
| 3 | 06 | DÉC. | Artisanat | Visite des ateliers d’artisans | Foumban · week-end | Places limitées | marche |

### Déroulé — gabarit (4 étapes identiques)

### Témoignage
| Citation | Auteur | Initiales | Sous-ligne | Illustration |
|----------|--------|-----------|-----------|--------------|
| « La journée découverte à Kribi était parfaite : guide passionné, repas local, tout était organisé. Mes enfants en parlent encore. » | Patrick E. | PE | Marseille · Découverte du Cameroun | equipe |

### Autres rubriques
| Rubrique | Sous-ligne | Vignette |
|----------|-----------|----------|
| Expérience | Des moments sur mesure · 5 services | accueil |
| Immobilier | Se loger en toute sérénité · 7 services | logement |
| Services de proximité | Votre quotidien simplifié · 3 services | courses |

### CTA (61:6140) — surcharge (capture)
- Titre : `Envie de sortir,` / `de découvrir ?`
- Texte : `Rejoignez une sortie Mambo ou demandez une activité sur mesure.`
- Boutons : `Demander un devis gratuit` (+ arrow-right) ; `Écrire sur WhatsApp`.

## 3. Interactifs
- Gabarit rubrique (fil d'Ariane, boutons hero, 4 × `Voir le service` / `Devis`, autres rubriques, CTA, WhatsApp).
- `Voir tout l’agenda` → /agenda (liste des événements).
- `Je participe` ×3 → inscription à l'événement (/agenda/<slug> ou formulaire d'inscription).

## 4. Visuels
Illustrations : culture (hero + 3 cartes + événement 2), evenement, chef (événement 1), marche (événement 3), equipe, accueil / logement / courses. Icônes : plane, map-pin, users, compass, sparkles, calendar-check, globe, arrow-right, arrow-up-right, quote, chevron-right.
