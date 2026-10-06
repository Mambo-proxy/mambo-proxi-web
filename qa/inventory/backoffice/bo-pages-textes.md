# BO — Pages & textes (92:10771)

Écran desktop 1440 × 1419. Coque : voir `_shell.md` — élément actif **Pages & textes**. Éditeur de sections de pages (page sélectionnée : Accueil).

## 1. Régions

| Région | Node | Position / taille | Détails |
|---|---|---|---|
| Barre latérale | 92:10772 | 264 × 1419 | identique `_shell.md` |
| Barre supérieure | 92:10895 | 1176 × 83 | fil d’Ariane, 2 boutons |
| Contenu | 92:10925 | 1176 × 1336 | padding 32px |
| Rangée | 92:10926 | 1112 × 1272 | liste des pages 260px + sections 828px, écart 24px |
| Liste « Pages » | 92:10927 | 260 × 736 | carte blanche, bordure #E4E1DC, radius 16px, padding 12px, gap 2px |
| Sections | 92:11033 | 828 × 1272 | en-tête + 7 cartes de section, écart 14px |

## 2. Textes et typographie

### Barre supérieure
| Texte | Node | Rôle / style |
|---|---|---|
| `Contenus du site` › `Pages & textes` | 92:10898 / 92:10901 | fil d’Ariane, Inter Regular 12px #5E5952 |
| `Pages & textes` | 92:10902 | titre, Poppins SemiBold 24px |
| `Voir la page` | 92:10915 | bouton secondaire, icon/arrow-up-right 16px, fond blanc, bordure #CFCAC3, 135 × 42 |
| `Publier les modifications` | 92:10920 | bouton primaire, icon/check-circle 16px, fond #FF7A00, texte #1C1A18, 221 × 40 |

### Liste des pages (92:10927)
- Titre de groupe `PAGES DU SITE` — Inter SemiBold 11px / lh 16px, tracking 0,11px, #7D776F, padding 6px 10px 8px.
- Élément : padding 9px / 10px, radius 9px, gap 10px, icon/file-text 16px ; libellé Inter Medium 14px / lh 20px #46423D. **Actif** (`Accueil`) : fond #FDF4EC, libellé Inter SemiBold 14px #1C1A18, icône orange.
- Méta à droite (optionnelle) : Inter Regular 11px #7D776F.

| # | Page | Node | État / méta |
|---|---|---|---|
| 1 | `Accueil` | 92:10930 | **active** |
| 2 | `Nos services` | 92:10936 | |
| 3 | `Expérience` | 92:10942 | |
| 4 | `Immobilier` | 92:10948 | |
| 5 | `Services de proximité` | 92:10954 | |
| 6 | `Culture & événementiel` | 92:10960 | |
| 7 | `Qui sommes-nous ?` | 92:10966 | (espace avant « ? ») |
| 8 | `Mission` | 92:10972 | |
| 9 | `Partenaires` | 92:10978 | |
| 10 | `Formation` | 92:10984 | |
| 11 | `Recrutement` | 92:10990 | |
| 12 | `Avis clients` | 92:10996 | |
| 13 | `Contact` | 92:11002 | |
| 14 | `Suivi Mambo` | 92:11008 | |
| 15 | `Mentions légales` | 92:11014 | méta `Modifié hier` |
| 16 | `Confidentialité` | 92:11021 | |
| 17 | `Cookies` | 92:11027 | |

### En-tête des sections (92:11034)
- `Accueil` — titre de la page éditée (Poppins SemiBold 20px / lh 28px, #1C1A18).
- `7 sections · glissez pour réordonner, cliquez pour modifier` — Inter Regular 12px #5E5952.
- Bouton `Ajouter une section` — secondaire (icon/plus 16px, fond blanc, bordure #CFCAC3, radius 10px, 188 × 42).

### Cartes de section
Carte repliée : fond #FFFFFF, bordure 1px #E4E1DC, radius 16px, padding 18px ; en-tête gap 12px : icon/grip 18px, titre Inter SemiBold 15px / lh 24px #1C1A18, description Inter Regular 12px #5E5952, interrupteur de visibilité 40 × 24 (activé #7DB928), icon/chevron-right 18px.
Carte dépliée (en cours d’édition) : **bordure 2px `--mp-color-brand-primary` #FF7A00**, icône icon/minus 18px à la place du chevron, contenu gap 16px.

| # | Section | Node | Description (verbatim) | Visible | État |
|---|---|---|---|---|---|
| 1 | `Bandeau supérieur` | 92:11042 | `Téléphones, e-mail et réseaux · repris des Paramètres` | activé | repliée |
| 2 | `Section principale` | 92:11058 | `Titre, texte, boutons et visuel` | activé | **dépliée** |
| 3 | `Nos engagements` | 92:11146 | `3 engagements : titre et texte` | activé | repliée |
| 4 | `Rubriques de services` | 92:11162 | `Générée automatiquement à partir des Services` | activé | repliée |
| 5 | `Chiffres clés` | 92:11178 | `Projets accompagnés, partenaires engagés, pays couverts` | activé | **dépliée** |
| 6 | `Témoignages` | 92:11215 | `Les avis publiés s’affichent automatiquement (3 derniers)` | activé | repliée |
| 7 | `Partenaires et newsletter` | 92:11231 | `Logos gérés dans Partenaires · inscription à la lettre` | activé | repliée |

#### Section principale — champs (style de champ identique à l’éditeur de service : libellé Inter SemiBold 14px, saisie bordure #CFCAC3 radius 12px, valeur Inter Regular 16px)
| Champ | Obligatoire | Type | Valeur |
|---|---|---|---|
| `Titre` | oui `*` (#AD5300) | texte | `Mambo, ce n’est pas qu’un service. C’est une expérience pensée pour vous.` |
| `Texte de présentation` | non | zone de texte (76px) | `Mobilité, chef privé, logement, courses, découvertes culturelles… Nous réunissons des prestataires de confiance pour vous simplifier la vie au Cameroun.` |
| `Bouton principal` | non | liste déroulante (libellé → cible) | `Demander un devis gratuit → Devis gratuit` |
| `Bouton secondaire` | non | liste déroulante | `Créer mon compte → S’inscrire` |
| `Visuel` | non | image | vignette illustration « accueil » 120 × 80 ; nom `accueil-douala.jpg` (Inter SemiBold 14px) ; méta `1600 × 1200 · 240 Ko` (Inter Regular 12px #5E5952) ; bouton secondaire `Remplacer` (icon/image 16px) |

#### Chiffres clés — 4 blocs (fond #F8F7F5, radius 12px, padding 12px, gap 8px ; 2 sous-champs blancs bordure #E4E1DC radius 8px padding 8px / 10px : valeur Inter SemiBold 16px #1C1A18, libellé Inter Regular 12px #5E5952)
| Valeur | Libellé |
|---|---|
| `150+` | `projets accompagnés` |
| `40+` | `partenaires engagés` |
| `19` | `services` |
| `2` | `pays couverts` |

## 3. Données

- **Page** : id/slug, titre (17 pages listées ci-dessus), dateModification (« Modifié hier »), sections[] ordonnées.
- **Section** : type (bandeau_superieur, hero/section_principale, engagements, rubriques_services, chiffres_cles, temoignages, partenaires_newsletter), titre, description, visible (bool), ordre, contenu (selon type) :
  - section_principale : titre (requis), texte, boutonPrincipal {libellé, cible}, boutonSecondaire {libellé, cible}, visuel {fichier, dimensions, poids}.
  - chiffres_cles : items[] {valeur, libellé}.
  - engagements : items[3] {titre, texte}.
  - bandeau_superieur : données reprises des Paramètres (téléphones, e-mail, réseaux).
  - rubriques_services : générée depuis Services.
  - temoignages : 3 derniers avis publiés.
  - partenaires_newsletter : logos depuis Partenaires + formulaire d’inscription.
- Cibles de boutons connues : `Devis gratuit`, `S’inscrire`.

## 4. Interactions

| Élément | Type |
|---|---|
| Liste des pages | navigation (page active surlignée) |
| `Voir la page` | ouvre la page publique |
| `Publier les modifications` | publication |
| `Ajouter une section` | ajout |
| Poignée icon/grip | glisser pour réordonner |
| Clic carte / chevron / moins | déplier / replier l’édition |
| Interrupteur par section | visibilité de la section |
| Listes déroulantes Bouton principal / secondaire | choix libellé → cible |
| `Remplacer` | remplacement d’image |
