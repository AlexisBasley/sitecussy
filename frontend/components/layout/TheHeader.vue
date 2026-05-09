<template>
  <header class="bg-foret-dark text-white shadow">
    <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <NuxtLink to="/" class="!text-white no-underline">
        <span class="text-xl font-bold">VTT Cussy-en-Morvan</span>
      </NuxtLink>
      <nav>
        <ul class="flex gap-4 md:gap-6 text-sm md:text-base">
          <li><NuxtLink to="/balades" class="!text-white hover:underline">Balades</NuxtLink></li>
          <li><NuxtLink to="/chemins" class="!text-white hover:underline">Chemins</NuxtLink></li>
          <li>
            <NuxtLink to="/actualites" class="!text-white hover:underline">Actualités</NuxtLink>
          </li>
          <li><NuxtLink to="/a-propos" class="!text-white hover:underline">À propos</NuxtLink></li>
        </ul>
      </nav>
    </div>
  </header>
</template>
