# Journal — mambo-proxi-web

## Phase 0 — Préparation (5 octobre 2026)

### Fait

- Accès Figma vérifié (`whoami` : compte avec siège Full sur l'offre Professional ; `get_metadata` sur la page `43:2` : OK).
- Lecture complète du dossier de pilotage.
- **Éléments graphiques** exportés depuis Figma en SVG : 6 logos (`public/brand/`) et 15 illustrations 640×480 (`public/illustrations/`). Exports bruts conservés dans `qa/raw-exports/` pour la traçabilité.
- **Captures de référence** à l'échelle 1 (1440 / 390 / 680 px de large) : 50 cadres du site, 4 e-mails, 15 écrans du back-office, 10 composants (`qa/reference/`, détail dans `qa/reference/README.md`).
- **Inventaire** des textes exacts, valeurs typographiques, couleurs, données et formulaires de chaque cadre (`qa/inventory/`, 3 synthèses de données site + 1 back-office).
- Contrat d'API copié dans `contracts/openapi.yaml` (source : `../mambo-proxi-api/contracts/`), script `pnpm contract:sync`.
- Initialisation du projet : Next.js 16.3.8 (App Router, React Compiler, routes typées), React 19.3, TypeScript strict, Tailwind CSS 4.3 branché sur les tokens fournis, ESLint 9.39, Prettier, CI (types générés à jour, lint, types, format, build).

### Décisions

- **Nettoyage des SVG exportés** : l'export Figma des variantes inclut le cadre du « component set » (fond `#E5E5E5`, rectangle `#80808C`, contour pointillé `#9747FF`) pour les logos, et le fond du canevas + le fond et la bordure de la section parente pour les illustrations. Seuls ces éléments d'export ont été retirés ; aucun tracé, couleur, dégradé ni viewBox des logos et illustrations n'a été modifié (nombre de tracés vérifié identique pour les logos).
- **TypeScript 6.0.3** au lieu de 7.0.2 : TypeScript 7 (compilateur natif) ne fournit plus l'API JavaScript ; Next.js 16.3 ne le prend en charge qu'avec un drapeau expérimental et l'analyse typée d'ESLint (typescript-eslint) en dépend. TypeScript 6 est la dernière version stable dotée de cette API.
- **ESLint 9.39.5** au lieu de 10.12.0 : `eslint-config-next` 16.3.8 embarque `eslint-plugin-react` 7.37.5, `jsx-a11y` et `import`, qui ne prennent en charge qu'ESLint 9 au plus ; avec ESLint 10, la règle `react/display-name` plante (`context.getFilename` supprimé). Retour à la dernière version 9.
- **Script d'installation de `unrs-resolver` non exécuté** (`allowBuilds` dans `pnpm-workspace.yaml`) : le binaire natif Windows est fourni par `@unrs/resolver-binding-win32-x64-msvc`, le script n'est qu'un repli qui télécharge ce binaire s'il manque.
- **`openapi-typescript` 7.13.0 avec TypeScript 6** : le paquet déclare TypeScript `^5` en dépendance de pair ; la génération fonctionne sans erreur avec 6.0.3. Avertissement de pair accepté.
- **Création manuelle de l'application** (au lieu de `create-next-app`, resté bloqué sur une invite interactive) : configuration équivalente et maîtrisée (pas de fichier d'aide générique ajouté).
- **Polices** : Poppins et Inter via `next/font`, injectées dans les variables des tokens `--mp-font-family-brand` / `--mp-font-family-ui`.
- **Fond des illustrations** : dégradé à deux arrêts (pas une couleur unie) ; la couleur du premier arrêt sert de fond de secours de `<Visual>` (`qa/raw-exports/illustrations/dominant-colors.json`).

### Difficultés et solutions

- **Quota de l'API Figma** : 200 appels/jour et 15/min sur l'offre Professional (6/mois pour les sièges View/Collab ; 600/jour sur Organization/Enterprise). Cinq extractions en parallèle ont atteint la limite par minute. Solution : appels séquentiels, un seul `get_design_context` par cadre complet (sortie volumineuse enregistrée puis analysée localement), métadonnées seules pour les cadres mobiles dont les textes sont déjà connus. Cadres restants relus le 6 octobre 2026 (10 appels).
- **Installation des dépendances de développement bloquée** (6 octobre 2026) : trois causes successives. (1) Disque C: plein, libéré par l'utilisateur. (2) Registre npm très lent par moments (requêtes de 1 à 6 min, 1–2 Kio/s), probablement lié à l'inspection HTTPS de l'antivirus (Avast, `aswMonFltProxy`) sur les téléchargements parallèles ; redevenu normal ensuite. (3) pnpm 12 s'arrête sur `ERR_PNPM_IGNORED_BUILDS` au lieu d'installer en silence : c'est cette invite d'approbation qui faisait attendre les premières tentatives. Solution : installation par petits groupes, refus explicite du script (voir Décisions).
- **Espaces insécables absents des maquettes** : Figma contient des espaces ordinaires avant `: ? ! %` et dans « 24 h » (vérifié sur l'export complet de Contact ; certains titres se cassent d'ailleurs avant le `?`). Décision : le rendu applique la typographie française (espace fine insécable / insécable) via un utilitaire, sans changer les mots.

### Contrôle des tokens (`get_variable_defs` sur l'accueil, 6 octobre 2026)

- 32 couleurs, espacements (8/12/24), rayon `md` 12, tailles et interlignages de texte, ombres `elevation/2` et `elevation/3` : **valeurs identiques** entre Figma et `src/styles/tokens.css`. Aucun écart de valeur.
- Seuls les noms diffèrent (Figma `--mp-font-line-height-caption`, `--mp-font-size-h1` ↔ tokens `--mp-line-height-caption`, `--mp-font-size-heading-h1`) : les tokens fournis sont conservés tels quels.
- Les styles web (`web/eyebrow` Inter SemiBold 13/16 +8 %, `web/section` Poppins SemiBold 48/56 −2 %, `web/stat` Poppins SemiBold 56/60 −2 %) sont des styles de texte Figma absents des tokens : ils seront ajoutés au CSS en phase 1, conformément à docs/02 §3.

### Inventaire complété (6 octobre 2026)

- Questionnaire, page de remerciement, 404 et 4 e-mails relus après renouvellement du quota (10 appels). Le questionnaire de la maquette n'affiche que le libellé de la note 4 (« Très bien ») : libellés retenus de 1 à 5 « Très décevant, Décevant, Correct, Très bien, Excellent » (docs/03 : « Très décevant → Excellent »), modifiables dans le back-office. Seule la note étoilée est obligatoire (aucun astérisque sur la maquette).

### Observations sur les maquettes (à traiter à l'intégration)

- Apostrophes mixtes `'` / `’` selon les blocs : reprises telles que sur la maquette.
- Le bandeau CTA est surchargé sur chaque page (7 variantes de textes) ; plusieurs pages n'en ont pas (Partenaires, Formation, Recrutement, Offre, Contact).
- Mobile : contenus retirés volontairement (ex. Partenaires 6 logos au lieu de 8, Avis 4 cartes au lieu de 6, rail de la méthode retiré sur Mission), débordements à corriger dans le même langage visuel (onglets Contact, ligne d'offre Recrutement, fil d'Ariane Offre).
- Erreurs ponctuelles des maquettes : calendrier de novembre 2026 sans le 30, flèches de navigation de mois dissymétriques, flèche « Voir toutes les offres » du mauvais côté — corrigées à l'intégration et listées dans le rapport final.
- Case newsletter de l'inscription cochée sur la maquette : décochée par défaut (RGPD).

## Phase 1 — Frontend sur mocks (6 octobre 2026)

### Fait

- Dépôts poussés sur GitHub.
- Couche API `src/lib/api` : client serveur (`api`, `cached` avec étiquettes de revalidation, `createAdminServerClient` qui transmet les cookies), client navigateur (`browserApi`, jeton CSRF « double-submit »), `ApiError` (RFC 9457, erreurs par champ), étiquettes de cache.
- Mocks : `scripts/contract-examples.mjs` extrait les exemples du contrat (63 opérations sur 151 simulables telles quelles, dont toutes les routes publiques sauf `GET /v1/services`) ; gestionnaires dédiés pour le catalogue (19 services de `catalogue-services.json`, filtres rubrique / mis en avant / recherche sans accents) et les 7 formulaires publics (référence `MP-AAAA-NNNN`) ; toute autre route répond 501 « Route non simulée ».
- Vitest 5 (projets `node` et `jsdom`), Testing Library, 11 tests. CI : contrôle des fichiers générés (types + exemples) et tests.
- Vérifié dans Next.js : build avec `NEXT_PUBLIC_API_MOCKING=enabled`, page serveur lisant les paramètres et les rubriques via les mocks.

### Décisions

- **Mocks branchés sur le transport du client** plutôt que par interception globale : avec le drapeau, `openapi-fetch` utilise un `fetch` qui résout la requête avec `getResponse(handlers, request)` de MSW, identique côté serveur (Server Components) et navigateur. Évite les conflits entre l'interception de MSW et le `fetch` modifié par Next.js, et pas de service worker à installer. Le code des mocks est chargé par import dynamique derrière une constante de compilation. Les tests utilisent `setupServer` (MSW Node) avec les mêmes gestionnaires.
- **MSW 3.0.2** (sorti le 3 octobre 2026) : l'option `onUnhandledRequest` est devenue `onUnhandledFrame` ; l'ancienne est ignorée sans erreur, d'où la vérification par `tsc`.
- **Vitest 5.0.3** et Vite 8 (dépendance de Vitest).

### Difficultés et solutions

- **Installations groupées bloquées** : une commande `pnpm add` de plusieurs paquets restait muette indéfiniment alors que chaque paquet, seul, s'installe en 8 à 30 s. Un processus pnpm orphelin d'une tentative précédente tenait aussi le magasin. Solution : arrêter les processus orphelins, installer un paquet à la fois.

### Fondations visuelles et composants (6 octobre 2026)

- Styles web relevés dans les inventaires (mobile 390 / desktop 1440) : titre de page 32/38 → 52/58, titre de section 30/36 → 48/56, chapô 16/25 → 19/31, sur-titre 12 → 13 px +8 %, chiffres 36/40 → 56/60 ; tablette interpolée. Les pages dont la maquette diffère (accueil 36/42 → 58/64…) surchargent ces valeurs. Conteneur 1440 avec marges `clamp(20px, 4.5vw, 64px)` (contenu 1312 à 1440). Vérifié dans le navigateur : valeurs calculées identiques.
- Palette Tailwind par défaut retirée (`palette-reset.css`) : seules les couleurs des tokens existent, plus le vert WhatsApp.
- Utilitaires : `frenchTypography` (insécables sans changer les mots), formats FR (nombres, %, tailles de fichier, dates en `Africa/Douala`, dates relatives), `AccentText` (`==…==`), `whatsappUrl`, `toE164`, `cn` (tailwind-merge configuré avec les noms du thème).
- Composants `ui` : Button / ButtonLink, Chip, SegmentedTabs, Field / Input / PhoneInput / Textarea / Select, Checkbox, Switch, Badge, Stars, Breadcrumb, Pagination, Accordion (`<details>` natif), Card, Skeleton, Spinner, Modal (`<dialog>` natif), Toaster (Sonner), Calendar (grille ARIA au clavier), Dropzone, Visual. Page `/dev/ui` (404 en production hors build sur mocks).
- Tests : 32 tests Vitest ; Playwright + axe-core sur `/dev/ui` aux 4 largeurs (aucune erreur console, aucun débordement, aucune violation WCAG détectée, modale et calendrier au clavier). Job E2E ajouté à la CI.

### Décisions

- **Contraste des petits textes** : la couleur `text/subtle` (#7D776F) des maquettes donne 4,4:1 sur blanc, 4,1:1 sur `neutral/50` et 3,9:1 sur `neutral/100`, sous le seuil WCAG AA de 4,5:1 pour les textes de 12–14 px. Les aides de champ, l'aide de la zone de dépôt, les en-têtes du calendrier et le badge « gris clair » (Clôturée) utilisent `text/muted` (#5E5952). Écart de teinte à valider ; les placeholders gardent la couleur de la maquette.
- **Libellés courts des onglets segmentés en mobile** (`shortLabel`), comme la maquette d'inscription ; les onglets ne débordent plus (la maquette Contact mobile dépassait de 32 px).
- **Calendrier** : chevrons des deux côtés (la maquette mélange une flèche et un chevron) — à valider.
- **Modale, notifications** : non maquettées, dessinées dans le langage des cartes (blanc, rayon 28, `elevation/4` ; panneau bas en mobile).
- **Type de routes** : `pnpm typecheck` lance `next typegen` pour que la CI vérifie les liens typés sans build préalable.

### Difficultés et solutions

- **`max-w-none` valait 0** : les tokens définissent un espacement `none` = 0, que Tailwind 4 utilise pour `max-w-none`. Utiliser `max-w-full` (ou une valeur explicite) ; relevé par le test E2E (modale de largeur nulle en mobile).
- **Espaces insécables invisibles** dans le code source : règle ESLint `no-irregular-whitespace` étendue aux chaînes ; elles s'écrivent en séquences d'échappement.
- **Tests E2E en parallèle bloqués en local** (navigations sans réponse sous charge, alors que le serveur répond en 40 ms) : un seul navigateur en local (~1 min), deux en CI. Les interactions attendent l'hydratation (`toPass`).

### Gabarit global (6 octobre 2026)

- Layout `(site)` : lien d'évitement, barre supérieure + en-tête collants, pied de page, bouton WhatsApp flottant, bandeau cookies ; données `GET /v1/site/settings` et `GET /v1/site/navigation` (cache par étiquettes, une requête par rendu).
- Barre supérieure (repli après 80 px), en-tête desktop 85 → 72 px avec ombre, onglets avec point actif, méga-menu (survol avec délai d'intention 120 ms / fermeture 200 ms, clavier, voile 35 %, colonnes en cascade), sous-menus des autres onglets et de « S'inscrire », en-tête mobile (masqué en descendant), menu mobile plein écran (`<dialog>`, glissement depuis la droite, accordéons animés, fermeture au changement de page), pied de page et newsletter (états succès / déjà inscrit / erreur), WhatsApp flottant (apparition après 400 px ou 4 s, anneau pulsant, étiquette au survol, décalé au-dessus du bandeau cookies), bandeau cookies + modale « Personnaliser » (choix mémorisé 6 mois dans le cookie `mp_consent`, GA4 chargé seulement après accord), bandeau CTA (dégradé qui ondule, filigrane).
- Vérifié au navigateur contre les captures : en-tête 85 px (69 en mobile), logo 144 × 40 (130 × 36), méga-menu et pied de page superposables aux maquettes ; aucun débordement à 390 / 768 / 1280 / 1440. Tests E2E : méga-menu au clavier, menu mobile, cookies (aucune requête Google sans accord), newsletter, WhatsApp, axe.
- Contrat (dépôt API) : exemple `Navigation` complété d'après les maquettes (4 rubriques et 19 services du méga-menu avec les noms courts, texte de l'encart promo, colonnes du pied de page), ordre des réseaux de la maquette (Instagram, Facebook, LinkedIn, TikTok).

### Décisions

- **Onglets à sous-menu** : l'onglet reste un lien vers sa page (`Entrée` y mène) ; `↓` ou `Espace` ouvrent le panneau. La spécification (docs/04) prévoit aussi `Entrée` pour ouvrir : conserver le lien vers la page a été préféré (pas de lien « voir toute la page » dans les panneaux maquettés).
- **Icône Immobilier** : la maquette montre `icon/building` (immeuble unique) ; le catalogue indique `Building2`. Contrat aligné sur la maquette (`Building`) ; à reporter dans les données d'amorçage de l'API.
- **Pastille Culture** : icône orange sur fond sombre (maquettes méga-menu et menu mobile).
- **Point de rupture `wide` (1440 px)** : mesures exactes des maquettes à partir de 1440 ; entre 1280 et 1439, marges de l'en-tête et colonnes du pied de page resserrées (sinon débordement de 35 à 78 px).
- **Newsletter sans case de consentement** (maquette) : le clic sur « S'abonner » vaut consentement (`consent: true`), confirmé par le double opt-in. À valider avec la cliente ; ajouter une mention sous le formulaire si nécessaire.
- **Animations en CSS** (transitions, `@starting-style`, `grid-template-rows`) plutôt que Motion pour le gabarit : même rendu, sans JavaScript supplémentaire. Motion reste prévu pour les animations de contenu.
- **Barre supérieure** : icône `Smartphone` (la capture montre un téléphone portable, l'inventaire indiquait `phone`).

### Difficultés et solutions

- **Préchargements des pages pas encore intégrées** : Next.js précharge `/devis`, `/inscription`… qui répondent 404 et sont relancés en boucle (l'état « réseau au repos » n'est jamais atteint). Les tests attendent le DOM et ignorent ces seuls préchargements ; disparaît avec les pages.
- **Double espace de la maquette** (« France␣␣+33… ») supprimé par Prettier dans le JSX : écrit dans une chaîne littérale.
- **Build de CI sans API** : les pages lisent l'API au rendu statique ; en Phase 1 le build de CI utilise les mocks (`NEXT_PUBLIC_API_MOCKING=enabled`). À l'intégration, le build de production devra joindre l'API (ou les pages passeront en rendu à la demande).
- **Règle `react-hooks/refs`** (compilateur React) : les déclencheurs et panneaux du menu sont retrouvés par `id` au lieu de références lues pendant le rendu.

### Accueil (6 octobre 2026)

- Page `/` pilotée par `GET /v1/pages/accueil` : chaque section est rendue selon son type et sa source (héros, bandeau défilant, « Nos univers » en bento, étapes, engagements + chiffres clés, avis, partenaires, bandeau CTA), dans l'ordre du back-office. Données complémentaires : rubriques, avis mis en avant, note moyenne, partenaires, chiffres des Paramètres.
- Fidélité vérifiée par comparaison côte à côte avec les captures (`qa/fidelite/accueil-1440.png`, `-390.png`) : en desktop, chaque section a la hauteur de la maquette à 4 px près (page 6 580 px pour 6 575) ; en mobile, page 7 173 px pour 7 094 (écart dû à trois retours à la ligne, voir ci-dessous). 768 et 1280 : rendu cohérent, sans débordement.
- Animations : apparition au défilement (fondu + 16 px, une fois, cascade 70 ms), chiffres qui défilent, bandeau défilant en boucle (pause au survol), flèches des cartes qui pivotent ; tout est désactivé avec `prefers-reduced-motion`. Le contenu reste dans le HTML rendu côté serveur.
- Tests : E2E accueil (ordre des sections, textes mobiles, liens des cartes, chiffres, carrousel au clavier) + axe aux 4 largeurs ; 50 tests E2E au total.
- Contrat (dépôt API) : champs facultatifs de textes mobiles (`titleMobile`, `leadMobile`, `textMobile`, `itemsMobile`, `labelMobile`), cartes « Nos univers » des rubriques (`homeCard`), visuels des rubriques Proximité (`livraison`) et Culture (`marche`), icône bouclier coché, texte mobile du bandeau CTA.

### Décisions

- **Textes propres au mobile** : la maquette mobile raccourcit de nombreux textes. Plutôt que d'afficher partout la version desktop, le contrat accueille des versions mobiles facultatives, éditables dans le back-office (vides = texte principal ; chapô mobile vide = masqué).
- **Avis en mobile** : la maquette montre des citations raccourcies ; un avis client ne se réécrit pas. Le texte complet est affiché, limité à 4 lignes.
- **Carrousel des avis** : points de pagination décoratifs (6 px, trop petits pour une cible tactile de 24 px exigée par WCAG 2.2) ; la liste défile au doigt, à la molette et aux flèches du clavier.
- **« Logo partenaire »** (en attendant les logos) : texte `text/muted` au lieu de `neutral/400` (contraste 2,4:1).
- **Carte Expériences** : la maquette laisse la description en sombre sur l'illustration (illisible) ; elle est rendue en blanc comme le titre.
- **Écarts restants en mobile** : trois textes que Figma garde sur une ligne passent à la ligne dans le navigateur (« La proximité, c'est notre métier. », « Un pont entre la France et le Cameroun », « services, 4 rubriques ») ; 3e icône des engagements en mobile (`sparkles` sur la maquette, `globe` comme en desktop).
- **Étoiles** : l'étoile lucide n'occupe que 83 % de son cadre ; agrandie de 20 % pour égaler l'icône Figma.

### Difficultés et solutions

- **Images chargées à la demande** absentes des captures pleine page (filigrane du bandeau CTA) : le symbole décoratif est chargé immédiatement.
- **Tests E2E dépendants de l'hydratation** sur une machine chargée : interactions répétées jusqu'au succès (`toPass`) et délais plus longs pour le premier envoi simulé (le module des mocks est chargé à la demande dans le navigateur).

### Nos services (6 octobre 2026)

- Page `/services` : héros de page générique (`PageHero`, réutilisable par les rubriques), barre des rubriques collante sous l'en-tête avec suivi de la section visible et défilement fluide, 4 rubriques en fonds alternés (présentation + grille de cartes en desktop, lignes cliquables en mobile), bandeau CTA propre à la page. Données : `GET /v1/pages/services` et `GET /v1/categories?include=services`.
- L'en-tête publie sa hauteur visible dans `--site-header-h` (barres collantes, marge des ancres).
- Fidélité : 5 947 px pour 5 926 à 1440, 6 747 pour 6 742 à 390 (`qa/fidelite/nos-services-*.png`) ; aucun débordement à 768 et 1280. Tests E2E : contenu, 19 liens de fiche, barre collante et rubrique active, axe.
- Contrat (dépôt API) : exemple de page `services`, numéros 01–04 et descriptions des rubriques de la maquette, icône `Key` de la carte « Logement trouvé » de l'accueil.

### Décisions

- **Icônes de services corrigées d'après la maquette** dans le catalogue simulé : Location / colocation → `Key`, Logement adapté → `HouseHeart`, Gestion locative → `Building` (le catalogue du dossier de pilotage indique `KeyRound`, `HousePlus`, `Building`/`Building2`) : à reporter dans les données d'amorçage de l'API.
- **Massage bien-être** : la maquette montre une fleur de lotus absente de lucide ; `Flower2` conservé.
- **Numéros décoratifs « 01 »–« 04 »** (orange très pâle de la maquette, contraste 1,4:1) : rendus par pseudo-élément CSS. Texte purement décoratif, exempté par WCAG 1.4.3 ; l'outil d'audit ne peut pas le savoir.
- **Noms courts des services** sur les cartes (« Portage et livraison de repas »…), comme dans le méga-menu.

### Pages rubrique (6 octobre 2026)

- Gabarit `/services/[rubrique]` (4 pages générées à la compilation) : héros, « Pour qui ? », services (groupes titrés pour Immobilier), bloc spécifique (réception de colis pour Proximité, agenda pour Culture), « Comment ça se passe », témoignage, « Nos autres rubriques », bandeau CTA propre à la rubrique. Liens « Devis » vers `/devis?service=…`, bouton du héros vers `/devis?rubrique=…`, message WhatsApp pré-rempli avec la rubrique. Rubrique inconnue : 404.
- Agenda : 3 prochains événements, « Voir tout l’agenda » affiche les suivants ; « Je participe » ouvre la modale d'inscription (non maquettée : nom, e-mail, téléphone, nombre de places, consentement → `POST /v1/event-registrations`), premier formulaire sur react-hook-form + zod (règles et messages communs dans `src/lib/forms`).
- Fidélité : en desktop, chaque section à 8 px près des maquettes (5 498 / 5 487, 6 002 / 5 999, 5 734 / 5 725, 6 144 / 6 129) ; mobile ajusté section par section (`qa/fidelite/rubrique-*.png`). Tests E2E : 4 rubriques (contenu, axe, débordement), groupes, 404, agenda, inscription (validation et confirmation).
- Contrat (dépôt API) : étapes illustrées et lien du bloc spécifique, vignette des rubriques (`thumbnail`), bandeau CTA d'Expérience.

### Décisions

- **Contenu des 4 rubriques dans les mocks** (`src/mocks/data/category-details.ts`, relevé des inventaires) plutôt que 4 exemples complets dans le contrat ; sert de référence pour l'amorçage de l'API.
- **Illustrations de services alignées sur les maquettes** dans le catalogue simulé : Livraison de courses → `livraison`, Activités culturelles → `culture`, Découverte et intégration locale → `culture` (catalogue de pilotage : `courses`, `marche`, `accueil`) — à reporter dans l'amorçage.
- **Teinte des pastilles** de « Pour qui ? » et des cartes services selon la rubrique (orange pâle, gris clair, vert pâle, sombre + icône orange), comme sur les maquettes.
- **« Places limitées »** en `text/muted` (maquette `text/subtle`, contraste insuffisant).
- **Agenda simulé** : 5 événements (les 3 de la maquette + 2) pour que « Voir tout l’agenda » ait un effet.

### Fiche service (7 octobre 2026)

- Gabarit `/services/[rubrique]/[service]` (19 pages générées à la compilation) d'après la maquette « Chef privé » : héros (étiquettes rubrique et villes, titre 64/68, accroche, boutons, galerie de 3 visuels), colonne principale (« À qui s’adresse ce service ? », étapes en frise verticale, avantages, FAQ dont la première question est ouverte) et colonne latérale collante (carte devis « Tarif communiqué sur devis » + encart rendez-vous), avis du service, services liés, bandeau CTA propre au service. Aucun prix affiché.
- Mobile : la carte devis s'insère après « À qui… », chaque bloc devient une section, les avantages passent sur fond `neutral/50` ; barre d'action fixe « Devis gratuit » + « WhatsApp » qui remplace le bouton WhatsApp flottant (le pied de page garde une marge pour ne pas être recouvert). Tablette : boutons du héros, pas de barre.
- Tous les boutons Devis mènent à `/devis?service=<slug>` ; le message WhatsApp mentionne le service. Un service demandé sous une autre rubrique que la sienne répond 404.
- Fidélité : 5 294 px pour 5 287 à 1440 (héros, avis et services liés au pixel, contenu à 2 px) ; mobile comparé section par section (`qa/fidelite/fiche-service-*.png`) ; aucun débordement à 768 et 1280. Tests E2E : 4 fiches (une par rubrique : contenu, axe, débordement), devis pré-rempli, FAQ, avis, services liés, barre d'action mobile, 404.
- Contrat (dépôt API) : exemple « Chef privé » complet (galerie chef / marché / chef, 4 questions, 2 avis, 3 services liés, titres des sections, bandeau « Prêt à recevoir vos invités ? »).

### Décisions

- **Fiches sans maquette** : seules les données de « Chef privé » viennent de la maquette. Les 18 autres fiches simulées ont un contenu provisoire cohérent par rubrique (publics, étapes, avantages, FAQ), marqué `toComplete` ; la cliente le remplacera dans le back-office.
- **Réponses de la FAQ « Chef privé »** : seule la première est visible sur la maquette ; les trois autres sont rédigées (villes desservies, réservation depuis la France, délai conseillé) et sont à valider par la cliente.
- **Carte devis** : largeur 338 px comme sur la maquette (l'encart rendez-vous dessous fait 400 px).
- **Vignettes des services liés** : la maquette montre des illustrations provisoires sans rapport avec les services ; chaque carte affiche le visuel de son service.
- **Accordéon** : variante espacée (question py 32, 29 en mobile) relevée sur la page, l'espacement de la planche des composants (py 20) restant celui par défaut.
- **Données structurées** (`Service`, `FAQPage`, `BreadcrumbList`) : elles demandent l'adresse publique du site, pas encore définie ; elles seront ajoutées avec le chantier SEO (1.5).

### Devis gratuit et confirmation (7 octobre 2026)

- `/devis` : en-tête, indicateur de progression (Service → Votre besoin → Coordonnées), 3 cartes d'étape et récapitulatif collant (service choisi avec ✕ pour changer, 3 garanties, carte « Une question avant de remplir ? » + WhatsApp). Pré-sélection par `?service=` (étape 2 active) ou `?rubrique=`.
- Étape 2 : champs propres à la rubrique lus dans `quoteFields` (`GET /v1/categories/{slug}`, administrables) — Expérience : date, ville, nombre de personnes, occasion ; Immobilier : type de bien, ville, budget indicatif, date d'arrivée, durée ; Proximité : ville, fréquence, adresse ; Culture : date, nombre de participants — puis description obligatoire.
- Validation zod étape par étape (« Continuer » vérifie les étapes 1 et 2 et place le focus sur l'étape 3), brouillon en `sessionStorage` (consentement jamais mémorisé), envoi `POST /v1/quote-requests`, erreurs en toast avec conservation des saisies, redirection vers `/devis/confirmation?ref=…`.
- Confirmation : pastille de succès animée (rebond + coche tracée, désactivés si le mouvement est réduit), référence, « Suivre sur WhatsApp » avec la référence dans le message, « Retour à l’accueil ». Sans référence valide : retour à `/devis`. Page non indexée.
- Fidélité : devis 2 948 px pour 2 945 (desktop) et 4 784 pour 4 781 (mobile), cartes d'étape à 8 px près ; confirmation 1 632 pour 1 631,5, section mobile à 1 px. Tests E2E : pré-sélection, parcours complet jusqu'à la confirmation, brouillon, redirection, axe.

### Décisions

- **Toutes les étapes restent ouvertes**, comme sur la maquette (l'étape faite garde ses choix modifiables, l'étape à venir est déjà remplissable) ; l'état de chaque carte (faite, active, à venir) suit la progression. Choisir un service passe à l'étape 2.
- **Date** : champ date natif (calendrier du système, accessible et adapté au mobile) ; la maquette affiche « Samedi 14 novembre 2026 », le navigateur affiche la date au format local.
- **Rubrique et service obligatoires** à l'étape 1 (le contrat accepte un service vide ; la maquette demande « une rubrique puis un service »).
- **Pays de résidence** : liste de 20 pays (France et Cameroun en tête) ; à compléter si besoin.
- **Liste « Choisir »** : texte gris `text/muted` (la maquette utilise `text/subtle`, contraste insuffisant pour une valeur affichée).
- **Vignette du récapitulatif** : visuel du service choisi (la maquette montre l'illustration « accueil »).

### Contact (7 octobre 2026)

- `/contact` : héros et 4 moyens de contact cliquables (`tel:`, `wa.me`, `mailto:`), carte « Écrivez-nous » à onglets « Nous contacter » / « Demande d’information » (`?onglet=information`, ajoute le service concerné) → `POST /v1/contact-messages`, confirmation et référence en place.
- « Prendre rendez-vous » (ancre `#rendez-vous`) : motif, format, calendrier des disponibilités du mois (`GET /v1/appointments/availability`, filtré par format ; jours passés, dimanches, jours complets et délai de 24 h désactivés), créneaux du jour en heure de Douala ; puis, dans le même encart, coordonnées (nom, e-mail, téléphone, message facultatif, consentement) → `POST /v1/appointments` (« À confirmer »), confirmation en place.
- « Notre agence » : plan stylisé reprenant la maquette (SVG, sans service tiers ni cookie) et carte adresse alimentée par les Paramètres (adresse, horaires, réception des colis, lien « Itinéraire »).
- Mocks : disponibilités générées (lundi–samedi, 5 créneaux dont le dernier sans agence, un jour sur neuf complet), envoi des rendez-vous.
- Fidélité : 3 320 px pour 3 349 en desktop et 4 891 pour 4 912 en mobile ; l'écart vient de la ligne de créneaux, affichée par la maquette avec un jour déjà choisi (`qa/fidelite/contact-*.png`). Tests E2E : page, validation et envoi du message, onglet information, rendez-vous complet.

### Décisions

- **Aucune sélection par défaut** pour le motif, le format, le jour et le créneau (la maquette montre « Immobilier », « Visio », le 12 et 14:00 pour illustrer l'état sélectionné) ; « Demander ce rendez-vous » indique ce qui manque.
- **Étape coordonnées du rendez-vous** (non maquettée) : le contrat exige nom, e-mail et téléphone ; l'encart rappelle le créneau choisi avec un lien « Modifier ».
- **Onglets en mobile** : libellé court « Information » (la maquette déborde de la carte).
- **Plan** : image stylisée en attendant l'adresse définitive (docs/03 le permet) ; une carte interactive (Leaflet + OpenStreetMap) pourra la remplacer quand les coordonnées seront validées.
- **Sujets** du formulaire : liste proposée (devis, question sur un service, immobilier, partenariat, recrutement, presse, autre) ; téléphone facultatif comme sur la maquette.
- **Pastille WhatsApp** : vert WhatsApp à 10 % d'opacité (la maquette utilise `#e9fbf0`, hors tokens).

### Inscription (7 octobre 2026)

- `/inscription` : panneau illustré collant en desktop (accueil pour un particulier, équipe pour un professionnel ; voile sombre, logo blanc, citation), absent en mobile ; sélecteur « Je suis un particulier » / « Je suis un professionnel / partenaire » (libellés courts en mobile) qui met à jour `?profil=professionnel` ; formulaire → `POST /v1/registrations` (fiche contact, pas de mot de passe au lot 1), confirmation en place.
- Professionnel : nom de la structure et activité principale obligatoires, rubriques d'intervention ; particulier : services qui intéressent (puces à choix multiple).
- Fidélité : 2 007 px pour 2 055 (desktop) et 3 142 / 3 312 pour 3 123 / 3 295 (mobile) ; l'écart desktop vient des puces, réparties sur deux lignes dans la maquette, où deux d'entre elles sont cochées. Tests E2E : deux profils (axe, débordement, newsletter décochée), validation et envoi, bascule de profil.

### Décisions

- **Newsletter décochée par défaut** : la maquette la montre cochée pour illustrer l'état ; le consentement doit être explicite (RGPD).
- **Pays et ville vides** par défaut (la maquette montre « France » et « Paris » comme valeurs saisies).
- **Activités principales** : liste proposée (restauration, transport, photo, bien-être, événementiel, immobilier, entretien, livraison, tourisme, autre), à valider par la cliente.
- **Citation du panneau** : guillemet orange clair (`orange/300`), comme sur la maquette.

### Qui sommes-nous et Mission (7 octobre 2026)

- Pages éditoriales rendues depuis `GET /v1/pages/{key}` par un moteur commun (`PageSections`) : chaque section publiée est affichée selon son type, dans l'ordre du back-office. Nouveaux rendus : héros avec puces d'ancrage (la puce active suit la section visible), texte + média (présentation en deux colonnes ou citation signée de la fondatrice), équipe, grilles de cartes (valeurs sur fond sombre, engagements numérotés, énoncés mission/vision), engagements + chiffres clés, méthode en rail (numéros dans les titres en mobile), bandeau de citation.
- Contenu des deux pages relevé dans les maquettes (`src/mocks/data/pages.ts`), servi par un gestionnaire dédié ; il sert de référence pour l'amorçage de l'API.
- Fidélité desktop : chaque section à la hauteur de la maquette (Qui sommes-nous 588 · 440 · 792 · 856 · 534 · 812 · 528, Mission 568 · 624 · 755 · 661 · 448 · 498) ; mobile à moins de 45 px par section (`qa/fidelite/qui-sommes-nous-*.png`, `mission-*.png`). Tests E2E : titres, ancres, bandeau final, axe, défilement par puce.

### Décisions

- **Portraits de l'équipe** : la maquette fait varier la couleur des vêtements sur une même illustration ; les 4 cartes affichent l'illustration « portrait » en attendant les photos de l'équipe (noms « Prénom Nom » à fournir).
- **Numéros décoratifs** (« 01 »… en `orange/200` et `orange/300`) rendus par pseudo-élément, comme sur Nos services : texte décoratif à faible contraste voulu par la maquette.

### Partenaires et Formation (8 octobre 2026)

- Les deux pages passent par le moteur des pages éditoriales, avec des sections dynamiques propres : grille de partenaires filtrable (`?categorie=`, 6 logos en mobile) et formulaire « Devenir partenaire » (`POST /v1/partner-requests`) ; catalogue des formations filtrable (`?categorie=`) et formulaire « Demande de formation » (`POST /v1/training-requests`).
- Nouveaux rendus de cartes : cartes illustrées avec sous-titre (types de partenariat), avantages sur fond clair, offres avec lien (Formation). Section formulaire commune (colonne d'informations + carte), avec l'encadré « Et ensuite ? » ou une illustration.
- Liens croisés sans rechargement : « Je candidate » présélectionne le type de partenariat, « Voir les formations » applique le filtre, « Demander cette formation » présélectionne la formation ; sans JavaScript, ces liens restent de simples ancres ou adresses avec paramètre.
- Contrat (dépôt API) : `subtitle` facultatif sur les éléments de section.
- Fidélité desktop : Partenaires 568 · 632 · 812 · 570 · 990 (maquette 568 · 632 · 806 · 570 · 982), Formation 568 · 476 · 990 · 946, identique à la maquette. Tests E2E : pages, filtres, présélections, validation et envoi.

### Décisions

- **Logos des partenaires** : en attendant les logos, la tuile affiche le nom en `text/muted` (la maquette utilise `neutral/400`, contraste insuffisant).
- **« Pays et ville »** (Partenaires) : liste au format « Pays · Ville » de la maquette (Cameroun et France, avec « Autre ville »), envoyée en code pays + ville comme l'exige le contrat.
- **Formation hors catalogue** : option « Autre formation » qui ouvre un champ « Formation recherchée » (le contrat prévoit `autre` + `otherTraining`).
- **Titre « Une formation pour votre équipe ? »** : le point d'interrogation ne passe plus seul à la ligne (espace insécable), comme le demandait l'inventaire.

### Recrutement et offre d'emploi (8 octobre 2026)

- `/recrutement` : atouts (cartes horizontales), offres (nombre de postes ouverts en titre, recherche, filtres lieu et contrat, ancienneté « Publiée il y a… »), bandeau sombre « Devenir prestataire » (variante sombre de la section CTA, vers le formulaire Partenaires), candidature avec CV par glisser-déposer → `POST /v1/job-applications` en `multipart/form-data`. « Candidature spontanée » est le choix par défaut ; `?poste=` présélectionne une offre.
- `/recrutement/[slug]` (générées à la compilation) : étiquettes, intitulé, lieu, contrat, prise de poste, date de publication ; Le poste, Vos missions, Votre profil, Ce que nous offrons ; carte « Intéressé·e ? » (Postuler → candidature présélectionnée, partage WhatsApp, LinkedIn, e-mail) et « Voir toutes les offres ».
- Fidélité desktop : Recrutement 568 · 278 · 972 · 348 · 1048 (identique à la maquette), offre 2 208 px pour 2 206 (`qa/fidelite/recrutement-*.png`, `offre-emploi-*.png`). Tests E2E : pages, compteur, recherche, filtres, présélection et envoi avec CV.
- Tests : l'audit d'accessibilité neutralise désormais les animations d'apparition (un contraste mesuré en plein fondu faisait échouer un test de façon aléatoire).

### Décisions

- **Filtres de contrat** : CDI, CDD, Freelance… selon les offres publiées (la maquette ne montre que CDI et Freelance ; une offre en CDD fait apparaître « CDD »).
- **Ville** facultative dans la candidature, comme sur la maquette (le contrat la déclare obligatoire : une valeur vide est envoyée ; à aligner côté API).
- **Partage de l'offre** : l'adresse est lue dans le navigateur tant que l'adresse publique du site n'est pas définie.
- **Liste en mobile** : la ligne de métadonnées passe sur plusieurs lignes (la maquette déborde de la carte).

### Avis clients (8 octobre 2026)

- `/avis-clients` : héros avec carte « Note globale » (moyenne, étoiles, nombre d'avis, répartition des notes) depuis `GET /v1/reviews/summary` ; avis de `GET /v1/reviews` filtrés par rubrique (liens `?categorie=`), triés (« Plus récents » / « Mieux notés », `?tri=notes`) et paginés (`?page=`, 6 avis par page comme la maquette), en maçonnerie 3 colonnes remplie ligne par ligne (une colonne sous 1 280 px, 4 avis en mobile) ; bloc « Votre avis compte » (texte + 4 étapes) ; bandeau CTA.
- Mocks : les 6 avis de la maquette et 66 avis provisoires pour remplir la pagination (`1 2 3 … 12`) ; l'accueil lit désormais ses 3 avis mis en avant dans ce jeu.
- Fidélité desktop : héros 404, collecte 576, CTA 498 au pixel ; liste 940 pour 878 (`qa/fidelite/avis-clients-*.png`). Tests E2E : page, filtre, tri et pagination qui conservent les paramètres.

### Décisions

- **« Avis vérifié après prestation »** affiché sur chaque avis vérifié (la maquette ne le montre que sur le premier) : d'où la liste un peu plus haute que la maquette.
- **Date des avis** en `text/muted` (maquette `text/subtle`, contraste insuffisant).
- **Nombre d'avis par page** : 6 (maquette) ; la maquette annonce 120 avis et 12 pages, incohérence à arbitrer avec la cliente.

### Suivi Mambo (8 octobre 2026)

- `/suivi-mambo` (page statique, espace client hors lot 1) : badge « Bientôt disponible », « Me prévenir » → `POST /v1/newsletter/subscriptions` avec la source et l'étiquette `suivi-mambo` (double opt-in, déjà inscrit géré), aperçu illustratif « Mes demandes » (décoratif, masqué aux lecteurs d'écran), 4 fonctionnalités à venir, bandeau CTA.
- Fidélité desktop : 511 · 514 · 498, identique à la maquette (`qa/fidelite/suivi-mambo-*.png`). Tests E2E : page, adresse invalide puis inscription.
- En-têtes des grilles de cartes portés à 820 px (largeur de la maquette) ; les autres pages éditoriales gardent leurs hauteurs.

### Décisions

- **Consentement de « Me prévenir »** : comme la newsletter du pied de page, pas de case (la maquette n'en montre pas) ; l'envoi vaut demande et l'e-mail de confirmation (double opt-in) recueille le consentement. À valider avec la cliente (point déjà signalé pour la newsletter).
