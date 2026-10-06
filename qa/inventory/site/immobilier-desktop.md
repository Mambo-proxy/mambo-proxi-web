# Inventaire — site/immobilier-desktop

- Figma : frame `61:2156` « Immobilier — Desktop 1440 », 1440 × 5998,5 px
- Gabarit « page rubrique » : styles identiques à `experience-desktop.md` (mêmes composants, mêmes tailles). Textes ci-dessous relevés sur la structure Figma (noms de calques = contenu) et capture pour le CTA.
- Typographie : apostrophes droites `'`.

## 1. Sections
| # | Node | Calque | Fond | Hauteur |
|---|------|--------|------|---------|
| 0 | 61:2157 / 61:2189 | TopBar + Header Desktop | composants | 36 + 85 |
| 1 | 61:2267 | Hero | neutral-50 | 568 |
| 2 | 61:2296 | Pour qui ? | #fff | 554 |
| 3 | 61:2327 | Services (**groupés en 2 sous-groupes**) | neutral-50 | 1810 |
| 4 | 61:2559 | Déroulé | #fff | 556 |
| 5 | 61:2588 | Témoignage | neutral-50 | 606 |
| 6 | 61:2612 | Autres rubriques | #fff | 458 |
| 7 | 61:2671 | Web/CTA — Desktop (**surchargé**) | gradient | 494 |
| 8 | 61:2692 | Web/Footer — Desktop | composant | 831,5 |
| — | 61:2804 | WhatsApp flottant | | 64 |

## 2. Textes

### Hero
- Fil d'Ariane : `Accueil` › `Nos services` › **`Immobilier`**
- Eyebrow : `Immobilier`
- H1 (Poppins SemiBold 52/58, 2 lignes de 58) : `Se loger au Cameroun, ` + **`en toute sérénité.` en orange #ad5300** (vérifié sur capture).
- Lead (Inter 19/31) : `Que vous cherchiez un logement ou que vous souhaitiez confier votre bien, une équipe présente sur place s'occupe de tout, même pendant que vous êtes en France.`
- Boutons : `Demander un devis gratuit` · `Écrire sur WhatsApp`
- Visuel : `Illustration — logement` 560×440

### Pour qui ?
- Eyebrow `Pour qui ?` ; H2 `Locataires, propriétaires et familles.`

| Icône | Titre | Texte |
|-------|-------|-------|
| key | Vous cherchez un logement | Pour un séjour, une installation durable ou un besoin spécifique. |
| building | Vous êtes propriétaire | Votre bien est géré, entretenu et loué en toute transparence. |
| home-heart | Vous accompagnez un proche | Logement adapté, meublé, installation : nous préparons tout. |

### Services (61:2327)
- Eyebrow `Nos services` ; H2 `7 services pour chaque étape de votre logement.` (pas de lead)
- **Titres de groupe** (h 32, Poppins SemiBold ~24 *(estimé)*) suivis d'une ligne horizontale 1 px (border-default) qui remplit la largeur : `Vous cherchez un logement` ; `Vous êtes propriétaire`.
- Cartes : gabarit carte service (illustration 220 + icône 40 + titre + description + `Voir le service` / `Devis`).

| Groupe | Service | Description | Icône | Illustration |
|--------|---------|-------------|-------|--------------|
| Vous cherchez un logement | Recherche de logement | Nous trouvons le bien qui correspond à vos critères et à votre budget. | search | logement |
| Vous cherchez un logement | Location, sous-location et colocation | Des solutions souples, avec des contrats clairs et un suivi. | key | logement |
| Vous cherchez un logement | Logement adapté et appartement meublé | Logements thérapeutiques ou adaptés, et meublés prêts à vivre. | home-heart | logement |
| Vous cherchez un logement | Solutions de logement temporaire | Un logement pour quelques jours ou quelques mois, prêt à votre arrivée. | clock | logement |
| Vous cherchez un logement | Accompagnement à l'installation | Démarches, abonnements, ameublement : on vous aide à vous installer. | home | accueil |
| Vous êtes propriétaire | Gestion locative | Nous gérons votre bien au Cameroun, même depuis la France. | building | equipe |
| Vous êtes propriétaire | Entretien des logements | Ménage, petites réparations et contrôles réguliers. | wrench | logement |

### Déroulé — identique à Expérience
Eyebrow `Comment ça se passe` ; H2 `Nous coordonnons tout, du premier message au suivi.` ; étapes 1 Votre demande / 2 Devis sur mesure / 3 Intervention / 4 Votre avis (textes identiques).

### Témoignage
| Citation | Auteur | Initiales | Sous-ligne | Illustration |
|----------|--------|-----------|-----------|--------------|
| « Je vis en France et Mambo gère mon appartement à Bonapriso. Comptes rendus réguliers, locataires suivis : je suis enfin serein. » | Sandrine M. | SM | Lyon · Gestion locative | equipe |

### Autres rubriques
Eyebrow `Découvrir aussi` ; H2 `Nos autres rubriques`.

| Rubrique | Sous-ligne | Vignette |
|----------|-----------|----------|
| Expérience | Des moments sur mesure · 5 services | Illustration — accueil |
| Services de proximité | Votre quotidien simplifié · 3 services | Illustration — courses |
| Culture & événementiel | Vivre le Cameroun · 4 services | Illustration — culture |

### CTA (61:2671) — surcharge (lu sur capture)
- Titre 2 lignes : `Un logement à trouver` / `ou à confier ?`
- Texte : `Expliquez-nous votre projet immobilier : devis gratuit et réponse sous 24 h.`
- Boutons : `Demander un devis gratuit` (sombre + arrow-right) ; `Écrire sur WhatsApp`.

## 3. Interactifs
Identiques au gabarit rubrique : fil d'Ariane, 2 boutons hero, `Voir le service` ×7 → /services/<slug>, `Devis` ×7 → /devis?service=<slug>, 3 cartes autres rubriques, CTA (/devis, wa.me), WhatsApp flottant.

## 4. Visuels
Illustrations : logement (hero, cartes), accueil, equipe (carte Gestion locative + témoignage), courses, culture (vignettes). Icônes : chevron-right, key, building, home-heart, search, clock, home, wrench, arrow-right, arrow-up-right, quote.
