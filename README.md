# docusaurus-plugin-dgmo

Render [DGMO](https://diagrammo.app) diagrams from `` ```dgmo `` fenced code blocks in your Docusaurus site at build time. Powered by [`@diagrammo/dgmo`](https://www.npmjs.com/package/@diagrammo/dgmo) and the framework-agnostic [`remark-dgmo`](https://www.npmjs.com/package/remark-dgmo) core. Zero client JavaScript by default.

Every diagram is rendered twice at build time (light + dark palettes) and follows the Docusaurus color-mode toggle via shipped CSS.

## Install

```bash
pnpm add docusaurus-plugin-dgmo @diagrammo/dgmo
```

`@diagrammo/dgmo` is a peer dependency. Node 20.6+. **ESM only.** Your `docusaurus.config.js` must be `.mjs`/`.ts`/`.mts`, or your `package.json` must have `"type": "module"`.

## Configure

Two things go into `docusaurus.config.ts`. The plugin handles asset registration; the remark plugin gets wired into each preset slot manually (Docusaurus's plugin API has no hook to auto-inject into a sibling preset).

```ts
// docusaurus.config.ts
import type { Config } from '@docusaurus/types';

const dgmoRemark = async () =>
  (await import('docusaurus-plugin-dgmo/remark')).default;

const config: Config = {
  // …
  plugins: ['docusaurus-plugin-dgmo'],
  presets: [
    [
      'classic',
      {
        docs: {
          remarkPlugins: [await dgmoRemark()],
        },
        blog: {
          remarkPlugins: [await dgmoRemark()],
        },
        pages: {
          remarkPlugins: [await dgmoRemark()],
        },
      },
    ],
  ],
};

export default config;
```

The plugin's `getClientModules()` registers two assets:

- `remark-dgmo/client.css` — three rules that hide the wrong-mode SVG based on `[data-theme="dark"]` (Docusaurus's color-mode signal on `<html>`).
- A small client script (~1.5 KB) that tightens each diagram's `viewBox` to its content bounds and binds showcase-mode copy buttons. The script registers an `onRouteDidUpdate` hook, so it fires on every SPA route change.

## Use

Drop a fenced block with the language `dgmo` into any `.md` or `.mdx` file in your `docs/`, `blog/`, or `pages/` directory (whichever slots you wired above):

````markdown
```dgmo
chart: sequence
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
chart: sequence
A -> B
```
````

See the [`remark-dgmo` README](https://github.com/diagrammo/remark-dgmo) for the full option matrix.

## Custom color-mode selector

The shipped `remark-dgmo/client.css` keys on `[data-theme="dark"]` — the convention Docusaurus uses. For sites with a custom toggle that signals dark mode via `.dark` or some other selector, see the "Custom color-mode selector" section in the `remark-dgmo` README.

## How it works

1. The plugin registers `remark-dgmo`'s CSS and a Docusaurus-shaped client wrapper via `getClientModules()`.
2. You wire `remarkPlugins: [(await import('docusaurus-plugin-dgmo/remark')).default]` into the preset slots you want diagrams in.
3. At build time, the remark plugin walks the mdast, finds `` ```dgmo `` blocks, calls `render()` from `@diagrammo/dgmo` once per theme under default `colorMode: 'auto'`, and replaces the block with an `html` node carrying the rendered wrappers.
4. The client script tightens each SVG's `viewBox` after every route change.

All rendering happens at build time. The browser ships only the inline SVG + the small CSS rules.

## License

MIT
