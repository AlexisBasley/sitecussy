<script setup lang="ts">
const open = ref(false);
const route = useRoute();

// Ferme le drawer à chaque navigation
watch(
  () => route.fullPath,
  () => {
    open.value = false;
  },
);

const links = [
  { to: '/balades', label: 'Balades' },
  { to: '/chemins', label: 'Chemins' },
  { to: '/actualites', label: 'Actualités' },
  { to: '/a-propos', label: 'À propos' },
];
</script>

<template>
  <header class="sticky top-0 z-40 bg-foret-dark/95 backdrop-blur text-white shadow-sm">
    <div class="container-page py-3 md:py-4 flex items-center justify-between gap-4">
      <NuxtLink
        to="/"
        class="!text-white no-underline shrink-0"
        aria-label="Cussy-en-Morvan, accueil"
      >
        <img
          src="/logo-cussy.png"
          alt="Cussy-en-Morvan"
          class="h-9 md:h-12 w-auto bg-cream rounded-md px-2 py-1"
        />
      </NuxtLink>

      <!-- Nav desktop -->
      <nav class="hidden md:block">
        <ul class="flex gap-2 lg:gap-4 text-sm lg:text-base">
          <li v-for="l in links" :key="l.to">
            <NuxtLink
              :to="l.to"
              class="!text-white no-underline px-3 py-2 rounded-full transition-colors hover:bg-white/10"
              active-class="bg-white/15 font-medium"
            >
              {{ l.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Burger mobile -->
      <button
        type="button"
        class="md:hidden p-2 -mr-2 rounded text-white"
        :aria-expanded="open"
        aria-controls="mobile-menu"
        aria-label="Ouvrir le menu"
        @click="open = !open"
      >
        <svg
          v-if="!open"
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>
    </div>

    <!-- Drawer mobile -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <nav v-if="open" id="mobile-menu" class="md:hidden border-t border-white/10 bg-foret-dark">
        <ul class="container-page py-3 flex flex-col">
          <li v-for="l in links" :key="l.to">
            <NuxtLink
              :to="l.to"
              class="!text-white no-underline block py-3 text-base"
              active-class="font-semibold text-foret-light"
            >
              {{ l.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </Transition>
  </header>
</template>
