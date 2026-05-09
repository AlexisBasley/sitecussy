<script setup lang="ts">
import type { Balade, Difficulte } from '~/types/balade';

const route = useRoute();
const router = useRouter();
const { findMany } = useStrapi();

type Filtre = Difficulte | 'tous';
const options: { value: Filtre; label: string }[] = [
  { value: 'tous', label: 'Toutes' },
  { value: 'famille', label: 'Famille' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'expert', label: 'Expert' },
];

const initial = (route.query.difficulte as Filtre) || 'tous';
const filtre = ref<Filtre>(options.some((o) => o.value === initial) ? initial : 'tous');

watch(filtre, (v) => {
  router.replace({ query: v === 'tous' ? {} : { difficulte: v } });
});

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

useSeoMeta({
  title: 'Toutes les balades VTT — Cussy-en-Morvan',
  description:
    'Explorez les balades VTT autour de Cussy-en-Morvan : famille, intermédiaire ou expert. Trace GPX téléchargeable.',
});
</script>

<template>
  <div class="container-page section">
    <div class="max-w-2xl mb-10">
      <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">Itinéraires</p>
      <h1 class="mb-4">Toutes les balades</h1>
      <p class="text-stone-600 text-lg">
        Filtrez par niveau pour trouver le parcours qui vous correspond.
      </p>
    </div>

    <div class="flex flex-wrap gap-2 mb-10">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="px-4 py-2 rounded-full text-sm border transition-colors"
        :class="
          filtre === opt.value
            ? 'bg-ink text-cream border-ink'
            : 'bg-cream text-ink border-ink/15 hover:border-foret hover:text-foret'
        "
        @click="filtre = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <p v-if="!balades.length" class="text-stone-600">Aucune balade pour ce filtre.</p>

    <div v-else class="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      <BaladeCard v-for="b in balades" :key="b.id" :balade="b" />
    </div>
  </div>
</template>
