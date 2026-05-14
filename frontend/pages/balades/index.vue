<script setup lang="ts">
import type { Balade, Difficulte, Locomotion, TypeParcours } from '~/types/balade';

const route = useRoute();
const router = useRouter();
const { findMany } = useStrapi();
const { label, all: difficultes } = useDifficulte();

const { data: res, error } = await useAsyncData('balades-list', () =>
  findMany<Balade>('balades', {
    populate: ['photo_mise_en_avant', 'tags'],
    sort: ['titre:asc'],
    pagination: { pageSize: 200 },
  }),
);

const allBalades = computed(() => res.value?.data ?? []);

// Garde-fou : si on d\u00e9passe la pageSize, des balades sont silencieusement absentes.
// TODO: paginer pour de vrai si total > 200.
if (import.meta.dev) {
  watchEffect(() => {
    const total = res.value?.meta?.pagination?.total ?? 0;
    if (total > 200) {
      console.warn(
        `[balades] ${total} balades en base mais seules 200 sont affich\u00e9es. Paginer.`,
      );
    }
  });
}

// === Filtres ===
const locomotions: { value: Locomotion; label: string; icon: string }[] = [
  { value: 'vtt', label: 'VTT', icon: '🚵' },
  { value: 'marche', label: 'Marche', icon: '🚶' },
  { value: 'cheval', label: 'Cheval', icon: '🐎' },
];
const typesParcours: { value: TypeParcours; label: string }[] = [
  { value: 'boucle', label: 'Boucle' },
  { value: 'hameaux', label: 'De hameaux en hameaux' },
  { value: 'aller_retour', label: 'Aller-retour' },
  { value: 'libre', label: 'Libre' },
];
const dureeBuckets = [
  { value: 'short', label: '< 1h', min: 0, max: 60 },
  { value: 'medium', label: '1–2h', min: 60, max: 120 },
  { value: 'long', label: '2–4h', min: 120, max: 240 },
  { value: 'xlong', label: '> 4h', min: 240, max: Infinity },
];

const filtreDifficulte = ref<Difficulte | ''>((route.query.difficulte as Difficulte) || '');
const filtreLocomotion = ref<Locomotion | ''>((route.query.locomotion as Locomotion) || '');
const filtreType = ref<TypeParcours | ''>((route.query.type as TypeParcours) || '');
const filtreDuree = ref<string>((route.query.duree as string) || '');

// Sync URL
watch([filtreDifficulte, filtreLocomotion, filtreType, filtreDuree], () => {
  const q: Record<string, string> = {};
  if (filtreDifficulte.value) q.difficulte = filtreDifficulte.value;
  if (filtreLocomotion.value) q.locomotion = filtreLocomotion.value;
  if (filtreType.value) q.type = filtreType.value;
  if (filtreDuree.value) q.duree = filtreDuree.value;
  router.replace({ query: q });
});

const balades = computed(() =>
  allBalades.value.filter((b) => {
    if (filtreDifficulte.value && b.difficulte !== filtreDifficulte.value) return false;
    if (filtreLocomotion.value && !(b.locomotion ?? []).includes(filtreLocomotion.value))
      return false;
    if (filtreType.value && b.type_parcours !== filtreType.value) return false;
    if (filtreDuree.value) {
      const bucket = dureeBuckets.find((d) => d.value === filtreDuree.value);
      if (!bucket) return true;
      const d = b.duree_minutes ?? 0;
      if (d < bucket.min || d >= bucket.max) return false;
    }
    return true;
  }),
);

const hasFilter = computed(
  () =>
    !!filtreDifficulte.value ||
    !!filtreLocomotion.value ||
    !!filtreType.value ||
    !!filtreDuree.value,
);

function reset() {
  filtreDifficulte.value = '';
  filtreLocomotion.value = '';
  filtreType.value = '';
  filtreDuree.value = '';
}

useSeoMeta({
  title: 'Toutes les randos — Cussy-en-Morvan',
  description:
    'Explorez les randonnées autour de Cussy-en-Morvan : VTT, marche, à cheval. Filtrez par difficulté, durée et type de parcours.',
});
</script>

<template>
  <div class="container-page section">
    <div class="max-w-2xl mb-10">
      <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">Itinéraires</p>
      <h1 class="mb-4">Toutes les randos</h1>
      <p class="text-stone-600 text-lg">
        VTT, marche ou cheval — filtrez par locomotion, difficulté, durée ou type de parcours.
      </p>
    </div>

    <!-- Filtres -->
    <div class="space-y-4 mb-10">
      <!-- Locomotion -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs uppercase tracking-wider text-stone-500 mr-2">Locomotion</span>
        <button
          type="button"
          class="px-3 py-1.5 rounded-full text-sm border transition-colors"
          :class="
            filtreLocomotion === ''
              ? 'bg-ink text-cream border-ink'
              : 'bg-cream text-ink border-ink/15 hover:border-foret'
          "
          @click="filtreLocomotion = ''"
        >
          Toutes
        </button>
        <button
          v-for="l in locomotions"
          :key="l.value"
          type="button"
          class="px-3 py-1.5 rounded-full text-sm border transition-colors flex items-center gap-1.5"
          :class="
            filtreLocomotion === l.value
              ? 'bg-ink text-cream border-ink'
              : 'bg-cream text-ink border-ink/15 hover:border-foret'
          "
          @click="filtreLocomotion = l.value"
        >
          <span>{{ l.icon }}</span>
          {{ l.label }}
        </button>
      </div>

      <!-- Difficulté -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs uppercase tracking-wider text-stone-500 mr-2">Difficulté</span>
        <button
          type="button"
          class="px-3 py-1.5 rounded-full text-sm border transition-colors"
          :class="
            filtreDifficulte === ''
              ? 'bg-ink text-cream border-ink'
              : 'bg-cream text-ink border-ink/15 hover:border-foret'
          "
          @click="filtreDifficulte = ''"
        >
          Toutes
        </button>
        <button
          v-for="d in difficultes"
          :key="d"
          type="button"
          class="px-3 py-1.5 rounded-full text-sm border transition-colors"
          :class="
            filtreDifficulte === d
              ? 'bg-ink text-cream border-ink'
              : 'bg-cream text-ink border-ink/15 hover:border-foret'
          "
          @click="filtreDifficulte = d"
        >
          {{ label(d) }}
        </button>
      </div>

      <!-- Durée -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs uppercase tracking-wider text-stone-500 mr-2">Durée</span>
        <button
          type="button"
          class="px-3 py-1.5 rounded-full text-sm border transition-colors"
          :class="
            filtreDuree === ''
              ? 'bg-ink text-cream border-ink'
              : 'bg-cream text-ink border-ink/15 hover:border-foret'
          "
          @click="filtreDuree = ''"
        >
          Toutes
        </button>
        <button
          v-for="d in dureeBuckets"
          :key="d.value"
          type="button"
          class="px-3 py-1.5 rounded-full text-sm border transition-colors"
          :class="
            filtreDuree === d.value
              ? 'bg-ink text-cream border-ink'
              : 'bg-cream text-ink border-ink/15 hover:border-foret'
          "
          @click="filtreDuree = d.value"
        >
          {{ d.label }}
        </button>
      </div>

      <!-- Type -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs uppercase tracking-wider text-stone-500 mr-2">Type</span>
        <button
          type="button"
          class="px-3 py-1.5 rounded-full text-sm border transition-colors"
          :class="
            filtreType === ''
              ? 'bg-ink text-cream border-ink'
              : 'bg-cream text-ink border-ink/15 hover:border-foret'
          "
          @click="filtreType = ''"
        >
          Tous
        </button>
        <button
          v-for="t in typesParcours"
          :key="t.value"
          type="button"
          class="px-3 py-1.5 rounded-full text-sm border transition-colors"
          :class="
            filtreType === t.value
              ? 'bg-ink text-cream border-ink'
              : 'bg-cream text-ink border-ink/15 hover:border-foret'
          "
          @click="filtreType = t.value"
        >
          {{ t.label }}
        </button>
      </div>

      <div v-if="hasFilter" class="pt-2">
        <button type="button" class="text-sm text-foret hover:underline" @click="reset">
          Réinitialiser les filtres
        </button>
      </div>
    </div>

    <div
      v-if="error"
      class="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      Les randos n'ont pas pu \u00eatre charg\u00e9es. R\u00e9essayez plus tard.
    </div>

    <p v-if="!balades.length" class="text-stone-600">Aucune rando ne correspond à ces filtres.</p>

    <div v-else class="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      <BaladeCard v-for="b in balades" :key="b.id" :balade="b" />
    </div>
  </div>
</template>
