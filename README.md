# docusaurus-plugin-dgmo

Render [DGMO](https://diagrammo.app) diagrams from `` ```dgmo `` fenced code blocks in your Docusaurus site at build time. Powered by [`@diagrammo/dgmo`](https://www.npmjs.com/package/@diagrammo/dgmo) and the framework-agnostic [`remark-dgmo`](https://www.npmjs.com/package/remark-dgmo) core. Zero client JavaScript by default.

Every diagram is rendered twice at build time (light + dark palettes) and follows the Docusaurus color-mode toggle via shipped CSS.

## Install

```bash
pnpm add docusaurus-plugin-dgmo @diagrammo/dgmo
```

`@diagrammo/dgmo` is a peer dependency. Node 20.6+. **ESM only.** Your `docusaurus.config.js` must be `.mjs`/`.ts`/`.mts`, or your `package.json` must have `"type": "module"`.

## Configure

Wrap your `docusaurus.config.ts` with `defineConfig`. The helper injects the remark plugin into your classic preset's docs/blog/pages slots, sets `markdown.format = 'md'` (raw-HTML output is incompatible with MDX), and registers `docusaurus-plugin-dgmo`. Nothing else to wire.

```ts
// docusaurus.config.ts
import { defineConfig } from 'docusaurus-plugin-dgmo/config';

export default defineConfig({
  title: 'My Docs',
  url: 'https://example.com',
  baseUrl: '/',
  presets: [
    [
      'classic',
      {
        docs: { sidebarPath: './sidebars.ts' },
        blog: { showReadingTime: true },
      },
    ],
  ],
});
```

That's the whole integration. `defineConfig` returns `Promise<Config>`; Docusaurus accepts a promise as the default config export.

Pass remark-dgmo options as a second argument:

```ts
export default defineConfig(
  { /* …config… */ },
  { dgmo: { palette: 'catppuccin', colorMode: 'auto' } }
);
```

The plugin's `getClientModules()` registers two assets:

- `remark-dgmo/client.css` — three rules that hide the wrong-mode SVG based on `[data-theme="dark"]` (Docusaurus's color-mode signal on `<html>`).
- A small client script (~1.5 KB) that tightens each diagram's `viewBox` to its content bounds and binds showcase-mode copy buttons. The script registers an `onRouteDidUpdate` hook, so it fires on every SPA route change.

## Use

Drop a fenced block with the language `dgmo` into any `.md` file in your `docs/`, `blog/`, or `pages/` directory (whichever slots you wired above). MDX files aren't supported without an additional `rehype-raw`-style adapter — the `markdown: { format: 'md' }` setting above forces every file through the markdown parser.

````markdown
```dgmo
sequence
Client -POST /login-> API
API -validate-> Auth
Auth -JWT-> API
API -200 OK-> Client
```
````

## Per-block overrides

Append options to the fence info string. Tokens are space-separated; values may be quoted.

````markdown
```dgmo showcase title="Login flow" palette=catppuccin colorMode=light
sequence
A -> B
```
````

See the [`remark-dgmo` README](https://github.com/diagrammo/remark-dgmo) for the full option matrix.

## Working reference site

[`tests/fixture/`](./tests/fixture/) is a complete minimal Docusaurus 3 site running this plugin. It's the smallest correct configuration we know of, with all the non-obvious gotchas (async-function config export, `markdown: { format: 'md' }`, `future.faster`) called out inline. Copy [`tests/fixture/docusaurus.config.ts`](./tests/fixture/docusaurus.config.ts) as a template for your own site.

```bash
git clone https://github.com/diagrammo/docusaurus-plugin-dgmo
cd docusaurus-plugin-dgmo
pnpm install && pnpm build
cd tests/fixture && pnpm install --no-frozen-lockfile && pnpm exec docusaurus start
```

Opens at http://localhost:3000 with four example diagrams (plain auto, colored tag sequence, showcase mode, per-block override). See [`tests/fixture/README.md`](./tests/fixture/README.md) for details.

## Custom color-mode selector

The shipped `remark-dgmo/client.css` keys on `[data-theme="dark"]` — the convention Docusaurus uses. For sites with a custom toggle that signals dark mode via `.dark` or some other selector, see the "Custom color-mode selector" section in the `remark-dgmo` README.

## How it works

1. `defineConfig` is an async helper that dynamically imports the ESM-only `remark-dgmo` plugin, then injects it into every `docs` / `blog` / `pages` slot in your classic preset (or any standalone `@docusaurus/plugin-content-*` entry), sets `markdown.format = 'md'`, and adds `'docusaurus-plugin-dgmo'` to `plugins[]`.
2. The plugin itself registers `remark-dgmo`'s CSS and a Docusaurus-shaped client wrapper via `getClientModules()`.
3. At build time, the remark plugin walks the mdast, finds `` ```dgmo `` blocks, calls `render()` from `@diagrammo/dgmo` once per theme under default `colorMode: 'auto'`, and replaces the block with an `html` node carrying the rendered wrappers.
4. The client script tightens each SVG's `viewBox` after every route change.

All rendering happens at build time. The browser ships only the inline SVG + the small CSS rules.

## Manual setup (advanced)

If `defineConfig` doesn't fit (custom preset, deeply dynamic config, you need to inspect the wiring), do it by hand:

```ts
// docusaurus.config.ts
import type { Config } from '@docusaurus/types';

export default async function createConfig(): Promise<Config> {
  const remarkDgmo = (await import('docusaurus-plugin-dgmo/remark')).default;
  return {
    // …
    markdown: { format: 'md' },
    plugins: ['docusaurus-plugin-dgmo'],
    presets: [
      ['classic', {
        docs:  { remarkPlugins: [remarkDgmo] },
        blog:  { remarkPlugins: [remarkDgmo] },
        pages: { remarkPlugins: [remarkDgmo] },
      }],
    ],
  };
}
```

The async-function default export is required because `remark-dgmo` is ESM-only and the jiti loader Docusaurus uses to read the config rejects top-level `await` in a sync default export.

## License

MIT
