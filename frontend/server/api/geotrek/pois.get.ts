/**
 * Proxy vers l'API Geotrek du PNR Morvan pour les POIs.
 * Permet de filtrer par bbox (ex: pour afficher les POIs proches d'une balade)
 * ou de tout récupérer (page patrimoine).
 *
 * Query params :
 *   - bbox : "minLng,minLat,maxLng,maxLat" (optionnel)
 *   - types : "1,2,3" (ids séparés par des virgules, optionnel)
 *   - page_size : nombre par page (défaut 50, max 500)
 *   - page : page courante (défaut 1)
 */

const GEOTREK_BASE = 'https://geotrek.parcdumorvan.org/api/v2';

interface GeotrekPoi {
  id: number;
  name: { fr: string | null; en: string | null };
  description: { fr: string | null; en: string | null };
  geometry: { type: 'Point'; coordinates: [number, number, number?] };
  type: number;
  type_label: { fr: string | null; en: string | null };
  type_pictogram: string | null;
  attachments: Array<{ url: string; thumbnail?: string }>;
}

interface GeotrekResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const params = new URLSearchParams({
      format: 'json',
      page_size: String(Math.min(Number(query.page_size) || 50, 500)),
      page: String(Number(query.page) || 1),
      fields: 'id,name,description,geometry,type,type_label,type_pictogram,attachments',
    });
    if (query.bbox) params.set('in_bbox', String(query.bbox));
    if (query.types) params.set('types', String(query.types));

    const url = `${GEOTREK_BASE}/poi/?${params.toString()}`;
    const data = await $fetch<GeotrekResponse<GeotrekPoi>>(url);
    return data;
  },
  {
    maxAge: 60 * 60, // 1h de cache (les POIs ne bougent presque jamais)
    name: 'geotrek-pois',
    getKey: (event) => {
      const q = getQuery(event);
      return `${q.bbox ?? 'all'}-${q.types ?? 'all'}-${q.page ?? 1}-${q.page_size ?? 50}`;
    },
  },
);
