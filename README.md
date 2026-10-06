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

## Documentation

- `CLAUDE.md` — conventions, règles de fidélité aux maquettes, design system.
- `TASKS.md` — avancement page par page et écran par écran.
- `JOURNAL.md` — décisions, difficultés et solutions.
- `qa/reference/` — captures de référence des maquettes ; `qa/inventory/` — textes et valeurs relevés dans les maquettes.
