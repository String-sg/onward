import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';

export default {
  plugins: [svelteTesting(), sveltekit()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      enabled: true,
      include: ['src/**/*.{ts,js,svelte}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,js}',
        'src/**/*.d.ts',
        'src/app.html',
        'src/generated/**/*',
      ],
    },
  },
};
