<script setup lang="ts">
import type { Evenement } from '~/types/evenement';

useSeoMeta({
  title: 'Événements — Cussy-en-Morvan',
  description:
    "Toutes les manifestations, randonnées organisées et rendez-vous de l'association à Cussy-en-Morvan.",
});

const { findMany } = useStrapi();

const { data: res, error } = await useAsyncData('evenements-list', () =>
  findMany<Evenement>('evenements', {
    populate: ['image_couverture', 'flyer', 'balade', 'balade.photo_mise_en_avant'],
    sort: ['date_debut:desc'],
    pagination: { pageSize: 50 },
  }),
);

const evenements = computed(() => res.value?.data ?? []);

const now = new Date();
const upcoming = computed(() => evenements.value.filter((e) => new Date(e.date_debut) >= now));
const past = computed(() => evenements.value.filter((e) => new Date(e.date_debut) < now));
</script>

<template>
  <div>
    <section class="bg-cream-dark border-b border-stone-200">
      <div class="container-page py-12 md:py-16 max-w-3xl">
        <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">Vie locale</p>
        <h1 class="mb-4">Événements à venir et déjà passés.</h1>
        <p class="text-stone-700 leading-relaxed">
          Randonnées organisées, manifestations, temps forts de l'association : tout ce qui se passe
          à Cussy-en-Morvan.
        </p>
      </div>
    </section>

    <section class="container-page py-12">
      <div
        v-if="error"
        class="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        Les \u00e9v\u00e9nements n'ont pas pu \u00eatre charg\u00e9s. R\u00e9essayez plus tard.
      </div>

      <template v-if="upcoming.length">
        <h2 class="mb-6">À venir</h2>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          <EvenementCard v-for="e in upcoming" :key="e.id" :evenement="e" />
        </div>
      </template>

      <template v-if="past.length">
        <h2 class="mb-6">Précédents</h2>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-90">
          <EvenementCard v-for="e in past" :key="e.id" :evenement="e" />
        </div>
      </template>

      <p v-if="!evenements.length" class="text-stone-600">Aucun événement publié pour le moment.</p>
    </section>
  </div>
</template>
