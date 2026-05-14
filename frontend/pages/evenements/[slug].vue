<script setup lang="ts">
import type { Evenement } from '~/types/evenement';

const route = useRoute();
const slug = route.params.slug as string;

const { findFirst, mediaUrl } = useStrapi();
const { safe } = useSanitize();

const { data: evenement } = await useAsyncData(`evenement-${slug}`, () =>
  findFirst<Evenement>('evenements', {
    filters: { slug: { $eq: slug } },
    populate: [
      'image_couverture',
      'flyer',
      'balade',
      'balade.photo_mise_en_avant',
      'balade.chemins',
      'balade.chemins.fichier_gpx',
      'balade.tags',
    ],
  }),
);

if (!evenement.value) {
  throw createError({ statusCode: 404, statusMessage: 'Événement introuvable', fatal: true });
}

const e = evenement.value;

useSeoMeta({
  title: `${e.titre} — Cussy-en-Morvan`,
  description: e.contenu.replace(/<[^>]+>/g, '').slice(0, 160),
});

const dateLong = computed(() => {
  const d = new Date(e.date_debut);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

const heureDebut = computed(() => {
  const d = new Date(e.date_debut);
  const h = d.getHours();
  const m = d.getMinutes();
  if (h === 0 && m === 0) return null;
  return `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}`;
});

const flyerIsImage = computed(() => e.flyer?.mime?.startsWith('image/') ?? false);

const cover = computed(() => e.image_couverture ?? e.balade?.photo_mise_en_avant ?? null);
</script>

<template>
  <div>
    <!-- Bannière -->
    <section v-if="cover" class="relative h-[40vh] md:h-[55vh] overflow-hidden">
      <img :src="mediaUrl(cover)" :alt="e.titre" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent"></div>
      <div class="absolute inset-x-0 bottom-0 container-page pb-10">
        <NuxtLink
          to="/evenements"
          class="inline-flex items-center gap-2 text-cream/90 hover:text-cream text-sm mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tous les événements
        </NuxtLink>
        <p class="uppercase tracking-[0.2em] text-xs text-cream/80 mb-2">{{ dateLong }}</p>
        <h1 class="text-cream m-0">{{ e.titre }}</h1>
        <p v-if="e.lieu" class="text-cream/90 mt-2">{{ e.lieu }}</p>
      </div>
    </section>
    <section v-else class="bg-cream-dark border-b border-stone-200">
      <div class="container-page py-12 max-w-3xl">
        <NuxtLink
          to="/evenements"
          class="inline-flex items-center gap-2 text-foret hover:underline text-sm mb-4"
        >
          ← Tous les événements
        </NuxtLink>
        <p class="uppercase tracking-[0.2em] text-xs text-foret mb-2">{{ dateLong }}</p>
        <h1>{{ e.titre }}</h1>
        <p v-if="e.lieu" class="text-stone-700 mt-2">{{ e.lieu }}</p>
      </div>
    </section>

    <!-- Infos clés -->
    <section v-if="heureDebut || e.balade" class="border-b border-stone-200">
      <div class="container-page py-6 flex flex-wrap gap-x-10 gap-y-3 text-sm">
        <div v-if="heureDebut">
          <span class="text-stone-500">Heure </span>
          <strong class="font-serif text-lg">{{ heureDebut }}</strong>
        </div>
        <div v-if="e.balade">
          <span class="text-stone-500">Rando </span>
          <NuxtLink
            :to="`/balades/${e.balade.slug}`"
            class="font-serif text-lg text-foret hover:underline"
          >
            {{ e.balade.titre }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Contenu + flyer -->
    <section class="container-page py-12 grid gap-10 lg:grid-cols-[1fr_320px]">
      <article class="prose-strapi" v-html="safe(e.contenu)" />

      <aside v-if="e.flyer" class="space-y-3">
        <h3 class="text-base font-semibold m-0">Flyer</h3>
        <a
          :href="mediaUrl(e.flyer)"
          target="_blank"
          rel="noopener noreferrer"
          class="block rounded-lg overflow-hidden border border-stone-200 hover:border-foret transition-colors"
        >
          <img
            v-if="flyerIsImage"
            :src="mediaUrl(e.flyer)"
            :alt="`Flyer ${e.titre}`"
            class="w-full h-auto"
          />
          <div v-else class="p-6 text-center">
            <p class="text-sm text-stone-600 mb-2">{{ e.flyer.name }}</p>
            <span class="btn btn-secondary">Télécharger le flyer</span>
          </div>
        </a>
      </aside>
    </section>

    <!-- Carte si rando liée -->
    <section v-if="e.balade?.chemins?.length" class="container-page pb-16">
      <h2 class="mb-6">Le parcours</h2>
      <ClientOnly>
        <BaladeMap :chemins="e.balade.chemins" :difficulte="e.balade.difficulte" />
        <template #fallback>
          <div
            class="h-[500px] rounded-lg bg-stone-100 flex items-center justify-center text-stone-600"
          >
            Chargement de la carte...
          </div>
        </template>
      </ClientOnly>
    </section>
  </div>
</template>
