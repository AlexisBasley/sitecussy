<script setup lang="ts">
import type { Balade } from '~/types/balade';

const route = useRoute();
const slug = route.params.slug as string;

const { findFirst, mediaUrl } = useStrapi();

const { data: balade } = await useAsyncData(`balade-${slug}`, () =>
  findFirst<Balade>('balades', {
    filters: { slug: { $eq: slug } },
    populate: {
      photo_mise_en_avant: true,
      chemins: { populate: ['fichier_gpx', 'photos'] },
    },
  }),
);

if (!balade.value) {
  throw createError({ statusCode: 404, statusMessage: 'Balade introuvable' });
}

const aGpx = computed(() => (balade.value?.chemins ?? []).some((c) => c.fichier_gpx?.url));

const difficulteLabel: Record<Balade['difficulte'], { label: string; cls: string }> = {
  famille: { label: 'Famille', cls: 'bg-green-100 text-green-800 border-green-300' },
  intermediaire: { label: 'Intermédiaire', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  expert: { label: 'Expert', cls: 'bg-red-100 text-red-800 border-red-300' },
};

useHead({
  title: () => `${balade.value?.titre ?? 'Balade'} — VTT Cussy-en-Morvan`,
});
</script>

<template>
  <article v-if="balade">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <NuxtLink to="/balades" class="text-sm">← Retour aux balades</NuxtLink>

      <!-- Photo mise en avant -->
      <div
        v-if="balade.photo_mise_en_avant"
        class="w-full aspect-[5/2] bg-stone-200 overflow-hidden rounded-lg mt-4"
      >
        <img
          :src="mediaUrl(balade.photo_mise_en_avant)"
          :alt="balade.photo_mise_en_avant.alternativeText || balade.titre"
          class="w-full h-full object-cover"
        />
      </div>
      <header class="mt-4 mb-6">
        <h1 class="mb-3">{{ balade.titre }}</h1>
        <div class="flex flex-wrap gap-2 text-sm">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full font-medium border"
            :class="difficulteLabel[balade.difficulte].cls"
          >
            {{ difficulteLabel[balade.difficulte].label }}
          </span>
          <span class="inline-flex items-center px-3 py-1 rounded-full bg-stone-100 text-stone-700">
            ⏱ {{ balade.duree_estimee }}
          </span>
          <span class="inline-flex items-center px-3 py-1 rounded-full bg-stone-100 text-stone-700">
            📍 {{ balade.point_depart }}
          </span>
        </div>
      </header>

      <!-- Description -->
      <section class="prose-strapi mb-8" v-html="balade.description" />

      <!-- Carte -->
      <section v-if="balade.chemins?.length" class="mb-8">
        <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2 class="!mb-0">Tracé</h2>
          <a
            v-if="aGpx"
            :href="`/api/balades/${balade.slug}/gpx`"
            :download="`${balade.slug}.gpx`"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foret text-white text-sm font-medium hover:bg-foret-dark transition no-underline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
              />
            </svg>
            Télécharger le GPX
          </a>
        </div>
        <ClientOnly>
          <BaladeMap :chemins="balade.chemins" :difficulte="balade.difficulte" />
          <template #fallback>
            <div
              class="w-full h-[500px] bg-stone-100 rounded-lg flex items-center justify-center text-stone-500"
            >
              Chargement de la carte...
            </div>
          </template>
        </ClientOnly>
      </section>

      <!-- Chemins composant la balade -->
      <section v-if="balade.chemins?.length" class="mb-8">
        <h2 class="mb-4">Chemins parcourus</h2>
        <ul class="space-y-3">
          <li
            v-for="chemin in balade.chemins"
            :key="chemin.id"
            class="bg-white border border-stone-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="!mb-0">{{ chemin.nom }}</h3>
                <CheminBadge :statut="chemin.statut" />
              </div>
              <p class="text-sm text-stone-600">{{ chemin.description_courte }}</p>
            </div>
            <div class="flex gap-4 text-sm text-stone-700 shrink-0">
              <span>📏 {{ chemin.distance_km }} km</span>
              <span>⛰ {{ chemin.denivele_m }} m D+</span>
            </div>
          </li>
        </ul>
      </section>

      <!-- Conseils -->
      <section v-if="balade.conseils" class="mb-8">
        <h2 class="mb-4">Conseils pratiques</h2>
        <p class="whitespace-pre-line text-stone-700">{{ balade.conseils }}</p>
      </section>
    </div>
  </article>
</template>
