# Inventaire — site/navigation-mega-menu-nos-services-desktop

- Figma : frame `72:10000` « Navigation — Méga-menu Nos services — Desktop 1440 ».
- État : survol/ouverture de l'item « Nos services » du header (item en **Inter SemiBold text-main** + chevron + indicateur actif).
- Typographie : apostrophes droites (`Accompagnement à l'installation`, `Organisation d'activités et d'événements`).

## Structure
| Node | Calque | Détails |
|------|--------|---------|
| — | Web/TopBar — Desktop | identique au composant |
| 72:10033 | Web/Header — Desktop | fond blanc + backdrop-blur 12 ; « Nos services » actif |
| 72:10111 | Voile | fond `--mp-color-neutral-900`, **opacité 35 %**, recouvre la page sous le header |
| 72:10112 | Méga-menu | panneau blanc 1360 px, pos (40, 132), radius 28, p 32, gap 32, ombre `elevation/4` (0 24 48 -12 #38153638) |

## Colonnes (72:10113, 4 colonnes égales, gap 28)
En-tête de colonne (gap 10) : pastille 36 radius 11 + icône 17 ; titre Inter SemiBold 15/24 text-main ; sous-titre Inter Regular 12/16 ls 0.12 text-muted. Séparateur 1 px border-default. Liens services Inter Regular 14/20 text-main (gap 12). Lien bas `Toute la rubrique` + arrow-right 16 (Inter SemiBold 14/20 text-brand #ad5300).

| Rubrique | Sous-titre | Pastille (fond / icône) | Services (ordre) |
|----------|-----------|-------------------------|------------------|
| Expérience | Des moments sur mesure | orange-50 / sparkles | Location de voiture · Photographe · Chef privé · Massage bien-être · Services événementiels |
| Immobilier | Se loger en toute sérénité | neutral-100 / building | Recherche de logement · Location, sous-location et colocation · Logement adapté et appartement meublé · Gestion locative · Entretien des logements · Accompagnement à l'installation · Solutions de logement temporaire |
| Services de proximité | Votre quotidien simplifié | vert-50 / cart | Portage et livraison de repas · Livraison de courses et de commandes · Réception de colis et de courrier |
| Culture & événementiel | Vivre le Cameroun | neutral-900 / compass (blanc) | Découverte du Cameroun · Activités culturelles, loisirs et sorties · Organisation d'activités et d'événements · Découverte et intégration locale |

## Encart promo (72:10195)
Fond neutral-900, radius 22, p 24, largeur 280, gap 14 :
| Élément | Contenu |
|---------|---------|
| Visuel | `Illustration — accueil` 232×130, fond #fce7d5, radius 16 |
| Titre | `Un besoin précis ?` — Inter SemiBold 16/24 blanc |
| Texte | `Devis gratuit, réponse sous 24 h.` — Inter 14/20 neutral-300 |
| Bouton | `Devis gratuit` — Button Primary pleine largeur |

## Interactifs
- 19 liens services → /services/<slug> ; 4 × `Toute la rubrique` → /experience, /immobilier, /services-de-proximite, /culture-evenementiel ; `Devis gratuit` → /devis ; clic sur le voile / Échap → fermeture.
