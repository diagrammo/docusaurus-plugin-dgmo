# Release Checklist — docusaurus-plugin-dgmo

Every `chore: release vX.Y.Z` PR body MUST link to this checklist. Each item MUST be ticked before `git tag v* && git push --tags`.

## Pre-flight (local)

- [ ] `package.json` `version` matches the intended tag (without the `v` prefix).
- [ ] `package.json` deps on `remark-dgmo` are **`^x.y.z`** — no `file:` or `link:` left over from the dev loop.
- [ ] `package.json` has no `pnpm.overrides` key (the release workflow rejects it, but catch it here).
- [ ] `pnpm build` succeeded.
- [ ] `pnpm test` (unit tests) passed.
- [ ] `pnpm test:e2e` (Webpack fixture build) passed.
- [ ] `pnpm test:e2e:rspack` (Rspack fixture build) passed.

## User-visible smoke (manual, ad-hoc)

The fixture build asserts HTML structure but not the actual toggle UX. Once per release, scaffold a real Docusaurus site and eyeball it:

- [ ] `pnpm create docusaurus _smoke classic --typescript --skip-install` in a scratch dir.
- [ ] `pnpm pack` in this repo; install the tarball into `_smoke` (`pnpm add ../docusaurus-plugin-dgmo-X.Y.Z.tgz`).
- [ ] Wire the plugin per README into `_smoke/docusaurus.config.ts`.
- [ ] `pnpm start` opens the page.
- [ ] The default page contains a dgmo block — confirm it **renders** (not raw fence text).
- [ ] The navbar color-mode toggle is present.
- [ ] Click the toggle — confirm the diagram visually switches between light and dark variants.

## Cross-package coordination

- [ ] `remark-dgmo@^0.1` is already on npm and your `dependencies.remark-dgmo` range resolves to it.
- [ ] If this is a v0.x.0 minor and `remark-dgmo` shipped a minor too, `astro-dgmo` got a coordinated patch in the same release window.

## After the tag

- [ ] CI release workflow finished successfully (logs green; npm view confirms publish).
- [ ] GitHub release was auto-created and has reasonable auto-generated notes; edit if needed to surface the marquee feature.
- [ ] Bump consumer documentation if README install snippet changed.
