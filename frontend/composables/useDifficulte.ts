import type { Difficulte } from '~/types/balade';

interface DifficulteMeta {
  label: string;
  description: string;
  /** Classes pour un badge sur fond clair */
  badge: string;
  /** Classes pour un badge sur photo (avec backdrop-blur) */
  badgeOverlay: string;
}

const META: Record<Difficulte, DifficulteMeta> = {
  famille: {
    label: 'Famille',
    description: 'Boucles courtes, pentes douces, idéales pour découvrir le Morvan en famille.',
    badge: 'bg-foret-light/20 text-foret-dark border-foret-light/40',
    badgeOverlay: 'bg-cream/85 text-foret-dark',
  },
  intermediaire: {
    label: 'Intermédiaire',
    description: 'Des boucles plus longues avec un peu de dénivelé pour les habitués.',
    badge: 'bg-morvan-light/30 text-morvan border-morvan-light/50',
    badgeOverlay: 'bg-cream/85 text-morvan',
  },
  expert: {
    label: 'Expert',
    description: 'Les itinéraires les plus engagés : longueur, dénivelé, technique.',
    badge: 'bg-ink/10 text-ink border-ink/20',
    badgeOverlay: 'bg-cream/85 text-ink',
  },
};

export const DIFFICULTES: Difficulte[] = ['famille', 'intermediaire', 'expert'];

export function useDifficulte() {
  return {
    meta: (d: Difficulte) => META[d],
    label: (d: Difficulte) => META[d].label,
    badge: (d: Difficulte) => META[d].badge,
    badgeOverlay: (d: Difficulte) => META[d].badgeOverlay,
    description: (d: Difficulte) => META[d].description,
    all: DIFFICULTES,
  };
}
