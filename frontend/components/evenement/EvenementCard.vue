<script setup lang="ts">
import type { Evenement } from '~/types/evenement';

const props = defineProps<{ evenement: Evenement }>();
const { mediaUrl } = useStrapi();

const dateFormatted = computed(() => {
  const d = new Date(props.evenement.date_debut);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

const cover = computed(
  () => props.evenement.image_couverture ?? props.evenement.balade?.photo_mise_en_avant ?? null,
);
</script>

<template>
  <NuxtLink
    :to="`/evenements/${evenement.slug}`"
    class="group block rounded-2xl overflow-hidden bg-cream-dark border border-stone-200 hover:border-foret transition-colors"
  >
    <div class="aspect-[16/10] bg-stone-200 overflow-hidden">
      <img
        v-if="cover"
        :src="mediaUrl(cover)"
        :alt="evenement.titre"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <div class="p-5">
      <time
        :datetime="evenement.date_debut"
        class="text-xs uppercase tracking-wider text-foret font-medium"
      >
        {{ dateFormatted }}
      </time>
      <h3
        class="font-serif text-xl mt-2 mb-1 leading-tight group-hover:text-foret transition-colors"
      >
        {{ evenement.titre }}
      </h3>
      <p v-if="evenement.lieu" class="text-sm text-stone-600">
        {{ evenement.lieu }}
      </p>
      <p
        v-if="evenement.balade"
        class="mt-3 text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full bg-foret/10 text-foret-dark"
      >
        Rando associée
      </p>
    </div>
  </NuxtLink>
</template>
