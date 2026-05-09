<script setup lang="ts">
import type { Actualite } from '~/types/actualite';
import type { Balade } from '~/types/balade';

const { findMany } = useStrapi();

// 3 dernières actualités publiées
const { data: actuRes } = await useAsyncData('home-actus', () =>
  findMany<Actualite>('actualites', {
    populate: ['image', 'balade'],
    sort: ['date:desc'],
    pagination: { pageSize: 3 },
  }),
);

// 6 balades en avant (dernières publiées)
const { data: baladesRes } = await useAsyncData('home-balades', () =>
  findMany<Balade>('balades', {
    populate: ['photo_mise_en_avant'],
    sort: ['publishedAt:desc'],
    pagination: { pageSize: 6 },
  }),
);

const actualites = computed(() => actuRes.value?.data ?? []);
const balades = computed(() => baladesRes.value?.data ?? []);
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-foret text-white">
      <div class="max-w-6xl mx-auto px-4 py-12 md:py-20 text-center">
        <h1 class="!text-white mb-4">Le VTT à Cussy-en-Morvan</h1>
        <p class="text-lg md:text-xl text-stone-100 max-w-2xl mx-auto">
          Découvrez les chemins, balades et conditions de pratique du VTT dans le Morvan, au cœur de
          la Bourgogne.
        </p>
        <div class="mt-6 flex gap-3 justify-center">
          <NuxtLink
            to="/balades"
            class="inline-block bg-white text-foret-dark px-5 py-2 rounded-md font-medium no-underline hover:bg-stone-100"
          >
            Voir les balades
          </NuxtLink>
          <NuxtLink
            to="/chemins"
            class="inline-block border border-white !text-white px-5 py-2 rounded-md font-medium no-underline hover:bg-foret-dark"
          >
            État des chemins
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Actualités -->
    <section v-if="actualites.length" class="max-w-6xl mx-auto px-4 py-10">
      <div class="flex items-baseline justify-between mb-6">
        <h2>Dernières actualités</h2>
        <NuxtLink to="/actualites" class="text-sm">Toutes les actus →</NuxtLink>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <ActualiteCard v-for="a in actualites" :key="a.id" :actualite="a" />
      </div>
    </section>

    <!-- Balades -->
    <section v-if="balades.length" class="max-w-6xl mx-auto px-4 py-10">
      <div class="flex items-baseline justify-between mb-6">
        <h2>Balades à découvrir</h2>
        <NuxtLink to="/balades" class="text-sm">Toutes les balades →</NuxtLink>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <BaladeCard v-for="b in balades" :key="b.id" :balade="b" />
      </div>
    </section>
  </div>
</template>
