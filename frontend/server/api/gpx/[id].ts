/**
 * Proxy GPX — sert un fichier .gpx hébergé sur Strapi/Cloudinary
 * via le domaine Nuxt (évite CORS et cache côté Nitro).
 *
 * Le paramètre `id` est le `documentId` du chemin (Strapi v5).
 */
import type { Chemin } from '~/types/chemin';

export default defineEventHandler(async (event) => {
  const documentId = getRouterParam(event, 'id');
  if (!documentId) {
    throw createError({ statusCode: 400, statusMessage: 'documentId manquant' });
  }

  const config = useRuntimeConfig();
  const strapiUrl = config.strapiUrl.replace(/\/$/, '');
  const headers: Record<string, string> = {};
  if (config.strapiApiToken) {
    headers.Authorization = `Bearer ${config.strapiApiToken}`;
  }

  // 1. Récupérer le chemin pour obtenir l'URL du fichier GPX
  const res = await $fetch<{ data: Chemin }>(
    `${strapiUrl}/api/chemins/${documentId}?populate=fichier_gpx`,
    { headers },
  );

  const gpxMedia = res.data?.fichier_gpx;
  if (!gpxMedia?.url) {
    throw createError({ statusCode: 404, statusMessage: 'Fichier GPX introuvable' });
  }

  const gpxUrl = gpxMedia.url.startsWith('http') ? gpxMedia.url : `${strapiUrl}${gpxMedia.url}`;

  // 2. Récupérer le contenu GPX brut
  const xml = await $fetch<string>(gpxUrl, { responseType: 'text' });

  setHeader(event, 'Content-Type', 'application/gpx+xml; charset=utf-8');
  setHeader(event, 'Cache-Control', 'public, max-age=3600');
  return xml;
});
