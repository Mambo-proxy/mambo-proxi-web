# Synthèse des données — partie 1 (accueil, nos services, 4 rubriques, fiche service, navigation, composants)

Source : inventaires `qa/inventory/site/*.md` et `qa/inventory/components/*.md` (fileKey `lsun63JexZYvgYUVpmSYyg`). Valeurs reprises à l'identique (apostrophes `'` / `’` telles que dans la maquette).

## 1. Settings (paramètres globaux)
| Champ | Valeur(s) | Où |
|-------|-----------|----|
| phone_fr | `+33 6 00 00 00 00` (affiché `France  +33 6 00 00 00 00` dans la topbar, `France · +33 6 00 00 00 00` dans le footer) | topbar, footer |
| phone_cm | `+237 6 00 00 00 00` (`Cameroun  +237 …` topbar ; `Cameroun · +237 …` footer ; `ou appelez le +237 6 00 00 00 00` fiche service) | topbar, footer, fiche |
| whatsapp | numéro non affiché ; liens `Écrire sur WhatsApp`, bouton flottant, `WhatsApp` (barre mobile) | partout |
| email | `contact@mamboproxi.com` | topbar, footer |
| horaires | `Lun – Sam · 8h – 20h` | topbar |
| réseaux sociaux | Instagram, Facebook, LinkedIn, TikTok (topbar + footer) ; WhatsApp (footer uniquement) — URLs non fournies | topbar, footer |
| adresse | aucune adresse postale visible dans ces maquettes (seulement « l’agence » mentionnée) | — |
| pays / baseline | `France · Cameroun` ; `Conciergerie de proximité` ; signature logo `VOS SERVICES, AU PLUS PRÈS DE VOUS` | hero accueil, logo |
| copyright | `© 2026 Mambo Proxi · France — Cameroun` | footer |
| texte marque footer | `Votre conciergerie de proximité entre la France et le Cameroun. Des services pensés pour vous, des personnes de confiance pour les réaliser.` | footer |
| zones (chef privé) | `Douala · Yaoundé · Kribi` | fiche service |

## 2. Chiffres clés (key figures)
| Valeur | Libellé desktop | Libellé mobile | Style |
|--------|-----------------|----------------|-------|
| 150+ | projets accompagnés | projets accompagnés | neutral-50 |
| 40+ | partenaires engagés | partenaires engagés | gradient/energie |
| 19 | services réunis en 4 rubriques | services, 4 rubriques | neutral-900 |
| 2 pays | couverts : France et Cameroun | France et Cameroun | vert-50 |
Autres : note `4,9` / `4,9/5`, `120 avis`, `plus de 150 projets accompagnés`, `Devis envoyé en 24 h`.

## 3. Avis clients (reviews)
| Auteur | Initiales | Couleur avatar | Origine / ville | Service | Note | Citation | Pages |
|--------|-----------|----------------|-----------------|---------|------|----------|-------|
| Aurélie K. | AK | #f8cfaa | Paris → Douala | Logement temporaire | 5 | « Arrivée à Douala sans stress : logement prêt, chauffeur à l'aéroport et même les courses faites. On s'est sentis attendus. » (mobile : « … même les courses faites. ») | accueil |
| Jean-Marc T. | JT | #d5eab8 | Yaoundé | Chef privé | 5 | « Le chef privé a régalé nos invités pour l'anniversaire de ma mère. Service impeccable, équipe aux petits soins du début à la fin. » (mobile accueil : « Le chef privé a régalé nos invités. Service impeccable du début à la fin. » ; fiche : « Le chef a régalé nos invités pour l'anniversaire de ma mère. Service impeccable, du début à la fin. ») | accueil, expérience, fiche |
| Sandrine M. | SM | #e4e1dc | Lyon | Gestion locative | 5 | « Je vis en France et Mambo gère mon appartement à Bonapriso. Comptes rendus réguliers, locataires suivis : je suis enfin serein. » | accueil, immobilier |
| Clarisse N. | CN | — | Paris | Portage de repas | — | « Ma mère reçoit ses repas chaque midi et ses courses le samedi. Depuis Paris, je suis rassurée et toujours informée. » | proximité |
| Patrick E. | PE | — | Marseille | Découverte du Cameroun | — | « La journée découverte à Kribi était parfaite : guide passionné, repas local, tout était organisé. Mes enfants en parlent encore. » | culture |
| Laure B. | — | — | Douala | (Chef privé) | 5 | « Dîner de fiançailles parfait : menu revisité, table magnifique, et une cuisine rendue impeccable. » | fiche |
Agrégat : note moyenne `4,9`, `120 avis`.

## 4. Partenaires
6 emplacements `Logo partenaire` (desktop, placeholders, sans nom) ; mobile : 6 cases `Logo` (grille 3×2). Lien `Vous êtes prestataire ? Devenez partenaire` (mobile `Devenez partenaire`). Titre `Ils travaillent à nos côtés`. Entité : {nom, logo, url?, ordre}.

## 5. Événements (agenda)
| Jour | Mois | Tag | Titre | Lieu | Mention | Visuel |
|------|------|-----|-------|------|---------|--------|
| 14 | NOV. | Gastronomie | Nuit des saveurs camerounaises | Douala · Akwa | Places limitées | chef |
| 22 | NOV. | Nature | Randonnée et cascades de la Lobé | Kribi · journée | Places limitées | culture |
| 06 | DÉC. | Artisanat | Visite des ateliers d’artisans | Foumban · week-end | Places limitées | marche |
Entité : {date, catégorie/tag, titre, ville, quartier/durée, mention places, illustration, lien « Je participe »}. Lien liste : `Voir tout l’agenda`.

## 6. Catégories (rubriques / univers)
| Slug | Nom | N° | Accroche (sous-titre) | Description rubrique (nos-services) | Carte accueil (titre / texte) | Nb | Icône | Illustration | Couleur pastille |
|------|-----|----|------------------------|-------------------------------------|-------------------------------|----|-------|--------------|------------------|
| experience | Expérience | 01 | Des moments sur mesure | Se déplacer, se faire plaisir, immortaliser un moment : des prestataires triés sur le volet, réservés pour vous. | Des moments sur mesure / même texte ; mobile : Voiture, chef privé, massage, photographe, événementiel. | 5 | sparkles | chef | orange-50 |
| immobilier | Immobilier | 02 | Se loger en toute sérénité | Trouver, louer, s'installer, ou confier votre bien à une équipe présente sur place. | Immobilier / Trouver, s'installer, louer en toute sérénité, ou confier votre bien à une équipe sur place. ; mobile : Trouver, louer, s'installer ou confier votre bien. | 7 | building | logement | neutral-100 |
| services-de-proximite | Services de proximité | 03 | Votre quotidien simplifié | Repas, courses, colis : nous nous en chargeons pour vous et pour vos proches. | Votre quotidien simplifié / Repas, courses, colis : on s'en charge, vous gagnez du temps. ; mobile : Repas, courses et colis livrés pour vous. | 3 | cart | livraison | vert-50 |
| culture-evenementiel | Culture & événementiel | 04 | Vivre le Cameroun | Découvertes, sorties, événements et intégration locale : le pays vu de l'intérieur. | Vivre le Cameroun / Découvertes, sorties, événements et intégration locale : le pays vu de l'intérieur. ; mobile : Découvertes, sorties, événements, intégration locale. | 4 | compass | marche / culture | neutral-900 |
Chips accueil (libellés courts) : Expérience = Location de voiture, Chef privé, Massage bien-être, Photographe, Prestataires événementiels ; Immobilier = Recherche de logement, Location & colocation, Logement temporaire, Gestion locative, +3 ; Proximité = Livraison de repas, Courses, Colis ; Culture = Découverte du Cameroun, Sorties & loisirs, Événements Mambo, Intégration locale.

Page rubrique — champs : hero (eyebrow, H1 + partie orange, lead), « Pour qui ? » (H2 + 3 publics), services (H2 + lead optionnel + groupes optionnels), section spécifique optionnelle (colis / agenda), déroulé, témoignage, autres rubriques, CTA.
| Rubrique | H1 (partie **orange**) | Lead hero | H2 Pour qui ? | Publics (icône · titre · texte) | H2 services | Lead services |
|----------|------------------------|-----------|---------------|----------------------------------|-------------|---------------|
| Expérience | Des moments sur mesure, **pensés pour vous.** | Location de voiture, chef privé, massage, photographe, événementiel : nous réservons pour vous des prestataires de confiance, au Cameroun. | Pour les particuliers, les familles et ceux qui reçoivent. | user · Particuliers · Vous voulez vous faire plaisir ou simplifier un séjour, sans chercher pendant des heures. / users · Familles en séjour · Vous rentrez au pays en vacances : tout est prêt à votre arrivée. / party · Organisateurs · Anniversaire, mariage, réception : des prestataires fiables pour votre événement privé. | 5 services pour vivre chaque moment pleinement. | Chaque prestation fait l’objet d’un devis gratuit et personnalisé. |
| Immobilier | Se loger au Cameroun, **en toute sérénité.** | Que vous cherchiez un logement ou que vous souhaitiez confier votre bien, une équipe présente sur place s'occupe de tout, même pendant que vous êtes en France. | Locataires, propriétaires et familles. | key · Vous cherchez un logement · Pour un séjour, une installation durable ou un besoin spécifique. / building · Vous êtes propriétaire · Votre bien est géré, entretenu et loué en toute transparence. / home-heart · Vous accompagnez un proche · Logement adapté, meublé, installation : nous préparons tout. | 7 services pour chaque étape de votre logement. | — (groupes : Vous cherchez un logement ; Vous êtes propriétaire) |
| Services de proximité | Votre quotidien simplifié, **chez vous.** | Repas livrés, courses faites, colis réceptionnés : nous prenons en charge les tâches du quotidien pour vous et pour vos proches. | Pour les résidents et les familles, ici comme à distance. | users · Résidents et familles locales · Gagnez du temps sur les tâches de tous les jours. / home-heart · Proches accompagnés · Vous êtes en France : nous veillons sur vos parents au Cameroun. / package · Envois depuis l’étranger · Vos colis et courriers reçus à l’agence, en toute sécurité. | 3 services pour souffler au quotidien. | Zones desservies communiquées lors du devis. |
| Culture & événementiel | Vivre le Cameroun, **de l’intérieur.** | Découvertes, sorties culturelles, événements organisés par Mambo et accompagnement à l'intégration : pour découvrir le pays ou s'y sentir chez soi. | Pour les curieux, les nouveaux arrivants et la diaspora. | plane · Visiteurs et diaspora · Vous venez quelques semaines : profitez du pays sans rien organiser. / map-pin · Nouveaux arrivants · Vous vous installez : repères, rencontres et bonnes adresses. / users · Groupes et entreprises · Sorties, activités et événements sur mesure pour vos équipes. | 4 façons de découvrir et de vivre le pays. | — |

## 7. Services (19)
| # | Rubrique | Titre | Description courte | Icône | Illustration carte rubrique | Groupe (immobilier) |
|---|----------|-------|--------------------|-------|-----------------------------|---------------------|
| 1 | Expérience | Location de voiture | Véhicules récents, avec ou sans chauffeur, pour vos trajets et vos séjours. | mobilite | voiture | |
| 2 | Expérience | Photographe | Portraits, événements, reportages : vos moments immortalisés. | photo | photo | |
| 3 | Expérience | Chef privé | Un chef à domicile pour vos dîners, réceptions et grandes occasions. | chef | chef | |
| 4 | Expérience | Massage bien-être | Des praticiens qualifiés, chez vous ou sur votre lieu de séjour. | bien-etre | massage | |
| 5 | Expérience | Services événementiels | Décoration, traiteur, animation : des prestataires pour vos événements privés. | party | evenement | |
| 6 | Immobilier | Recherche de logement | Nous trouvons le bien qui correspond à vos critères et à votre budget. | search | logement | Vous cherchez un logement |
| 7 | Immobilier | Location, sous-location et colocation | Des solutions souples, avec des contrats clairs et un suivi. | key | logement | Vous cherchez un logement |
| 8 | Immobilier | Logement adapté et appartement meublé | Logements thérapeutiques ou adaptés, et meublés prêts à vivre. | home-heart | logement | Vous cherchez un logement |
| 9 | Immobilier | Gestion locative | Nous gérons votre bien au Cameroun, même depuis la France. | building | equipe | Vous êtes propriétaire |
| 10 | Immobilier | Entretien des logements | Ménage, petites réparations et contrôles réguliers. | wrench | logement | Vous êtes propriétaire |
| 11 | Immobilier | Accompagnement à l'installation | Démarches, abonnements, ameublement : on vous aide à vous installer. | home | accueil | Vous cherchez un logement |
| 12 | Immobilier | Solutions de logement temporaire | Un logement pour quelques jours ou quelques mois, prêt à votre arrivée. | clock | logement | Vous cherchez un logement |
| 13 | Proximité | Portage et livraison de repas | Des repas livrés au domicile de la personne accompagnée. | utensils | livraison | |
| 14 | Proximité | Livraison de courses et de commandes | Vos courses et achats effectués, puis livrés au bénéficiaire. | cart | livraison | |
| 15 | Proximité | Réception de colis et de courrier | L'agence reçoit vos envois, prévient le destinataire et organise le retrait ou la livraison. | package | colis | |
| 16 | Culture | Découverte du Cameroun | Circuits et visites pour découvrir le pays autrement. | compass | culture | |
| 17 | Culture | Activités culturelles, loisirs et sorties | Concerts, expositions, sorties : l'agenda culturel à portée de main. | sparkles | culture | |
| 18 | Culture | Organisation d'activités et d'événements | Des sorties et des événements conçus et organisés par Mambo. | calendar-check | evenement | |
| 19 | Culture | Découverte et intégration locale | Repères, rencontres et conseils pour vous sentir chez vous. | globe | culture | |
Ordre dans les grilles de rubrique ≠ ordre méga-menu pour Immobilier (méga-menu : Recherche, Location…, Logement adapté…, Gestion locative, Entretien, Accompagnement, Solutions temporaire) → prévoir un champ `ordre`.
Libellés du bandeau défilant accueil (13) : Location de voiture, Chef privé, Massage bien-être, Photographe, Événementiel, Livraison de repas, Courses, Colis, Recherche de logement, Logement temporaire, Gestion locative, Découverte du Cameroun, Sorties culturelles (mobile : Chef privé, Logement, Massage bien-être, Courses, Découverte du Cameroun).

### Fiche service (exemple chef-prive)
tags [Expérience ; Douala · Yaoundé · Kribi] ; H1 `Chef privé` ; lead `Un chef à domicile pour vos dîners, réceptions et grandes occasions. Vous profitez de vos invités, nous nous occupons du reste.` ; publics (4) : Aux particuliers qui reçoivent famille ou amis / Aux familles de la diaspora en séjour au pays / Aux organisateurs d’anniversaires et de fêtes privées / Aux entreprises pour un repas d’équipe ou un client ; étapes (5) : Échange sur votre projet — Date, lieu, nombre d’invités, envies et contraintes alimentaires. / Proposition de menu et devis — Le chef imagine un menu sur mesure ; vous recevez le devis sous 24 h. / Courses et préparation — Produits frais achetés par le chef, préparation sur place. / Service et rangement — Service à table, puis cuisine rangée et nettoyée. / Votre avis — Un court questionnaire pour nous aider à progresser. ; avantages (4) : sparkles Un menu unique — Pensé pour vos goûts et votre occasion. / shield Des chefs vérifiés — Sélectionnés, suivis et évalués après chaque prestation. / clock Du temps pour vous — Aucune course, aucune vaisselle : vous profitez. / users Un interlocuteur unique — Joignable depuis la France comme au Cameroun. ; FAQ (4) : Combien coûte un chef privé ? — Chaque prestation est unique : le tarif dépend du menu, du nombre d’invités et du lieu. Il vous est communiqué sur devis, gratuitement. / Dans quelles villes intervenez-vous ? / Puis-je réserver depuis la France ? / Combien de temps à l’avance réserver ? (réponses 2-4 non dessinées) ; carte devis : `Tarif communiqué sur devis` / `Recevez votre devis gratuit sous 24 h` / puces `Gratuit et sans engagement`, `Menu et prestation sur mesure`, `Un seul interlocuteur du début à la fin` ; aide `Préférez un rendez-vous ?` / `Prendre rendez-vous` ; avis : Jean-Marc T. · Yaoundé, Laure B. · Douala ; titre avis `Ils ont reçu un chef à domicile` ; services liés (3) : Location de voiture, Photographe, Massage bien-être ; titre `Pour compléter votre événement`.

## 8. Étapes / processus
- Accueil « Comment ça marche » : 01 file-text Vous exprimez votre besoin — Via le formulaire de devis, sur WhatsApp ou lors d'un rendez-vous, en France comme au Cameroun. / 02 mail Vous recevez un devis sur mesure — Sous 24 h, une proposition claire et personnalisée, sans engagement de votre part. / 03 shield Nous nous occupons de tout — Nos prestataires sélectionnés interviennent. Vous êtes tenu informé à chaque étape. (mobile : Formulaire, WhatsApp ou rendez-vous. / Sous 24 h, sans engagement. / Vous êtes informé à chaque étape.) ; canaux : Formulaire en ligne, WhatsApp, Rendez-vous (`Au choix :`).
- Rubriques « Comment ça se passe » (identique ×4) : 1 Votre demande — Formulaire, WhatsApp ou rendez-vous. / 2 Devis sur mesure — Une proposition claire sous 24 h. / 3 Intervention — Un prestataire sélectionné, un suivi constant. / 4 Votre avis — Un court questionnaire après chaque prestation.
- Colis (proximité) : 1. Réception — L’agence reçoit le colis ou le courrier envoyé depuis l’extérieur. / 2. On vous prévient — Nous contactons le destinataire par téléphone ou WhatsApp. / 3. Retrait ou livraison — Retrait à l’agence ou livraison à domicile, selon votre choix. ; note `Le suivi des colis se fait directement avec l’agence.`

## 9. Engagements (accueil)
users Une équipe à vos côtés — Un interlocuteur unique qui vous accompagne pas à pas, en France comme au Cameroun. / shield Des solutions concrètes et durables — Des prestataires vérifiés, suivis et évalués après chaque mission. / globe (mobile : sparkles) Un pont entre la France et le Cameroun — Préparez votre venue depuis la France, nous agissons sur place.

## 10. Navigation / menus
- Header desktop : Accueil · Nos services ▾ · Partenaires ▾ · Formation ▾ · Mission ▾ · Qui sommes-nous ? ▾ · Recrutement ▾ · Contact ▾ ; actions `S'inscrire`, `Devis gratuit`.
- Méga-menu Nos services : 4 colonnes (rubrique + sous-titre + services + `Toute la rubrique`) + promo `Un besoin précis ?` / `Devis gratuit, réponse sous 24 h.` / `Devis gratuit`.
- Menu mobile : Accueil, Nos services (ouvert : Expérience 5 services, Immobilier 7 services, Services de proximité 3 services, Culture & événementiel 4 services), Partenaires, Formation, Mission, Qui sommes-nous ?, Recrutement, Contact ; actions `S'inscrire`, `Devis gratuit`, `Écrire sur WhatsApp`.
- Header mobile : logo, `Devis gratuit`, bouton menu. Fil d'Ariane : Accueil › Nos services › <Rubrique> › <Service>.

## 11. Liens du footer
| Colonne | Liens |
|---------|-------|
| Nos services | Expérience · Immobilier · Services de proximité · Culture & événementiel · Devis gratuit |
| Mambo Proxi | Qui sommes-nous ? · Mission · Partenaires · Avis clients · Contact |
| Nous rejoindre | S'inscrire · Devenir partenaire · Recrutement · Formation |
| Nous contacter | France · +33 6 00 00 00 00 · Cameroun · +237 6 00 00 00 00 · contact@mamboproxi.com · Prendre rendez-vous |
| Légal | Mentions légales · CGU · Politique de confidentialité · Cookies |

## 12. Formulaire newsletter (footer)
Eyebrow `La lettre Mambo` ; titre `Restez au plus près de nos nouveautés` ; texte `Nouveaux services, sorties culturelles et conseils pour la France et le Cameroun. Désinscription en un clic.` ; champs : nom (`Votre nom`, icône user), e-mail (`Votre adresse e-mail`, icône mail), téléphone (`Téléphone (WhatsApp)`, icône phone) ; bouton `S'abonner` ; aucun astérisque ni texte de consentement visible.

## 13. CTA par page (bandeau)
| Page | Titre (2 lignes) | Texte |
|------|------------------|-------|
| Accueil (défaut) | Un projet, une question ? / Parlons-en. | Devis gratuit et sans engagement, réponse sous 24 h. Ou écrivez-nous directement sur WhatsApp. |
| Nos services | Vous ne trouvez pas / votre besoin ? | Décrivez-nous votre projet : nous trouvons la bonne solution et vous répondons sous 24 h. |
| Expérience | Envie d’un moment / sur mesure ? | Dites-nous ce que vous imaginez : nous vous proposons un devis gratuit sous 24 h. |
| Immobilier | Un logement à trouver / ou à confier ? | Expliquez-nous votre projet immobilier : devis gratuit et réponse sous 24 h. |
| Services de proximité | Besoin d’un coup de main / au quotidien ? | Repas, courses ou colis : décrivez votre besoin, nous vous répondons sous 24 h. |
| Culture & événementiel | Envie de sortir, / de découvrir ? | Rejoignez une sortie Mambo ou demandez une activité sur mesure. |
| Fiche Chef privé | Prêt à recevoir / vos invités ? | Votre devis chef privé, gratuit et sans engagement, sous 24 h. |
Boutons fixes : `Demander un devis gratuit`, `Écrire sur WhatsApp`.

## 14. Types de sections par page (schéma CMS)
| Type de section | Pages | Champs éditables |
|-----------------|-------|------------------|
| `hero-home` | accueil | pastille pays, pastille libellé, titre ligne 1, titre ligne 2 (surlignée), lead, CTA primaire (libellé, lien), CTA secondaire (libellé, lien), preuve sociale (note, texte, avatars), illustration principale + vignette, cartes flottantes [{icône, titre, sous-titre, progression?, note}], sticker |
| `hero-page` | nos-services, rubriques | fil d'Ariane (auto), eyebrow, titre, partie surlignée, lead, CTA primaire, CTA WhatsApp, illustration |
| `hero-service` | fiche service | fil d'Ariane, tags [rubrique, zones], titre, lead, CTA ×2, galerie [3 images] |
| `marquee` | accueil | items[] (libellé), icône séparateur |
| `bento-categories` | accueil | eyebrow, titre, lead, lien (libellé, url), cartes[4] {rubrique, compteur, titre, texte, chips[], illustration, style/variante} |
| `category-filter` (ancres) | nos-services | rubriques[] (libellé, actif) |
| `category-block` | nos-services ×4 | numéro, titre, sous-titre, description, lien rubrique, illustration, services[] (réf.) |
| `steps` | accueil, rubriques | eyebrow, titre, lead, étapes[] {numéro, icône?, titre, texte}, canaux[] {libellé, icône, lien} (accueil) |
| `commitments-stats` | accueil | eyebrow, titre, lead, engagements[] {icône, titre, texte}, illustration, stats[] {valeur, libellé, style} |
| `reviews` | accueil, fiche | eyebrow, titre, note globale, nb avis, avis[] (réf.), lien « Lire tous les avis » ; mobile carrousel |
| `testimonial` (citation unique) | rubriques | avis (réf.), illustration |
| `partners` | accueil | titre, logos[] (réf. partenaires), lien devenir partenaire |
| `audiences` (« Pour qui ? ») | rubriques, fiche | eyebrow, titre, publics[] {icône, titre, texte} (fiche : liste simple) |
| `services-grid` | rubriques | eyebrow, titre, lead, groupes[]? {titre, services[]}, services[] (réf.) |
| `process-colis` (étapes sur fond sombre) | services de proximité | eyebrow, titre, étapes[] {icône, titre, texte}, note |
| `events` (agenda) | culture | eyebrow, titre, lien « Voir tout l’agenda », événements[] (réf.) |
| `related-categories` | rubriques | eyebrow, titre, rubriques[] (réf. + sous-ligne auto « accroche · N services ») |
| `timeline` | fiche | titre, étapes[] {titre, texte} |
| `benefits` | fiche | titre, avantages[] {icône, titre, texte} |
| `faq` | fiche | titre, questions[] {question, réponse} |
| `quote-card` (sidebar) | fiche | sur-titre, titre, puces[], CTA ×2, téléphone, encart rendez-vous {titre, lien} |
| `related-services` | fiche | eyebrow, titre, services[] (réf.) |
| `cta-band` | toutes | titre ligne 1, titre ligne 2, texte, CTA primaire, CTA WhatsApp |
| globaux | toutes | topbar (settings), header/nav, méga-menu, footer (newsletter + colonnes + légal), WhatsApp flottant, barre d'action fixe mobile (fiche) |
