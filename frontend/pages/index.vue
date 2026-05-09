<script setup lang="ts">
import type { Actualite } from '~/types/actualite';
import type { Balade } from '~/types/balade';

const { findMany } = useStrapi();

// 3 dernières actualités publiées
const { data: actuRes } = await useAsyncData('home-actus', () =>
  findMany<Actualite>('actualites', {
    populate: ['image', 'balade'],
    sort: ['date:desc'],
    pagination: { pageSize: 3 },
  }),
);

// Balades par niveau (1 vitrine par niveau pour la section "Choisir")
const { data: famillesRes } = await useAsyncData('home-familles', () =>
  findMany<Balade>('balades', {
    populate: ['photo_mise_en_avant'],
    filters: { difficulte: { $eq: 'famille' } },
    sort: ['publishedAt:desc'],
    pagination: { pageSize: 1 },
  }),
);
const { data: interRes } = await useAsyncData('home-inter', () =>
  findMany<Balade>('balades', {
    populate: ['photo_mise_en_avant'],
    filters: { difficulte: { $eq: 'intermediaire' } },
    sort: ['publishedAt:desc'],
    pagination: { pageSize: 1 },
  }),
);
const { data: expertRes } = await useAsyncData('home-expert', () =>
  findMany<Balade>('balades', {
    populate: ['photo_mise_en_avant'],
    filters: { difficulte: { $eq: 'expert' } },
    sort: ['publishedAt:desc'],
    pagination: { pageSize: 1 },
  }),
);

// Stats : compter le total balades + chemins
const { data: statsRes } = await useAsyncData('home-stats', async () => {
  const [balades, chemins] = await Promise.all([
    findMany<Balade>('balades', { pagination: { pageSize: 1 } }),
    findMany<{ id: number }>('chemins', { pagination: { pageSize: 1 } }),
  ]);
  return {
    balades: balades.meta?.pagination?.total ?? 0,
    chemins: chemins.meta?.pagination?.total ?? 0,
  };
});

const actualites = computed(() => actuRes.value?.data ?? []);
const stats = computed(() => statsRes.value ?? { balades: 0, chemins: 0 });

const niveaux = computed(() => [
  {
    key: 'famille',
    label: 'Famille',
    desc: 'Boucles courtes, pentes douces, idéales pour découvrir le Morvan en famille.',
    balade: famillesRes.value?.data?.[0],
    fallback:
      'https://images.unsplash.com/photo-1544191696-15693072e0b5?auto=format&fit=crop&w=1200&q=70',
  },
  {
    key: 'intermediaire',
    label: 'Intermédiaire',
    desc: 'Des boucles plus longues avec un peu de dénivelé pour les habitués.',
    balade: interRes.value?.data?.[0],
    fallback:
      'https://images.unsplash.com/photo-1502209524164-acea936639a2?auto=format&fit=crop&w=1200&q=70',
  },
  {
    key: 'expert',
    label: 'Expert',
    desc: 'Les itinéraires les plus engagés : longueur, dénivelé, technique.',
    balade: expertRes.value?.data?.[0],
    fallback:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=70',
  },
]);

const { mediaUrl } = useStrapi();

function imgFor(n: { balade?: Balade; fallback: string }) {
  if (n.balade?.photo_mise_en_avant) return mediaUrl(n.balade.photo_mise_en_avant);
  return n.fallback;
}

useSeoMeta({
  title: 'VTT à Cussy-en-Morvan — Balades, chemins et actualités',
  description:
    'Découvrez les balades VTT au cœur du Morvan : itinéraires famille, intermédiaire et expert, état des chemins, fichiers GPX à télécharger.',
});
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative isolate overflow-hidden text-cream">
      <div class="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=2000&q=70"
          alt=""
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink/85"></div>
      </div>
      <div class="container-page py-24 md:py-36 max-w-4xl">
        <p class="uppercase tracking-[0.2em] text-xs md:text-sm text-cream/80 mb-6">
          Cussy-en-Morvan · Bourgogne
        </p>
        <h1 class="!text-cream font-serif text-5xl md:text-7xl leading-[1.05] mb-6">
          Le VTT au cœur<br />
          du Morvan.
        </h1>
        <p class="text-lg md:text-xl text-cream/85 max-w-2xl mb-10">
          Des chemins forestiers, des boucles balisées et des paysages préservés. Choisissez votre
          balade, téléchargez la trace GPX et partez.
        </p>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/balades" class="btn-primary">Voir les balades</NuxtLink>
          <NuxtLink
            to="/chemins"
            class="btn-secondary !border-cream/40 !text-cream hover:!bg-cream/10"
          >
            État des chemins
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="border-b border-stone-200 bg-cream">
      <div class="container-page py-10 grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
        <div>
          <div class="font-serif text-4xl md:text-5xl text-foret-dark">{{ stats.balades }}</div>
          <div class="uppercase tracking-wider text-xs text-stone-600 mt-1">Balades publiées</div>
        </div>
        <div>
          <div class="font-serif text-4xl md:text-5xl text-foret-dark">{{ stats.chemins }}</div>
          <div class="uppercase tracking-wider text-xs text-stone-600 mt-1">
            Chemins cartographiés
          </div>
        </div>
        <div class="col-span-2 md:col-span-1">
          <div class="font-serif text-4xl md:text-5xl text-foret-dark">901 m</div>
          <div class="uppercase tracking-wider text-xs text-stone-600 mt-1">
            Haut-Folin, point culminant du Morvan
          </div>
        </div>
      </div>
    </section>

    <!-- Choisir sa balade -->
    <section class="section">
      <div class="container-page">
        <div class="max-w-2xl mb-12">
          <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">Choisir sa balade</p>
          <h2 class="text-4xl md:text-5xl mb-4">Trois niveaux, un seul terrain de jeu.</h2>
          <p class="text-stone-600 text-lg">
            Que vous rouliez en famille ou que vous cherchiez un parcours engagé, le Morvan a sa
            boucle pour vous.
          </p>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <NuxtLink
            v-for="n in niveaux"
            :key="n.key"
            :to="n.balade ? `/balades/${n.balade.slug}` : `/balades?difficulte=${n.key}`"
            class="group relative isolate overflow-hidden rounded-2xl aspect-[3/4] no-underline"
          >
            <img
              :src="imgFor(n)"
              :alt="n.label"
              class="absolute inset-0 -z-10 w-full h-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div
              class="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent"
            ></div>
            <div class="flex flex-col h-full justify-end p-6 text-cream">
              <p class="uppercase tracking-[0.2em] text-xs text-cream/70 mb-2">Niveau</p>
              <h3 class="!text-cream font-serif text-3xl mb-2">{{ n.label }}</h3>
              <p class="text-cream/85 text-sm mb-4">{{ n.desc }}</p>
              <span class="text-sm font-medium text-cream group-hover:underline">
                Découvrir →
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Actualités -->
    <section v-if="actualites.length" class="section bg-stone-50">
      <div class="container-page">
        <div class="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">Actualités</p>
            <h2 class="text-4xl md:text-5xl">Sur les chemins, en ce moment.</h2>
          </div>
          <NuxtLink to="/actualites" class="btn-ghost">Toutes les actus →</NuxtLink>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <ActualiteCard v-for="a in actualites" :key="a.id" :actualite="a" />
        </div>
      </div>
    </section>

    <!-- À propos de Cussy -->
    <section class="section">
      <div class="container-page grid md:grid-cols-2 gap-12 items-center">
        <div class="aspect-[4/3] rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=70"
            alt="Paysage du Morvan"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div>
          <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">Cussy-en-Morvan</p>
          <h2 class="text-4xl md:text-5xl mb-6">Un village, une porte d'entrée vers le Parc.</h2>
          <p class="text-stone-700 text-lg leading-relaxed mb-4">
            Niché en Saône-et-Loire, Cussy-en-Morvan est un point de départ idéal pour explorer le
            Parc naturel régional du Morvan : forêts profondes, étangs, hameaux préservés.
          </p>
          <p class="text-stone-700 text-lg leading-relaxed mb-8">
            Les itinéraires VTT proposés ici sont réalisés en partenariat avec le PNR du Morvan, qui
            entretient et balise plus de 1 000 km de circuits.
          </p>
          <NuxtLink to="/about" class="btn-secondary">En savoir plus</NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="bg-foret-dark text-cream">
      <div class="container-page py-20 md:py-28 text-center max-w-3xl">
        <h2 class="!text-cream font-serif text-4xl md:text-5xl mb-6">
          Prêt à enfourcher votre VTT ?
        </h2>
        <p class="text-cream/85 text-lg mb-10">
          Toutes les balades, leurs traces GPX et l'état des chemins en temps réel.
        </p>
        <div class="flex flex-wrap gap-3 justify-center">
          <NuxtLink to="/balades" class="btn-primary">Toutes les balades</NuxtLink>
          <NuxtLink
            to="/chemins"
            class="btn-secondary !border-cream/40 !text-cream hover:!bg-cream/10"
          >
            Voir l'état des chemins
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
