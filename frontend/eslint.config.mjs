// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/html-self-closing': 'off',
  },
}).override('nuxt/vue/rules', {
  files: [
    'pages/balades/[slug].vue',
    'pages/evenements/[slug].vue',
    'components/actualite/ActualiteCard.vue',
    'components/balade/BaladeMap.vue',
  ],
  rules: {
    // v-html sur ces fichiers est sanitisé via useSanitize().
    'vue/no-v-html': 'off',
  },
});
