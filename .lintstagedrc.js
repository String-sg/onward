/** @type {import('lint-staged').Configuration} */
export default {
  '*.{svelte,js,ts,md,html,css,json}': 'prettier --write',
  '*.{svelte,js,ts}': 'eslint --fix',
};
