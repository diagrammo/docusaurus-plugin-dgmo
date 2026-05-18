import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/fixture/**', 'tests/**/fixture-build.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/**/*.d.ts'],
      reporter: ['text-summary'],
      // Floor 2 pts below 2026-05-17 baseline.
      // Baseline: lines 96, statements 95, branches 89, functions 100.
      thresholds: {
        lines: 94,
        statements: 93,
        branches: 87,
        functions: 98,
      },
    },
  },
});
