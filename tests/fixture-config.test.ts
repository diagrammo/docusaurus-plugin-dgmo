import { describe, it, expect } from 'vitest';
import remarkDgmo from 'remark-dgmo';

// Integration test: load the actual fixture config via the new defineConfig
// path and assert the resulting object has the remark plugin and the
// docusaurus-plugin-dgmo wired correctly. Independent of any Docusaurus
// build step — sidesteps SSG-time regressions in the host Node version.
describe('tests/fixture/docusaurus.config.ts (defineConfig integration)', () => {
  it('exports a resolved config with dgmo fully wired', async () => {
    // Bypass tsconfig.json's `exclude: ['tests/fixture/**']` by importing
    // the file as a raw module — tsx-compatible since vitest transforms it.
    const mod = await import('./fixture/docusaurus.config.ts');
    const resolved = await mod.default;

    expect(resolved.title).toBe('dgmo fixture');
    expect(resolved.markdown?.format).toBe('md');
    expect(resolved.plugins).toContain('docusaurus-plugin-dgmo');

    const classic = resolved.presets?.[0] as [string, Record<string, any>];
    expect(classic[0]).toBe('classic');
    expect(classic[1].docs.path).toBe('docs');
    expect(classic[1].docs.remarkPlugins[0]).toBe(remarkDgmo);
    // Disabled slots remain disabled.
    expect(classic[1].blog).toBe(false);
    expect(classic[1].pages).toBe(false);
  });
});
