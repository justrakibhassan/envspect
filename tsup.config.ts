import { defineConfig } from 'tsup';

export default defineConfig([
  // CLI binary
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    target: 'node20',
    clean: true,
    shims: true,
    sourcemap: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  // Programmatic API
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    target: 'node20',
    dts: true,
    sourcemap: true,
  },
]);
