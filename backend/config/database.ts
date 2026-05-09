export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  const isSqlite = client === 'sqlite';
  const databaseUrl = env('DATABASE_URL');

  // Postgres : Railway fournit DATABASE_URL ; sinon variables séparées
  const pgConnection = databaseUrl
    ? {
        connectionString: databaseUrl,
        ssl: env.bool('DATABASE_SSL', true) && {
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
        },
      }
    : {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'sitecussy'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
        schema: env('DATABASE_SCHEMA', 'public'),
      };

  return {
    connection: {
      client,
      connection: isSqlite
        ? { filename: env('DATABASE_FILENAME', '.tmp/data.db') }
        : pgConnection,
      useNullAsDefault: true,
      // SQLite ne tolère qu'une seule connexion en écriture simultanée
      pool: isSqlite
        ? { min: 1, max: 1 }
        : { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
  };
};
