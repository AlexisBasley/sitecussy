<script setup lang="ts">
import type { Actualite } from '~/types/actualite';

const props = defineProps<{ actualite: Actualite }>();
const { mediaUrl } = useStrapi();

const categorieMeta: Record<Actualite['categorie'], { label: string; cls: string }> = {
  info: { label: 'Info', cls: 'bg-blue-100 text-blue-800' },
  conditions: { label: 'Conditions', cls: 'bg-amber-100 text-amber-800' },
  nouveaute: { label: 'Nouveauté', cls: 'bg-green-100 text-green-800' },
};

const dateFmt = computed(() =>
  new Date(props.actualite.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
);
</script>

<template>
  <article class="bg-white rounded-lg shadow overflow-hidden">
    <div v-if="actualite.image" class="aspect-video bg-stone-200 overflow-hidden">
      <img
        :src="mediaUrl(actualite.image)"
        :alt="actualite.image.alternativeText || actualite.titre"
        class="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div class="p-4">
      <div class="flex items-center gap-2 mb-2 text-xs">
        <span
          class="inline-flex items-center px-2 py-0.5 rounded-full font-medium"
          :class="categorieMeta[actualite.categorie].cls"
        >
          {{ categorieMeta[actualite.categorie].label }}
        </span>
        <time class="text-stone-500">{{ dateFmt }}</time>
      </div>
      <h3 class="!text-foret-dark mb-2">{{ actualite.titre }}</h3>
      <div class="prose-strapi text-sm text-stone-700" v-html="actualite.contenu" />
      <NuxtLink
        v-if="actualite.balade?.slug"
        :to="`/balades/${actualite.balade.slug}`"
        class="text-sm mt-2 inline-block"
      >
        Voir la balade concernée →
      </NuxtLink>
    </div>
  </article>
</template>
