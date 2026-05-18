# `tests/fixture/` — working Docusaurus 3 + dgmo reference

A minimal Docusaurus 3.10 site wired with `docusaurus-plugin-dgmo` and
`remark-dgmo`. Two purposes:

1. **Consumer copy-paste template.** If you want to use this plugin in
   your own Docusaurus site, [`docusaurus.config.ts`](./docusaurus.config.ts)
   is the smallest working configuration. The settings here cover three
   non-obvious gotchas that bit us during the v0.1 smoke test:
   - **Async-function default export.** `docusaurus-plugin-dgmo/remark`
     is ESM-only. A sync default export with top-level `await` fails
     under the jiti loader Docusaurus uses to read the config; an async
     function wrapper works.
   - **`markdown: { format: 'md' }`.** Required. The remark plugin emits
     raw HTML AST nodes; Docusaurus 3 routes every `.md`/`.mdx` file
     through MDX by default, and MDX rejects raw nodes with
     `Cannot handle unknown node 'raw'`. Forcing pure-markdown
     (CommonMark) bypasses that.
   - **`future.faster` (not `experimental_faster`).** Renamed in
     Docusaurus 3.10.

2. **Test fixture for plugin development.** [`docs/diagrams.md`](./docs/diagrams.md)
   exercises four shapes:
   - Plain block under `colorMode: 'auto'` — dual-render with the
     navbar toggle swapping between the two SVGs
   - Colored sequence diagram with `tag` blocks — exercises palette
     color resolution
   - Showcase mode — diagram + collapsible source + open-in-editor +
     copy
   - Per-block override — single-render, alternate palette

## Running it

The fixture lives outside the parent repo's pnpm install so it can use
its own lockfile and `link:../..` dep on the plugin source.

```bash
# from the parent docusaurus-plugin-dgmo repo root
pnpm build                                      # build the plugin
cd tests/fixture
pnpm install --no-frozen-lockfile               # link: deps require non-frozen
pnpm exec docusaurus start                      # opens http://localhost:3000
```

## CI status — `pnpm test:e2e` is currently disabled

The plugin's CI workflow has the fixture build (`pnpm test:e2e` + its
Rspack variant) commented out at the moment. Webpack and Rspack both
compile successfully, but Docusaurus 3.10.1's SSG runtime hits two
cascading bugs on Node 22/24/25:

1. `@docusaurus/core/lib/ssg/ssgNodeRequire.js` builds a fake
   `require()` for the eval'd server bundle that forwards `.resolve`,
   `.cache`, `.extensions`, `.main` — but not `.resolveWeak`. The
   auto-generated `registry.js` calls `require.resolveWeak(...)` at
   module-eval time and aborts with `TypeError: require.resolveWeak is
not a function`.
2. After fixing (1) locally we hit a second bug: the server bundle
   eagerly `require()`s raw CSS files (e.g. `infima/.../default.css`),
   which Node's CJS loader can't parse (`SyntaxError: Unexpected token
':'` on `:root`). The server webpack config should null-loader
   those imports.

Webpack/Rspack compile succeed in both cases. The errors live in
Docusaurus's SSG eval runtime, not in this plugin. The `pnpm start` /
dev-server flow is unaffected and is the recommended way to verify the
plugin locally until those bugs are patched upstream.

When Docusaurus ships a fix (or we adopt a workaround in a custom plugin
hook), the two `# - name: Fixture build` lines in
`.github/workflows/{ci,release}.yml` get uncommented and the fixture
becomes a continuously-validated reference.

## Not shipped to npm

`tests/` is excluded from the npm tarball via `"files": ["dist",
"README.md", "LICENSE"]` in `package.json`. The fixture adds zero bytes
to consumer installs.
