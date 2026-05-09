import type { StrapiMedia } from './strapi';
import type { Balade } from './balade';

export type CategorieActu = 'info' | 'conditions' | 'nouveaute';

export interface Actualite {
  id: number;
  documentId: string;
  titre: string;
  contenu: string;
  date: string;
  categorie: CategorieActu;
  image: StrapiMedia | null;
  balade: Balade | null;
  publishedAt: string | null;
}
