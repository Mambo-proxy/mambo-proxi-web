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

| Commande                                             | Rôle                                                                  |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| `pnpm install`                                       | Installer (pnpm 12, Node 24 — `.nvmrc`)                               |
| `pnpm dev`                                           | Serveur de développement (http://localhost:3000)                      |
| `pnpm build` / `pnpm start`                          | Build et démarrage de production                                      |
| `pnpm lint` · `pnpm typecheck` · `pnpm format:check` | Qualité                                                               |
| `pnpm contract:sync`                                 | Copier le contrat depuis l'API et régénérer `src/lib/api/schema.d.ts` |
| `pnpm contract:types`                                | Régénérer seulement les types                                         |

(Tests unitaires, E2E, régression visuelle et mocks MSW sont ajoutés en phase 1.)

## Règles de fidélité (non négociables)

- Reproduire les maquettes **à l'identique** : mêmes textes mot pour mot (typographie française : espace insécable avant `: ; ? !` et `%`, guillemets « », apostrophes telles que sur la maquette), mêmes couleurs, tailles, espacements, rayons, ombres, ordre des sections, à 1440 px et 390 px. Pas de réinterprétation.
- Avant d'intégrer une page : relire l'inventaire (`qa/inventory/`) et la capture (`qa/reference/`) ; en cas de doute, interroger Figma (`get_design_context` sur la section). Le quota Figma est limité (200 appels/jour) : un appel par cadre complet, jamais d'appels en parallèle.
- Contrôle de fidélité par page : capture Playwright pleine page à 1440 et 390 comparée à `qa/reference/` (image de comparaison dans `qa/fidelite/`), vérification à 768 et 1280. Tolérance ±2 px sur les espacements, textes identiques.
- Une page n'est terminée qu'après : fidélité vérifiée (390/768/1280/1440), navigation clavier testée, animations en place, aucune erreur console, tests écrits.
- Écrans et états non maquettés : conçus dans exactement le même langage visuel.

## Design system

- **Tokens uniquement** (`src/styles/tokens.css`, `tailwind.theme.css`) : aucune couleur en dur, sauf le vert WhatsApp `#25D366` / survol `#1EBE5A`.
- Texte orange = `#AD5300` (`text-text-brand`), **jamais** `#FF7A00` sur fond clair.
- **Violet au strict minimum** : uniquement le logo, les guillemets des témoignages et le petit cœur du badge « Pensé pour vous ». Nulle part ailleurs (pas de focus violet).
- **Logos** : `public/brand/*.svg` exportés de Figma, utilisés tels quels (jamais modifiés, recolorés ni recomposés).
- **Illustrations** à la place des photos : `public/illustrations/<scène>.svg`, affichées via `<Visual>` qui acceptera plus tard une photo du back-office sans changer la mise en page.
- Icônes : `lucide-react`. Polices : Poppins (titres) et Inter (texte) via `next/font`.

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
