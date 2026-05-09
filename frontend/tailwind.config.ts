import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        // Palette outdoor moderne
        ink: {
          DEFAULT: '#0a0e0a', // noir profond pour titres/header
          soft: '#1a1f1a',
        },
        cream: {
          DEFAULT: '#faf7f2', // fond off-white chaud
          dark: '#f0ebe2',
        },
        foret: {
          DEFAULT: '#2f4a3a', // vert forêt principal
          dark: '#1a2e22', // vert très foncé (header, cta)
          light: '#7a9e7a', // vert mousse (accent, hover)
        },
        morvan: {
          DEFAULT: '#7a5230', // terre, conservé
          light: '#c9a877',
        },
        stone: {
          // override léger pour cohérence (Tailwind stone garde sinon)
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tight2: '-0.03em',
      },
      maxWidth: {
        prose2: '68ch',
      },
    },
  },
};
