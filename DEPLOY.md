# Déploiement — SiteCussy

Ce document décrit comment déployer **frontend** (Nuxt 3 SSR) et **backend** (Strapi v5) de façon cloud-agnostique. Les images Docker produites tournent indifféremment sur **GKE** (Kubernetes) ou **Cloud Run**.

## Architecture cible

- **Frontend** : image Docker Nuxt SSR, écoute sur `$PORT` (défaut 3000), stateless.
- **Backend** : image Docker Strapi v5, écoute sur `$PORT` (défaut 1337), connectée à Postgres managé (Cloud SQL) et Cloudinary pour les médias.
- **Base de données** : Postgres managé (Cloud SQL recommandé). Le filesystem des conteneurs est **éphémère** — toute persistance doit passer par la DB ou Cloudinary.
- **Médias** : Cloudinary (obligatoire en prod, sinon les uploads sont perdus à chaque redéploiement).

## Healthchecks

- Frontend : `GET /api/health` → `200 {ok:true, service:"frontend", uptime}`
- Backend : `GET /_health` (fourni nativement par Strapi) → `204`

Utiliser ces endpoints pour les readiness/liveness probes (K8s) ou les startup probes (Cloud Run).

## Build des images

Depuis la racine du repo :

```bash
# Frontend
docker build -t sitecussy-frontend:latest ./frontend

# Backend
docker build -t sitecussy-backend:latest ./backend
```

## Variables d'environnement

### Frontend (Nuxt)

| Variable | Requise | Description |
|---|---|---|
| `PORT` | non | Port d'écoute. Défaut `3000`. Cloud Run injecte `8080`. |
| `HOST` | non | Défaut `0.0.0.0`. |
| `NODE_ENV` | non | `production` (fixé dans l'image). |
| `NUXT_PUBLIC_STRAPI_URL` | **oui** | URL publique du backend Strapi (ex. `https://api.sitecussy.fr`). |
| `STRAPI_API_TOKEN` | **oui** | Token API Strapi (read-only public minimal). Utilisé côté serveur Nuxt uniquement. |

### Backend (Strapi v5)

| Variable | Requise | Description |
|---|---|---|
| `PORT` | non | Défaut `1337`. Cloud Run injecte `8080`. |
| `HOST` | non | Défaut `0.0.0.0`. |
| `NODE_ENV` | non | `production` (fixé dans l'image). |
| `APP_KEYS` | **oui** | Liste de clés séparées par `,` (générer avec `openssl rand -base64 32`). |
| `API_TOKEN_SALT` | **oui** | `openssl rand -base64 32` |
| `ADMIN_JWT_SECRET` | **oui** | `openssl rand -base64 32` |
| `JWT_SECRET` | **oui** | `openssl rand -base64 32` |
| `TRANSFER_TOKEN_SALT` | **oui** | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | **oui** | `openssl rand -base64 32` |
| `DATABASE_URL` | **oui** | URL complète Postgres (`postgres://user:pass@host:5432/db`). Alternative : variables séparées ci-dessous. |
| `DATABASE_CLIENT` | non | `postgres` (défaut si `DATABASE_URL` fournie). |
| `DATABASE_SSL` | non | `true` si la DB managée exige SSL. |
| `CLOUDINARY_CLOUD_NAME` | **oui** | Nom du compte Cloudinary. Si absent, l'upload retombe sur le filesystem (perdu au redéploiement). |
| `CLOUDINARY_API_KEY` | **oui** | |
| `CLOUDINARY_API_SECRET` | **oui** | |
| `STRAPI_ADMIN_BACKEND_URL` | recommandé | URL publique du backend, pour que l'admin se charge derrière un domaine custom. |

Pour Cloud SQL via socket Unix, voir la section dédiée plus bas.

## Déploiement Cloud Run

### Prérequis
- Artifact Registry : un dépôt Docker régional (ex. `europe-west1-docker.pkg.dev/PROJECT/sitecussy`).
- Cloud SQL Postgres provisionné.
- Secrets dans Secret Manager (un secret par variable sensible).

### Push d'image

```bash
PROJECT_ID=...
REGION=europe-west1
REGISTRY=$REGION-docker.pkg.dev/$PROJECT_ID/sitecussy

docker tag sitecussy-frontend:latest $REGISTRY/frontend:latest
docker tag sitecussy-backend:latest  $REGISTRY/backend:latest

docker push $REGISTRY/frontend:latest
docker push $REGISTRY/backend:latest
```

### Déploiement backend

```bash
gcloud run deploy sitecussy-backend \
  --image=$REGISTRY/backend:latest \
  --region=$REGION \
  --platform=managed \
  --port=1337 \
  --min-instances=1 \
  --max-instances=3 \
  --cpu=1 --memory=1Gi \
  --add-cloudsql-instances=$PROJECT_ID:$REGION:sitecussy-db \
  --set-env-vars=NODE_ENV=production \
  --set-secrets=APP_KEYS=app-keys:latest,\
API_TOKEN_SALT=api-token-salt:latest,\
ADMIN_JWT_SECRET=admin-jwt-secret:latest,\
JWT_SECRET=jwt-secret:latest,\
TRANSFER_TOKEN_SALT=transfer-token-salt:latest,\
ENCRYPTION_KEY=encryption-key:latest,\
DATABASE_URL=database-url:latest,\
CLOUDINARY_CLOUD_NAME=cloudinary-cloud-name:latest,\
CLOUDINARY_API_KEY=cloudinary-api-key:latest,\
CLOUDINARY_API_SECRET=cloudinary-api-secret:latest
```

> `--min-instances=1` évite les cold starts (Strapi met ~10s à démarrer). Ajuster selon le budget.

### Déploiement frontend

```bash
gcloud run deploy sitecussy-frontend \
  --image=$REGISTRY/frontend:latest \
  --region=$REGION \
  --platform=managed \
  --port=3000 \
  --min-instances=0 \
  --max-instances=5 \
  --cpu=1 --memory=512Mi \
  --allow-unauthenticated \
  --set-env-vars=NODE_ENV=production,NUXT_PUBLIC_STRAPI_URL=https://api.sitecussy.fr \
  --set-secrets=STRAPI_API_TOKEN=strapi-api-token:latest
```

## Déploiement GKE

Un cluster GKE Autopilot est le plus simple. Côté manifests, prévoir au minimum :

- `Deployment` frontend (replicas 2, readinessProbe sur `/api/health`).
- `Deployment` backend (replicas 1, readinessProbe sur `/_health`, ressources `requests.cpu=200m memory=512Mi`).
- `Service` ClusterIP pour chaque.
- `Ingress` (GCE) ou `Gateway API` avec certificat managé pour TLS.
- `Secret` Kubernetes pour les variables sensibles (ou External Secrets Operator branché sur Secret Manager).

Les manifests seront ajoutés sous `deploy/k8s/` quand le cluster cible sera défini.

## GitLab CI

Le pipeline doit :
1. Build images frontend et backend.
2. Push vers Artifact Registry (auth via Workload Identity Federation — pas de clé JSON).
3. Déclencher `gcloud run deploy` (Cloud Run) ou `kubectl apply` / `kubectl set image` (GKE).

Variables CI/CD GitLab requises :
- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`

Le fichier `.gitlab-ci.yml` sera ajouté quand la cible (GKE ou Cloud Run) sera arbitrée.

## Migration des données depuis Railway

```bash
# Dump depuis Railway
pg_dump "$RAILWAY_DATABASE_URL" --no-owner --no-acl -Fc -f sitecussy.dump

# Restore vers Cloud SQL (via proxy ou IP publique autorisée)
pg_restore --no-owner --no-acl -d "$CLOUDSQL_DATABASE_URL" sitecussy.dump
```

Les médias restent sur Cloudinary, rien à migrer côté images.

## Points de vigilance

- **Strapi v5** : la première montée d'une nouvelle image lance les migrations automatiquement. Prévoir une fenêtre de maintenance ou des migrations idempotentes.
- **Cloudinary obligatoire** : sans les 3 variables `CLOUDINARY_*`, Strapi écrit dans `public/uploads` (perdu à chaque redéploiement).
- **Token API Strapi** : créer un token **read-only** scopé aux content-types publics. Ne jamais committer.
- **SIGTERM** : le backend utilise `dumb-init` pour propager le signal, Strapi a ~10s pour fermer proprement. Configurer `terminationGracePeriodSeconds: 30` côté K8s.
