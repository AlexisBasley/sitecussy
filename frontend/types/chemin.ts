import type { StrapiMedia } from './strapi';

export type TypeSurface = 'foret' | 'piste' | 'route';
export type StatutChemin = 'ouvert' | 'deconseille' | 'ferme';

export interface Chemin {
  id: number;
  documentId: string;
  nom: string;
  description_courte: string;
  fichier_gpx: StrapiMedia;
  distance_km: number;
  denivele_m: number;
  type_surface: TypeSurface;
  statut: StatutChemin;
  photos: StrapiMedia[];
  publishedAt: string | null;
}
