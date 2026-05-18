import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import pluginDgmo from '../src/index.js';

const MOCK_CTX = {} as never;

describe('docusaurus-plugin-dgmo (AC-DC1, AC-DC4)', () => {
  it('returns a plugin object with the right name', () => {
    const plugin = pluginDgmo(MOCK_CTX);
    expect(plugin.name).toBe('docusaurus-plugin-dgmo');
  });

  it('getClientModules returns two existing files (CSS + client JS)', () => {
    const plugin = pluginDgmo(MOCK_CTX);
    const modules = plugin.getClientModules!();
    expect(modules).toHaveLength(2);
    for (const m of modules) {
      expect(typeof m).toBe('string');
      // Must be an absolute path (output of fileURLToPath).
      expect(m.startsWith('/')).toBe(true);
      // The file must exist on disk — both remark-dgmo and this package were
      // built by `pretest`, so these are reachable.
      expect(existsSync(m), `${m} should exist on disk`).toBe(true);
      expect(statSync(m).isFile()).toBe(true);
    }
    // One should be the CSS, one the JS.
    expect(modules.some((m) => m.endsWith('.css'))).toBe(true);
    expect(modules.some((m) => m.endsWith('.js'))).toBe(true);
  });

  it('configureWebpack returns {} for isServer=true', () => {
    const plugin = pluginDgmo(MOCK_CTX);
    const out = (
      plugin.configureWebpack as (config: unknown, isServer: boolean) => unknown
    )({}, true);
    expect(out).toEqual({});
  });

  it('configureWebpack returns jsdom-fallback config for isServer=false', () => {
    const plugin = pluginDgmo(MOCK_CTX);
    const out = (
      plugin.configureWebpack as (config: unknown, isServer: boolean) => unknown
    )({}, false);
    expect(out).toEqual({
      resolve: { fallback: { jsdom: false, fs: false, canvas: false } },
    });
  });
});
