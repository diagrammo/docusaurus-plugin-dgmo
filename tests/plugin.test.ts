import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import pluginDgmo from '../src/index.js';

const MOCK_CTX = {} as never;

describe('docusaurus-plugin-dgmo (AC-DC1, AC-DC4)', () => {
  it('returns a plugin object with the right name', () => {
    const plugin = pluginDgmo(MOCK_CTX);
    expect(plugin.name).toBe('docusaurus-plugin-dgmo');
  });

  it('getClientModules returns three existing files (2× CSS + client JS)', () => {
    const plugin = pluginDgmo(MOCK_CTX);
    const modules = plugin.getClientModules!();
    expect(modules).toHaveLength(3);
    for (const m of modules) {
      expect(typeof m).toBe('string');
      // Must be an absolute path (output of fileURLToPath).
      expect(m.startsWith('/')).toBe(true);
      // The file must exist on disk — both remark-dgmo and this package were
      // built by `pretest`, so these are reachable.
      expect(existsSync(m), `${m} should exist on disk`).toBe(true);
      expect(statSync(m).isFile()).toBe(true);
    }
    // Shared block CSS + the Docusaurus chrome-neutralizing CSS + the JS.
    expect(modules.filter((m) => m.endsWith('.css'))).toHaveLength(2);
    expect(modules.some((m) => m.endsWith('docusaurus.css'))).toBe(true);
    expect(modules.some((m) => m.endsWith('.js'))).toBe(true);
  });

  it('leaves the browser renderer out by default', () => {
    const plugin = pluginDgmo(MOCK_CTX);
    const modules = plugin.getClientModules!();
    expect(modules.some((m) => m.includes('render-client'))).toBe(false);
  });

  it('adds the browser renderer when liveLink.refresh is render', () => {
    const plugin = pluginDgmo(MOCK_CTX, {
      liveLink: { refresh: 'render' },
    });
    const modules = plugin.getClientModules!();
    expect(modules).toHaveLength(4);
    const renderer = modules.find((m) => m.includes('render-client'));
    expect(renderer, 'the render client should be registered').toBeDefined();
    expect(existsSync(renderer!)).toBe(true);
  });

  it('leaves the browser renderer out when liveLink.refresh is notify', () => {
    const plugin = pluginDgmo(MOCK_CTX, { liveLink: { refresh: 'notify' } });
    expect(plugin.getClientModules!()).toHaveLength(3);
  });

  it('configureWebpack returns {} for isServer=true', () => {
    const plugin = pluginDgmo(MOCK_CTX);
    const out = (
      plugin.configureWebpack as (config: unknown, isServer: boolean) => unknown
    )({}, true);
    expect(out).toEqual({});
  });

  // `url` and `path` are here because `refresh: 'render'` pulls the renderer
  // into the client bundle, and webpack 5 fails a build on an unpolyfilled node
  // built-in rather than shipping it. Losing either breaks that build with a
  // message about polyfills that says nothing about live links.
  it('returns node-builtin fallbacks for the client bundle', () => {
    const plugin = pluginDgmo(MOCK_CTX);
    const out = (
      plugin.configureWebpack as (config: unknown, isServer: boolean) => unknown
    )({}, false);
    expect(out).toEqual({
      resolve: {
        fallback: {
          jsdom: false,
          fs: false,
          canvas: false,
          url: false,
          path: false,
        },
      },
    });
  });
});
