# Inventaire — site/fiche-service-chef-prive-desktop

- Figma : frame `62:4161` « Fiche service (Chef privé) — Desktop 1440 », 1440 × 5286,5 px — **gabarit « fiche service »** (une fiche par service, 19 au total).
- Typographie : apostrophes **typographiques `’`** dans `À qui s’adresse ce service ?`, `d’anniversaires`, `d’équipe`, `nombre d’invités` (×2), `à l’avance` ; **droite `'`** dans l'avis `l'anniversaire`. Espaces ordinaires avant `?` `;` `:` (ex. `sur mesure ; vous recevez`).

## 1. Sections
| # | Node | Calque | Fond | Padding | Hauteur |
|---|------|--------|------|---------|---------|
| 0 | 62:4162 | Web/TopBar — Desktop | neutral-900 | py 10, px 80 | 36 |
| 0b | 62:4194 | Web/Header — Desktop (item « Nos services » actif) | #fff, bordure basse | py 18, px 40 | 85 |
| 1 | 62:4272 | Hero | `--mp-color-neutral-50` | pt 40 / pb 56, px 64, gap 32 | 850 |
| 2 | 62:4333 | Contenu (2 colonnes : principale 848 + latérale 400, gap 64) | `--mp-color-neutral-0` | py 80, px 64 | 2000 |
| 3 | 62:4496 | Témoignages | `--mp-color-neutral-50` | py 96, px 64, gap 48 | 532 |
| 4 | 62:4537 | Services liés | `--mp-color-neutral-0` | py 96, px 64, gap 48 | 458 |
| 5 | 62:4596 | Web/CTA — Desktop (**surchargé**) | #fff + gradient/energie | pb 112 | 494 |
| 6 | 62:4617 | Web/Footer — Desktop | neutral-900 | | 831,5 |
| — | 62:4729 | WhatsApp flottant (fond #25d366, radius 32, 64×64) | | | |

## 2. Textes

### Hero (62:4272)
| Rôle | Texte | Typo | Couleur |
|------|-------|------|---------|
| Fil d'Ariane | `Accueil` › `Nos services` › `Expérience` › **`Chef privé`** | Inter Regular 13/16 ls 0.13 (dernier SemiBold text-main) | text-muted |
| Tag rubrique | `Expérience` | Inter SemiBold 13/16 ls 0.13 | `--mp-color-orange-700` sur `--mp-color-orange-50`, bordure border-default, pill px 12 py 6 |
| Tag zones | `Douala · Yaoundé · Kribi` | Inter SemiBold 13/16 | text-muted sur #fff, bordure border-default |
| H1 | `Chef privé` (pas de mot orange) | Poppins SemiBold 64/68 ls -1.6 | text-main |
| Lead | `Un chef à domicile pour vos dîners, réceptions et grandes occasions. Vous profitez de vos invités, nous nous occupons du reste.` | Inter Regular 20/32 (bloc 780) | text-muted |
| Boutons (alignés à droite, bas du bloc titre) | `Demander un devis gratuit` (Primary) · `Écrire sur WhatsApp` (#25d366) | Inter SemiBold 16/24 | |

Galerie (62:4298) 1312×480, gap 16 : grande `Illustration — chef` 860×480 (#fce7d5, radius 28) + colonne 436 : `Illustration — marche` 436×232 (#eaf5db, radius 28) / `Illustration — chef` 436×232 (#fce7d5, radius 28).

### Colonne principale (gap 72) — titres H2 Poppins SemiBold `--mp-font-size-h2` / `--mp-font-line-height-h2` (≈32/40, ls -0.32) text-main

**1. `À qui s’adresse ce service ?`** — liste 2×2 (cartes 376, gap 12) fond neutral-50, radius 16, p 16, gap 12 ; pastille ronde 28 fond `--mp-color-orange-100` icône check 16 ; texte Inter 15/22 text-main.

| Public |
|--------|
| Aux particuliers qui reçoivent famille ou amis |
| Aux familles de la diaspora en séjour au pays |
| Aux organisateurs d’anniversaires et de fêtes privées |
| Aux entreprises pour un repas d’équipe ou un client |

**2. `Ce que Mambo fait concrètement`** — chronologie verticale : pastille numéro 36 (neutral-900, chiffre blanc Inter SemiBold 15/24 ; **étape 5 fond `--mp-color-brand-primary` #ff7a00, chiffre neutral-900**) + rail vertical 2 px border-default ; titre Inter SemiBold 17/24 text-main ; texte Inter 15/24 text-muted ; pt 6 pb 28, gap 18.

| N° | Titre | Texte |
|----|-------|-------|
| 1 | Échange sur votre projet | Date, lieu, nombre d’invités, envies et contraintes alimentaires. |
| 2 | Proposition de menu et devis | Le chef imagine un menu sur mesure ; vous recevez le devis sous 24 h. |
| 3 | Courses et préparation | Produits frais achetés par le chef, préparation sur place. |
| 4 | Service et rangement | Service à table, puis cuisine rangée et nettoyée. |
| 5 | Votre avis | Un court questionnaire pour nous aider à progresser. |

**3. `Les avantages pour vous`** — grille 2×2 (376, gap 16), fond neutral-50, radius 20, p 24, gap 12 ; icône 20 dans carré 44 radius 13 fond orange-50 ; titre Inter SemiBold 17/24 ; texte Inter 15/22 text-muted.

| Icône | Titre | Texte |
|-------|-------|-------|
| sparkles | Un menu unique | Pensé pour vos goûts et votre occasion. |
| shield | Des chefs vérifiés | Sélectionnés, suivis et évalués après chaque prestation. |
| clock | Du temps pour vous | Aucune course, aucune vaisselle : vous profitez. |
| users | Un interlocuteur unique | Joignable depuis la France comme au Cameroun. |

**4. `Questions fréquentes`** — accordéon ; item : bordure basse border-default, py 20 ; question Inter SemiBold 16/24 text-main + icône 20 à droite (`minus` si ouvert, `plus` si fermé) ; réponse Inter 15/24 text-muted.

| # | Question | État | Réponse |
|---|----------|------|---------|
| 1 | Combien coûte un chef privé ? | **ouvert** | Chaque prestation est unique : le tarif dépend du menu, du nombre d’invités et du lieu. Il vous est communiqué sur devis, gratuitement. |
| 2 | Dans quelles villes intervenez-vous ? | fermé | (non visible) |
| 3 | Puis-je réserver depuis la France ? | fermé | (non visible) |
| 4 | Combien de temps à l’avance réserver ? | fermé | (non visible) |

### Colonne latérale (400, gap 16) — probablement sticky
**Carte devis** (62:4456) : fond #fff, bordure border-default, radius 24, p 28, gap 16.
| Rôle | Texte | Typo |
|------|-------|------|
| Sur-titre | `Tarif communiqué sur devis` | Inter Medium 14/20 text-muted |
| Titre | `Recevez votre devis gratuit sous 24 h` | Poppins SemiBold h4 (20/28) text-main |
| Puce ×3 (pastille 22 vert-50 + check 14) | `Gratuit et sans engagement` · `Menu et prestation sur mesure` · `Un seul interlocuteur du début à la fin` | Inter 14/20 text-main |
| Bouton 1 | `Demander un devis gratuit` (Primary, pleine largeur) | |
| Bouton 2 | `Écrire sur WhatsApp` (#25d366, pleine largeur) | |
| Ligne tél. | icône phone 14 + `ou appelez le +237 6 00 00 00 00` | Inter 13/16 text-muted, centré |

**Encart aide** (62:4483) : fond neutral-50, radius 20, p 20 ; icône calendar-check 20 dans carré blanc 44 radius 13 ; `Préférez un rendez-vous ?` (Inter SemiBold 15/24) ; lien `Prendre rendez-vous` + arrow-right 16 (Inter SemiBold 14/20 text-brand).

### Témoignages (62:4496)
- Eyebrow `Avis clients` ; H2 `Ils ont reçu un chef à domicile` (48/56).
- 2 cartes (648, gap 16), fond #fff, bordure, radius 24, p 32, gap 16 ; quote 28 + 5 étoiles 15 ; citation Inter 18/29 text-main ; signature Inter Medium 14/20 text-muted.

| Citation | Signature | Note |
|----------|-----------|------|
| « Le chef a régalé nos invités pour l'anniversaire de ma mère. Service impeccable, du début à la fin. » | Jean-Marc T. · Yaoundé | 5 |
| « Dîner de fiançailles parfait : menu revisité, table magnifique, et une cuisine rendue impeccable. » | Laure B. · Douala | 5 |

### Services liés (62:4537)
- Eyebrow `Services liés` ; H2 `Pour compléter votre événement`.
- 3 cartes horizontales (426,7, gap 16), bordure border-default, radius 22, p 16, gap 16 ; vignette 96×96 radius 16 ; titre Inter SemiBold 16/24 ; description Inter 13/19 text-muted ; icône arrow-up-right 20.

| Service | Description | Vignette (fond) |
|---------|-------------|-----------------|
| Location de voiture | Véhicules récents, avec ou sans chauffeur, pour vos trajets et vos séjours. | Illustration — culture (#2e2b28) |
| Photographe | Portraits, événements, reportages : vos moments immortalisés. | Illustration — logement (#f1efec) |
| Massage bien-être | Des praticiens qualifiés, chez vous ou sur votre lieu de séjour. | Illustration — courses (#fdf4ec) |
(Remarque : vignettes non cohérentes avec les services — placeholders.)

### CTA (62:4596) — surcharge
- Titre : `Prêt à recevoir` / `vos invités ?`
- Texte : `Votre devis chef privé, gratuit et sans engagement, sous 24 h.`
- Boutons : `Demander un devis gratuit` (+ arrow-right) ; `Écrire sur WhatsApp`.

## 3. Données « fiche service » (modèle API)
| Champ | Exemple |
|-------|---------|
| slug | chef-prive |
| titre | Chef privé |
| rubrique | Expérience |
| zones | Douala · Yaoundé · Kribi |
| accroche (lead) | Un chef à domicile pour vos dîners, réceptions et grandes occasions. Vous profitez de vos invités, nous nous occupons du reste. |
| description courte (cartes) | Un chef à domicile pour vos dîners, réceptions et grandes occasions. |
| galerie | 3 visuels |
| publics[] | 4 libellés |
| étapes[] | 5 × {titre, texte} |
| avantages[] | 4 × {icône, titre, texte} |
| faq[] | 4 × {question, réponse} |
| carte devis | surTitre, titre, puces[3], téléphone |
| avis[] | 2 × {citation, auteur, ville, note} |
| servicesLiés[] | 3 slugs |
| cta | titre (2 lignes), texte |

## 4. Interactifs
| Élément | Variante | Destination |
|---------|----------|-------------|
| Fil d'Ariane ×3 | liens | /, /nos-services, /experience |
| Demander un devis gratuit (hero, carte devis, CTA) | Primary / sombre | /devis?service=chef-prive |
| Écrire sur WhatsApp (hero, carte, CTA) | WhatsApp | wa.me |
| ou appelez le +237 6 00 00 00 00 | lien tel: | tel:+237600000000 |
| Prendre rendez-vous | lien orange | /contact?rdv ou /rendez-vous |
| FAQ ×4 | accordéon (1er ouvert) | — |
| Services liés ×3 | cartes | /services/location-de-voiture, /services/photographe, /services/massage-bien-etre |

## 5. Visuels
Illustrations : chef ×2, marche, culture, logement, courses. Icônes : chevron-right, check, sparkles, shield, clock, users, minus, plus, phone, calendar-check, arrow-right, arrow-up-right, quote, star, whatsapp. Rayons : galerie 28, cartes 24/22/20/16.
