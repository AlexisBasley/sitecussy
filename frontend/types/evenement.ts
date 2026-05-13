import type { StrapiMedia } from './strapi';
import type { Balade } from './balade';

export interface Evenement {
  id: number;
  documentId: string;
  titre: string;
  slug: string;
  date_debut: string;
  date_fin: string | null;
  contenu: string;
  image_couverture: StrapiMedia | null;
  flyer: StrapiMedia | null;
  lieu: string | null;
  balade: Balade | null;
  publishedAt: string | null;
}
