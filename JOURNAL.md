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
