<script setup lang="ts">
import type { Balade, Difficulte } from '~/types/balade';

const { findMany } = useStrapi();

const filtre = ref<Difficulte | 'tous'>('tous');

const { data: res } = await useAsyncData(
  'balades-list',
  () =>
    findMany<Balade>('balades', {
      populate: ['photo_mise_en_avant'],
      filters: filtre.value === 'tous' ? undefined : { difficulte: { $eq: filtre.value } },
      sort: ['titre:asc'],
      pagination: { pageSize: 100 },
    }),
  { watch: [filtre] },
);

const balades = computed(() => res.value?.data ?? []);
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="mb-6">Toutes les balades</h1>

    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="opt in ['tous', 'famille', 'intermediaire', 'expert'] as const"
        :key="opt"
        type="button"
        class="px-3 py-1.5 rounded-full text-sm border transition"
        :class="
          filtre === opt
            ? 'bg-foret text-white border-foret'
            : 'bg-white text-stone-700 border-stone-300 hover:border-foret'
        "
        @click="filtre = opt"
      >
        {{
          opt === 'tous'
            ? 'Toutes'
            : opt === 'famille'
              ? 'Famille'
              : opt === 'intermediaire'
                ? 'Intermédiaire'
                : 'Expert'
        }}
      </button>
    </div>

    <p v-if="!balades.length" class="text-stone-600">Aucune balade pour ce filtre.</p>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <BaladeCard v-for="b in balades" :key="b.id" :balade="b" />
    </div>
  </div>
</template>
