<script setup lang="ts">
import type { Balade } from '~/types/balade';

const route = useRoute();
const slug = route.params.slug as string;

const { findFirst, mediaUrl } = useStrapi();
const { label: difficulteLabel, badge: difficulteBadge } = useDifficulte();
const { safe } = useSanitize();

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

// Totaux distance + dénivelé agrégés sur les chemins
const totaux = computed(() => {
  const chemins = balade.value?.chemins ?? [];
  return {
    distance: chemins.reduce((s, c) => s + (c.distance_km ?? 0), 0),
    denivele: chemins.reduce((s, c) => s + (c.denivele_m ?? 0), 0),
  };
});

useSeoMeta({
  title: () => `${balade.value?.titre ?? 'Balade'} — VTT Cussy-en-Morvan`,
  description: () =>
    balade.value?.description?.replace(/<[^>]*>/g, '').slice(0, 160) ??
    'Balade VTT à Cussy-en-Morvan',
});
</script>

<template>
  <article v-if="balade">
    <!-- Bannière photo -->
    <div
      v-if="balade.photo_mise_en_avant"
      class="relative w-full aspect-[5/2] md:aspect-[3/1] overflow-hidden bg-cream-dark"
    >
      <img
        :src="mediaUrl(balade.photo_mise_en_avant)"
        :alt="balade.photo_mise_en_avant.alternativeText || balade.titre"
        class="w-full h-full object-cover"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent"
      ></div>
    </div>

    <div class="container-page py-10 md:py-14 max-w-4xl">
      <!-- Retour -->
      <NuxtLink
        to="/balades"
        class="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-foret-dark transition-colors mb-6"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Toutes les balades
      </NuxtLink>

      <!-- En-tête -->
      <header class="mb-10">
        <span
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mb-4"
          :class="difficulteBadge(balade.difficulte)"
        >
          {{ difficulteLabel(balade.difficulte) }}
        </span>
        <h1 class="mb-6">{{ balade.titre }}</h1>

        <!-- Bandeau de stats -->
        <dl
          class="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-stone-200 text-center md:text-left"
        >
          <div v-if="totaux.distance > 0">
            <dt class="uppercase tracking-wider text-xs text-stone-500 mb-1">Distance</dt>
            <dd class="font-serif text-2xl text-ink">{{ totaux.distance.toFixed(1) }} km</dd>
          </div>
          <div v-if="totaux.denivele > 0">
            <dt class="uppercase tracking-wider text-xs text-stone-500 mb-1">Dénivelé</dt>
            <dd class="font-serif text-2xl text-ink">{{ Math.round(totaux.denivele) }} m D+</dd>
          </div>
          <div v-if="balade.duree_estimee">
            <dt class="uppercase tracking-wider text-xs text-stone-500 mb-1">Durée</dt>
            <dd class="font-serif text-2xl text-ink">{{ balade.duree_estimee }}</dd>
          </div>
          <div v-if="balade.point_depart">
            <dt class="uppercase tracking-wider text-xs text-stone-500 mb-1">Départ</dt>
            <dd class="font-serif text-lg text-ink leading-tight">{{ balade.point_depart }}</dd>
          </div>
        </dl>
      </header>

      <!-- Description (sanitis\u00e9 via useSanitize().safe) -->
      <section
        v-if="balade.description"
        class="prose-strapi mb-12 text-lg"
        v-html="safe(balade.description)"
      />

      <!-- Carte + GPX -->
      <section v-if="balade.chemins?.length" class="mb-12">
        <div class="flex items-end justify-between gap-3 mb-6 flex-wrap">
          <div>
            <p class="uppercase tracking-[0.2em] text-xs text-foret mb-2">Itinéraire</p>
            <h2 class="mb-0">Tracé sur la carte</h2>
          </div>
          <a
            v-if="aGpx"
            :href="`/api/balades/${balade.slug}/gpx`"
            :download="`${balade.slug}.gpx`"
            class="btn-primary"
          >
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            Télécharger le GPX
          </a>
        </div>
        <div class="relative isolate z-0 rounded-2xl overflow-hidden">
          <ClientOnly>
            <BaladeMap :chemins="balade.chemins" :difficulte="balade.difficulte" />
            <template #fallback>
              <div
                class="w-full h-[500px] bg-cream-dark flex items-center justify-center text-stone-500"
              >
                Chargement de la carte…
              </div>
            </template>
          </ClientOnly>
        </div>
      </section>

      <!-- Chemins parcourus -->
      <section v-if="balade.chemins?.length" class="mb-12">
        <p class="uppercase tracking-[0.2em] text-xs text-foret mb-2">Composition</p>
        <h2 class="mb-6">Chemins parcourus</h2>
        <ul class="space-y-3">
          <li
            v-for="chemin in balade.chemins"
            :key="chemin.id"
            class="bg-white border border-stone-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-foret-light transition-colors"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h3 class="mb-0 text-lg">{{ chemin.nom }}</h3>
                <CheminBadge :statut="chemin.statut" />
              </div>
              <p v-if="chemin.description_courte" class="text-sm text-stone-600">
                {{ chemin.description_courte }}
              </p>
            </div>
            <div class="flex gap-5 text-sm text-stone-700 shrink-0">
              <span class="inline-flex items-center gap-1.5">
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4" />
                </svg>
                {{ chemin.distance_km }} km
              </span>
              <span class="inline-flex items-center gap-1.5">
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 19l6-9 4 6 3-4 5 7H3z" />
                </svg>
                {{ chemin.denivele_m }} m D+
              </span>
            </div>
          </li>
        </ul>
      </section>

      <!-- Conseils -->
      <section
        v-if="balade.conseils"
        class="mb-12 bg-cream-dark border border-stone-200 rounded-2xl p-6 md:p-8"
      >
        <p class="uppercase tracking-[0.2em] text-xs text-foret mb-2">Avant de partir</p>
        <h2 class="mb-4">Conseils pratiques</h2>
        <p class="whitespace-pre-line text-stone-700 leading-relaxed">{{ balade.conseils }}</p>
      </section>

      <!-- Retour bas -->
      <div class="text-center pt-4">
        <NuxtLink to="/balades" class="btn-secondary">Voir toutes les balades</NuxtLink>
      </div>
    </div>
  </article>
</template>
