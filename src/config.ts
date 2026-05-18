import type { Config, PluginConfig, PresetConfig } from '@docusaurus/types';
import type { DgmoOptions } from 'remark-dgmo';

/**
 * Public type so users can wrap an async config factory:
 *   `export default defineConfig(async () => ({ … }))`
 */
export type DefineConfigInput = Config | (() => Config | Promise<Config>);

export interface DefineConfigOptions {
  /** Options forwarded to `remark-dgmo` (palette, theme, className, etc.). */
  dgmo?: DgmoOptions;
  /**
   * Build for MDX-format pipelines.
   *
   * Docusaurus 3 parses every `.md`/`.mdx` file through MDX by default, but
   * raw `html` mdast nodes (what remark-dgmo emits in its default mode) are
   * rejected by MDX with `Cannot handle unknown node "raw"`. Two paths:
   *
   *   - `mdx: false` (default): force `markdown.format = 'md'` if the user
   *     hasn't set it. Pure-markdown parsing, no JSX — but raw html nodes
   *     accepted.
   *   - `mdx: true`: forward `mdx: true` to remark-dgmo so it emits an
   *     `mdxJsxFlowElement` instead. Leaves `markdown.format` alone (so the
   *     site uses Docusaurus's default `'mdx'`) and unlocks JSX, frontmatter
   *     React imports, etc. alongside dgmo blocks.
   */
  mdx?: boolean;
  /**
   * Escape hatch: skip the auto-set of `markdown.format = 'md'` even in
   * non-MDX mode. Only set this if you're wiring `rehype-raw` (or similar)
   * yourself to make MDX accept raw HTML nodes.
   */
  skipMarkdownFormat?: boolean;
}

const PLUGIN_NAME = 'docusaurus-plugin-dgmo';
const CLASSIC_PRESET_NAMES = new Set(['classic', '@docusaurus/preset-classic']);
const CONTENT_PLUGIN_NAMES = new Set([
  '@docusaurus/plugin-content-docs',
  '@docusaurus/plugin-content-blog',
  '@docusaurus/plugin-content-pages',
]);

type RemarkPlugin = unknown;
type ContentOptions = {
  remarkPlugins?: RemarkPlugin[];
  [key: string]: unknown;
};

/**
 * Wrap a Docusaurus config so `docusaurus-plugin-dgmo` is fully wired with
 * one line of glue. Equivalent to manually:
 *
 *   - importing `remark-dgmo` (async — it's ESM-only)
 *   - setting `markdown.format = 'md'`
 *   - prepending the remark plugin into every preset slot (docs/blog/pages)
 *     and into any standalone `@docusaurus/plugin-content-*` entry
 *   - adding `'docusaurus-plugin-dgmo'` to `plugins[]`
 *
 * Returns `Promise<Config>`; Docusaurus accepts a promise as the default
 * config export, so:
 *
 *   export default defineConfig({ title: 'My Docs', presets: [['classic', {…}]] });
 *
 * is the entire integration.
 */
export async function defineConfig(
  input: DefineConfigInput,
  options: DefineConfigOptions = {}
): Promise<Config> {
  const remarkDgmoModule = await import('remark-dgmo');
  const remarkDgmo = remarkDgmoModule.default;

  // In MDX mode, forward `mdx: true` to remark-dgmo so it emits an
  // mdxJsxFlowElement (a `<div dangerouslySetInnerHTML={…}/>` wrapper) that
  // MDX accepts. Merge with any user-provided dgmo options.
  const dgmoOptions: DgmoOptions | undefined =
    options.mdx || options.dgmo
      ? { ...options.dgmo, ...(options.mdx ? { mdx: true } : null) }
      : undefined;
  const remarkInstance: unknown = dgmoOptions
    ? [remarkDgmo, dgmoOptions]
    : remarkDgmo;

  const config = await resolveInput(input);

  // MDX mode: leave `markdown.format` alone — Docusaurus's default is 'mdx',
  // which is exactly what we want. The user can still override.
  // Non-MDX mode: force `markdown.format = 'md'` so raw html mdast nodes
  // survive (MDX rejects them with `Cannot handle unknown node "raw"`).
  if (!options.skipMarkdownFormat && !options.mdx) {
    const markdown = (config.markdown ?? {}) as Record<string, unknown>;
    if (markdown['format'] === undefined) markdown['format'] = 'md';
    config.markdown = markdown as Config['markdown'];
  }

  if (!hasPlugin(config.plugins, PLUGIN_NAME)) {
    config.plugins = [...(config.plugins ?? []), PLUGIN_NAME];
  }

  if (Array.isArray(config.presets)) {
    config.presets = config.presets.map((preset) =>
      preset ? injectIntoPreset(preset as PresetConfig, remarkInstance) : preset
    );
  }
  if (Array.isArray(config.plugins)) {
    config.plugins = config.plugins.map((plugin) =>
      plugin
        ? injectIntoStandaloneContentPlugin(
            plugin as PluginConfig,
            remarkInstance
          )
        : plugin
    );
  }

  return config;
}

async function resolveInput(input: DefineConfigInput): Promise<Config> {
  if (typeof input === 'function') {
    return await input();
  }
  return input;
}

function hasPlugin(
  plugins: Config['plugins'] | undefined,
  name: string
): boolean {
  if (!Array.isArray(plugins)) return false;
  return plugins.some((p) => entryName(p) === name);
}

function entryName(entry: unknown): string | null {
  if (typeof entry === 'string') return entry;
  if (Array.isArray(entry) && typeof entry[0] === 'string') return entry[0];
  return null;
}

function injectIntoPreset(
  preset: PresetConfig,
  remarkInstance: RemarkPlugin
): PresetConfig {
  if (!Array.isArray(preset)) return preset;
  const [name, opts] = preset;
  if (typeof name !== 'string' || !CLASSIC_PRESET_NAMES.has(name)) {
    return preset;
  }
  const next = { ...((opts as Record<string, unknown>) ?? {}) };
  for (const slot of ['docs', 'blog', 'pages'] as const) {
    next[slot] = injectIntoContentSlot(next[slot], remarkInstance);
  }
  return [name, next] as PresetConfig;
}

function injectIntoStandaloneContentPlugin(
  plugin: PluginConfig,
  remarkInstance: RemarkPlugin
): PluginConfig {
  if (!Array.isArray(plugin)) return plugin;
  const [name, opts] = plugin;
  if (typeof name !== 'string' || !CONTENT_PLUGIN_NAMES.has(name)) {
    return plugin;
  }
  const injected = injectIntoContentSlot(opts, remarkInstance);
  return [name, injected as Record<string, unknown>] as PluginConfig;
}

function injectIntoContentSlot(
  slot: unknown,
  remarkInstance: RemarkPlugin
): unknown {
  if (slot === false) return slot;
  const opts: ContentOptions =
    slot && typeof slot === 'object' ? { ...(slot as ContentOptions) } : {};
  const existing = Array.isArray(opts.remarkPlugins) ? opts.remarkPlugins : [];
  if (existing.includes(remarkInstance)) return opts;
  opts.remarkPlugins = [remarkInstance, ...existing];
  return opts;
}
