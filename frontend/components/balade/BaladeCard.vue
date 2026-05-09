<script setup lang="ts">
import type { Balade } from '~/types/balade';

defineProps<{ balade: Balade }>();
const { mediaUrl } = useStrapi();

const difficulteLabel: Record<Balade['difficulte'], { label: string; cls: string }> = {
  famille: { label: 'Famille', cls: 'bg-green-100 text-green-800' },
  intermediaire: { label: 'Intermédiaire', cls: 'bg-amber-100 text-amber-800' },
  expert: { label: 'Expert', cls: 'bg-red-100 text-red-800' },
};
</script>

<template>
  <NuxtLink
    :to="`/balades/${balade.slug}`"
    class="block bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition no-underline !text-stone-900"
  >
    <div class="aspect-video bg-stone-200 overflow-hidden">
      <img
        v-if="balade.photo_mise_en_avant"
        :src="mediaUrl(balade.photo_mise_en_avant)"
        :alt="balade.photo_mise_en_avant.alternativeText || balade.titre"
        class="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div class="p-4">
      <h3 class="!text-foret-dark mb-2">{{ balade.titre }}</h3>
      <div class="flex flex-wrap gap-2 text-xs">
        <span
          class="inline-flex items-center px-2 py-0.5 rounded-full font-medium"
          :class="difficulteLabel[balade.difficulte].cls"
        >
          {{ difficulteLabel[balade.difficulte].label }}
        </span>
        <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
          {{ balade.duree_estimee }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
