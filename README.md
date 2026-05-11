# Site VTT Cussy-en-Morvan

Site public de partage de balades VTT pour le village de Cussy-en-Morvan (Bourgogne).

- **Backend** : Strapi v5 (CMS headless) — `backend/`
- **Frontend** : Nuxt 3 + Tailwind + Leaflet — `frontend/`

Lecture libre pour tous les visiteurs. Contenu géré via le backoffice Strapi (mairie + contributeurs).

---

## Stack

| Couche | Techno | Hébergement |
|---|---|---|
| CMS | Strapi v5 (Node 20) | Railway |
| Base | PostgreSQL | Railway |
| Médias | Cloudinary | — |
| Front | Nuxt 3 (Vue 3, TS) | Vercel |
| Carte | Leaflet + OpenStreetMap | — |

---

## Architecture

```mermaid
graph TB
    User([Visiteur])

    subgraph Vercel["Vercel (Hobby)"]
        Nuxt["Nuxt 3 + Vue 3<br/>Tailwind + Leaflet<br/>SSR + cache Nitro"]
        Proxy["/api/geotrek/*<br/>/api/gpx/*"]
    end

    subgraph Railway["Railway"]
        Strapi["Strapi v5<br/>REST API"]
        Postgres[(PostgreSQL)]
    end

    Cloudinary["Cloudinary<br/>(médias)"]
    Geotrek["API Geotrek<br/>PNR Morvan<br/>(1604 POIs)"]
    IGN["IGN data.geopf.fr<br/>(tuiles carto)"]
    OSM["OpenStreetMap<br/>(tuiles)"]

    User -->|HTTPS| Nuxt
    Nuxt --> Proxy
    Nuxt -->|fetch CMS| Strapi
    Strapi --> Postgres
    Strapi -.->|upload| Cloudinary
    Nuxt -.->|images| Cloudinary
    Proxy -->|cache 1h| Geotrek
    User -->|tuiles directes| IGN
    User -->|tuiles directes| OSM

    classDef vercel fill:#000,color:#fff,stroke:#000
    classDef railway fill:#0b0d0e,color:#9ca3af,stroke:#374151
    classDef ext fill:#f0ebe2,color:#1a2e22,stroke:#2f4a3a
    class Nuxt,Proxy vercel
    class Strapi,Postgres railway
    class Cloudinary,Geotrek,IGN,OSM ext
```

---

## Démarrage local

### 1. Backend Strapi

```bash
cd backend
cp .env.example .env
# Optionnel : remplacer les secrets dans .env
npm install
npm run develop
```

L'admin Strapi s'ouvre sur <http://localhost:1337/admin>. Première exécution : créer le compte super admin.

Par défaut la base est en **SQLite** (`.tmp/data.db`). Pour passer à PostgreSQL, voir la section déploiement Railway.

#### Configuration des permissions

Dans **Settings → Users & Permissions Plugin → Roles → Public**, cocher `find` et `findOne` sur les 3 collections `chemin`, `balade`, `actualite`. Sinon le frontend obtiendra des 403.

Créer ensuite un rôle **Editeur** depuis **Settings → Administration Panel → Roles → Create new role** avec les droits create / read / update / publish (pas delete) sur les 3 collections.

### 2. Frontend Nuxt

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Accessible sur <http://localhost:3000>.

---

## Modèle de données

### Collection `chemin`
Tronçon GPX unitaire avec statut (`ouvert` / `deconseille` / `ferme`), distance, dénivelé, type de surface.

### Collection `balade`
Itinéraire composé d'un ou plusieurs `chemin` (relation many-to-many). Difficulté famille / intermédiaire / expert. Champ `slug` (UID auto-généré depuis le titre) utilisé comme paramètre d'URL `/balades/[slug]`.

### Collection `actualite`
News datées avec catégorie (info / conditions / nouveauté). Peut être liée à une balade.

Les schemas sont dans `backend/src/api/*/content-types/*/schema.json`.

---

## Déploiement

### Backend sur Railway

1. Créer un nouveau projet Railway, ajouter un service **PostgreSQL**.
2. Créer un second service depuis le dossier `backend/` (déploiement depuis le repo Git).
3. Variables d'environnement à définir :

   ```
   NODE_ENV=production
   APP_KEYS=<générer 4 clés aléatoires séparées par virgule>
   API_TOKEN_SALT=<aléatoire>
   ADMIN_JWT_SECRET=<aléatoire>
   TRANSFER_TOKEN_SALT=<aléatoire>
   JWT_SECRET=<aléatoire>

   DATABASE_CLIENT=postgres
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   DATABASE_SSL=true
   DATABASE_SSL_REJECT_UNAUTHORIZED=false

   CLOUDINARY_CLOUD_NAME=<…>
   CLOUDINARY_API_KEY=<…>
   CLOUDINARY_API_SECRET=<…>
   ```

4. Build command : `npm run build` — Start command : `npm run start`.
5. Une fois déployé, créer un **API Token** dans Strapi (Settings → API Tokens → Create new token, type *Read-only*) et copier la valeur.

### Frontend sur Vercel

1. Importer le repo, sélectionner le dossier `frontend/` comme **Root Directory**.
2. Framework Preset : Nuxt — Vercel détecte automatiquement.
3. Variables d'environnement :

   ```
   STRAPI_URL=https://<votre-app-strapi>.up.railway.app
   STRAPI_API_TOKEN=<token créé à l'étape précédente>
   NUXT_PUBLIC_STRAPI_URL=https://<votre-app-strapi>.up.railway.app
   ```

4. Déployer.

---

## Structure

```
.
├── backend/              # Strapi v5
│   ├── src/api/
│   │   ├── chemin/
│   │   ├── balade/
│   │   └── actualite/
│   ├── config/
│   └── package.json
└── frontend/             # Nuxt 3
    ├── components/
    ├── composables/
    ├── pages/
    ├── server/api/gpx/   # proxy GPX
    ├── types/
    └── nuxt.config.ts
```

---

## Notes

- Les fichiers GPX hébergés sur Strapi/Cloudinary sont servis via le proxy Nuxt `/api/gpx/[documentId]` afin d'éviter les soucis CORS et de bénéficier du cache Nitro (1h).
- Le composant `BaladeMap.vue` est rendu dans un `<ClientOnly>` car Leaflet manipule directement le DOM.
- Le rendu du Rich Text Strapi se fait via `v-html` — Strapi v5 expose un éditeur Markdown qui retourne du HTML.
