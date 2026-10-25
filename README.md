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
