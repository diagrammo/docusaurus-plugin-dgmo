import { describe, it, expect } from 'vitest';
import type { Config } from '@docusaurus/types';
import { defineConfig } from '../src/config.js';
import remarkDgmo from 'remark-dgmo';

// Minimal Docusaurus config builder for tests.
const base = (overrides: Partial<Config> = {}): Config => ({
  title: 'Test',
  url: 'https://example.test',
  baseUrl: '/',
  ...overrides,
});

describe('defineConfig', () => {
  it('adds the plugin and sets markdown.format=md on a bare config', async () => {
    const out = await defineConfig(base());
    expect(out.markdown?.format).toBe('md');
    expect(out.plugins).toContain('docusaurus-plugin-dgmo');
  });

  it('accepts an async factory', async () => {
    const out = await defineConfig(async () => base({ title: 'Async' }));
    expect(out.title).toBe('Async');
    expect(out.plugins).toContain('docusaurus-plugin-dgmo');
  });

  it('respects an explicit markdown.format', async () => {
    const out = await defineConfig(
      base({ markdown: { format: 'mdx' } as Config['markdown'] })
    );
    expect(out.markdown?.format).toBe('mdx');
  });

  it('skipMarkdownFormat leaves markdown.format unset', async () => {
    const out = await defineConfig(base(), { skipMarkdownFormat: true });
    expect(out.markdown?.format).toBeUndefined();
  });

  it('injects remark-dgmo into classic preset docs/blog/pages slots', async () => {
    const out = await defineConfig(
      base({
        presets: [
          [
            'classic',
            {
              docs: { path: 'docs' },
              blog: { path: 'blog' },
              pages: {},
            },
          ],
        ],
      })
    );
    const preset = out.presets?.[0] as [string, Record<string, any>];
    expect(preset[1]['docs'].remarkPlugins[0]).toBe(remarkDgmo);
    expect(preset[1]['blog'].remarkPlugins[0]).toBe(remarkDgmo);
    expect(preset[1]['pages'].remarkPlugins[0]).toBe(remarkDgmo);
    // The user's existing fields are preserved.
    expect(preset[1]['docs'].path).toBe('docs');
  });

  it('handles missing slots — creates remarkPlugins entry on empty preset opts', async () => {
    const out = await defineConfig(
      base({ presets: [['classic', {}]] })
    );
    const preset = out.presets?.[0] as [string, Record<string, any>];
    expect(preset[1]['docs'].remarkPlugins[0]).toBe(remarkDgmo);
    expect(preset[1]['blog'].remarkPlugins[0]).toBe(remarkDgmo);
    expect(preset[1]['pages'].remarkPlugins[0]).toBe(remarkDgmo);
  });

  it('skips slots disabled with `false`', async () => {
    const out = await defineConfig(
      base({
        presets: [
          ['classic', { docs: { path: 'docs' }, blog: false, pages: false }],
        ],
      })
    );
    const preset = out.presets?.[0] as [string, Record<string, any>];
    expect(preset[1]['docs'].remarkPlugins[0]).toBe(remarkDgmo);
    expect(preset[1]['blog']).toBe(false);
    expect(preset[1]['pages']).toBe(false);
  });

  it('prepends without losing existing remarkPlugins', async () => {
    const otherPlugin = () => () => {};
    const out = await defineConfig(
      base({
        presets: [
          ['classic', { docs: { remarkPlugins: [otherPlugin] } }],
        ],
      })
    );
    const preset = out.presets?.[0] as [string, Record<string, any>];
    expect(preset[1]['docs'].remarkPlugins).toHaveLength(2);
    expect(preset[1]['docs'].remarkPlugins[0]).toBe(remarkDgmo);
    expect(preset[1]['docs'].remarkPlugins[1]).toBe(otherPlugin);
  });

  it('does not duplicate remark-dgmo when re-run on the same config', async () => {
    const once = await defineConfig(
      base({ presets: [['classic', { docs: {} }]] })
    );
    const twice = await defineConfig(once);
    const preset = twice.presets?.[0] as [string, Record<string, any>];
    expect(
      preset[1]['docs'].remarkPlugins.filter((p: unknown) => p === remarkDgmo)
    ).toHaveLength(1);
    expect(
      twice.plugins?.filter(p => p === 'docusaurus-plugin-dgmo')
    ).toHaveLength(1);
  });

  it('ignores unknown presets (no docs/blog/pages slots assumed)', async () => {
    const out = await defineConfig(
      base({ presets: [['some-other-preset', { foo: 'bar' }]] as any })
    );
    const preset = out.presets?.[0] as [string, Record<string, any>];
    expect(preset[1]['foo']).toBe('bar');
    expect(preset[1]['docs']).toBeUndefined();
  });

  it('handles the @docusaurus/preset-classic alias', async () => {
    const out = await defineConfig(
      base({
        presets: [['@docusaurus/preset-classic', { docs: {} }]],
      })
    );
    const preset = out.presets?.[0] as [string, Record<string, any>];
    expect(preset[1]['docs'].remarkPlugins[0]).toBe(remarkDgmo);
  });

  it('injects into standalone @docusaurus/plugin-content-docs entries', async () => {
    const out = await defineConfig(
      base({
        plugins: [['@docusaurus/plugin-content-docs', { id: 'extra' }]],
      })
    );
    const docsPlugin = out.plugins?.find(
      p => Array.isArray(p) && p[0] === '@docusaurus/plugin-content-docs'
    ) as [string, any];
    expect(docsPlugin[1].id).toBe('extra');
    expect(docsPlugin[1].remarkPlugins[0]).toBe(remarkDgmo);
  });

  it('forwards dgmo options to the remark plugin', async () => {
    const out = await defineConfig(base({ presets: [['classic', { docs: {} }]] }), {
      dgmo: { palette: 'catppuccin' },
    });
    const preset = out.presets?.[0] as [string, Record<string, any>];
    const entry = preset[1]['docs'].remarkPlugins[0];
    // Tuple form: [plugin, options]
    expect(Array.isArray(entry)).toBe(true);
    expect(entry[0]).toBe(remarkDgmo);
    expect(entry[1]).toEqual({ palette: 'catppuccin' });
  });

  it('mdx: true sets dgmo.mdx and leaves markdown.format untouched', async () => {
    const out = await defineConfig(
      base({ presets: [['classic', { docs: {} }]] }),
      { mdx: true }
    );
    expect(out.markdown?.format).toBeUndefined();
    const preset = out.presets?.[0] as [string, Record<string, any>];
    const entry = preset[1]['docs'].remarkPlugins[0];
    expect(Array.isArray(entry)).toBe(true);
    expect(entry[0]).toBe(remarkDgmo);
    expect(entry[1]).toEqual({ mdx: true });
  });

  it('mdx: true merges with explicit dgmo options', async () => {
    const out = await defineConfig(
      base({ presets: [['classic', { docs: {} }]] }),
      { mdx: true, dgmo: { palette: 'catppuccin' } }
    );
    const preset = out.presets?.[0] as [string, Record<string, any>];
    const entry = preset[1]['docs'].remarkPlugins[0];
    expect(entry[1]).toEqual({ palette: 'catppuccin', mdx: true });
  });
});
