import type { StrapiMedia } from './strapi';
import type { Chemin } from './chemin';
import type { Tag } from './tag';

export type Difficulte = 'famille' | 'intermediaire' | 'expert';
export type Locomotion = 'vtt' | 'marche' | 'cheval';
export type TypeParcours = 'boucle' | 'hameaux' | 'aller_retour' | 'libre';

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
  locomotion: Locomotion[] | null;
  type_parcours: TypeParcours | null;
  duree_minutes: number | null;
  tags: Tag[];
  publishedAt: string | null;
}
