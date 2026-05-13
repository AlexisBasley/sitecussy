<script setup lang="ts">
useSeoMeta({
  title: 'Qui sommes-nous — Cussy-en-Morvan',
  description:
    'Association et bénévoles de Cussy-en-Morvan : vie locale, événements et randonnées au cœur du Morvan.',
});
</script>

<template>
  <div>
    <!-- Hero éditorial -->
    <section class="bg-cream-dark border-b border-stone-200">
      <div class="container-page py-16 md:py-24 max-w-3xl">
        <p class="uppercase tracking-[0.2em] text-xs text-foret mb-4">À propos</p>
        <h1 class="mb-6">Un village qui vit, au cœur du Morvan.</h1>
        <p class="text-lg md:text-xl text-stone-700 leading-relaxed">
          Ce site est porté par l'association du village et la mairie de Cussy-en-Morvan. Il
          rassemble la vie locale : événements de l'association, randonnées à pied, en VTT ou à
          cheval, et patrimoine du Morvan. Tout est animé par des bénévoles, en partenariat avec le
          Parc naturel régional du Morvan.
        </p>
      </div>
    </section>

    <!-- Ce qu'on fait -->
    <section class="section">
      <div class="container-page max-w-3xl">
        <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">Notre association</p>
        <h2 class="mb-8">Ce qu'on fait à Cussy.</h2>
        <ul class="space-y-6">
          <li class="flex gap-4 items-start">
            <span
              class="shrink-0 w-7 h-7 rounded-full bg-foret-light/30 text-foret-dark inline-flex items-center justify-center font-serif text-sm font-semibold"
              >1</span
            >
            <p class="text-stone-700 text-lg leading-relaxed pt-0.5">
              Organiser des
              <strong>événements ouverts à toutes et tous</strong> tout au long de l'année : repas,
              fêtes du village, sorties nature, rendez-vous saisonniers.
            </p>
          </li>
          <li class="flex gap-4 items-start">
            <span
              class="shrink-0 w-7 h-7 rounded-full bg-foret-light/30 text-foret-dark inline-flex items-center justify-center font-serif text-sm font-semibold"
              >2</span
            >
            <p class="text-stone-700 text-lg leading-relaxed pt-0.5">
              Proposer des <strong>randonnées encadrées et balisées</strong> autour du village,
              accessibles en VTT, à pied ou à cheval, pour les habitants comme pour les visiteurs.
            </p>
          </li>
          <li class="flex gap-4 items-start">
            <span
              class="shrink-0 w-7 h-7 rounded-full bg-foret-light/30 text-foret-dark inline-flex items-center justify-center font-serif text-sm font-semibold"
              >3</span
            >
            <p class="text-stone-700 text-lg leading-relaxed pt-0.5">
              Mettre en valeur le <strong>patrimoine local</strong> : hameaux, lavoirs, croix de
              chemin, étangs, points de vue sur le Morvan.
            </p>
          </li>
        </ul>
      </div>
    </section>

    <!-- Charte du pratiquant -->
    <section class="section bg-stone-50">
      <div class="container-page max-w-3xl">
        <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">Sur les chemins</p>
        <h2 class="mb-8">Profiter en respectant les lieux.</h2>
        <ul class="space-y-4">
          <li
            v-for="(item, i) in [
              'Respectez la signalisation et la propriété privée.',
              'Ne dérangez pas la faune ni le bétail.',
              'Remportez vos déchets, ne laissez aucune trace.',
              'Cédez le passage entre piétons, cavaliers et vététistes.',
              'Ralentissez à proximité des hameaux et des exploitations.',
            ]"
            :key="i"
            class="flex gap-4 items-start"
          >
            <span
              class="shrink-0 w-7 h-7 rounded-full bg-foret-light/30 text-foret-dark inline-flex items-center justify-center font-serif text-sm font-semibold"
            >
              {{ i + 1 }}
            </span>
            <p class="text-stone-700 text-lg leading-relaxed pt-0.5">{{ item }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- Partenaires -->
    <section class="section bg-cream-dark border-y border-stone-200">
      <div class="container-page max-w-3xl">
        <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">Partenaires</p>
        <h2 class="mb-6">Le Parc naturel régional du Morvan.</h2>
        <p class="text-stone-700 text-lg leading-relaxed mb-6">
          Le PNR du Morvan entretient et balise plus de 1 000 km de circuits, dont plusieurs au
          départ de Cussy-en-Morvan. Les fiches techniques de certains itinéraires sont issues de
          leur base ouverte
          <a
            href="https://geotrek.parcdumorvan.org/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-foret-dark hover:text-foret-light underline underline-offset-4"
          >
            Geotrek
          </a>
          .
        </p>
        <a
          href="https://www.parcdumorvan.org/"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-secondary"
        >
          Visiter le site du Parc
        </a>
      </div>
    </section>

    <!-- Contact -->
    <section class="section">
      <div class="container-page max-w-3xl">
        <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">Contact</p>
        <h2 class="mb-6">Nous écrire.</h2>
        <p class="text-stone-700 text-lg leading-relaxed mb-8">
          Pour rejoindre l'association, proposer un événement, signaler un chemin endommagé ou
          contribuer à ce site, écrivez-nous.
        </p>
        <div class="flex flex-wrap gap-3">
          <a href="mailto:contact@cussy-en-morvan.fr" class="btn-primary">
            contact@cussy-en-morvan.fr
          </a>
          <NuxtLink to="/evenements" class="btn-secondary">Voir les événements</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
