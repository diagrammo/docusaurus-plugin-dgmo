# Changelog

## Unreleased

**`liveLink: { refresh: 'render' }` now does what it says here.** Setting it used
to be accepted and then ignored: the site kept getting the _"This diagram has
been updated"_ link forever, and nothing said why. Re-rendering needs the browser
half of the renderer on the page, and only `astro-dgmo` was putting it there.

Two things were in the way, both fixed:

- `defineConfig` registered the plugin by **name alone**, so the plugin was
  handed an empty options object and could never see the setting. It now passes
  the same options to both halves. Wiring the plugin by hand still works — give
  it the options too.
- The plugin now registers `docusaurus-plugin-dgmo/client-render` as a client
  module when the setting is on. Webpack emits the renderer as its own lazy
  chunk, so a reader downloads it only when a diagram has actually changed.

Nothing changes for a site that leaves the default (`refresh: 'notify'`) alone —
same client modules, same bytes, same HTML.

## 0.8.2

**Takes `remark-dgmo` 0.14.0, where the step that asks the Cloud what a pointer
points at moved into dgmo itself.** Nothing about this plugin changes: the build
resolves live links exactly as before, `.dgmo/references/` keeps its format, and
the failure table that decides whether a build stops is untouched.

🔴 **The `@diagrammo/dgmo` peer floor rises to `>=0.60.0 <1`.** 0.60.0 is the
release that adds the `@diagrammo/dgmo/live-link-resolve` subpath that
`remark-dgmo` 0.14.0 imports. On an older dgmo the failure is a module
resolution error in your build, not a warning here.

As in 0.8.1, this is a patch on purpose. **A caret on a `0.x` version locks the
minor**, so a site on `^0.8.0` reaches 0.8.2 and would never reach 0.9.0.

## 0.8.1

**Takes `remark-dgmo` 0.13.2, where the client half of live links was fixed.**

Through 0.13.1 the browser-side freshness check threw on its first call and the
error was swallowed, so a diagram the author had edited produced neither a
re-render nor the _"This diagram has been updated"_ notice. Nothing logged.

A version bump is the whole change here, and it is required rather than
cosmetic: 0.8.0 declares `remark-dgmo: ^0.12.0`, and **a caret on a `0.x`
version locks the minor** — `^0.12.0` means `>=0.12.0 <0.13.0`. A site on 0.8.0
therefore cannot reach the fix by updating `remark-dgmo` itself; the range in
this package is what pins it. That is exactly how the GitHub Pages showcase kept
serving the broken client after every other wrapper had moved.

## 0.8.0

**🔴 Live links: renamed keyword, renamed option, and now ON by default.** All
three arrive through `remark-dgmo` and all three are visible to a site that
upgrades and changes nothing.

The fence keyword is now `live-link`:

````md
```dgmo
live-link dgm_01HQ3RSTUV
```
````

`cloud <id>` no longer resolves — not deprecated, simply no longer a live link.
Same for `![[cloud:<id>]]`, which becomes `![[live-link:<id>]]`.

The option is `liveLink`, not `references`, and it resolves by default. Pass it
only to turn live links off:

```js
dgmo({ liveLink: { enabled: false } });
```

🔴 **A site that upgrades and does nothing will start fetching from
`api.diagrammo.app` at build time**, and a `.dgmo/references/` directory will
appear in the repository wanting to be committed. That is correct by design —
the cache belongs in your repo so a clean CI checkout never depends on our
uptime — but it is an unexplained directory until you know why it is there.

With live links off, a `live-link` fence now renders a small card naming the
diagram and linking through to it, plus a hover-revealed _"Show this diagram
here"_ link to the guide and a build warning naming the option and the source
line. It is no longer an error block. See the
[live links guide](https://diagrammo.app/docs/live-links/).

`refresh` is unchanged and still defaults to `notify`, so the renderer stays out
of your bundle unless you ask for it.

## 0.7.0

Build against dgmo 0.53.0 via remark-dgmo 0.10.0 — decision #48 language consistency. Embed toolbar moves from the diagram's top-right to bottom-right, clearing host chrome that occupies the top-right corner.

Canonical syntax updates land for free through the parser; all legacy spellings still parse, so existing diagrams are unaffected. Boxes-and-lines prints values by default, tech-radar renders its blip listing by default, and treemap colors by heat before tags.

- `remark-dgmo` `^0.9.0` → `^0.10.0`
- `@diagrammo/dgmo` `^0.51.0` → `^0.53.0` (peer range `>=0.45.0 <1` unchanged)
- e2e fixture repinned to dgmo 0.53.0 — its lockfile had been holding 0.50.0, so the build assertions were validating against a stale renderer

## 0.6.7

Build against dgmo 0.51.0 via remark-dgmo 0.9.0 — independent embed toolbar buttons, overlay toolbar, auto-collapse source.
