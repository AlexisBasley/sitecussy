# syntax=docker/dockerfile:1.7

# ============================================================
# Stage 1 : build
# Installe toutes les d\u00e9pendances et compile Nuxt en mode SSR Node.
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# D\u00e9pendances syst\u00e8me pour les bindings natifs (au cas o\u00f9 : sharp, etc.)
RUN apk add --no-cache libc6-compat

# Copie d'abord les manifests pour b\u00e9n\u00e9ficier du cache Docker tant que les deps
# ne changent pas.
COPY package.json package-lock.json ./
RUN npm ci

# Copie du code source et build
COPY . .
RUN npm run build

# ============================================================
# Stage 2 : runtime
# Image minimale qui n'embarque que .output (build artifact Nuxt).
# Aucun node_modules de d\u00e9veloppement, aucun code source.
# ============================================================
FROM node:22-alpine AS runtime

WORKDIR /app

# User non-root (s\u00e9curit\u00e9 K8s + Cloud Run)
RUN addgroup -S nuxt && adduser -S nuxt -G nuxt

# Copie uniquement le build Nitro
COPY --from=builder --chown=nuxt:nuxt /app/.output ./.output

USER nuxt

# Le port est inject\u00e9 par l'orchestrateur (Cloud Run = 8080, K8s = au choix).
# Nuxt/Nitro lit PORT et HOST automatiquement.
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
