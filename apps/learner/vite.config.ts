import { copyFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin, type ResolvedConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss(), prismaQueryEngine()],
});

/**
 * A `vite` plugin to copy the `prisma` query engine binary file to the build directory.
 */
function prismaQueryEngine(): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'prisma:query:engine',
    apply: 'build',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    closeBundle() {
      if (!config.build.ssr) {
        return;
      }

      const generatedDir = join(process.cwd(), 'src/generated');
      const buildDir = join(process.cwd(), 'build/server/chunks');

      // Find the query engine binary file.
      const files = readdirSync(generatedDir);
      const queryEngineFile = files.find(
        (file) => file.startsWith('libquery_engine') && file.endsWith('.node'),
      );

      if (!queryEngineFile) {
        throw new Error(
          'Query engine binary file not found! Have you run `pnpm db:generate` in the root directory?',
        );
      }

      copyFileSync(join(generatedDir, queryEngineFile), join(buildDir, queryEngineFile));
    },
  };
}
