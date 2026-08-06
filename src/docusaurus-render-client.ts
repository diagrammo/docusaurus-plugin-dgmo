/**
 * The opt-in half of live links: re-render a moved diagram in the reader's
 * browser instead of only linking to it.
 *
 * Registered as a Docusaurus client module by `src/index.ts`, and ONLY when the
 * site asked for it with `liveLink: { refresh: 'render' }`. The base client
 * (`docusaurus-client.ts`) notices that a referenced diagram moved; this is what
 * redraws it.
 *
 * 🔴 **The import is dynamic, and that is not a style choice.**
 * `remark-dgmo/client-render.js` exports nothing — it registers a renderer by
 * running — so a plain `import 'remark-dgmo/client-render.js'` is a side-effect
 * import, which every bundler that honours a package's `sideEffects` field is
 * free to delete. Measured with esbuild against remark-dgmo 0.14.0 on
 * 2026-08-06: the static form compiled to 75 bytes carrying no registration at
 * all. A dynamic import is a value-producing call, so it survives on any
 * remark-dgmo version, and webpack emits the renderer as its own lazy chunk —
 * downloaded only when a diagram has actually changed.
 */

let started = false;

/**
 * Docusaurus calls this on the initial render and after every SPA route change.
 * The renderer only needs registering once; the module it loads announces
 * itself, so a diagram that moved is swapped on this page rather than the next.
 */
export function onRouteDidUpdate(): void {
  if (started) return;
  started = true;
  void import('remark-dgmo/client-render.js');
}

export default onRouteDidUpdate;
