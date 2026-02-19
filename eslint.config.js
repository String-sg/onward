import js from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import simpleImportStort from 'eslint-plugin-simple-import-sort';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
  globalIgnores(['**/.svelte-kit/**', '**/build/**', '**/dist/**']),

  js.configs.recommended,
  ts.configs.recommended,
  ts.configs.stylistic,
  svelte.configs.recommended,

  {
    files: ['.husky/install.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
        },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },

  {
    plugins: {
      'simple-import-sort': simpleImportStort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
);
