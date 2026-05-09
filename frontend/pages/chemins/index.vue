<script setup lang="ts">
import type { Chemin } from '~/types/chemin';

const { findMany } = useStrapi();

const { data: res } = await useAsyncData('chemins-list', () =>
  findMany<Chemin>('chemins', {
    sort: ['nom:asc'],
    pagination: { pageSize: 200 },
  }),
);

const chemins = computed(() => res.value?.data ?? []);

const surfaceLabel: Record<Chemin['type_surface'], string> = {
  foret: 'Forêt',
  piste: 'Piste',
  route: 'Route',
};
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="mb-2">État des chemins</h1>
    <p class="text-stone-600 mb-6">
      Consultez la liste des chemins VTT et leur statut actuel (ouvert, déconseillé, fermé).
    </p>

    <div v-if="chemins.length" class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="w-full text-sm">
        <thead class="bg-stone-100 text-stone-700">
          <tr>
            <th class="text-left px-4 py-2">Nom</th>
            <th class="text-left px-4 py-2">Statut</th>
            <th class="text-left px-4 py-2">Surface</th>
            <th class="text-right px-4 py-2">Distance</th>
            <th class="text-right px-4 py-2">D+</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in chemins" :key="c.id" class="border-t border-stone-200 hover:bg-stone-50">
            <td class="px-4 py-3">
              <div class="font-medium">{{ c.nom }}</div>
              <div class="text-xs text-stone-500">{{ c.description_courte }}</div>
            </td>
            <td class="px-4 py-3"><CheminBadge :statut="c.statut" /></td>
            <td class="px-4 py-3">{{ surfaceLabel[c.type_surface] }}</td>
            <td class="px-4 py-3 text-right">{{ c.distance_km }} km</td>
            <td class="px-4 py-3 text-right">{{ c.denivele_m }} m</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="text-stone-600">Aucun chemin enregistré pour le moment.</p>
  </div>
</template>
