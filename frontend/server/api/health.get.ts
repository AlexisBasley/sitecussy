/**
 * Endpoint de healthcheck pour orchestrateurs (Kubernetes liveness/readiness,
 * Cloud Run startup probe). Renvoie 200 OK si le process Nuxt r\u00e9pond.
 *
 * Ne v\u00e9rifie volontairement pas Strapi : un d\u00e9faut de Strapi ne doit pas
 * tuer le pod Nuxt (le frontend doit pouvoir servir des pages d'erreur).
 */
export default defineEventHandler(() => ({
  ok: true,
  service: 'nuxt',
  uptime: process.uptime(),
}));
