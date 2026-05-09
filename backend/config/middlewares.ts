export default ({ env }) => {
  const frontendUrl = env('FRONTEND_URL');
  const origins = frontendUrl
    ? frontendUrl.split(',').map((s) => s.trim())
    : ['http://localhost:3000'];

  return [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    {
      name: 'strapi::cors',
      config: {
        origin: origins,
        headers: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
      },
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};
