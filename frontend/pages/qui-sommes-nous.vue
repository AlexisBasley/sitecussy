<script setup lang="ts">
useSeoMeta({
  title: 'Qui sommes-nous — Cussy-en-Morvan',
  description:
    'Association et bénévoles de Cussy-en-Morvan : randonnées, vie associative et événements au cœur du Morvan.',
});
</script>

<template>
  <div>
    <!-- Hero éditorial -->
    <section class="bg-cream-dark border-b border-stone-200">
      <div class="container-page py-16 md:py-24 max-w-3xl">
        <p class="uppercase tracking-[0.2em] text-xs text-foret mb-4">À propos</p>
        <h1 class="mb-6">Un site fait par et pour les habitants du Morvan.</h1>
        <p class="text-lg md:text-xl text-stone-700 leading-relaxed">
          Ce site est animé par la mairie de Cussy-en-Morvan et des bénévoles passionnés de VTT. Il
          recense les chemins ouverts à la pratique, des balades à la journée et des informations
          sur l'état des sentiers, en partenariat avec le Parc naturel régional du Morvan.
        </p>
      </div>
    </section>

    <!-- Pratique responsable -->
    <section class="section">
      <div class="container-page max-w-3xl">
        <p class="uppercase tracking-[0.2em] text-xs text-foret mb-3">Charte du pratiquant</p>
        <h2 class="mb-8">Rouler en respectant les lieux.</h2>
        <ul class="space-y-4">
          <li
            v-for="(item, i) in [
              'Respectez la signalisation et la propriété privée.',
              'Ne dérangez pas la faune ni le bétail.',
              'Remportez vos déchets, ne laissez aucune trace.',
              'Cédez le passage aux piétons et cavaliers.',
              'Ralentissez à proximité des hameaux et exploitations.',
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
          Le PNR du Morvan entretient et balise plus de 1 000 km de circuits VTT, dont plusieurs au
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
        <h2 class="mb-6">Une remarque, un chemin endommagé ?</h2>
        <p class="text-stone-700 text-lg leading-relaxed mb-8">
          Pour signaler un chemin endommagé, proposer une balade ou contribuer à ce site,
          écrivez-nous.
        </p>
        <div class="flex flex-wrap gap-3">
          <a href="mailto:contact@cussy-en-morvan.fr" class="btn-primary">
            contact@cussy-en-morvan.fr
          </a>
          <NuxtLink to="/balades" class="btn-secondary">Voir les balades</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
