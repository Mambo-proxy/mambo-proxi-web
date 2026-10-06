# Synthèse des données — partie 3

Sources inventoriées : devis-gratuit, devis-confirmation, s-inscrire-particulier, s-inscrire-professionnel, suivi-mambo-bientot, pages-legales, questionnaire-de-satisfaction, questionnaire-merci, page-introuvable-404 (desktop + mobile) et les 4 e-mails (accuse-de-reception-du-devis, invitation-au-questionnaire, confirmation-de-rendez-vous, inscription-confirmee).

## 1. Entités consolidées

### Rubrique (catégorie de services)
| Champ | Type | Exemple |
|---|---|---|
| slug | string | `experience` |
| nom | string | `Expérience` |
| icone | nom lucide | `sparkles` |
| nombreServices | nombre (affiché « N services ») | `5` |
| ordre | nombre | 1 |

Valeurs vues : Expérience (sparkles, 5 services) ; Immobilier (building, 7 services) ; Services de proximité (shopping-cart, 3 services) ; Culture & événementiel (compass, 4 services).

### Service
| Champ | Type | Exemple |
|---|---|---|
| nom | string | `Chef privé` |
| rubrique | réf. Rubrique | `Expérience` |
| illustration | image (vignette 56 px sur fond `#fce7d5`) | « Illustration — accueil » |
| champsBesoin | liste de définitions de champs (voir §3) | Date souhaitée, Ville, Nombre de personnes, Type d’occasion, Description |

Services vus pour Expérience : Location de voiture, Photographe, Chef privé, Massage bien-être, Services événementiels.

### DemandeDevis (quote request)
| Champ | Type | Exemple |
|---|---|---|
| reference | string format `MP-AAAA-NNNN` | `MP-2026-0142` |
| rubrique | réf. | Expérience |
| service | réf. | Chef privé |
| dateSouhaitee | date | Samedi 14 novembre 2026 |
| ville | enum / string | Douala |
| nombrePersonnes | entier | 12 |
| typeOccasion | enum | Anniversaire |
| description | texte (requis) | Dîner pour les 60 ans de ma mère, cuisine camerounaise revisitée, un invité végétarien… |
| nomComplet | string (requis) | — |
| email | email (requis) | vous@exemple.com |
| telephone | tel (requis) | +237 6 00 00 00 00 |
| paysResidence | enum (requis) | — |
| preferenceContact | enum `whatsapp` \| `telephone` \| `email` | whatsapp (par défaut sélectionné) |
| consentementRgpd | booléen (requis) | true |
| statut | enum (cf. Suivi) | `nouvelle` / `en_cours` / `prestation_realisee` |
| creeLe | datetime | — |

### Compte / Inscription
| Champ | Type | Particulier | Professionnel | Exemple |
|---|---|---|---|---|
| profil | enum `particulier` \| `professionnel` | ✓ | ✓ | particulier |
| nomStructure | string | — | requis | Saveurs de Douala |
| activitePrincipale | enum | — | requis | (options non montrées) |
| prenom | string | requis | requis | — |
| nom | string | requis | requis | — |
| email | email | requis | requis | vous@exemple.com |
| telephone | tel | requis | requis | +33 6 00 00 00 00 |
| paysResidence | enum | requis | requis | France |
| ville | string | optionnel | optionnel | Paris |
| rubriquesInteret | multi réf. Rubrique | « Les services qui vous intéressent » | « Rubriques dans lesquelles vous intervenez » | [Immobilier, Services de proximité] / [Expérience] |
| consentementRgpd | booléen | requis | requis | — |
| newsletter | booléen | optionnel (coché par défaut dans la maquette) | idem | true |

### AbonnéNewsletter / Liste d’attente « Suivi Mambo »
| Champ | Type | Exemple |
|---|---|---|
| email | email | — |
| source | enum `inscription` \| `footer` \| `suivi-mambo` | suivi-mambo |
| (footer) nom, téléphone WhatsApp | string | « Votre nom », « Téléphone (WhatsApp) » (vus dans le footer) |

### Demande (aperçu Suivi Mambo — données factices)
| intitule | statut | progression |
|---|---|---|
| Chef privé · 14 nov. | Prestation réalisée (vert) | 100 % |
| Logement temporaire · Bastos | En cours (orange) | ≈ 60 % |
| Réception de colis | Nouvelle (neutre) | 20 % |

Statuts et couleurs : `Nouvelle` (fond `#f1efec`, texte `#1c1a18`), `En cours` (fond `#fdf4ec`, texte `#ad5300`, barre `#ff7a00`), `Prestation réalisée` (fond `#f6faef`, texte `#557e1b`, barre `#7db928`).

### FonctionnalitéÀVenir
| icone | titre | description |
|---|---|---|
| file-text | Vos demandes et devis | Statut en temps réel, de la demande à la prestation. |
| message-square | Messages | Échangez avec votre conseiller, sans perdre le fil. |
| package | Colis et courriers | Soyez prévenu à chaque réception à l’agence. |
| wallet | Paiement en ligne | Carte bancaire et Mobile Money, dans une prochaine étape. |

### PageLégale
| Champ | Type | Exemple |
|---|---|---|
| slug | string | `mentions-legales` |
| titre | string | Mentions légales |
| libelleCourt (mobile) | string | Mentions légales / Confidentialité / Cookies |
| icone active | lucide | file-text |
| derniereMiseAJour | texte libre / date | octobre 2026 |
| sections[] | { numero, titre, corps (rich text) } | 1. Éditeur du site … |

Entrées : Mentions légales · Politique de confidentialité · Gestion des cookies. Sections de Mentions légales : 1. Éditeur du site ; 2. Hébergement ; 3. Propriété intellectuelle ; 4. Données personnelles ; 5. Contact.

### Témoignage (panneau inscription)
| citation | auteur | illustration |
|---|---|---|
| « On s’est sentis attendus dès notre arrivée. Tout était prêt. » | Aurélie K. · Paris → Douala | Illustration — accueil (fond `#fce7d5`) |
| « Depuis que je suis partenaire, je reçois des demandes claires et des clients qui reviennent. » | Chef partenaire · Douala | Illustration — equipe (fond `#eaf5db`) |

### Garanties (récap devis)
Devis gratuit et sans engagement · Réponse sous 24 h · Tarif communiqué sur devis.

### Consentement cookies
| Champ | Type |
|---|---|
| choix | enum `accepte` \| `refuse` \| `personnalise` (+ catégories, non montrées) |
| date | datetime |

## 2. Formulaires (liste complète des champs)

### F1 — Demande de devis (3 étapes)
| # | Étape | name | type | requis | options / remarque |
|---|---|---|---|---|---|
| 1 | Service | rubrique | radio (cartes) | oui | Expérience, Immobilier, Services de proximité, Culture & événementiel |
| 2 | Service | service | radio (puces) | oui | dépend de la rubrique |
| 3 | Votre besoin | dateSouhaitee | date | non | — |
| 4 | Votre besoin | ville | select | non | Douala (autres non montrées) |
| 5 | Votre besoin | nombrePersonnes | number | non | — |
| 6 | Votre besoin | typeOccasion | select | non | Anniversaire (autres non montrées) |
| 7 | Votre besoin | description | textarea | **oui** | helper « Plus votre description est précise, plus le devis sera juste. » |
| 8 | Coordonnées | nomComplet | text | oui | placeholder « Votre nom complet » |
| 9 | Coordonnées | email | email | oui | « vous@exemple.com » |
| 10 | Coordonnées | telephone | tel | oui | « +237 6 00 00 00 00 » |
| 11 | Coordonnées | paysResidence | select | oui | placeholder « Choisir » |
| 12 | Coordonnées | preferenceContact | radio (puces) | non marqué | WhatsApp, Téléphone, E-mail |
| 13 | Coordonnées | consentement | checkbox | oui | « J'accepte que Mambo Proxi traite mes données pour répondre à ma demande, conformément à la politique de confidentialité. » |
| — | — | anti-spam | honeypot / protection invisible | — | mention « Formulaire protégé contre les envois automatiques » |
Soumission : « Envoyer ma demande de devis » → page confirmation avec référence `MP-AAAA-NNNN`.

### F2 — Inscription particulier
prenom (text, req.), nom (text, req.), email (email, req.), telephone (tel, req., « +33 6 00 00 00 00 »), paysResidence (select, req.), ville (text), rubriquesInteret (multi-puces : Expérience, Immobilier, Services de proximité, Culture & événementiel), consentement (checkbox, req., même texte que F1), newsletter (checkbox : « Je souhaite recevoir la lettre Mambo (une fois par mois). »). Bouton « Créer mon compte ».

### F3 — Inscription professionnel / partenaire
nomStructure (text, req., « Ex. : Saveurs de Douala »), activitePrincipale (select, req., « Choisir »), prenom, nom, email, telephone, paysResidence (req.), ville, rubriquesIntervention (multi-puces, mêmes 4 rubriques), consentement (req.), newsletter. Bouton « Envoyer ma demande d’inscription ».

### F4 — Être prévenu (Suivi Mambo)
email (email, requis implicite, placeholder « Votre adresse e-mail ») ; bouton « Me prévenir ». Pas de consentement visible.

### F5 — Bandeau cookies
Actions : Refuser · Personnaliser · Accepter.

### F6 — Questionnaire de satisfaction
noteGlobale (étoiles 1-5), ponctualite (choix unique 4 options), information (choix unique 4 options), recommandation (NPS 0-10), commentaire (textarea, facultatif), consentementPublication (checkbox, facultatif). Bouton « Envoyer mes réponses ». Détail en §4.

### F7 — Newsletter du footer (global)
nom (text, « Votre nom »), email (email, « Votre adresse e-mail »), telephone (tel, « Téléphone (WhatsApp) ») ; bouton « S'abonner ». Pas de consentement visible.

## 3. Champs dynamiques du devis par rubrique (tels que vus)
| Rubrique | Service | Champs « Votre besoin » montrés |
|---|---|---|
| Expérience | Chef privé | Date souhaitée (date, icône calendar) · Ville (select, map-pin) · Nombre de personnes (number, users) · Type d’occasion (select) · Décrivez votre besoin* (textarea) |
| Immobilier | — | non montré |
| Services de proximité | — | non montré |
| Culture & événementiel | — | non montré |
Hypothèse de modèle : champs communs (Date souhaitée, Ville, Description requise) + champs spécifiques par service (ex. Nombre de personnes, Type d’occasion pour la restauration/événementiel).

## 4. Modèle du questionnaire de satisfaction

Source : `questionnaire-de-satisfaction-desktop.md` (82:9565) / mobile (82:9706). Page autonome (barre logo seule, sans header/footer), accessible par le lien de l’e-mail d’invitation.

### En-tête (contexte de la prestation)
| Champ | Exemple affiché | Variable |
|---|---|---|
| Surtitre | `Questionnaire de satisfaction` (uppercase) | fixe |
| Titre | `Comment s’est passée votre prestation ?` | fixe |
| Intitulé de la prestation | `Chef privé · samedi 14 novembre 2026` | `serviceName` + `serviceDate` (format long, minuscule initiale ici) |
| Référence | `Demande MP-2026-0142` | `reference` |
| Vignette | illustration du service (« chef ») 48 px sur `#fce7d5` | `service.illustration` |

### Questions
| # | id proposé | Libellé verbatim | Type | Options / échelle | Requis | Exemple montré |
|---|---|---|---|---|---|---|
| 1 | `rating` | `1. Quelle note donnez-vous à la prestation ?` | étoiles 1-5 | 5 étoiles ; libellé sous les étoiles selon la note | non marqué | 4 étoiles → `Très bien` |
| 2 | `punctuality` | `2. Le prestataire était-il ponctuel et professionnel ?` | choix unique (puces) | `Oui, tout à fait` · `Plutôt oui` · `Plutôt non` · `Non` | non marqué | `Oui, tout à fait` |
| 3 | `information` | `3. L’équipe Mambo vous a-t-elle bien informé ?` | choix unique (puces) | mêmes 4 options | non marqué | `Plutôt oui` |
| 4 | `nps` | `4. Recommanderiez-vous Mambo Proxi à un proche ?` | échelle 0-10 (NPS) | 11 cases `0`…`10` ; bornes `Peu probable` (0) / `Très probable` (10) | non marqué | `9` |
| 5 | `comment` | `5. Un commentaire à partager ?` | texte libre | label `Votre commentaire`, placeholder `Ce qui vous a plu, ce que nous pouvons améliorer…` | non | vide |

**Libellés des étoiles** : seul `Très bien` (= 4/5) figure dans la maquette. Les libellés des notes 1, 2, 3 et 5 ne sont pas définis dans le design ; proposition à valider : 1 `Décevant`, 2 `Moyen`, 3 `Bien`, 4 `Très bien`, 5 `Excellent`.

### Consentement
Checkbox facultative, décochée par défaut : `J’accepte que mon avis (prénom, ville, note et commentaire) soit publié sur le site après validation par l’agence.` → si cochée, l’avis devient un « Avis client » publiable (statut `en_attente_validation`), champs publiés : prénom, ville, note, commentaire.

### Progression
Barre à 5 segments (un par question), h 6, gap 6 : segments remplis `#ff7a00`, restants `#f1efec`. Dans la maquette, 2/5 remplis.

### Mentions et validation
- Pied : `2 minutes · 5 questions · réponses confidentielles`.
- Bouton : `Envoyer mes réponses` (Primary pleine largeur) → page `questionnaire-merci`.
- **Aucun état d’erreur** ni champ marqué requis dans la maquette (règle proposée : note Q1 obligatoire, le reste facultatif ; lien à usage unique lié à la référence).

### Page de remerciement
Titre `Merci pour votre avis !` ; texte `Vos réponses nous aident à améliorer chaque prestation. Si vous l’avez accepté, votre avis pourra être publié sur le site après validation.` ; boutons `Découvrir nos services` (Primary) et `Retour à l’accueil` (Outline).

### Entité ReponseQuestionnaire
| Champ | Type | Exemple |
|---|---|---|
| demandeReference | string | MP-2026-0142 |
| note | entier 1-5 | 4 |
| ponctualite | enum `oui_tout_a_fait` \| `plutot_oui` \| `plutot_non` \| `non` | oui_tout_a_fait |
| information | même enum | plutot_oui |
| nps | entier 0-10 | 9 |
| commentaire | texte | — |
| consentementPublication | booléen | false |
| repondueLe | datetime | — |

## 5. E-mails transactionnels — gabarit et variables

### Gabarit commun (identique pour les 4 e-mails, à reproduire en React Email)
| Bloc | Spécification |
|---|---|
| Body / fond extérieur | `#f1efec` (neutral-100), padding vertical 40, largeur de canevas 680 |
| Conteneur (carte) | blanc, largeur **600**, rayon **20**, overflow hidden, pas d’ombre ni de bordure |
| En-tête | py 28, logo couleur centré : symbole « M-Lien » 52 × 39,5 + « Mambo » (Poppins Bold 22, ls −0.66, dégradé orange `#ff9a1f` → `#ff7a00` → `#f0550f`) / « Proxi » (Poppins Medium 14, `#699b22`), gap 7 → en e-mail : logo en image PNG |
| Ruban | 4 px pleine largeur, dégradé horizontal `#7db928` → `#c9a814` (50 %) → `#ff7a00` (`gradient/lien`) ; repli : image ou couleur `#ff7a00` |
| Corps | px 44 / py 36, gap 18 entre éléments |
| Titre | Poppins SemiBold 26 / 34, ls −0.26px, `#1c1a18` |
| Paragraphe | Inter Regular 16 / 26, `#5e5952` |
| Bloc récapitulatif (optionnel) | fond `#f8f7f5`, p 20, rayon 14, lignes gap 10 ; libellé à gauche (Inter Regular 14/20 `#5e5952`), valeur à droite (Inter SemiBold 14/20, ls 0.07, `#1c1a18`) |
| Bouton | pleine largeur (512), fond `#ff7a00`, texte `#1c1a18` Inter SemiBold 16/24, px 24 / py 12, rayon 12, h 48 — **toujours orange**, y compris pour l’action WhatsApp |
| Signature | `L’équipe MAMBO Proxi` — Inter SemiBold 14 / 20, ls 0.07, `#1c1a18`, alignée à gauche |
| Pied | fond `#f8f7f5`, px 44 / py 24, gap 8, centré : `France +33 6 00 00 00 00 · Cameroun +237 6 00 00 00 00` (Inter 12/16 `#5e5952`) ; `contact@mamboproxi.com · Vos services, au plus près de vous` (Inter 12/16 `#5e5952`) ; `Vous recevez cet e-mail suite à votre demande sur mamboproxi.com.` (Inter 11/16 `#7d776f`) |
| Polices de repli | Poppins → Arial/Helvetica ; Inter → Arial/Helvetica |

### Contenu par e-mail
| E-mail | Titre | Paragraphe(s) | Bloc spécifique | Bouton |
|---|---|---|---|---|
| Accusé de réception du devis (83:10416) | `Bonjour {firstName}, nous avons bien reçu votre demande.` | `Merci pour votre confiance. Un conseiller étudie votre besoin et vous envoie un devis personnalisé sous 24 h.` | Récap : `Référence` / `Service` / `Date souhaitée` / `Ville` | `Écrire à mon conseiller sur WhatsApp` |
| Invitation au questionnaire (83:10454) | `Votre avis compte, {firstName}.` | `Votre prestation « {serviceName} » du {serviceDateShort} est terminée. Pouvez-vous nous dire comment elle s’est passée ? 5 questions, 2 minutes.` | 5 étoiles 34 px centrées, gap 8 | `Donner mon avis` |
| Confirmation de rendez-vous (83:10490) | `Votre rendez-vous est confirmé.` | `Nous avons hâte d’échanger avec vous. Vous recevrez un rappel la veille.` | Récap : `Motif` / `Date` / `Heure` / `Format` | `Ajouter à mon agenda` |
| Inscription confirmée (83:10528) | `Bienvenue chez Mambo Proxi !` | `Votre inscription est enregistrée. Vos prochaines demandes seront plus rapides et mieux suivies.` + `Découvrez dès maintenant nos {serviceCount} services, en France comme au Cameroun.` | — | `Découvrir nos services` |

### Variables
| Variable | Exemple | E-mails |
|---|---|---|
| `firstName` | Aurélie | accusé de réception, invitation questionnaire |
| `reference` | MP-2026-0142 | accusé de réception (récap) ; lien questionnaire |
| `serviceName` | Chef privé | accusé de réception, invitation |
| `desiredDate` (long, majuscule) | Samedi 14 novembre 2026 | accusé de réception |
| `city` | Douala | accusé de réception |
| `whatsappUrl` | wa.me/… | accusé de réception |
| `serviceDateShort` | 14 novembre | invitation |
| `surveyUrl` | /questionnaire/{token} | invitation |
| `topic` | Immobilier | confirmation RDV |
| `appointmentDate` | Jeudi 12 novembre 2026 | confirmation RDV |
| `appointmentTime` + `timezoneLabel` | 14:00 (heure de Douala) | confirmation RDV |
| `format` | Visio · lien envoyé la veille | confirmation RDV |
| `calendarUrl` | .ics | confirmation RDV |
| `serviceCount` | 19 | inscription confirmée |
| `servicesUrl` | /services | inscription confirmée |
Constantes (paramètres du site) : téléphones FR / CM, e-mail de contact, baseline « Vos services, au plus près de vous », domaine mamboproxi.com.

## 6. Types de sections de page et champs éditables
| Type de section | Pages | Champs éditables |
|---|---|---|
| HeroSimple (fil d’Ariane + H1 + chapô) | devis-gratuit, pages-legales | breadcrumb[], titre, motSurligné (orange `#ad5300`), chapô / date de mise à jour |
| Stepper de progression | devis-gratuit | étapes[] { libellé, état fait/actif/à venir } |
| Carte d’étape de formulaire | devis-gratuit | numéro, titre, sous-titre, champs[] |
| Récapitulatif + aide | devis-gratuit | titre, garanties[], aide { titre, texte, bouton WhatsApp } |
| ConfirmationSuccès | devis-confirmation, questionnaire-merci | icône, titre, texte, libellé référence, actions[] |
| SplitAuth (visuel + formulaire) | s-inscrire-* | illustration, citation, auteur, titre, chapô, onglets profil[], formulaire, lien d’aide |
| HeroTeaser (badge + titre + capture email + aperçu) | suivi-mambo | badge, titre (mot surligné), chapô, placeholder, libellé bouton, aperçu demandes[] |
| GrilleFonctionnalités | suivi-mambo | eyebrow, titre, items[] { icône, titre, description } |
| CTA bandeau dégradé (global) | suivi-mambo (et autres) | titre (2 lignes), texte, bouton devis, bouton WhatsApp |
| Document légal (sommaire + article) | pages-legales | entrées sommaire[], sections[] { titre, corps } , date de mise à jour |
| Bandeau cookies (global) | toutes | titre, texte, libellés boutons |
| WhatsApp flottant (global) | toutes | numéro / message |
| Page 404 (illustration + eyebrow + titre + actions + liens utiles) | page-introuvable-404 | illustration, eyebrow, titre, texte, actions[], liensUtiles[] |
| Questionnaire (carte autonome) | questionnaire-de-satisfaction | surtitre, titre, contexte prestation, questions[], consentement, libellé bouton, mention de pied |
