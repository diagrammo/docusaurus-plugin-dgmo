// Placeholder — the real fixture build runs as a `pnpm test:e2e` script
// (see package.json), not as a regular vitest run. This file exists so
// `vitest --include 'tests/**/*.test.ts'` doesn't expand to nothing and so
// CI can find the fixture-build invariant if it's swapped to a unit test in
// the future. Excluded from the default test run via vitest.config.ts.
import { describe, it } from 'vitest';

describe('fixture build (AC-DC2, AC-CM3, AC-DC3, AC-DC4)', () => {
  it.skip('runs via `pnpm test:e2e` — see scripts/assert-build-output.mjs', () => {});
});
