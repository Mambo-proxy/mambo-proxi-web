# syntax=docker/dockerfile:1
#
# Image de production du site (serveur Next.js autonome, `output: 'standalone'`), déployée sur le VPS à côté de l'API
# (pile Docker Compose de mambo-proxi-api, `deploy/docker-compose.prod.yml`, service `web`).
# Les variables NEXT_PUBLIC_* sont figées au build : elles sont passées en arguments (`--build-arg`) par le workflow
# « Déploiement » (variables de dépôt GitHub). SITE_ENV aussi (robots.txt, noindex). Les autres (REVALIDATE_SECRET, API_INTERNAL_URL,
# MAINTENANCE_MODE) sont lues à l'exécution, depuis /opt/mambo/.env sur le serveur.

# Version de Node.js : celle de .nvmrc (24), figée au correctif.
ARG NODE_VERSION=24.13.0

FROM node:${NODE_VERSION}-trixie-slim AS base
ENV COREPACK_HOME=/usr/local/share/corepack \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    CI=true \
    NEXT_TELEMETRY_DISABLED=1
RUN npm install --global corepack@latest && corepack enable pnpm
WORKDIR /app

# ─── Dépendances ───
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ─── Build ───
FROM deps AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=
ARG NEXT_PUBLIC_MEDIA_URL=
ARG NEXT_PUBLIC_MAP_TILES_URL=
ARG NEXT_PUBLIC_MAP_TILES_CREDIT=
# Indexation (robots.txt et noindex des pages pré-générées) : figée au build. « production » ouvre l'indexation.
ARG SITE_ENV=preproduction
# Production : API réelle (jamais les mocks), appels directs (domaine commun, pas de relais).
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY} \
    NEXT_PUBLIC_MEDIA_URL=${NEXT_PUBLIC_MEDIA_URL} \
    NEXT_PUBLIC_MAP_TILES_URL=${NEXT_PUBLIC_MAP_TILES_URL} \
    NEXT_PUBLIC_MAP_TILES_CREDIT=${NEXT_PUBLIC_MAP_TILES_CREDIT} \
    SITE_ENV=${SITE_ENV} \
    NEXT_PUBLIC_API_MOCKING= \
    API_RELAY_TARGET= \
    NODE_ENV=production
COPY . .
RUN test -n "$NEXT_PUBLIC_API_URL" && test -n "$NEXT_PUBLIC_SITE_URL" && pnpm build

# ─── Image d'exécution ───
FROM node:${NODE_VERSION}-trixie-slim AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# Cache ISR et images optimisées (volume web-cache sur le serveur).
RUN mkdir -p .next/cache && chown -R node:node .next/cache

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
CMD ["node", "server.js"]
