# Changelog

## 0.7.0

Build against dgmo 0.53.0 via remark-dgmo 0.10.0 — decision #48 language consistency. Embed toolbar moves from the diagram's top-right to bottom-right, clearing host chrome that occupies the top-right corner.

Canonical syntax updates land for free through the parser; all legacy spellings still parse, so existing diagrams are unaffected. Boxes-and-lines prints values by default, tech-radar renders its blip listing by default, and treemap colors by heat before tags.

- `remark-dgmo` `^0.9.0` → `^0.10.0`
- `@diagrammo/dgmo` `^0.51.0` → `^0.53.0` (peer range `>=0.45.0 <1` unchanged)
- e2e fixture repinned to dgmo 0.53.0 — its lockfile had been holding 0.50.0, so the build assertions were validating against a stale renderer

## 0.6.7

Build against dgmo 0.51.0 via remark-dgmo 0.9.0 — independent embed toolbar buttons, overlay toolbar, auto-collapse source.
