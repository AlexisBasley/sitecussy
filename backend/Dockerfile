# syntax=docker/dockerfile:1.7

# ============================================================
# Stage 1 : build de l'admin Strapi
# Installe toutes les d\u00e9pendances (y compris devDeps n\u00e9cessaires au build admin)
# et compile l'admin React.
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Toolchain pour les bindings natifs (better-sqlite3, sharp, pg natif).
# build-base et python3 sont requis pour la compilation de modules natifs sur
# Alpine ; ils n'embarquent rien dans l'image runtime.
RUN apk add --no-cache libc6-compat build-base python3 vips-dev

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Apr\u00e8s le build, on rejoue un install --omit=dev pour avoir un node_modules
# minimal r\u00e9utilisable en runtime.
RUN npm prune --omit=dev

# ============================================================
# Stage 2 : runtime
# ============================================================
FROM node:22-alpine AS runtime

WORKDIR /app

# vips + vips-cpp sont requis par sharp \u00e0 l'ex\u00e9cution. Le binaire natif sharp
# compil\u00e9 dans le builder est li\u00e9 dynamiquement \u00e0 libvips-cpp.so.42.
RUN apk add --no-cache vips vips-cpp dumb-init

# User non-root
RUN addgroup -S strapi && adduser -S strapi -G strapi

# On copie depuis le builder : code + node_modules de production + build admin.
COPY --from=builder --chown=strapi:strapi /app/package.json ./package.json
COPY --from=builder --chown=strapi:strapi /app/package-lock.json ./package-lock.json
COPY --from=builder --chown=strapi:strapi /app/node_modules ./node_modules
COPY --from=builder --chown=strapi:strapi /app/dist ./dist
COPY --from=builder --chown=strapi:strapi /app/config ./config
COPY --from=builder --chown=strapi:strapi /app/database ./database
COPY --from=builder --chown=strapi:strapi /app/public ./public
COPY --from=builder --chown=strapi:strapi /app/src ./src
COPY --from=builder --chown=strapi:strapi /app/types ./types
COPY --from=builder --chown=strapi:strapi /app/tsconfig.json ./tsconfig.json

USER strapi

ENV HOST=0.0.0.0
ENV PORT=1337
ENV NODE_ENV=production
EXPOSE 1337

# dumb-init pour propager correctement SIGTERM (graceful shutdown K8s/Cloud Run).
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "node_modules/@strapi/strapi/bin/strapi.js", "start"]
