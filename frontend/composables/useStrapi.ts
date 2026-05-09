/**
 * useStrapi — wrapper léger autour de l'API REST Strapi v5.
 *
 * Strapi v5 renvoie les attributs à plat (plus de `data.attributes`),
 * mais conserve `data` au niveau racine et `meta` pour la pagination.
 */
import type { StrapiCollectionResponse, StrapiResponse, StrapiMedia } from '~/types/strapi';

export interface StrapiQueryOptions {
  populate?: string | string[] | Record<string, unknown>;
  filters?: Record<string, unknown>;
  sort?: string | string[];
  pagination?: { page?: number; pageSize?: number; limit?: number; start?: number };
  fields?: string[];
  publicationState?: 'live' | 'preview';
  locale?: string;
}

/**
 * Sérialise les options en query string compatible Strapi (qs-like).
 * Ex: { filters: { statut: { $eq: 'ouvert' } } }
 *     -> filters[statut][$eq]=ouvert
 */
function buildQuery(opts: StrapiQueryOptions = {}): string {
  const params = new URLSearchParams();

  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v, i) => append(`${key}[${i}]`, v));
    } else if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        append(`${key}[${k}]`, v);
      }
    } else {
      params.append(key, String(value));
    }
  };

  if (opts.populate !== undefined) append('populate', opts.populate);
  if (opts.filters) append('filters', opts.filters);
  if (opts.sort) append('sort', opts.sort);
  if (opts.pagination) append('pagination', opts.pagination);
  if (opts.fields) append('fields', opts.fields);
  if (opts.publicationState) append('publicationState', opts.publicationState);
  if (opts.locale) append('locale', opts.locale);

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useStrapi() {
  const config = useRuntimeConfig();
  // Côté serveur : URL interne (Railway). Côté client : URL publique.
  const baseUrl = (import.meta.server ? config.strapiUrl : config.public.strapiUrl).replace(
    /\/$/,
    '',
  );

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (import.meta.server && config.strapiApiToken) {
    headers.Authorization = `Bearer ${config.strapiApiToken}`;
  }

  /** Fetch d'une collection (liste). */
  async function findMany<T>(
    resource: string,
    opts: StrapiQueryOptions = {},
  ): Promise<StrapiCollectionResponse<T>> {
    const url = `${baseUrl}/api/${resource}${buildQuery(opts)}`;
    return await $fetch<StrapiCollectionResponse<T>>(url, { headers });
  }

  /** Fetch d'un seul document par documentId ou par slug via filtre. */
  async function findOne<T>(
    resource: string,
    documentId: string,
    opts: StrapiQueryOptions = {},
  ): Promise<StrapiResponse<T>> {
    const url = `${baseUrl}/api/${resource}/${documentId}${buildQuery(opts)}`;
    return await $fetch<StrapiResponse<T>>(url, { headers });
  }

  /** Récupère le premier élément d'une collection filtrée — utile pour findBySlug. */
  async function findFirst<T>(resource: string, opts: StrapiQueryOptions = {}): Promise<T | null> {
    const res = await findMany<T>(resource, { ...opts, pagination: { pageSize: 1 } });
    return res.data[0] ?? null;
  }

  /** Construit une URL absolue pour un media Strapi (gère URL absolue ou relative). */
  function mediaUrl(media: StrapiMedia | null | undefined): string {
    if (!media?.url) return '';
    if (media.url.startsWith('http')) return media.url;
    return `${baseUrl}${media.url}`;
  }

  return {
    baseUrl,
    findMany,
    findOne,
    findFirst,
    mediaUrl,
    buildQuery,
  };
}
