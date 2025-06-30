/** @type {import('lint-staged').Configuration} */
export default {
  '*.{svelte,js,ts,md,html,css,json,yaml}': 'prettier --write',
  '*.{svelte,js,ts}': 'eslint --fix',
};
