// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/leaflet', '@nuxt/eslint'],

  components: [{ path: '~/components', pathPrefix: false }],

  css: ['~/assets/css/main.css', 'leaflet/dist/leaflet.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'VTT Cussy-en-Morvan',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Balades VTT à Cussy-en-Morvan : itinéraires, traces GPX, conditions des chemins.',
        },
      ],
    },
  },

  runtimeConfig: {
    // accessible côté serveur uniquement
    strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
    strapiApiToken: process.env.STRAPI_API_TOKEN || '',
    public: {
      // exposé côté client
      strapiUrl: process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
    },
  },

  nitro: {
    routeRules: {
      '/api/gpx/**': { cache: { maxAge: 60 * 60 } },
    },
  },

  typescript: {
    strict: true,
  },
});
