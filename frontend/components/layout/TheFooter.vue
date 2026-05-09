<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<template>
  <footer class="bg-ink text-cream/80 mt-20">
    <div class="container-page py-14 grid gap-10 md:grid-cols-3">
      <!-- À propos -->
      <div>
        <NuxtLink to="/" class="inline-block !text-cream no-underline mb-4">
          <img
            src="/logo-cussy.png"
            alt="Cussy-en-Morvan"
            class="h-12 w-32 object-cover object-left bg-cream rounded-lg"
          />
        </NuxtLink>
        <p class="text-sm leading-relaxed max-w-xs">
          Site informatif des balades VTT au départ de Cussy-en-Morvan, au cœur du Parc naturel
          régional du Morvan.
        </p>
      </div>

      <!-- Navigation -->
      <div>
        <h4 class="!text-cream mb-4 text-sm font-semibold uppercase tracking-wider">Découvrir</h4>
        <ul class="space-y-2 text-sm">
          <li>
            <NuxtLink to="/balades" class="!text-cream/80 hover:!text-cream no-underline">
              Balades
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/chemins" class="!text-cream/80 hover:!text-cream no-underline">
              Chemins
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/actualites" class="!text-cream/80 hover:!text-cream no-underline">
              Actualités
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/a-propos" class="!text-cream/80 hover:!text-cream no-underline">
              À propos
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Contact / partenaires -->
      <div>
        <h4 class="!text-cream mb-4 text-sm font-semibold uppercase tracking-wider">Mairie</h4>
        <address class="not-italic text-sm leading-relaxed mb-6">
          Mairie de Cussy-en-Morvan<br />
          71550 Cussy-en-Morvan<br />
          Bourgogne — France
        </address>
        <h4 class="!text-cream mb-3 text-sm font-semibold uppercase tracking-wider">
          En partenariat
        </h4>
        <a
          href="https://www.parcdumorvan.org/"
          target="_blank"
          rel="noopener noreferrer"
          class="!text-cream/80 hover:!text-cream text-sm underline-offset-2"
        >
          Parc naturel régional du Morvan
        </a>
      </div>
    </div>

    <div class="border-t border-cream/10">
      <div
        class="container-page py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-cream/60"
      >
        <p>© {{ year }} Mairie de Cussy-en-Morvan</p>
        <p>Pratiquez le VTT en respectant la nature et la propriété privée.</p>
      </div>
    </div>
  </footer>
</template>
