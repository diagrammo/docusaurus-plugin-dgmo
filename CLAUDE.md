# docusaurus-plugin-dgmo

Docusaurus 3 wrapper around `remark-dgmo`. Unlike the other wrappers this ships **two separate things**, and confusing them is the usual mistake:

- `src/config.ts` — `defineConfig(config, options?)`, an async wrapper that does the actual wiring: sets `markdown.format = 'md'`, adds the plugin to `plugins[]`, and prepends `remarkDgmo` into every classic-preset slot (`docs`/`blog`/`pages`) plus any standalone `@docusaurus/plugin-content-*` entry. Idempotent.
- `src/index.ts` — the Docusaurus plugin itself. It **does not** inject the remark plugin (Docusaurus has no hook for mutating a sibling preset's options — see ADR-3); it only registers client modules and a webpack fallback.

Shared wrapper contract: [`../remark-dgmo/WRAPPER-CONVENTIONS.md`](../remark-dgmo/WRAPPER-CONVENTIONS.md). `remark-dgmo` publishes to npm before this does — the workspace CLAUDE.md has the order.

## Versions — read `package.json`

- `remark-dgmo` `^0.11.0` (in step with astro-dgmo)
- peers: `@diagrammo/dgmo` `>=0.57.0 <1`, `@docusaurus/core` `^3.0.0`
- Caret on a `0.x` dep pins the **minor** — a `remark-dgmo` minor needs an explicit bump here
- The `@diagrammo/dgmo` peer floor tracks **remark-dgmo's own peer floor**. `remark-dgmo@0.11.0` imports dgmo subpaths (`./cloud-reference`) that first exist in 0.57.0, so a lower floor here would advertise compatibility our own dependency rules out. npm cannot catch that — nothing validates a peer range against your dependencies' peers. Move the `devDependencies` copy in lockstep, or the tests install a dgmo the floor forbids

## Host specifics

- **Config runs under jiti, in a CJS-ish vm context.** `import.meta` is a syntax error there, so `src/index.ts` declares and uses `require.resolve`. Don't "modernize" it to `import.meta.resolve`.
- **`markdown.format = 'md'` is the default path**, because remark-dgmo emits raw `html` mdast nodes and MDX rejects them (`Cannot handle unknown node "raw"`). `defineConfig(..., { mdx: true })` is the other path: forwards `mdx: true` to remark-dgmo and leaves `markdown.format` alone.
- **CSS arrives as a `<link>`** via `getClientModules()`, which also registers this package's own `styles/docusaurus.css` — that file exists to neutralize the chrome Docusaurus's MDXComponents mapping paints onto the showcase source panel in `md` mode. `build` copies it into `dist/` and `postbuild` asserts it landed.
- `src/docusaurus-client.ts` re-exports `bindDgmo` as `onRouteDidUpdate`, keeping Docusaurus vocabulary out of `remark-dgmo`.
- `configureWebpack` sets `jsdom`/`fs`/`canvas` to `false` on the client build — belt-and-suspenders against dgmo's Node-side DOM import.

## Verify

`pnpm build` must run **before** typecheck/tests: the fixture-config test imports `tests/fixture/docusaurus.config.ts`, which self-imports this package through its export map. CI stubs the `tests/fixture/node_modules/docusaurus-plugin-dgmo` symlink rather than doing a fixture install.

`pnpm test:e2e` (webpack) is **enabled** in `ci.yml`; the Rspack variant stays commented out pending `@docusaurus/faster` wiring. ⚠️ `tests/fixture/README.md` still claims e2e is disabled over an SSG `resolveWeak` bug — that was fixed (it was `"type": "module"` in the fixture) and the README is stale.

`pages.yml` builds the separate top-level `showcase/` directory against **published** npm packages, not `tests/fixture/` — the only wrapper that splits the two.
