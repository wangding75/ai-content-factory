import path from 'node:path';
import { defineConfig } from 'vitest/config';

const scriptsPath = path.resolve(__dirname, 'scripts');

export default defineConfig({
  test: {
    include: ['scripts/**/*.test.ts'],
    globals: true,
    environment: 'node',
    env: {
      PATH: `${scriptsPath}${path.delimiter}${process.env.PATH ?? ''}`,
    },
  },
});
