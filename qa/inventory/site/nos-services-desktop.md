# Inventaire — site/nos-services-desktop

- Figma : frame `58:828` « Nos services — Desktop 1440 », 1440 × 5925,5 px
- Typographie : apostrophes droites `'`, aucun espace insécable détecté avant `:` `?`.

## 1. Sections (ordre)

| # | Node | Calque | Fond | Padding vertical | Hauteur |
|---|------|--------|------|------------------|---------|
| 0 | 58:829 | Web/TopBar — Desktop | voir composant | — | 36 |
| 0b | 58:861 | Web/Header — Desktop (item actif « Nos services » visible dans le rendu) | voir composant | — | 85 |
| 1 | 58:940 | Hero | `--mp-color-neutral-50` #f8f7f5 | pt 48 / pb 80, px 64 | 548 |
| 2 | 58:966 | Navigation rubriques | `--mp-color-neutral-0` #fff, bordure basse border-default | py 18, px 64 | 77 |
| 3 | 58:978 | Rubrique — Expérience | #fff (neutral-0) | py 96, px 64 | 968 |
| 4 | 58:1092 | Rubrique — Immobilier | neutral-50 #f8f7f5 (déduit : cartes blanches, rendu gris) | py 96 | 1288 |
| 5 | 58:1235 | Rubrique — Services de proximité | `--mp-color-neutral-0` #fff | py 96, px 64 | 784 |
| 6 | 58:1313 | Rubrique — Culture & événementiel | neutral-50 (déduit) | py 96 | 784 |
| 7 | 58:1406 | Web/CTA — Desktop (**textes surchargés**) | #fff + bandeau gradient/energie | pb 112 | 524 |
| 8 | 58:1427 | Web/Footer — Desktop | composant | — | 831,5 |
| — | 58:1539 | Web/WhatsApp flottant 64×64 (1348, 808) | — | — | — |

## 2. Textes

### Hero (58:940) — 2 colonnes, gap 64 ; texte flex-1 (688), gap 22
| Rôle | Texte | Typo | Couleur |
|------|-------|------|---------|
| Fil d'Ariane — lien | `Accueil` | Inter Regular 13/16 ls 0.13 | text-muted #5e5952 |
| Fil d'Ariane — séparateur | icône `chevron-right` 14 | — | — |
| Fil d'Ariane — courant | `Nos services` | Inter SemiBold 13/16 ls 0.13 | text-main |
| Eyebrow | `Nos services` (uppercase) | Inter SemiBold 13/16 ls 1.04 | text-brand #ad5300 |
| H1 (58:948), une phrase, retour à la ligne auto | `19 services, ` + **`un seul interlocuteur.` en orange #ad5300** | Poppins SemiBold 52/58 ls -1.3 | text-main / #ad5300 |
| Lead | `Expérience, immobilier, services de proximité, culture et événementiel : choisissez votre besoin, nous coordonnons tout avec des prestataires sélectionnés. Tarifs communiqués sur devis.` | Inter Regular 19/31 | text-muted |
| Bouton 1 | `Demander un devis gratuit` | Button Primary (Inter SemiBold 16/24) | #1c1a18 sur #ff7a00 |
| Bouton 2 | `Écrire sur WhatsApp` | Button WhatsApp | #1c1a18 sur #25d366 |

Visuel : `Illustration — accueil` 560×420, fond #fce7d5, radius 32.

### Navigation rubriques (58:966) — filtres/ancres pill, gap 8
Pills px 14 py 9, radius 999, Inter Medium 14/20 ls 0.07.

| Libellé | État | Style |
|---------|------|-------|
| Expérience | **actif** | fond + bordure neutral-900 #1c1a18, texte blanc, icône `check` 14 |
| Immobilier | inactif | fond #fff, bordure border-strong #cfcac3, texte text-main |
| Services de proximité | inactif | idem |
| Culture & événementiel | inactif | idem |

### Rubriques (gabarit commun) — 2 colonnes gap 64
Colonne « Présentation » 400 px, gap 16 :
- Numéro : Poppins SemiBold 56/60 ls -1.12, `--mp-color-orange-200` #f8cfaa
- Titre H2 : Poppins SemiBold 40/48 ls -0.8, text-main
- Sous-titre : Inter SemiBold 16/24, text-brand #ad5300
- Description : Inter Regular 16/26, text-muted
- Lien `Découvrir la rubrique` + arrow-right 16 : Inter SemiBold 14/20 ls 0.07, text-main
- Illustration 400×260, radius 24
Grille services : 2 colonnes de 416, gap 16 (flex-wrap). Carte : radius 24, p 28, gap 14, bordure border-default ; icône 24 dans carré 52 radius 16 ; flèche ronde 40 bordure border-strong icône `arrow-up-right` 18 ; titre Poppins SemiBold 20/28 (`h4`) ; description Inter Regular 15/24 text-muted ; lien `En savoir plus` + arrow-right 16, Inter SemiBold 14/20 text-brand.

| Rubrique | N° | Titre | Sous-titre | Description | Illustration (fond) | Fond carte | Fond pastille icône |
|----------|----|-------|-----------|-------------|---------------------|-----------|---------------------|
| Expérience | 01 | Expérience | Des moments sur mesure | Se déplacer, se faire plaisir, immortaliser un moment : des prestataires triés sur le volet, réservés pour vous. | Illustration — chef (#fce7d5) | neutral-50 | orange-50 #fdf4ec |
| Immobilier | 02 | Immobilier | Se loger en toute sérénité | Trouver, louer, s'installer, ou confier votre bien à une équipe présente sur place. | Illustration — logement (#f1efec) | #fff | neutral-100 #f1efec |
| Services de proximité | 03 | Services de proximité | Votre quotidien simplifié | Repas, courses, colis : nous nous en chargeons pour vous et pour vos proches. | Illustration — livraison (#eaf5db) | neutral-50 | vert-50 #f6faef |
| Culture & événementiel | 04 | Culture & événementiel | Vivre le Cameroun | Découvertes, sorties, événements et intégration locale : le pays vu de l'intérieur. | Illustration — marche (#eaf5db) | #fff | neutral-900 #1c1a18 (icône blanche) |

## 3. Données — 19 services (catalogue)

| # | Rubrique | Node | Service (titre) | Description courte | Icône (calque) |
|---|----------|------|-----------------|--------------------|----------------|
| 1 | Expérience | 58:1001 | Location de voiture | Véhicules récents, avec ou sans chauffeur, pour vos trajets et vos séjours. | icon/mobilite (voiture, `car`) |
| 2 | Expérience | 58:1020 | Photographe | Portraits, événements, reportages : vos moments immortalisés. | icon/photo (`camera`) |
| 3 | Expérience | 58:1037 | Chef privé | Un chef à domicile pour vos dîners, réceptions et grandes occasions. | icon/chef (`chef-hat`) |
| 4 | Expérience | 58:1054 | Massage bien-être | Des praticiens qualifiés, chez vous ou sur votre lieu de séjour. | icon/bien-etre (`flower`/`spa`) |
| 5 | Expérience | 58:1071 | Services événementiels | Décoration, traiteur, animation : des prestataires pour vos événements privés. | icon/party (`party-popper`) |
| 6 | Immobilier | 58:1115 | Recherche de logement | Nous trouvons le bien qui correspond à vos critères et à votre budget. | icon/search |
| 7 | Immobilier | 58:1132 | Location, sous-location et colocation | Des solutions souples, avec des contrats clairs et un suivi. | icon/key |
| 8 | Immobilier | 58:1150 | Logement adapté et appartement meublé | Logements thérapeutiques ou adaptés, et meublés prêts à vivre. | icon/home-heart (`house-heart`) |
| 9 | Immobilier | 58:1167 | Gestion locative | Nous gérons votre bien au Cameroun, même depuis la France. | icon/building (`building-2`) |
| 10 | Immobilier | 58:1185 | Entretien des logements | Ménage, petites réparations et contrôles réguliers. | icon/wrench |
| 11 | Immobilier | 58:1201 | Accompagnement à l'installation | Démarches, abonnements, ameublement : on vous aide à vous installer. | icon/home (`house`) |
| 12 | Immobilier | 58:1218 | Solutions de logement temporaire | Un logement pour quelques jours ou quelques mois, prêt à votre arrivée. | icon/clock |
| 13 | Proximité | 58:1258 | Portage et livraison de repas | Des repas livrés au domicile de la personne accompagnée. | icon/utensils |
| 14 | Proximité | 58:1276 | Livraison de courses et de commandes | Vos courses et achats effectués, puis livrés au bénéficiaire. | icon/cart (`shopping-cart`) |
| 15 | Proximité | 58:1294 | Réception de colis et de courrier | L'agence reçoit vos envois, prévient le destinataire et organise le retrait ou la livraison. | icon/package |
| 16 | Culture | 58:1336 | Découverte du Cameroun | Circuits et visites pour découvrir le pays autrement. | icon/compass |
| 17 | Culture | 58:1353 | Activités culturelles, loisirs et sorties | Concerts, expositions, sorties : l'agenda culturel à portée de main. | icon/sparkles |
| 18 | Culture | 58:1370 | Organisation d'activités et d'événements | Des sorties et des événements conçus et organisés par Mambo. | icon/calendar-check |
| 19 | Culture | 58:1388 | Découverte et intégration locale | Repères, rencontres et conseils pour vous sentir chez vous. | icon/globe |

Répartition : Expérience 5, Immobilier 7, Proximité 3, Culture 4 = 19.

## 4. CTA (58:1406) — surcharge de l'instance
- Titre 2 lignes : `Vous ne trouvez pas` / `votre besoin ?` (Poppins SemiBold 52/58 ls -1.04, neutral-900)
- Texte : `Décrivez-nous votre projet : nous trouvons la bonne solution et vous répondons sous 24 h.` (Inter 19/30)
- Boutons inchangés : `Demander un devis gratuit` (sombre + arrow-right) ; `Écrire sur WhatsApp` (#25d366)

## 5. Interactifs
| Élément | Variante | Destination présumée |
|---------|----------|----------------------|
| Accueil (fil d'Ariane) | lien texte | / |
| Demander un devis gratuit | Primary | /devis |
| Écrire sur WhatsApp | WhatsApp | wa.me |
| Pills rubriques ×4 | filtre/ancre (actif = noir + check) | #experience, #immobilier, #proximite, #culture |
| Découvrir la rubrique ×4 | lien texte | /experience, /immobilier, /services-de-proximite, /culture-evenementiel |
| Cartes services ×19 (flèche + « En savoir plus ») | carte cliquable | fiche service (/services/<slug>, cf. fiche-service-chef-prive) |
| CTA | 2 boutons | /devis, wa.me |

## 6. Visuels
- Illustrations : accueil (hero), chef, logement, livraison, marche.
- Icônes : chevron-right, check, arrow-right, arrow-up-right, + 19 icônes de service ci-dessus.
- Rayons : hero illu 32 ; cartes 24 ; pastille icône 16 ; pills 999.
- Largeurs : présentation 400, grille 848 (2 × 416 + 16). Hauteurs cartes 224–276 (selon titre sur 1 ou 2 lignes).
