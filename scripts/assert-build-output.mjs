#!/usr/bin/env node
// AC-DC2 + AC-CM3 + AC-DC3: validate the fixture build output.
//
// Invoked from the `test:e2e` script after `docusaurus build` runs against
// `tests/fixture/`. CWD when this script runs is `tests/fixture/`.
//
// Checks:
//   1. The built diagram page HTML contains both `dgmo-light` and `dgmo-dark`
//      class names (dual-render emitted).
//   2. The page <head> contains a <link rel="stylesheet"> whose href matches
//      `*remark-dgmo*client*.css` (AC-CM3).
//   3. The page-specific JS chunks do NOT contain the jsdom-internal sentinel
//      "http://www.w3.org/2000/xmlns/" (AC-DC3).
//   4. The summed gzipped size of the page-specific JS chunks stays within
//      100 KB of the committed baseline (or seeds the baseline on first run).
//   5. The map block rendered real geography, not an error card.
//
// Exit codes: 0 on pass, 1 on any failure.

import {
  readFileSync,
  statSync,
  readdirSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const FIXTURE = process.cwd();
const HTML_PATH = resolve(FIXTURE, 'build/docs/diagrams/index.html');
const ASSETS = resolve(FIXTURE, 'build/assets/js');
const BASELINE = resolve(FIXTURE, 'baseline-bundle-size.json');
const JSDOM_SENTINEL = 'http://www.w3.org/2000/xmlns/';
const BUDGET_BYTES = 100 * 1024;

function fail(msg) {
  console.error(`::error::${msg}`);
  process.exit(1);
}

if (!existsSync(HTML_PATH)) fail(`Built HTML missing: ${HTML_PATH}`);

const html = readFileSync(HTML_PATH, 'utf8');

if (!/\bdgmo-light\b/.test(html)) fail('built HTML missing dgmo-light wrapper');
if (!/\bdgmo-dark\b/.test(html)) fail('built HTML missing dgmo-dark wrapper');

// The map block. Assert on CONTENT, not on structure: dgmo >= 0.62.0 stopped
// reading basemap geometry off disk itself, so when the integration fails to
// supply it the map still emits a <figure> and the page still builds happily —
// it just draws an error card or an empty frame. Only what ends up inside the
// SVG tells a real map apart from that, so check for the error strings by name
// and for the place labels the fence asked for.
if (html.includes("Couldn't render this diagram")) {
  fail('built HTML contains the dgmo error card — a diagram failed to render');
}
if (html.includes('no basemap data')) {
  fail(
    'built HTML says "no basemap data" — the integration stopped supplying ' +
      'basemaps to dgmo blocks (dgmo >= 0.62.0 no longer reads them off disk)'
  );
}
// `Miami` is the load-bearing half of this pair, and the pair is deliberate:
// the error card echoes the opening lines of the source it could not render,
// so `Denver` (line 3) shows up even in a broken build. `Miami` is line 4,
// past that echo. Do not "simplify" this to a single label.
for (const label of ['Denver', 'Miami']) {
  if (!html.includes(label)) {
    fail(`built HTML missing map poi label "${label}"`);
  }
}

console.log('✓ map block rendered with basemap data and both poi labels');

// Docusaurus bundles every client module's CSS (including remark-dgmo's
// client.css, registered via getClientModules) into its combined
// `assets/css/styles.<hash>.css` — it does NOT emit a standalone
// remark-dgmo-client.css <link>. So verify the load-bearing dual-render rules
// (`.dgmo-dark { display: none }` + `[data-theme=dark] .dgmo-light
// { display: none }`, remark-dgmo >= 0.5.0 standard embed chrome — may be
// merged into one selector list by the CSS minifier) made it into whichever
// stylesheet the page links.
const cssHrefs = [
  ...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+\.css)"/g),
].map((m) => m[1]);
if (cssHrefs.length === 0) fail('built HTML links no stylesheet');

const DUAL_RENDER_RULES = [
  /\.dgmo-dark[^{}]*\{[^}]*display\s*:\s*none/,
  /\[data-theme=["']?dark["']?\]\s*\.dgmo-light[^{}]*\{[^}]*display\s*:\s*none/,
];
const cssHasRule = cssHrefs.some((href) => {
  const cssPath = resolve(FIXTURE, 'build', href.replace(/^\//, ''));
  if (!existsSync(cssPath)) return false;
  const css = readFileSync(cssPath, 'utf8');
  return DUAL_RENDER_RULES.every((rule) => rule.test(css));
});
if (!cssHasRule) {
  fail(
    'no linked stylesheet contains remark-dgmo/client.css dual-render rules — ' +
      'did getClientModules stop registering remark-dgmo/client.css?'
  );
}

console.log(
  '✓ HTML contains dgmo-light, dgmo-dark, and the bundled stylesheet carries remark-dgmo/client.css rules'
);

// Find page-specific JS chunks. Docusaurus emits per-route chunks named
// `<hash>.<route>.<hash>.js` — we identify them by reading the index.html
// scripts. Simpler approximation: scan all JS chunks for the sentinel and
// total size of chunks referenced from this page's HTML.
if (!existsSync(ASSETS)) fail(`Built JS asset dir missing: ${ASSETS}`);

const allChunks = readdirSync(ASSETS).filter((f) => f.endsWith('.js'));
const referenced = allChunks.filter((f) => html.includes(`/assets/js/${f}`));

if (referenced.length === 0) {
  console.warn(
    `::warning::no per-page JS chunks referenced from the diagrams page; sentinel/byte checks skipped`
  );
} else {
  for (const chunk of referenced) {
    const body = readFileSync(join(ASSETS, chunk), 'utf8');
    if (body.includes(JSDOM_SENTINEL)) {
      fail(
        `jsdom sentinel "${JSDOM_SENTINEL}" found in ${chunk} — jsdom leaked into client bundle`
      );
    }
  }
  console.log(
    `✓ ${referenced.length} per-page JS chunks free of jsdom sentinel`
  );

  const totalGzipped = referenced.reduce(
    (acc, chunk) => acc + gzipSync(readFileSync(join(ASSETS, chunk))).length,
    0
  );
  if (!existsSync(BASELINE)) {
    writeFileSync(
      BASELINE,
      JSON.stringify(
        {
          totalGzippedBytes: totalGzipped,
          capturedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );
    console.log(
      `✓ Baseline seeded at ${totalGzipped} bytes (gzipped). Commit ${BASELINE} to enable regression checks.`
    );
  } else {
    const prev = JSON.parse(readFileSync(BASELINE, 'utf8')).totalGzippedBytes;
    const delta = totalGzipped - prev;
    if (Math.abs(delta) > BUDGET_BYTES) {
      fail(
        `bundle-size delta ${delta} bytes exceeds ${BUDGET_BYTES} budget (baseline ${prev}, current ${totalGzipped})`
      );
    }
    console.log(
      `✓ Bundle size ${totalGzipped} (Δ${delta} bytes) within ±${BUDGET_BYTES}`
    );
  }
}

console.log('✓ fixture build output assertions pass');
