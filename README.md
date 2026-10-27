# mambo-proxi-web

Site officiel **MAMBO Proxi** (site public et back-office `/admin`) — agence de coordination multiservices entre la France et le Cameroun.
Next.js (App Router) · TypeScript strict · Tailwind CSS v4 · Motion.

Les données viennent de l'API (`mambo-proxi-api`) décrite par `contracts/openapi.yaml`.

## Démarrage (développement)

Prérequis : Node.js 24 (`.nvmrc`), pnpm 12 (`corepack enable`).

```bash
pnpm install
pnpm contract:sync      # copier le contrat depuis ../mambo-proxi-api et générer les types
pnpm dev                # http://localhost:3000
```

> Le projet est en cours de réalisation par phases. Les commandes de test, les mocks et la configuration (`.env.example`) sont documentés ici au fil des phases.

## Lancer le site sur l'API réelle

1. Démarrer l'API (`../mambo-proxi-api`, voir son README) avec `WEB_URL=http://localhost:3000` (seule origine
   autorisée par son CORS, cookies et liens des e-mails) et le même `REVALIDATE_SECRET` que le site.
2. Dans `.env.local` du site :

   ```bash
   NEXT_PUBLIC_API_MOCKING=            # vide : plus de mocks MSW
   NEXT_PUBLIC_API_URL=http://localhost:4000
   API_INTERNAL_URL=                   # ex. http://api:4000 si le serveur Next joint l'API par un réseau interne
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   REVALIDATE_SECRET=<même valeur que l'API>
   NEXT_PUBLIC_MEDIA_URL=              # seulement si les médias sont servis par un CDN distinct de l'API
   ```

3. `pnpm build && pnpm start` (les variables `NEXT_PUBLIC_*` sont lues au build), ou `pnpm dev`.

- Le site et l'API doivent partager le même site au sens des cookies (`localhost` en local, `COOKIE_DOMAIN` de l'API
  en production) : le back-office lit le cookie `mp_csrf` pour l'en-tête `X-CSRF-Token`.
- Revalidation : le worker de l'API envoie `POST {WEB_URL}/api/revalidate` (`Authorization: Bearer
REVALIDATE_SECRET`, `{ "tags": [...] }`, 100 étiquettes au plus) ; étiquettes de `src/lib/api/tags.ts`.
- Images de la médiathèque : variantes AVIF / WebP (480, 960, 1600) servies telles quelles par `<Visual>` ;
  `{NEXT_PUBLIC_API_URL}/v1/media/**` et `NEXT_PUBLIC_MEDIA_URL` sont dans `images.remotePatterns` et la CSP.

## Carte des zones (OpenStreetMap)

La carte des zones d'intervention (accueil, `/zones-d-intervention`, `/contact`, aperçu et saisie du back-office) utilise
Leaflet et les tuiles raster d'OpenStreetMap. Leaflet et sa feuille de styles sont chargés à la demande (jamais dans le
JavaScript initial du site), au repos ou à l'approche de la carte.

- Les tuiles `https://tile.openstreetmap.org` sont un service gratuit soumis à la
  [politique d'usage](https://operations.osmfoundation.org/policies/tiles/) : attribution « © contributeurs
  OpenStreetMap » toujours visible, aucun préchargement. Pour un trafic de production soutenu, configurer un
  fournisseur dédié : `NEXT_PUBLIC_MAP_TILES_URL` (gabarit `{z}/{x}/{y}`, sous-domaine `{s}` accepté) et
  `NEXT_PUBLIC_MAP_TILES_CREDIT` (mention du fournisseur). L'origine des tuiles est ajoutée à `img-src` des CSP
  (`src/lib/security/headers.ts`) ; variables lues au build.
- Données : `ZoneQuarter.coordinates`, `Zone.area` (GeoJSON) et `ServiceAreas.map` de `GET /v1/zones` ; agence placée
  avec `SiteSettings.agency.latitude/longitude`. Sans tuiles (réseau coupé), contours et repères restent affichés.
- Tests e2e : les tuiles sont servies vides par `e2e/fixtures.ts` (aucune requête vers OpenStreetMap en CI).

## Documentation

- `CLAUDE.md` — conventions, règles de fidélité aux maquettes, design system.
- `TASKS.md` — avancement page par page et écran par écran.
- `JOURNAL.md` — décisions, difficultés et solutions.
- `qa/reference/` — captures de référence des maquettes ; `qa/inventory/` — textes et valeurs relevés dans les maquettes.
