/** @type {import("prettier").Config} */
export default {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',

  plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte',
      },
    },
  ],
};
