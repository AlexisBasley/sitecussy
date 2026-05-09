/**
 * Proxy vers l'API Geotrek du PNR Morvan pour les types de POI.
 * Sert de légende et de filtres sur la page /patrimoine.
 */

const GEOTREK_BASE = 'https://geotrek.parcdumorvan.org/api/v2';

interface GeotrekPoiType {
  id: number;
  label: { fr: string | null; en: string | null };
  pictogram: string | null;
}

interface GeotrekResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default defineCachedEventHandler(
  async () => {
    const url = `${GEOTREK_BASE}/poi_type/?format=json&page_size=100&fields=id,label,pictogram`;
    const data = await $fetch<GeotrekResponse<GeotrekPoiType>>(url);
    return data;
  },
  {
    maxAge: 60 * 60 * 24, // 24h, ces types ne bougent quasi jamais
    name: 'geotrek-poi-types',
    getKey: () => 'all',
  },
);
