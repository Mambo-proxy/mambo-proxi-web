# Synthèse des données — partie 2

Périmètre : Qui sommes-nous, Mission, Partenaires, Formation, Recrutement, Offre d'emploi (détail), Avis clients, Contact (desktop + mobile).
Fichiers sources : `qa/inventory/site/<page>-desktop.md` et `<page>-mobile.md`.

Conventions observées (toutes pages) :
- Espaces avant `:` `?` `%` et dans `24 h` / `72 h` : espaces **normales** dans Figma (vérifié sur l'export complet de Contact : 0 espace insécable) → à convertir en ` ` au rendu.
- Apostrophe typographique `’` majoritaire ; apostrophe droite `'` dans le texte de consentement (tous formulaires) et dans 3 avis clients.
- Écriture inclusive avec point médian `·` (`Coordinateur·rice`, `Intéressé·e ?`) ; `·` aussi utilisé comme séparateur (`Présentiel · Douala`, `Coordination · Douala`).
- Titres H1 : un fragment « surligné » en orange `#ad5300` (champ `highlight` à prévoir).

---

## 1. Entités de données

### 1.1 TeamMember (Qui sommes-nous › Notre équipe)
Champs : `name`, `role`, `location`, `portrait` (image / illustration), `order`.

| name | role | location |
|---|---|---|
| `Prénom Nom` | `Coordination` | `Douala` |
| `Prénom Nom` | `Relation clients` | `France` |
| `Prénom Nom` | `Immobilier` | `Yaoundé` |
| `Prénom Nom` | `Partenariats` | `Douala` |

Affichage : `role · location`.

### 1.2 Founder / Testimony (Qui sommes-nous › Parcours de la fondatrice)
Champs : `eyebrow`, `quote`, `bio`, `name`, `title`, `portrait`.
- quote : `« J’ai voulu créer le service dont chaque famille entre la France et le Cameroun a besoin : quelqu’un de confiance, sur place, qui s’occupe de tout comme pour les siens. »`
- bio : `Fondatrice de MAMBO Proxi, Mireille Bell a fait de la proximité le cœur de son engagement : relier deux pays qu’elle connaît intimement et accompagner chacun avec attention et exigence.`
- name : `Mireille Bell` ; title : `Fondatrice et directrice`

### 1.3 Value (Qui sommes-nous › Nos valeurs)
Champs : `icon`, `title`, `description`.

| icon | title | description |
|---|---|---|
| users | `Proximité` | `Être présents, accessibles et attentifs, ici et là-bas.` |
| shield | `Confiance` | `Des prestataires vérifiés, des engagements tenus.` |
| sparkles | `Exigence` | `Le même niveau de qualité, quel que soit le service.` |
| graduation | `Transmission` | `Partager la culture, les savoir-faire et les bonnes pratiques.` |

### 1.4 Commitment — variante « carte numérotée avec icône » (Qui sommes-nous › Pourquoi Mambo Proxi ?)
Champs : `number`, `icon`, `title`, `description`.

| number | icon | title | description |
|---|---|---|---|
| `01` | users | `Une équipe à vos côtés` | `Un interlocuteur unique qui vous accompagne pas à pas.` |
| `02` | shield | `Des solutions concrètes et durables` | `Des prestataires vérifiés, suivis et évalués.` |
| `03` | globe | `Un pont entre la France et le Cameroun` | `Préparez depuis la France, nous agissons sur place.` |

### 1.5 Commitment — variante « liste numérotée » (Mission › Nos engagements)
Champs : `number`, `title`, `description`.

| number | title | description |
|---|---|---|
| `01` | `Écoute` | `Comprendre votre besoin réel avant de proposer une solution.` |
| `02` | `Transparence` | `Un devis clair, sans frais cachés, avant toute prestation.` |
| `03` | `Fiabilité` | `Des prestataires vérifiés, suivis et évalués.` |
| `04` | `Réactivité` | `Une réponse sous 24 h, un suivi à chaque étape.` |
| `05` | `Confidentialité` | `Vos informations protégées et utilisées avec votre accord.` |
| `06` | `Amélioration continue` | `Votre avis après chaque prestation pour progresser.` |

### 1.6 KeyFigure (Qui sommes-nous › Chiffres)
Champs : `value`, `label`.

| value | label |
|---|---|
| `150+` | `projets accompagnés` |
| `40+` | `partenaires engagés` |
| `2` | `pays couverts` |
| `19` | `services` |

### 1.7 Pillar / Tag (Qui sommes-nous › Présentation)
Liste de libellés : `Vie`, `Expérience`, `Culture`, `Transmission`.

### 1.8 Statement (Mission › Mission et vision)
Champs : `key`, `eyebrow`, `icon`, `text`, `theme` (light/dark).

| key | eyebrow | icon | theme | text |
|---|---|---|---|---|
| mission | `Notre mission` | shield | light (orange-50) | `Accompagner les personnes, les familles et les organisations entre la France et le Cameroun, en leur offrant des solutions fiables, humaines et coordonnées pour se loger, se simplifier le quotidien et vivre des expériences de qualité.` |
| vision | `Notre vision` | compass | dark (neutral-900) | `Devenir la référence de la coordination de services entre la France et le Cameroun : un lieu unique où chacun trouve un interlocuteur de confiance, quel que soit son besoin.` |

### 1.9 MethodStep (Mission › Notre méthode de coordination)
Champs : `order`, `icon`, `title`, `description`.

| order | icon | title | description |
|---|---|---|---|
| 1 | file-text | `Écoute` | `Vous nous décrivez votre besoin par formulaire, WhatsApp ou rendez-vous.` |
| 2 | search | `Analyse` | `Nous identifions la solution et les prestataires les plus adaptés.` |
| 3 | mail | `Proposition` | `Vous recevez un devis clair et personnalisé sous 24 h.` |
| 4 | users | `Coordination` | `Nous organisons et supervisons l’intervention des prestataires.` |
| 5 | sparkles | `Suivi et évaluation` | `Un questionnaire de satisfaction clôture chaque prestation.` |

Mobile : titre préfixé `1. Écoute` … `5. Suivi et évaluation` (préfixe généré).

### 1.10 Quote / Signature (Mission › Citation)
Champs : `quote`, `attribution`, `illustration`.
- `« Mambo, ce n’est pas qu’un service. C’est une expérience pensée pour vous. »` — `La signature de MAMBO Proxi` — illustration `culture` (desktop seulement).

### 1.11 Partner (Partenaires › Nos partenaires)
Champs : `name`, `logo`, `category` (enum), `url` (présumé), `order`.
Catégories (enum) : `experience` (badge `Expérience`, filtre `Prestataires Expérience`), `immobilier` (`Immobilier` / `Immobilier`), `entreprise` (badge `Entreprise`, filtre `Entreprises & prestataires`).

| # | logo | category |
|---|---|---|
| 1 | `Logo partenaire` | Expérience |
| 2 | `Logo partenaire` | Immobilier |
| 3 | `Logo partenaire` | Entreprise |
| 4 | `Logo partenaire` | Expérience |
| 5 | `Logo partenaire` | Immobilier |
| 6 | `Logo partenaire` | Entreprise |
| 7 | `Logo partenaire` | Expérience |
| 8 | `Logo partenaire` | Entreprise |

(Mobile n'affiche que les 6 premiers.)

### 1.12 PartnershipType (Partenaires › Catégories)
Champs : `key`, `illustration`, `title`, `audience`, `description`, `ctaLabel`.

| key | illustration | title | audience | description | cta |
|---|---|---|---|---|---|
| experience | equipe | `Prestataires Expérience` | `Chauffeurs, photographes, chefs privés, masseurs, prestataires événementiels.` | `Recevez des demandes de prestations près de chez vous.` | `Je candidate` |
| immobilier | logement | `Immobilier` | `Propriétaires, agences et acteurs immobiliers.` | `Confiez une gestion locative ou proposez vos logements.` | `Je candidate` |
| entreprise | equipe | `Entreprises & prestataires` | `Livraison, entretien, culture, loisirs, services aux familles.` | `Développez votre activité avec un partenaire de confiance.` | `Je candidate` |

### 1.13 Benefit / Feature (cartes icône + titre + texte)
Champs : `icon`, `title`, `description`. Utilisé par :
- Partenaires › Avantages : (mail) `Des demandes qualifiées` — `Des clients dont le besoin est déjà précisé.` ; (shield) `Une relation claire` — `Des engagements écrits, des règles simples.` ; (users) `Une visibilité nouvelle` — `En France comme au Cameroun, auprès de la diaspora.` ; (graduation) `Formation et accompagnement` — `Ateliers pour progresser et monter en qualité.`
- Recrutement › Pourquoi nous rejoindre : (users) `Une équipe soudée` — `Entre Douala, Yaoundé et la France, on avance ensemble.` ; (graduation) `Formation continue` — `Des sessions régulières pour progresser dans votre métier.` ; (sparkles) `Des missions utiles` — `Chaque jour, vous simplifiez la vie de familles.`

### 1.14 ProcessStep simple (listes d'étapes)
Champs : `order`, `icon?`, `label`.
- Partenaires « Et ensuite ? » : 1 `Étude de votre demande` ; 2 `Échange avec notre équipe` ; 3 `Signature de la charte partenaire`.
- Avis « Votre avis compte » : (calendar-check) `Prestation réalisée` ; (mail) `E-mail avec le questionnaire` ; (star) `Vous notez et commentez` ; (check) `Avis publié après validation`.

### 1.15 TrainingOffer (Formation › Offres)
Champs : `key`, `icon`, `title`, `description`, `linkLabel`, `theme`.
- professionnels : briefcase, `Formation des professionnels`, `Pour les prestataires et les entreprises : accueil, qualité de service, hygiène, entretien, gestion locative.`, `Voir les formations`, dark.
- ateliers : users, `Ateliers & sensibilisation`, `Pour les particuliers, les familles et les associations : installation, accompagnement des proches, culture locale.`, `Voir les formations`, light.

### 1.16 Training (Formation › Catalogue)
Champs : `slug`, `icon`, `title`, `category` (enum `professionnels` | `ateliers` | `sensibilisation`), `duration` (texte), `format` (enum `presentiel` | `en_ligne`), `city?`, `description?` (non affichée).

| title | category | duration | format · ville | icon |
|---|---|---|---|---|
| `Accueil et relation client` | `Professionnels` | `1 jour` | `Présentiel · Douala` | users |
| `Hygiène et sécurité en cuisine` | `Professionnels` | `2 jours` | `Présentiel · Douala` | utensils |
| `Entretien professionnel des logements` | `Professionnels` | `1 jour` | `Présentiel · Yaoundé` | wrench |
| `Gestion locative : les fondamentaux` | `Professionnels` | `2 jours` | `En ligne` | building |
| `Bien préparer son installation au Cameroun` | `Ateliers` | `2 heures` | `En ligne` | plane |
| `Accompagner un proche âgé à domicile` | `Sensibilisation` | `3 heures` | `Présentiel · Douala` | home-heart |

Filtres : `Toutes`, `Professionnels`, `Ateliers`, `Sensibilisation`.

### 1.17 JobOffer (Recrutement › Nos offres + page détail)
Champs : `slug`, `title`, `isNew` (badge `Nouveau`), `city` (liste), `locationDetail` (détail), `contractType` (enum), `contractDetail`, `startDate` (texte), `publishedAt` (date → `Publiée il y a …` / `Publiée le …`), `summary` (`Le poste`), `missions[]`, `profile[]`, `benefits[]` (`Ce que nous offrons`), `status` (ouvert/fermé).

| title | badge | city (liste) | contrat | publication |
|---|---|---|---|---|
| `Coordinateur·rice de services` | `Nouveau` | `Douala` | `CDI` | `Publiée il y a 3 jours` |
| `Chargé·e de relation clients diaspora` | — | `France · télétravail` | `CDD 12 mois` | `Publiée il y a 1 semaine` |
| `Agent·e d’entretien des logements` | — | `Yaoundé` | `Temps partiel` | `Publiée il y a 2 semaines` |
| `Chauffeur·euse partenaire` | — | `Douala` | `Freelance` | `Publiée il y a 3 semaines` |

Détail complet (offre 1) :
- locationDetail `Douala, Cameroun` ; contractDetail `CDI · temps plein` ; startDate `Prise de poste : janvier 2027` ; publishedAt `Publiée le 2 octobre 2026`.
- summary : `Au cœur de l’agence de Douala, vous coordonnez les demandes de nos clients, de la réception du besoin jusqu’au suivi de la prestation, avec notre réseau de prestataires.`
- missions : `Analyser les demandes et préparer les devis` ; `Sélectionner et briefer les prestataires` ; `Suivre chaque prestation et informer le client` ; `Mettre à jour les dossiers dans l’outil de gestion`.
- profile : `Expérience en relation client ou coordination` ; `Sens de l’organisation et du service` ; `Aisance à l’écrit et à l’oral en français` ; `Maîtrise des outils numériques courants`.
- benefits : `Une équipe bienveillante et engagée` ; `Des formations régulières` ; `Des missions utiles, au service des familles`.
Compteur dynamique : `4 postes ouverts`. Filtres : `Tous`, `Douala`, `Yaoundé`, `France`, `CDI`, `Freelance` + recherche `Rechercher un poste`.
Enum contrat observé : `CDI`, `CDD 12 mois` (CDD + durée), `Temps partiel`, `Freelance`.

### 1.18 Review (Avis clients)
Champs : `rating` (1–5), `date`, `text`, `authorName`, `authorInitials` (dérivé), `authorCity` (ou trajet), `service` (libellé), `serviceCategory` (enum filtres), `verified` (bool), `published` (bool, validation agence), `avatarColor?`.

| rating | date | authorName | authorCity | service | verified | text |
|---|---|---|---|---|---|---|
| 5 | `12 sept. 2026` | `Aurélie K.` | `Paris → Douala` | `Logement temporaire` | oui | `Arrivée à Douala sans stress : logement prêt, chauffeur à l'aéroport et même les courses faites. On s'est sentis attendus.` |
| 5 | `3 sept. 2026` | `Jean-Marc T.` | `Yaoundé` | `Chef privé` | — | `Le chef privé a régalé nos invités pour l'anniversaire de ma mère. Service impeccable du début à la fin.` |
| 5 | `28 août 2026` | `Sandrine M.` | `Lyon` | `Gestion locative` | — | `Je vis en France et Mambo gère mon appartement à Bonapriso. Comptes rendus réguliers, locataires suivis : je suis enfin serein.` |
| 5 | `20 août 2026` | `Clarisse N.` | `Paris` | `Portage de repas` | — | `Ma mère reçoit ses repas chaque midi. Depuis Paris, je suis rassurée et toujours informée.` |
| 5 | `9 août 2026` | `Patrick E.` | `Marseille` | `Découverte du Cameroun` | — | `La journée découverte à Kribi était parfaite : guide passionné, repas local, tout était organisé.` |
| 5 | `2 août 2026` | `Hervé D.` | `Douala` | `Réception de colis` | — | `Colis reçu à l’agence, on m’a appelé le jour même et livré le lendemain. Très pro.` |

Catégories de filtre : `Tous`, `Expérience`, `Immobilier`, `Proximité`, `Culture & événementiel`. Tri : `Plus récents`.

### 1.19 ReviewSummary (Avis clients › Note globale)
Champs : `average` (`4,9`), `count` (`120` → `120 avis vérifiés`), `distribution` :

| étoiles | % |
|---|---|
| 5 | `86 %` |
| 4 | `10 %` |
| 3 | `3 %` |
| 2 | `1 %` |
| 1 | `0 %` |

Pagination affichée : `1` (actif) `2` `3` `…` `12`.

### 1.20 ContactChannel (Contact › Moyens de contact)
Champs : `type` (phone/whatsapp/email), `label`, `value`, `href`.

| type | label | value |
|---|---|---|
| phone | `France` | `+33 6 00 00 00 00` |
| phone | `Cameroun` | `+237 6 00 00 00 00` |
| whatsapp | `WhatsApp` | `Réponse rapide, 7j/7` |
| email | `E-mail` | `contact@mamboproxi.com` |

### 1.21 Agency (Contact › Notre agence)
Champs : `name`, `address`, `city`, `country`, `hours`, `services[]`, `mapUrl`, `coordinates`.
- `Agence MAMBO Proxi` ; `Adresse de l’agence · Douala, Cameroun` (placeholder) ; `Lun – Sam · 8h – 20h` ; `Réception des colis et courriers` ; lien `Itinéraire`.

### 1.22 Appointment (Contact › Prendre rendez-vous)
Champs : `motif` (enum), `format` (enum), `date`, `slot` (HH:MM), `timezone`, + coordonnées (non maquettées).
- motifs : `Devis`, `Immobilier`, `Partenariat`, `Recrutement`, `Autre` (sélection exemple : Immobilier)
- formats : `À l’agence`, `Téléphone`, `Visio` (sélection exemple : Visio)
- calendrier exemple : `Novembre 2026` ; jours désactivés 1–4 (passés) + dimanches 1, 8, 15, 22, 29 ; jour choisi 12 (jeudi) ; le 30 est absent de la maquette.
- créneaux du `Jeudi 12 novembre` : `09:00`, `10:30`, `14:00` (choisi), `15:30`, `17:00`
- fuseau : `Heure de Douala (UTC+1)`
- note : `Le rendez-vous est confirmé par l’agence par e-mail ou WhatsApp.`
Entité de configuration suggérée : `AvailabilitySlot { date, time, capacity }` ou règles (jours ouvrés lun–sam, plages horaires).

### 1.23 CTA band (instance `Web/CTA`, textes par page)
Champs : `title` (2 lignes), `lead`, `primaryLabel`, `whatsappLabel`.

| page | title | lead |
|---|---|---|
| Qui sommes-nous | `Faisons` ⏎ `connaissance.` | `Une question, un projet ? Échangeons par téléphone, WhatsApp ou lors d’un rendez-vous.` |
| Mission | `Une demande` ⏎ `à nous confier ?` | `Nous l’étudions avec soin et vous répondons sous 24 h.` |
| Avis clients | `À votre tour de vivre` ⏎ `l’expérience Mambo.` | `Demandez votre devis gratuit : réponse sous 24 h.` |
| Partenaires, Formation, Recrutement, Offre détail, Contact | (pas de CTA) | — |

Boutons constants : `Demander un devis gratuit` (+ flèche desktop) et `Écrire sur WhatsApp`.

### 1.24 Page hero (toutes pages)
Champs : `breadcrumb[]`, `eyebrow`, `title`, `titleHighlight`, `lead`, `illustration?`, `actions[]?`, `anchorChips[]?`.

| page | eyebrow | title (surlignage en **gras**) | illustration | actions / chips |
|---|---|---|---|---|
| Qui sommes-nous | `Qui sommes-nous ?` | `Une agence qui relie **la France et le Cameroun.**` | equipe | chips : Présentation*, Notre équipe, Nos valeurs, Pourquoi Mambo Proxi ? |
| Mission | `Notre mission` | `Simplifier la vie, **rapprocher les distances.**` | accueil | chips : Notre mission*, Notre vision, Nos engagements, Notre méthode |
| Partenaires | `Partenaires` | `Construisons ensemble des services **de confiance.**` | equipe | boutons : Devenir partenaire / Voir nos partenaires |
| Formation | `Formation` | `Transmettre les savoir-faire **qui font la qualité.**` | formation | boutons : Demander une formation / Voir le catalogue |
| Recrutement | `Recrutement` | `Rejoignez une équipe **qui prend soin des autres.**` | equipe | boutons : Voir nos offres / Candidature spontanée |
| Offre détail | (aucun) | `Coordinateur·rice de services` (sans surlignage) | — | tags + méta |
| Avis clients | `Avis clients` | `Ce que **nos clients** disent de nous.` | — (carte note globale) | — |
| Contact | `Contact` | `Parlons de **votre projet.**` | — | cartes moyens de contact |

---

## 2. Formulaires

Styles communs : label Inter SemiBold 14/20 ; astérisque `*` orange `#ad5300` = requis ; champ h 54, radius 12 ; consentement par case à cocher avec texte verbatim :
`J'accepte que Mambo Proxi traite mes données pour répondre à ma demande, conformément à la politique de confidentialité.`

### 2.1 Devenir partenaire (Partenaires) — bouton `Envoyer ma demande` — anti-spam affiché : `Formulaire protégé contre les envois automatiques`

| name (suggéré) | label | type | requis | placeholder / options |
|---|---|---|---|---|
| partnershipType | `Type de partenariat` | radio-chips | oui | `Prestataire Expérience`, `Immobilier`, `Entreprise & prestataire`, `Autre` |
| organizationName | `Nom de la structure` | text | oui | `Ex. : Saveurs de Douala` |
| activity | `Activité` | text | oui | `Ex. : chef privé, traiteur` |
| fullName | `Nom et prénom` | text | oui | `Votre nom complet` |
| email | `E-mail` | email | oui | `vous@exemple.com` |
| phone | `Téléphone / WhatsApp` | tel | oui | `+237 6 00 00 00 00` |
| countryCity | `Pays et ville` | select | oui | `Cameroun · Douala` (options non montrées) |
| description | `Présentez votre activité` | textarea | non | `Expérience, zones d’intervention, disponibilités…` |
| consent | (consentement) | checkbox | oui (implicite) | texte ci-dessus |

### 2.2 Demande de formation (Formation) — bouton `Envoyer ma demande` — pas d'anti-spam affiché

| name | label | type | requis | placeholder / options |
|---|---|---|---|---|
| training | `Formation souhaitée` | select | oui | `Choisir une formation` (options = catalogue 1.16) |
| organization | `Structure` | text | oui | `Entreprise, association, particulier…` |
| participants | `Nombre de participants` | number | oui | `Ex. : 8` |
| fullName | `Nom et prénom` | text | oui | `Votre nom complet` |
| email | `E-mail` | email | oui | `vous@exemple.com` |
| phone | `Téléphone / WhatsApp` | tel | oui | `+237 6 00 00 00 00` |
| period | `Période souhaitée` | text (mois) | non | `Ex. : janvier 2027` |
| details | `Précisions` | textarea | non | `Objectifs, niveau des participants, lieu…` |
| consent | (consentement) | checkbox | oui (implicite) | — |

### 2.3 Candidature (Recrutement) — bouton `Envoyer ma candidature` — pas d'anti-spam affiché

| name | label | type | requis | placeholder / options |
|---|---|---|---|---|
| position | `Poste visé` | select | oui | valeur par défaut `Candidature spontanée` + offres ouvertes |
| fullName | `Nom et prénom` | text | oui | `Votre nom complet` |
| email | `E-mail` | email | oui | `vous@exemple.com` |
| phone | `Téléphone / WhatsApp` | tel | oui | `+237 6 00 00 00 00` |
| city | `Ville` | text | non | `Douala` |
| cv | `CV` | file (drag & drop) | oui | `Glissez votre CV ici ou parcourez vos fichiers` ; aide `PDF ou Word · 5 Mo maximum` |
| message | `Message` | textarea | non | `Présentez-vous en quelques lignes…` |
| consent | (consentement) | checkbox | oui (implicite) | — |

### 2.4 Nous contacter (Contact, onglet actif) — bouton `Envoyer le message` — pas d'anti-spam affiché

| name | label | type | requis | placeholder / options |
|---|---|---|---|---|
| fullName | `Nom et prénom` | text | oui | `Votre nom complet` |
| email | `E-mail` | email | oui | `vous@exemple.com` |
| phone | `Téléphone / WhatsApp` | tel | **non** | `+237 6 00 00 00 00` |
| country | `Pays` | select | non | valeur `Cameroun` (options non montrées) |
| subject | `Sujet` | select | non | `Choisir un sujet` (options non montrées) |
| message | `Message` | textarea | oui | `Votre message…` |
| consent | (consentement) | checkbox | oui (implicite) | — |

Onglet 2 `Demande d’information` : libellé présent, contenu non maquetté.

### 2.5 Prendre rendez-vous (Contact) — bouton `Demander ce rendez-vous`

| name | label | type | requis | options |
|---|---|---|---|---|
| motif | `Motif du rendez-vous` | radio-chips | (non marqué) | `Devis`, `Immobilier`, `Partenariat`, `Recrutement`, `Autre` |
| format | `Format` | radio-chips | (non marqué) | `À l’agence`, `Téléphone`, `Visio` |
| date | (calendrier) | date | implicite | jours ouvrés lun–sam, futurs |
| slot | `<Jour date mois> · créneaux disponibles` | radio-chips | implicite | `09:00`, `10:30`, `14:00`, `15:30`, `17:00` |
| — | aide | texte | — | `Heure de Douala (UTC+1)` |

Pas de champs d'identité ni de consentement dans la maquette (à prévoir côté implémentation ou étape suivante).

### 2.6 Champs de recherche / filtres (non-formulaires)
- Recrutement : recherche texte `Rechercher un poste` + chips `Tous`/`Douala`/`Yaoundé`/`France`/`CDI`/`Freelance`.
- Avis : chips `Tous`/`Expérience`/`Immobilier`/`Proximité`/`Culture & événementiel` + tri `Plus récents` + pagination.
- Formation : chips `Toutes`/`Professionnels`/`Ateliers`/`Sensibilisation`.
- Partenaires : chips `Tous`/`Prestataires Expérience`/`Immobilier`/`Entreprises & prestataires`.

---

## 3. Types de sections par page (schéma CMS)

Champs communs à toute section : `id/anchor`, `background` (`neutral-0` | `neutral-50` | `neutral-900` sombre), `eyebrow`, `title`, `lead?`.

| Type de section | Champs éditables | Pages |
|---|---|---|
| `hero_page` | breadcrumb (auto), eyebrow, title, titleHighlight, lead, illustration (enum : equipe, accueil, formation…), actions[] (label, variant primary/outline, href), anchorChips[] (label, anchor, active) | Qui sommes-nous, Mission, Partenaires, Formation, Recrutement, Avis, Contact |
| `hero_detail` | breadcrumb[], tags[] (label, tone), title, meta[] (icon, text) | Offre détail |
| `split_text` (titre gauche / paragraphes droite) | eyebrow, title, paragraphs[], pills[] | Qui sommes-nous › Présentation |
| `quote_portrait` | eyebrow, portrait, quote, bio, signatureName, signatureTitle | Qui sommes-nous › Fondatrice |
| `team_grid` | eyebrow, title, lead, members[] → TeamMember | Qui sommes-nous |
| `cards_icon_grid` | eyebrow?, title?, theme (light/dark), columns (3/4), cardStyle (filled/outline/horizontal), items[] (icon, title, description, number?) | Valeurs (dark), Engagements numérotés, Avantages partenaires, Atouts recrutement |
| `key_figures` | items[] (value, label) | Qui sommes-nous |
| `statements_duo` | items[] (eyebrow, icon, text, theme) | Mission |
| `numbered_list` | eyebrow, title, items[] (number auto, title, description), columns 2 | Mission › Engagements |
| `process_steps` | eyebrow, title, lead, showRail (bool), steps[] → MethodStep | Mission |
| `quote_band` | quote, attribution, illustration?, theme (vert-50) | Mission › Citation |
| `logo_grid_filterable` | eyebrow, title, filters (auto depuis catégories), partners[] → Partner | Partenaires |
| `cards_illustrated` | eyebrow, title, items[] (illustration, title, subtitle, description, linkLabel, href) | Partenaires › Catégories |
| `form_section` | eyebrow, title, lead, sidePanel (steps[] ou illustration), formType (enum : partner, training, job_application, contact, appointment), submitLabel, showAntiSpam (bool) | Partenaires, Formation, Recrutement |
| `offers_duo` | items[] (icon, title, description, linkLabel, href, theme) | Formation › Offres |
| `catalog_filterable` | eyebrow, title, lead, filters (auto), items → Training | Formation |
| `job_list` | eyebrow, titleTemplate (`{n} postes ouverts`), searchPlaceholder, filters[], footnote, items → JobOffer | Recrutement |
| `banner_dark_cta` | eyebrow, title, text, buttonLabel, href | Recrutement › Devenir prestataire |
| `job_detail_body` | sections[] (title, paragraph? / bullets[]), aside (title, text, buttonLabel, shareChannels[], backLinkLabel) | Offre détail |
| `rating_summary` | average, count, distribution[] (auto depuis Reviews) | Avis › hero |
| `reviews_list` | filters[], sortOptions[], pageSize, items → Review | Avis |
| `info_steps_card` | eyebrow, title, text, steps[] (icon, label) | Avis › Votre avis compte |
| `contact_channels` | items[] → ContactChannel | Contact |
| `contact_forms` | tabs[] (label, formType), contactForm, appointment (motifs[], formats[], slots[], timezoneLabel, confirmationNote) | Contact |
| `agency_map` | eyebrow, title, agency → Agency, map (coords/zoom) | Contact |
| `cta_band` | title (multi-ligne), lead, primaryLabel/href, whatsappLabel/href | Qui sommes-nous, Mission, Avis |

Composition par page :
- **Qui sommes-nous** : hero_page → split_text → quote_portrait → team_grid → cards_icon_grid (dark, valeurs) → cards_icon_grid (outline numéroté) + key_figures → cta_band.
- **Mission** : hero_page → statements_duo → numbered_list → process_steps → quote_band → cta_band.
- **Partenaires** : hero_page → logo_grid_filterable → cards_illustrated → cards_icon_grid (avantages) → form_section (partner).
- **Formation** : hero_page → offers_duo → catalog_filterable → form_section (training).
- **Recrutement** : hero_page → cards_icon_grid (horizontal, sans en-tête) → job_list → banner_dark_cta → form_section (job_application).
- **Offre détail** : hero_detail → job_detail_body.
- **Avis clients** : hero_page + rating_summary → reviews_list → info_steps_card → cta_band.
- **Contact** : hero_page + contact_channels → contact_forms → agency_map.
