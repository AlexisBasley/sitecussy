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
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap',
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
      '/a-propos': { redirect: { to: '/qui-sommes-nous', statusCode: 301 } },
    },
  },

  typescript: {
    strict: true,
  },
});
