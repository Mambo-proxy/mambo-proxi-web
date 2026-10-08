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

- [x] Types et client générés (`openapi-typescript`, `openapi-fetch`) + couche `src/lib/api` (fetch serveur avec tags, client navigateur)
- [x] Mocks MSW (navigateur + Node) à partir des exemples du contrat et du catalogue ; drapeau `NEXT_PUBLIC_API_MOCKING` — gestionnaires dédiés du back-office et détails des rubriques/fiches à compléter avec chaque écran
- [x] Polices, styles web (`web/hero`, `web/section`, `web/lead`, `web/eyebrow`, `web/stat`), conteneur, grille, rythme vertical
- [x] Utilitaires : typographie française (insécables), formatage FR (nombres, dates, relatives), `AccentText` (`==…==`), WhatsApp (`wa.me`)
- [x] Composants `ui` : Button (Primary/Outline/Dark/WhatsApp/états), Chip, SegmentedTabs, Field/Input/Select/Textarea/Phone, Checkbox, Badge, Card, Accordion, Modal/Sheet, Toast (Sonner), Calendar, Dropzone, Pagination, Breadcrumb, Stars, Skeleton, Switch
- [x] Page interne `/dev/ui` (exclue de la production)
- [x] `<Visual>` (illustration ↔ photo, `next/image`, fond de secours)
- [~] Infrastructure de tests : Vitest + Testing Library, Playwright + axe-core aux 4 largeurs (faits) — reste : captures `toHaveScreenshot` par page (avec chaque page), Lighthouse CI

### 1.2 Gabarit global

- [x] Barre supérieure (repli au défilement)
- [x] En-tête desktop (onglets, point actif, S'inscrire, Devis gratuit, compactage 84 → 72)
- [x] Méga-menu « Nos services » (survol avec intention, clic/clavier, voile, flèches, Échap)
- [x] Sous-menus Partenaires, Formation, Mission, Qui sommes-nous, Recrutement, Contact, S'inscrire (non maquettés)
- [x] En-tête mobile + menu mobile plein écran (accordéons, blocage du défilement)
- [x] Pied de page + formulaire newsletter (états succès / déjà inscrit / erreur)
- [x] Bouton WhatsApp flottant (apparition, pulsation, étiquette, décalage cookies)
- [x] Bandeau cookies + modale « Personnaliser » + chargement GA4 après consentement
- [~] Bandeau CTA (variantes par page), fil d'Ariane, transitions de page — bandeau et fil d'Ariane faits ; reste : transitions de page (View Transitions)
- [ ] Protection Turnstile (widget invisible) sur tous les formulaires publics, newsletter comprise (jeton vide pour l'instant)

### 1.3 Pages publiques (desktop 1440, tablette, mobile 390)

- [x] Accueil `/` — comparaisons dans `qa/fidelite/accueil-*.png` ; captures de régression `toHaveScreenshot` à ajouter avec l'infrastructure de tests
- [x] Nos services `/services` — comparaisons dans `qa/fidelite/nos-services-*.png`
- [x] Rubrique Expérience `/services/experience` — `qa/fidelite/rubrique-*.png`
- [x] Rubrique Immobilier `/services/immobilier`
- [x] Rubrique Services de proximité `/services/services-de-proximite`
- [x] Rubrique Culture & événementiel `/services/culture-evenementiel` (+ agenda, modale d'inscription)
- [x] Fiche service `/services/[rubrique]/[service]` (19 fiches, barre d'action mobile) — `qa/fidelite/fiche-service-*.png` ; JSON-LD `Service`/`FAQPage`/`BreadcrumbList` reporté au chantier SEO (1.5)
- [x] Devis gratuit `/devis` (3 étapes, champs dynamiques, brouillon, récapitulatif) — `qa/fidelite/devis-*.png`
- [x] Confirmation `/devis/confirmation` — `qa/fidelite/devis-confirmation-*.png`
- [x] Contact `/contact` (2 formulaires, prise de rendez-vous + étape coordonnées, carte) — `qa/fidelite/contact-*.png`
- [x] Inscription `/inscription` (particulier / professionnel) — `qa/fidelite/inscription-*.png`
- [x] Qui sommes-nous `/qui-sommes-nous` — `qa/fidelite/qui-sommes-nous-*.png`
- [x] Mission `/mission` — `qa/fidelite/mission-*.png`
- [x] Partenaires `/partenaires` (filtres, formulaire) — `qa/fidelite/partenaires-*.png`
- [x] Formation `/formation` (catalogue filtrable, formulaire) — `qa/fidelite/formation-*.png`
- [x] Recrutement `/recrutement` (recherche, filtres, candidature avec CV) — `qa/fidelite/recrutement-*.png`
- [x] Offre d'emploi `/recrutement/[slug]` — `qa/fidelite/offre-emploi-*.png`
- [x] Avis clients `/avis-clients` (synthèse, filtres, masonry, pagination) — `qa/fidelite/avis-clients-*.png`
- [x] Suivi Mambo `/suivi-mambo` — `qa/fidelite/suivi-mambo-*.png`
- [x] Pages légales `/mentions-legales`, `/confidentialite`, `/cookies`, `/cgu` — `qa/fidelite/pages-legales-*.png`
- [x] Questionnaire `/questionnaire/[token]` (+ états jeton invalide / expiré / déjà rempli) — `qa/fidelite/questionnaire-*.png`
- [x] Merci `/questionnaire/merci`
- [x] 404, erreur 500, maintenance — `qa/fidelite/page-404-*.png`
- [x] Pages newsletter `/newsletter/confirmation`, `/newsletter/desinscription`, acceptation de créneau RDV (`/rendez-vous/confirmer`)

### 1.4 Back-office `/admin`

- [x] Connexion + vérification du code (OTP) + mot de passe oublié / réinitialisation / acceptation d'invitation
- [~] Gabarit : barre latérale (compteurs), barre supérieure, recherche ⌘K, notifications, responsive (icônes, navigation basse mobile), 404 — reste la 404 du back-office
- [x] Tableau de bord (desktop + mobile)
- [x] Demandes (liste, filtres, panneau de détail, statuts, notes, export)
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
