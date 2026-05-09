<script setup lang="ts">
import type { StatutChemin } from '~/types/chemin';

const props = defineProps<{ statut: StatutChemin }>();

const config = computed(() => {
  switch (props.statut) {
    case 'ouvert':
      return { label: 'Ouvert', cls: 'bg-green-100 text-green-800 border-green-300' };
    case 'deconseille':
      return { label: 'Déconseillé', cls: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'ferme':
      return { label: 'Fermé', cls: 'bg-red-100 text-red-800 border-red-300' };
    default:
      return { label: 'Inconnu', cls: 'bg-gray-100 text-gray-800 border-gray-300' };
  }
});
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
    :class="config.cls"
  >
    {{ config.label }}
  </span>
</template>
