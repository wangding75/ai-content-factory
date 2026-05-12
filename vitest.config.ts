import path from 'node:path';
import { defineConfig } from 'vitest/config';

const scriptsPath = path.resolve(__dirname, 'scripts');

export default defineConfig({
  test: {
    include: [
      'scripts/**/*.test.ts',
      'apps/api-server/src/**/*.test.ts',
      'apps/web-admin/src/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      'packages/core/src/**/*.test.ts',
      'packages/shared/src/**/*.test.ts',
      'packages/content-packs/*/src/**/*.test.ts',
      'packages/platform-adapters/*/src/**/*.test.ts',
    ],
    globals: true,
    environment: 'node',
    setupFiles: ['./apps/api-server/src/test-setup.ts'],
    env: {
      PATH: `${scriptsPath}${path.delimiter}${process.env.PATH ?? ''}`,
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
});
