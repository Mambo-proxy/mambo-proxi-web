# Liste des tâches — site et back-office

Légende : `[x]` fait · `[~]` en cours · `[ ]` à faire. Les tâches de l'API sont dans `../mambo-proxi-api/TASKS.md`.
Une page n'est cochée qu'après : fidélité 390/768/1280/1440 vérifiée (`qa/fidelite/`), clavier testé, animations en place, aucune erreur console, tests écrits.

## Phase 0 — Préparation

- [x] Lecture complète du dossier de pilotage et vérification de l'accès Figma (`whoami`, `get_metadata` 43:2)
- [x] Export des 6 logos (`public/brand/`) et des 15 illustrations (`public/illustrations/`) depuis Figma
- [x] Captures de référence des 69 cadres + 10 composants (`qa/reference/`)
- [x] Inventaire des textes, données et valeurs par cadre (`qa/inventory/`)
- [x] Contrat `openapi.yaml` rédigé, validé (Redocly) et synchronisé dans `contracts/`
- [x] Initialisation du dépôt : Next.js 16, TypeScript strict, Tailwind v4 + tokens, ESLint, Prettier, CI
- [x] Vérifier `get_variable_defs` ↔ `src/styles/tokens.css` (aucun écart de valeur, voir JOURNAL)

## Phase 1 — Frontend complet sur mocks

### 1.1 Fondations

- [ ] Types et client générés (`openapi-typescript`, `openapi-fetch`) + couche `src/lib/api` (fetch serveur avec tags, client navigateur)
- [ ] Mocks MSW (navigateur + Node) à partir des exemples du contrat et du catalogue ; drapeau `NEXT_PUBLIC_API_MOCKING`
- [ ] Polices, styles web (`web/hero`, `web/section`, `web/lead`, `web/eyebrow`, `web/stat`), conteneur, grille, rythme vertical
- [ ] Utilitaires : typographie française (insécables), formatage FR (nombres, dates, relatives), `AccentText` (`==…==`), WhatsApp (`wa.me`)
- [ ] Composants `ui` : Button (Primary/Outline/Dark/WhatsApp/états), Chip, SegmentedTabs, Field/Input/Select/Textarea/Phone, Checkbox, Badge, Card, Accordion, Modal/Sheet, Toast (Sonner), Calendar, Dropzone, Pagination, Breadcrumb, Stars, Skeleton, Switch
- [ ] Page interne `/dev/ui` (exclue de la production)
- [ ] `<Visual>` (illustration ↔ photo, `next/image`, fond de secours)
- [ ] Infrastructure de tests : Vitest + Testing Library, Playwright (E2E + `toHaveScreenshot` 390/768/1280/1440), axe-core, Lighthouse CI

### 1.2 Gabarit global

- [ ] Barre supérieure (repli au défilement)
- [ ] En-tête desktop (onglets, point actif, S'inscrire, Devis gratuit, compactage 84 → 72)
- [ ] Méga-menu « Nos services » (survol avec intention, clic/clavier, voile, flèches, Échap)
- [ ] Sous-menus Partenaires, Formation, Mission, Qui sommes-nous, Recrutement, Contact, S'inscrire (non maquettés)
- [ ] En-tête mobile + menu mobile plein écran (accordéons, blocage du défilement)
- [ ] Pied de page + formulaire newsletter (états succès / déjà inscrit / erreur)
- [ ] Bouton WhatsApp flottant (apparition, pulsation, étiquette, décalage cookies)
- [ ] Bandeau cookies + modale « Personnaliser » + chargement GA4 après consentement
- [ ] Bandeau CTA (variantes par page), fil d'Ariane, transitions de page

### 1.3 Pages publiques (desktop 1440, tablette, mobile 390)

- [ ] Accueil `/`
- [ ] Nos services `/services`
- [ ] Rubrique Expérience `/services/experience`
- [ ] Rubrique Immobilier `/services/immobilier`
- [ ] Rubrique Services de proximité `/services/services-de-proximite`
- [ ] Rubrique Culture & événementiel `/services/culture-evenementiel` (+ agenda, modale d'inscription)
- [ ] Fiche service `/services/[rubrique]/[service]` (19 fiches, barre d'action mobile)
- [ ] Devis gratuit `/devis` (3 étapes, champs dynamiques, brouillon, récapitulatif)
- [ ] Confirmation `/devis/confirmation`
- [ ] Contact `/contact` (2 formulaires, prise de rendez-vous + étape coordonnées, carte)
- [ ] Inscription `/inscription` (particulier / professionnel)
- [ ] Qui sommes-nous `/qui-sommes-nous`
- [ ] Mission `/mission`
- [ ] Partenaires `/partenaires` (filtres, formulaire)
- [ ] Formation `/formation` (catalogue filtrable, formulaire)
- [ ] Recrutement `/recrutement` (recherche, filtres, candidature avec CV)
- [ ] Offre d'emploi `/recrutement/[slug]`
- [ ] Avis clients `/avis-clients` (synthèse, filtres, masonry, pagination)
- [ ] Suivi Mambo `/suivi-mambo`
- [ ] Pages légales `/mentions-legales`, `/confidentialite`, `/cookies`, `/cgu`
- [ ] Questionnaire `/questionnaire/[token]` (+ états jeton invalide / expiré / déjà rempli)
- [ ] Merci `/questionnaire/merci`
- [ ] 404, erreur 500, maintenance
- [ ] Pages newsletter `/newsletter/confirmation`, `/newsletter/desinscription`, acceptation de créneau RDV

### 1.4 Back-office `/admin`

- [ ] Connexion + vérification du code (OTP) + mot de passe oublié / réinitialisation / acceptation d'invitation
- [ ] Gabarit : barre latérale (compteurs), barre supérieure, recherche ⌘K, notifications, responsive (icônes, navigation basse mobile), 404
- [ ] Tableau de bord (desktop + mobile)
- [ ] Demandes (liste, filtres, panneau de détail, statuts, notes, export)
- [ ] Services (liste, réordonnancement, menu) + gestion des rubriques
- [ ] Ajouter / modifier un service (7 sections, sauvegarde auto, aperçu, complétude, publication)
- [ ] Pages & textes (sections, éditeurs par type, Tiptap pour les pages légales, aperçu, publication)
- [ ] Avis clients (validation, réponse, mise en avant, questions du questionnaire)
- [ ] Rendez-vous (calendrier jour/semaine/mois, détail, à confirmer, saisie manuelle) + réglage des disponibilités
- [ ] Recrutement (offres, éditeur d'offre, candidatures, détail, CV)
- [ ] Partenaires (logos réordonnables, éditeur, demandes de partenariat)
- [ ] Formations (catalogue, éditeur, demandes)
- [ ] Agenda (événements, éditeur, inscriptions) — non maquetté
- [ ] Contacts & inscrits (liste, fiche contact, export, RGPD)
- [ ] Newsletter (campagnes, éditeur, aperçu, test, programmation, inscrits)
- [ ] Paramètres (coordonnées, WhatsApp, réseaux, e-mails automatiques + éditeur de modèle, référencement, utilisateurs, sécurité & sauvegardes)
- [ ] Médiathèque, utilisateurs (ADMIN), journal d'activité

### 1.5 Transverse

- [ ] SEO : `generateMetadata`, `sitemap.ts`, `robots.ts`, `opengraph-image`, JSON-LD (Organization/LocalBusiness, WebSite, BreadcrumbList, Service, FAQPage, JobPosting, AggregateRating)
- [ ] Revalidation `/api/revalidate` (tags), `/health`, `middleware` (protection `/admin`, en-têtes de sécurité, CSP avec nonce)
- [ ] Accessibilité (axe, clavier), performance (Lighthouse ≥ 90 mobile, JS initial < 170 Ko)

## Phase 3 — Intégration

- [ ] Branchement sur l'API réelle, téléversements, OTP, revalidation par tags
- [ ] E2E de bout en bout sur la pile Docker (devis, contact + RDV, inscription, candidature, newsletter, questionnaire, cookies, BO : OTP, demande → « Prestation réalisée », ajout et publication d'un service, page, avis)

## Phase 4 — Production

- [ ] Dockerfile multi-étapes, `docker-compose.prod.yml` + Caddy, CI/CD (GHCR, déploiement sur étiquette)
- [ ] Audits Lighthouse / axe archivés, tests de charge k6
- [ ] Documentation : README, DEPLOIEMENT, EXPLOITATION, ARCHITECTURE, GUIDE_BACK_OFFICE
- [ ] `RAPPORT_DE_LIVRAISON.md`
