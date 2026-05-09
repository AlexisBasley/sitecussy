<script setup lang="ts">
import type { Balade } from '~/types/balade';

defineProps<{ balade: Balade }>();
const { mediaUrl } = useStrapi();
const { label, badgeOverlay } = useDifficulte();
</script>

<template>
  <NuxtLink :to="`/balades/${balade.slug}`" class="group block text-ink">
    <div class="relative overflow-hidden rounded-2xl aspect-[4/3] bg-cream-dark">
      <img
        v-if="balade.photo_mise_en_avant"
        :src="mediaUrl(balade.photo_mise_en_avant)"
        :alt="balade.photo_mise_en_avant.alternativeText || balade.titre"
        class="w-full h-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-stone-400 font-serif text-sm"
      >
        Pas de photo
      </div>
      <span
        class="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur"
        :class="badgeOverlay(balade.difficulte)"
      >
        {{ label(balade.difficulte) }}
      </span>
    </div>
    <div class="pt-4">
      <h3 class="font-serif text-xl md:text-2xl mb-2 group-hover:text-foret-dark transition-colors">
        {{ balade.titre }}
      </h3>
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
        <span v-if="balade.duree_estimee" class="inline-flex items-center gap-1.5">
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
            <circle cx="12" cy="12" r="9" />
            <polyline points="12,7 12,12 15,14" />
          </svg>
          {{ balade.duree_estimee }}
        </span>
        <span v-if="balade.point_depart" class="inline-flex items-center gap-1.5">
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
            <path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {{ balade.point_depart }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
