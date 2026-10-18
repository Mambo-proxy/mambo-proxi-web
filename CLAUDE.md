# mambo-proxi-web — conventions du dépôt

Site public et back-office (`/admin`) de MAMBO Proxi, agence de coordination multiservices France ↔ Cameroun.
Next.js (App Router, TypeScript strict), Tailwind CSS v4 branché sur les tokens du design system, Motion pour les animations.
Les données viennent de l'API (`mambo-proxi-api`) décrite par `contracts/openapi.yaml`.

## Sources de vérité

1. **Maquettes Figma validées** — fichier `lsun63JexZYvgYUVpmSYyg` (« Mambo Proxi — Design System »), page `43:2` (site), page `84:10293` (back-office). Index des cadres et node IDs : `../Mambo_Proxi_Pilotage_Claude_Code/mambo-proxi-pilotage/FIGMA.md`.
   - Captures de référence (échelle 1) : `qa/reference/<référence>.png`.
   - Inventaires des textes, données et valeurs par cadre : `qa/inventory/`.
   - La page `2:3` (ancienne application) est hors périmètre ; la page `73:2` (prototype) ne sert pas aux mesures. Le fichier Figma est en lecture seule.
2. **Dossier de pilotage** — `docs/01` → `docs/08`, cahier des charges v1.2 (`ref/`).
3. **Contrat d'API** — `contracts/openapi.yaml`, copie synchronisée depuis `../mambo-proxi-api/contracts/` (`pnpm contract:sync`). Ne jamais le modifier ici : toute évolution commence dans le dépôt de l'API.

## Commandes

| Commande                                               | Rôle                                                                                |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `pnpm install`                                         | Installer (pnpm 12, Node 24 — `.nvmrc`)                                             |
| `pnpm dev`                                             | Serveur de développement (http://localhost:3000)                                    |
| `pnpm build` / `pnpm start`                            | Build et démarrage de production                                                    |
| `pnpm lint` · `pnpm typecheck` · `pnpm format:check`   | Qualité                                                                             |
| `pnpm test` · `pnpm test:watch` · `pnpm test:coverage` | Tests unitaires et de composants (Vitest, MSW)                                      |
| `pnpm test:e2e`                                        | Bout en bout + accessibilité (Playwright, axe) à 390/768/1280/1440, build sur mocks |
| `pnpm contract:sync`                                   | Copier le contrat depuis l'API, régénérer types et exemples des mocks               |
| `pnpm contract:generate`                               | Régénérer `src/lib/api/schema.d.ts` et `src/mocks/data/contract-examples.json`      |

## API et mocks

- Lecture côté serveur : `api` + `cached([cacheTags…])` + `unwrap` / `unwrapOrNull` (`src/lib/api/server.ts`, `result.ts`, `tags.ts`). Les étiquettes sont celles envoyées par l'API à `/api/revalidate`.
- Composants client : `browserApi` (`src/lib/api/browser.ts`), cookies de session inclus, jeton CSRF ajouté aux mutations. Erreurs : `ApiError` (`fieldErrors`, `errorMessage`).
- `NEXT_PUBLIC_API_MOCKING=enabled` : toutes les requêtes sont résolues par les gestionnaires MSW de `src/mocks/handlers/` (gestionnaires dédiés, puis exemples du contrat, puis 501 « Route non simulée »). Tests : `src/mocks/node.ts` (`onUnhandledFrame: 'error'`).
- `erreur@exemple.fr` dans un formulaire simulé déclenche une erreur 500, pour vérifier l'affichage des erreurs.

## Règles de fidélité (non négociables)

- Reproduire les maquettes **à l'identique** : mêmes textes mot pour mot (typographie française : espace insécable avant `: ; ? !` et `%`, guillemets « », apostrophes telles que sur la maquette), mêmes couleurs, tailles, espacements, rayons, ombres, ordre des sections, à 1440 px et 390 px. Pas de réinterprétation.
- Avant d'intégrer une page : relire l'inventaire (`qa/inventory/`) et la capture (`qa/reference/`) ; en cas de doute, interroger Figma (`get_design_context` sur la section). Le quota Figma est limité (200 appels/jour) : un appel par cadre complet, jamais d'appels en parallèle.
- Contrôle de fidélité par page : capture Playwright pleine page à 1440 et 390 comparée à `qa/reference/` (image de comparaison dans `qa/fidelite/`), vérification à 768 et 1280. Tolérance ±2 px sur les espacements, textes identiques.
- Une page n'est terminée qu'après : fidélité vérifiée (390/768/1280/1440), navigation clavier testée, animations en place, aucune erreur console, tests écrits.
- Écrans et états non maquettés : conçus dans exactement le même langage visuel.

## Design system

- Styles web : `text-web-hero`, `text-web-section`, `text-web-lead`, `text-web-eyebrow`, `text-web-stat`, conteneur `container-site`, rythme `section-y` (`src/styles/web.css`). Palette Tailwind par défaut désactivée. Composants de base dans `src/components/ui/` (aperçu : `/dev/ui`), classes assemblées avec `cn()`.
- Petits textes (≤ 14 px) en `text-text-muted` et non `text-text-subtle` (#7D776F, contraste insuffisant) ; `text-text-subtle` reste possible pour les textes décoratifs ou de 18 px et plus.

- **Tokens uniquement** (`src/styles/tokens.css`, `tailwind.theme.css`) : aucune couleur en dur, sauf le vert WhatsApp `#25D366` / survol `#1EBE5A`.
- Texte orange = `#AD5300` (`text-text-brand`), **jamais** `#FF7A00` sur fond clair.
- **Violet au strict minimum** : uniquement le logo, les guillemets des témoignages et le petit cœur du badge « Pensé pour vous ». Nulle part ailleurs (pas de focus violet).
- **Logos** : `public/brand/*.svg` exportés de Figma, utilisés tels quels (jamais modifiés, recolorés ni recomposés).
- **Photos** : depuis la refonte des maquettes (octobre 2026), les emplacements visuels montrent des photos. Elles sont exportées de Figma dans `public/photos/` et servies par l'API comme `Visual.image` (médias du back-office) ; `<Visual>` affiche l'illustration `public/illustrations/<scène>.svg` tant qu'aucune image n'est fournie.
- Icônes : `lucide-react`. Polices : Poppins (titres) et Inter (texte) via `next/font`.

## Langues (français / anglais)

- Site bilingue avec next-intl : français sans préfixe (adresses historiques), anglais sous `/en` avec des adresses traduites (`src/i18n/routing.ts`). Le back-office reste en français.
- Liens du site : toujours `SiteLink` (`@/i18n/site-link`) avec l'adresse interne française (`/qui-sommes-nous`), convertie dans la langue de la page ; `useSiteRouter` / `useSitePathname` pour la navigation programmée et l'onglet actif.
- Textes de l'interface dans `messages/fr.json` et `messages/en.json` (mêmes clés) ; contenus éditoriaux fournis par l'API dans la langue demandée (`?lang=en`, ajouté par le client serveur). Dans les mocks, l'exemple anglais d'un exemple du contrat porte le même nom suffixé `En` (`default` → `en`).
- Les traductions anglaises sont rédigées pour le site (aucune maquette anglaise) : ton et longueurs proches du français.

## Règles produit

- Aucun prix affiché (devis uniquement), aucun paiement en ligne, pas d'espace client (cahier §9).
- WCAG 2.2 AA, mobile d'abord, Lighthouse ≥ 90 sur mobile, `prefers-reduced-motion` respecté.
- RGPD : cases de consentement non cochées par défaut, double opt-in newsletter, aucun script de mesure avant consentement.
- Langue : interface, contenus, messages d'erreur et documentation en français ; code et noms techniques en anglais.
- Ne jamais mentionner d'outil d'IA ni d'assistant dans le code, les commentaires, la documentation, l'interface ou les messages de commit ; aucune ligne `Co-Authored-By` d'outil. Le dépôt appartient à la cliente.
- Versions : dernières versions stables vérifiées dans la documentation officielle, figées (lockfile, `packageManager`, `.nvmrc`).
- Commits petits au format « conventional commits ».

## Suivi

- `TASKS.md` : liste des tâches du projet (site + back-office), tenue à jour.
- `JOURNAL.md` : à chaque étape, ce qui a été fait, décisions, difficultés et solutions.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
