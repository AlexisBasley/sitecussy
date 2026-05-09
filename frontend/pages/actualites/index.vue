<script setup lang="ts">
import type { Actualite } from '~/types/actualite';

const { findMany } = useStrapi();

const { data: res } = await useAsyncData('actus-list', () =>
  findMany<Actualite>('actualites', {
    populate: ['image', 'balade'],
    sort: ['date:desc'],
    pagination: { pageSize: 50 },
  }),
);

const actualites = computed(() => res.value?.data ?? []);
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="mb-6">Actualités</h1>
    <div v-if="actualites.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <ActualiteCard v-for="a in actualites" :key="a.id" :actualite="a" />
    </div>
    <p v-else class="text-stone-600">Aucune actualité pour le moment.</p>
  </div>
</template>
