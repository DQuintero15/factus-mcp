# syntax=docker/dockerfile:1
# Imagen multi-stage para el monorepo Factus MCP (pnpm + Turborepo).
# Targets: "api" (NestJS MCP) y "web" (Astro panel).

# ---------------------------------------------------------------------------
FROM node:20-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

# ---------------------------------------------------------------------------
# Instala dependencias de todo el workspace (cacheable).
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc turbo.json tsconfig.base.json ./
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY packages/factus-sdk/package.json packages/factus-sdk/
COPY packages/core/package.json packages/core/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile=false

# ---------------------------------------------------------------------------
# Copia el codigo y construye todos los paquetes.
FROM deps AS build
COPY . .
# DATABASE_URL dummy: prisma generate no requiere DB real.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN pnpm build

# ---------------------------------------------------------------------------
# Runtime API (NestJS MCP). Aplica migraciones y arranca.
FROM base AS api
ENV NODE_ENV=production
COPY --from=build /app /app
WORKDIR /app
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @factus-mcp/db migrate && node apps/api/dist/main.js"]

# ---------------------------------------------------------------------------
# Runtime Web (Astro panel).
FROM base AS web
ENV NODE_ENV=production
COPY --from=build /app /app
WORKDIR /app
EXPOSE 4321
CMD ["node", "apps/web/dist/server/entry.mjs"]
