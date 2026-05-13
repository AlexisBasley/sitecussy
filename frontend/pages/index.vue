<script setup lang="ts">
import type { Evenement } from '~/types/evenement';
import type { Balade } from '~/types/balade';

const { findMany } = useStrapi();

const now = new Date().toISOString();

const { data: home } = await useAsyncData('home', async () => {
  const [upcoming, recent, balades, chemins] = await Promise.all([
    findMany<Evenement>('evenements', {
      populate: ['image_couverture', 'balade', 'balade.photo_mise_en_avant'],
      filters: { date_debut: { $gte: now } },
      sort: ['date_debut:asc'],
      pagination: { pageSize: 3 },
    }),
    findMany<Evenement>('evenements', {
      populate: ['image_couverture', 'balade', 'balade.photo_mise_en_avant'],
      filters: { date_debut: { $lt: now } },
      sort: ['date_debut:desc'],
      pagination: { pageSize: 3 },
    }),
    findMany<Balade>('balades', { pagination: { pageSize: 1 } }),
    findMany<{ id: number }>('chemins', { pagination: { pageSize: 1 } }),
  ]);
  return {
    upcoming: upcoming.data ?? [],
    recent: recent.data ?? [],
    totalBalades: balades.meta?.pagination?.total ?? 0,
    totalChemins: chemins.meta?.pagination?.total ?? 0,
  };
});

const upcoming = computed(() => home.value?.upcoming ?? []);
const recent = computed(() => home.value?.recent ?? []);
const stats = computed(() => ({
  balades: home.value?.totalBalades ?? 0,
  chemins: home.value?.totalChemins ?? 0,
}));

useSeoMeta({
  title: 'Cussy-en-Morvan — Randos, événements et vie locale',
  description:
    "Site de Cussy-en-Morvan : randonnées (VTT, marche, cheval), événements de l'association et patrimoine du Morvan.",
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
        <h1 class="text-cream font-serif text-5xl md:text-7xl leading-[1.05] mb-6">
          La vie du village,<br />
          au cœur du Morvan.
        </h1>
        <p class="text-lg md:text-xl text-cream/85 max-w-2xl mb-10">
          Randos en VTT, à pied ou à cheval, événements de l'association et patrimoine du Morvan —
          tout ce qui se passe à Cussy.
        </p>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/evenements" class="btn-primary">Prochains événements</NuxtLink>
          <NuxtLink to="/balades" class="btn-outline-cream">Toutes les randos</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Prochains événements -->
    <section v-if="upcoming.length" class="section">
      <div class="container-page">
        <div class="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">À venir</p>
            <h2 class="text-4xl md:text-5xl">Les prochains rendez-vous.</h2>
          </div>
          <NuxtLink to="/evenements" class="btn-ghost">Tous les événements →</NuxtLink>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <EvenementCard v-for="e in upcoming" :key="e.id" :evenement="e" />
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="border-y border-stone-200 bg-cream-dark">
      <div class="container-page py-10 grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
        <div>
          <div class="font-serif text-4xl md:text-5xl text-foret-dark">{{ stats.balades }}</div>
          <div class="uppercase tracking-wider text-xs text-stone-600 mt-1">
            Randos cartographiées
          </div>
        </div>
        <div>
          <div class="font-serif text-4xl md:text-5xl text-foret-dark">{{ stats.chemins }}</div>
          <div class="uppercase tracking-wider text-xs text-stone-600 mt-1">Chemins balisés</div>
        </div>
        <div class="col-span-2 md:col-span-1">
          <div class="font-serif text-4xl md:text-5xl text-foret-dark">901 m</div>
          <div class="uppercase tracking-wider text-xs text-stone-600 mt-1">
            Haut-Folin, point culminant du Morvan
          </div>
        </div>
      </div>
    </section>

    <!-- Derniers événements passés -->
    <section v-if="recent.length" class="section bg-stone-50">
      <div class="container-page">
        <div class="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">Précédents</p>
            <h2 class="text-4xl md:text-5xl">Ce qu'on a fait récemment.</h2>
          </div>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <EvenementCard v-for="e in recent" :key="e.id" :evenement="e" />
        </div>
      </div>
    </section>

    <!-- À propos -->
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
            Les randonnées proposées ici sont réalisées en partenariat avec le PNR du Morvan, qui
            entretient et balise plus de 1 000 km de circuits.
          </p>
          <NuxtLink to="/qui-sommes-nous" class="btn-secondary">En savoir plus</NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="bg-foret-dark text-cream">
      <div class="container-page py-20 md:py-28 text-center max-w-3xl">
        <h2 class="text-cream font-serif text-4xl md:text-5xl mb-6">
          Rejoignez-nous sur les chemins.
        </h2>
        <p class="text-cream/85 text-lg mb-10">
          Toutes les randos, les prochains événements et l'état des sentiers à Cussy-en-Morvan.
        </p>
        <div class="flex flex-wrap gap-3 justify-center">
          <NuxtLink to="/evenements" class="btn-primary">Voir les événements</NuxtLink>
          <NuxtLink to="/balades" class="btn-outline-cream">Toutes les randos</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
