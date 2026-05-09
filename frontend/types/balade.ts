import type { StrapiMedia } from './strapi';
import type { Chemin } from './chemin';

export type Difficulte = 'famille' | 'intermediaire' | 'expert';

export interface Balade {
  id: number;
  documentId: string;
  titre: string;
  slug: string;
  description: string;
  difficulte: Difficulte;
  duree_estimee: string;
  point_depart: string;
  conseils: string;
  photo_mise_en_avant: StrapiMedia;
  chemins: Chemin[];
  publishedAt: string | null;
}
