# Changelog

## Unreleased

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
diagram and linking through to it, plus a hover-revealed *"Show this diagram
here"* link to the guide and a build warning naming the option and the source
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
