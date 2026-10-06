# Back-office — Synthèse des données (schémas API admin)

Source : 15 frames Figma de la page 84:10293 (fichier `lsun63JexZYvgYUVpmSYyg`). Détail écran par écran dans les fiches `bo-*.md` ; coque commune dans `_shell.md`.
Conventions d’affichage : dates courtes françaises (`5 oct.`, `29 sept.`), horodatage `5 oct. · 09:12`, dates relatives (`Il y a 2 h`, `Hier`, `Aujourd’hui`), séparateur de milliers espace (`1 248`), pourcentages `46 %`, notes `4,8 / 5`, séparateur « · ».

## 1. Entités et champs

### Utilisateur back-office (AdminUser)
| Champ | Type | Notes |
|---|---|---|
| id | id | |
| nom | string | `Mireille Bell`, `Équipe Douala` |
| prenom (affichage accueil) | string | `Bonjour Mireille` |
| initiales | string | `MB`, `ED` |
| email | string | `mireille@mamboproxi.com` |
| role | enum | `administrateur` (« Administratrice ») / `editeur` (« Éditeur (demandes et contenus) ») |
| motDePasse (hash), 2FA e-mail | | « double vérification par e-mail » ; « Rester connecté » |

### Rubrique
| Champ | Valeurs |
|---|---|
| id / slug | `experience`, `immobilier`, `proximite`, `culture` |
| libelleLong | `Expérience`, `Immobilier`, `Services de proximité`, `Culture & événementiel` |
| libelleCourt | `Expérience`, `Immobilier`, `Proximité`, `Culture` (liste Demandes) / `Culture & événementiel` (Services) |
| ordre | |

### Service
| Champ | Type | Contraintes / exemple |
|---|---|---|
| id, nom | string | requis — `Visites guidées de Douala` |
| rubriqueId | ref Rubrique | requis |
| slug / urlPage | string | `/services/{rubrique}/{slug}` ; SEO `mamboproxi.com/services/culture/visites-guidees-douala` |
| illustration (scène) | enum/asset | `chef`, `voiture`, `photo`, `massage`, `evenement`, `logement`, `equipe`, `colis`, `marche`, `culture`, `accueil` |
| accroche | string | requis, max 120 |
| descriptionCourte | string | cartes et résultats |
| visuels[] | images JPG/PNG (1600 px conseillé) | 1er = principal ; critère « Photo principale en haute définition » |
| publics[] | string[] ordonnés | « À qui s’adresse ce service ? » |
| etapes[] | {titre, texte}[] ordonnés | « Ce que Mambo fait concrètement » |
| avantages[] | {titre, texte}[] ordonnés | |
| faq[] | {question, reponse}[] ordonnés | facultatif |
| servicesLies[] | ids Service | |
| temoignages[] | ids Avis publiés | « Patrick E. · ★★★★★ » |
| seo.titre | string max 60 | défaut `{nom} | MAMBO Proxi` |
| seo.description | string max 160 | |
| statut | enum ServiceStatut | |
| dansLeMenu | bool | |
| misEnAvantAccueil | bool | |
| boutonWhatsApp | bool | |
| ordre | int | glisser-déposer |
| demandes30j | calculé | |
| completude | calculé | 7 critères → % (`Page complète à 86 %`, `6 sections sur 7`) |
| derniereSauvegarde | datetime | autosave |

### Demande (devis / contact client)
| Champ | Type | Exemple |
|---|---|---|
| reference | string | `MP-2026-0142` |
| client | ref Contact (nom complet, nom abrégé « Prénom N. », initiales, couleur avatar, email, téléphone, ville, pays, contactPrefere) | `Aurélie Kamga`, `aurelie.k@email.com`, `+33 6 12 34 56 78`, `Paris, France`, `WhatsApp` |
| serviceId, rubriqueId | refs | `Chef privé`, `Expérience` |
| recueLe | datetime | `5 oct. · 09:12` |
| statut | enum DemandeStatut | |
| champs spécifiques (JSON) | dateSouhaitee, ville, personnes, occasion… | `Samedi 14 nov. 2026`, `Douala`, `12`, `Anniversaire` |
| besoin | texte | « Dîner pour les 60 ans… » |
| notesInternes | texte | placeholder `Ajouter une note pour l’équipe…` |
| historique[] | {libelle, date} | `Demande reçue via le formulaire`, `Accusé de réception envoyé au client` |
| devis | (action `Préparer le devis`) | |

### Rendez-vous
| Champ | Type | Exemple |
|---|---|---|
| debut, duree | datetime, minutes | `Jeu 12 nov. · 14:00`, 60 / 90 |
| motif | enum | `Devis`, `Immobilier`, `Partenariat`, `Recrutement` |
| objet | string | `Chef privé`, `Événement`, `entretien` |
| contact | nom libre ou ref (Contact / Partenaire / Candidat) | `Sandrine M.`, `Saveurs de Douala`, `Famille Ndzana` |
| format / lieu | enum + texte | `Téléphone`, `Visio`, `Agence`, `Agence Douala` |
| statut | enum RdvStatut | |
| demandeId / partenaireId / candidatureId | refs optionnelles | |
| Créneaux disponibles | {jour, heureDebut, heureFin}[] | plage visible 08:00–17:00, lun→sam |

### Avis client
| Champ | Type | Exemple |
|---|---|---|
| auteur (nom abrégé), initiales, ville | string | `Aurélie K. · Paris` |
| serviceId, datePrestation | | `Logement temporaire · prestation du 2 oct.` |
| note | 1–5 | |
| commentaire | texte | « … » |
| reponses.ponctualite | enum Échelle | `Oui, tout à fait` / `Plutôt oui` / `Plutôt non` / (`Non, pas du tout` présumé) |
| reponses.information | enum Échelle | |
| reponses.recommandation | 0–10 | `10/10` |
| consentementPublication | bool | |
| statut | enum AvisStatut | |
| reponseAdmin | texte | action `Répondre` |
| demandeId | ref | |

### Questionnaire de satisfaction (configuration)
Questions ordonnées : 1 `Note globale (1 à 5 étoiles)` · 2 `Ponctualité et professionnalisme` · 3 `Qualité de l’information` · 4 `Recommandation (0 à 10)` · 5 `Commentaire libre`. Envoi automatique 24 h après passage au statut « Prestation réalisée ».

### Page & Section (Pages & textes)
| Entité | Champs |
|---|---|
| Page | id/slug, titre, dateModification, sections[] — pages : Accueil, Nos services, Expérience, Immobilier, Services de proximité, Culture & événementiel, Qui sommes-nous ?, Mission, Partenaires, Formation, Recrutement, Avis clients, Contact, Suivi Mambo, Mentions légales, Confidentialité, Cookies |
| Section | id, type, titre, description, visible (bool), ordre, contenu (JSON par type) |
Types observés (Accueil) : `bandeau_superieur` (repris des Paramètres), `section_principale` {titre requis, texte, boutonPrincipal {libellé, cible}, boutonSecondaire, visuel {fichier, dimensions, poids}}, `engagements` {items[3] titre/texte}, `rubriques_services` (auto), `chiffres_cles` {items[] valeur/libellé : `150+` projets accompagnés, `40+` partenaires engagés, `19` services, `2` pays couverts}, `temoignages` (3 derniers avis publiés), `partenaires_newsletter`.

### Partenaire
| Champ | Type |
|---|---|
| nom | string (`Saveurs de Douala`, `Immo Bonapriso`, `Kribi Évasion`, `Studio Lumière`, `Résidences Akwa`, `DLA Transports`, `Atelier Bamoun`, `Cabinet Ndoumbe`) |
| logo | PNG/SVG fond transparent |
| categorie | enum `Prestataires Expérience` / `Immobilier` / `Entreprises & prestataires` |
| visible | bool |
| ordre | int |
**Demande de partenariat** : entité listée (compteur 3), détail non maquetté.

### Offre d’emploi & Candidature
| Offre | intitule, lieu, typeContrat (`CDI`, `CDD 12 mois`, `Temps partiel`, `Freelance`, `Stage`), datePublication, dateExpiration, statut, nbCandidatures, nbNouvelles |
|---|---|
| **Candidature** | nom, initiales, ville, telephone, offreId \| spontanée (`Candidature spontanée`), dateReception, cv (PDF), statut |

### Formation & Demande de formation
| Formation | intitule, programme (`Formation des professionnels` / `Ateliers & sensibilisation`), categorie (`Professionnels` / `Ateliers` / `Sensibilisation`), duree (texte), format (`Présentiel · {ville}` / `En ligne`), nbDemandes, statut |
|---|---|
| **Demande de formation** | structure, contact (civilité + nom), ville, formation (ref ou libellé), participants, periode (mois année), statut |

### Contact (inscrits)
| Champ | Exemple |
|---|---|
| nom / raison sociale, initiales | `Aurélie Kamga`, `Saveurs de Douala` |
| email | `contact@saveurs-dla.cm` |
| profil | `Particulier` / `Professionnel` |
| ville, pays | `Paris, France`, `Douala` |
| interets[] | rubriques |
| nbDemandes | calculé |
| newsletter | abonné / non |
| dateCreation | |

### Newsletter — Campagne & segment
| Campagne | objet (requis), contenu riche (gras, italique, lien, image, bouton ; variable `{prénom}`), segments[], nbDestinataires, tauxOuverture, tauxClic, statut, dateProgrammation, dateEnvoi, dateModification |
|---|---|
| **Segments** | `Tous les inscrits` (1 248), `France`, `Cameroun`, `Professionnels` |

### Notification (barre supérieure)
Pastille de non-lus sur la cloche ; contenu non maquetté.

## 2. Enums de statut — libellés FR et couleurs

Badge standard : pilule radius 999px, padding 4px / 10px, pastille 6px, Inter SemiBold 12px.
Palettes : **orange** fond #FDF4EC / texte #AD5300 / pastille #FF7A00 · **vert** fond #F6FAEF / texte #557E1B / pastille vert (#7DB928) · **gris foncé** fond #F1EFEC / texte #2E2B28 · **gris** fond #F1EFEC / texte #5E5952 · **gris clair** fond #F1EFEC / texte #7D776F.

| Enum | Valeur | Libellé | Palette |
|---|---|---|---|
| DemandeStatut | nouvelle | `Nouvelle` (onglet `Nouvelles`) | orange |
| | en_cours | `En cours` | gris foncé |
| | realisee | `Prestation réalisée` (étape `Réalisée`) | vert |
| | cloturee | `Clôturée` (onglet `Clôturées`) | gris clair |
| ServiceStatut / OffreStatut / FormationStatut | publie | `Publié` | vert |
| | brouillon | `Brouillon` | gris |
| AvisStatut | a_valider | `À valider` (onglet) | — |
| | publie | `Publiés` (onglet) | — |
| | masque | `Masqués` (onglet) | — |
| AvisConsentement | accepte | `Publication acceptée par le client` (icon/check-circle) | vert |
| | refuse | `Publication non autorisée` (icon/lock) | gris |
| RdvStatut | a_confirmer | `À confirmer` | événement fond #FDF4EC + bordure gauche 3px #FF7A00 |
| | confirme | (confirmé) | événement fond #F6FAEF + bordure gauche 3px #7DB928 |
| CandidatureStatut | nouveau | `Nouveau` | orange |
| | lu | `Lu` | gris |
| | retenu | `Retenu` | vert |
| DemandeFormationStatut | nouvelle | `Nouvelle` | orange |
| | en_cours | `En cours` | gris foncé |
| CampagneStatut | programmee | `Programmée` | orange |
| | envoyee | `Envoyée` | vert |
| | brouillon | `Brouillon` | gris |
| NewsletterAbonnement | abonne | `Abonné` | vert |
| | non | `Non` | gris |
| PartenaireVisibilite / Section visible / Service dansLeMenu / E-mail actif | true / false | interrupteur 40 × 24 | activé #7DB928, désactivé #CFCAC3 |
| ProfilContact | particulier / professionnel | `Particulier` / `Professionnel` | texte simple |
| Échelle questionnaire | — | `Oui, tout à fait`, `Plutôt oui`, `Plutôt non` (+ négatif présumé) | puces neutres #F8F7F5 |
| RoleAdmin | administrateur / editeur | `Administratrice` / `Éditeur (demandes et contenus)` | — |

## 3. Endpoints de liste — filtres, tri, colonnes

| Liste | Filtres | Tri (déduit) | Colonnes | Pagination / compteurs |
|---|---|---|---|---|
| Demandes | statut (Toutes 58 / Nouvelles 12 / En cours 18 / Prestation réalisée 21 / Clôturées 7), rubrique (`Toutes les rubriques`), pays (`Tous les pays`), période (`30 derniers jours`), recherche | recueLe desc | Client (avatar, nom abrégé, localisation), Service (+ rubrique), Reçue le, Statut | 8/page (`Affichage de 1 à 8 sur 58 demandes`) ; export CSV ; détail par ligne |
| Dernières demandes (dashboard) | — | recueLe desc, limite 5 | Client, Service, Reçue (relative), Statut, actions | |
| Services | rubrique (Tous 19 / Expérience 5 / Immobilier 7 / Proximité 3 / Culture & événementiel 4) | ordre manuel | grip, Service (vignette, nom, URL), Rubrique, Demandes (30 j), Statut, Dans le menu (toggle), actions | 9/page ; pied `Affichage de 9 sur 19 services · 1 brouillon` |
| Pages | — | ordre fixe | nom + méta « Modifié … » | 17 pages |
| Sections d’une page | — | ordre manuel | titre, description, visible | `7 sections` |
| Avis | statut (À valider 4 / Publiés 112 / Masqués 9), service (`Tous les services`) | date desc | cartes : auteur, ville, service, date prestation, note, texte, réponses, consentement | |
| Rendez-vous | plage (semaine `9 au 14 novembre 2026`), vue Jour/Semaine/Mois | debut asc | calendrier ; liste « À confirmer » (3) | |
| Offres d’emploi | onglet Offres (5) | datePublication desc | Offre (+ dates), Lieu, Contrat, Candidatures (`6 · 2 nouvelles`), Statut, actions | |
| Candidatures | onglet Candidatures (14) | dateReception desc | Candidat·e (+ ville/tél.), Poste visé, Reçue, CV, Statut | |
| Partenaires | vue (Logos affichés 12 / Demandes de partenariat 3), catégorie (Tous / Prestataires Expérience / Immobilier / Entreprises & prestataires) | ordre manuel | carte : logo, nom, catégorie, visible | grille |
| Formations | onglet Catalogue (6) | — | Formation (+ programme), Catégorie, Durée, Format, Demandes, Statut, actions | |
| Demandes de formation | onglet (4) ; « récentes » limite 3 | date desc | Structure (+ contact · ville), Formation souhaitée, Participants, Période, Statut | |
| Contacts | profil (Tous 1486 / Particuliers 1312 / Professionnels 174), pays, rubrique d’intérêt, recherche | — | Nom (+ e-mail), Profil, Localisation, Intérêts, Demandes, Newsletter, actions | 6/page (`Affichage de 1 à 6 sur 1 486 contacts`) ; export CSV |
| Campagnes newsletter | — | date desc | Objet (+ programmée/envoyée/modifié), Destinataires, Ouverture, Statut | export des inscrits |
| Utilisateurs admin | — | — | avatar, nom, rôle | `2 utilisateurs` ; invitation |

Compteurs de navigation (barre latérale) : Demandes = nouvelles (12) ; Rendez-vous = à confirmer (3) ; Avis clients = à valider (4) ; Recrutement = candidatures non lues (2).

## 4. Définitions des KPI

| KPI | Écran | Valeur maquette | Définition |
|---|---|---|---|
| Nouvelles demandes | Dashboard | 12, `+4` `vs semaine dernière` | demandes au statut nouvelle (ou reçues sur la période) ; delta vs semaine précédente |
| Devis en cours | Dashboard | 18 | demandes au statut en_cours |
| Prestations réalisées | Dashboard | 27, `+12 %` `ce mois-ci` | demandes passées à realisee sur le mois ; variation % vs mois précédent |
| Satisfaction moyenne / Note moyenne | Dashboard, Avis | `4,8 / 5`, `+0,1` `sur 30 jours` | moyenne des notes 1–5 |
| Période | Dashboard | `7 jours` / `30 jours` (actif) / `12 mois` | sélecteur appliqué aux KPI |
| Demandes reçues par semaine | Dashboard | S30→S41 : 5, 8, 6, 9, 11, 7, 10, 13, 12, 9, 14, 12 | nb de demandes par semaine ISO, toutes rubriques |
| Demandes par rubrique | Dashboard | Immobilier 21, Expérience 17, Services de proximité 9, Culture & événementiel 6 ; `53 demandes au total` | 30 derniers jours |
| À faire aujourd’hui | Dashboard | avis 4, candidatures 2, RDV 3, partenariat 1, nouveaux inscrits 5 ; `5 actions en attente` | compteurs d’éléments en attente |
| Questionnaires de satisfaction | Dashboard | `68 %` ; `23 réponses ce mois` | réponses / questionnaires envoyés |
| Newsletter (inscrits) | Dashboard, Newsletter | `1 248`, `+56 ce mois` | abonnés actifs |
| Visites du site | Dashboard | `4 320` `sur 30 jours · source Google Analytics` | GA, 30 j |
| Recommandation | Avis | `92 %`, `+3 pts`, `notes de 9 ou 10` | part des réponses 9–10 |
| Taux de réponse | Avis | `68 %` | identique questionnaires |
| Avis publiés | Avis | `112` | count statut publie |
| Répartition des notes | Avis | 5★ 86 %, 4★ 10 %, 3★ 3 %, 2★ 1 %, 1★ 0 % ; `120 avis` | |
| Contacts | Contacts | `1 486`, `+64` `ce mois-ci` | |
| Particuliers / Professionnels / partenaires | Contacts | `1 312` / `174` | |
| France / Cameroun | Contacts | `58 % / 39 %` | répartition par pays |
| Taux d’ouverture | Newsletter | `46 %`, `+4 pts` `dernier envoi` | |
| Taux de clic | Newsletter | `9 %` | |
| Désinscriptions | Newsletter | `0,4 %` | |
| Demandes (30 j) par service | Services | 14, 6, 3, 4, 5, 9, 7, 4, 0 | |
| Complétude page service | Éditeur | `86 %`, `6 sections sur 7` | 7 critères |
| Mobile | Dashboard mobile | `Nouvelles demandes` 12, `Devis en cours` 18, `Réalisées (mois)` 27, `Satisfaction` 4,8 / 5 | sans deltas |

## 5. Paramètres — groupes et champs

Onglets : `Coordonnées` · `E-mails automatiques` · `Référencement` · `Utilisateurs` · `Sécurité & sauvegardes` ; bouton global `Enregistrer`.

| Groupe | Champs (libellé exact → valeur maquette) |
|---|---|
| Coordonnées de l’agence (`Une seule saisie : mises à jour partout sur le site`) | `Téléphone France` → `+33 6 00 00 00 00` ; `Téléphone Cameroun` → `+237 6 00 00 00 00` ; `E-mail de contact` → `contact@mamboproxi.com` ; `Horaires` → `Lun – Sam · 8h – 20h` ; `Adresse de l’agence (réception des colis et courriers)` → `Adresse à compléter · Douala, Cameroun` |
| Bouton WhatsApp (`Affiché en bas à droite de toutes les pages`) | actif (toggle, activé) ; `Numéro WhatsApp` → `+237 6 00 00 00 00` ; `Message pré-rempli` → `Bonjour Mambo Proxi, je souhaite des informations sur…` |
| Réseaux sociaux | `Instagram` → `instagram.com/mamboproxi` ; `Facebook` → `facebook.com/mamboproxi` ; `LinkedIn` → `linkedin.com/company/mamboproxi` ; `TikTok` → `tiktok.com/@mamboproxi` |
| E-mails automatiques (`Envoyés sans action de votre part`) | `Accusé de réception` — `À chaque demande de devis, contact, inscription ou candidature` — actif ; `Questionnaire de satisfaction` — `24 h après le passage au statut « Prestation réalisée »` — actif ; `Confirmation et rappel de rendez-vous` — `À la confirmation, puis la veille du rendez-vous` — actif ; `Alerte à l’équipe` — `Une notification par e-mail pour chaque nouvelle demande` — actif ; chacun avec un `Modèle` éditable |
| Diffusion (`Où ces informations s’affichent`) | `Bandeau supérieur du site`, `Pied de page`, `Page Contact et carte`, `Bouton WhatsApp flottant`, `E-mails envoyés aux clients` |
| Utilisateurs (`Accès au back-office`, `2 utilisateurs`) | `Mireille Bell` — `Administratrice` ; `Équipe Douala` — `Éditeur (demandes et contenus)` ; action `Inviter` |
| Sécurité & sauvegardes | `Sauvegarde automatique` — `Chaque nuit · dernière : aujourd’hui 03:00` ; `Connexion sécurisée (HTTPS) active` ; connexion avec `double vérification par e-mail` |
| Référencement | onglet non maquetté (SEO global) ; SEO par service : titre ≤ 60, description ≤ 160, adresse de page |

## 6. Incohérences relevées dans les maquettes (à arbitrer)

- Demandes de partenariat : `1` (tableau de bord) vs `3` (onglet Partenaires).
- Logos affichés : compteur `12` vs 8 cartes dessinées.
- Avis : onglets 4 + 112 + 9 = 125 vs `120 avis` dans la répartition.
- Slug du service Visites guidées : `/services/culture/visites-douala` (liste) vs `…/visites-guidees-douala` (SEO éditeur).
- Libellés de rubrique courts / longs selon l’écran (`Proximité` / `Services de proximité`, `Culture` / `Culture & événementiel`).
- Compteurs d’onglets Contacts sans séparateur de milliers (`1486`) vs KPI `1 486`.
- Avis d’Aurélie K. : apostrophes droites (`l'aéroport`, `s'est`) alors que le reste utilise ’.
- Navigation semaine Rendez-vous : icônes précédent `arrow-left` / suivant `chevron-right`.
