import type { LoadContext, Plugin } from '@docusaurus/types';
import type { DgmoOptions } from 'remark-dgmo';

/**
 * Docusaurus loads its config + plugin files via jiti, which executes
 * modules in a CJS-style vm.Script context where `import.meta` is invalid
 * syntax. jiti DOES polyfill `require` in that context, so the conventional
 * Docusaurus-plugin path-resolution pattern works fine — and matches what
 * the rest of the plugin ecosystem uses.
 *
 * We don't ship a pure-ESM consumer; Docusaurus is the only thing that
 * loads `docusaurus-plugin-dgmo/index.js`, and Docusaurus is always
 * jiti-backed.
 */
declare const require: NodeRequire;

/**
 * Options accepted by `docusaurus-plugin-dgmo`. Currently a re-export of
 * `remark-dgmo`'s `DgmoOptions` — the plugin doesn't add its own option
 * surface, it just wires asset registration.
 */
export type DocusaurusDgmoOptions = DgmoOptions;

/**
 * Docusaurus plugin that registers `remark-dgmo`'s shared CSS and a thin
 * Docusaurus-shaped client wrapper via `getClientModules()`. Does NOT
 * auto-inject the remark plugin into preset configs — Docusaurus's plugin
 * API has no hook for mutating sibling preset options, so users wire
 * `remarkPlugins` manually per preset slot (see README + ADR-3).
 *
 * One option is read here rather than only forwarded to the remark plugin:
 * `liveLink.refresh`. It decides which client modules the site gets, which is
 * this plugin's job and nothing else's — the built HTML is identical either
 * way. `defineConfig` passes the same options object to both halves so a user
 * configures it once.
 */
export default function pluginDgmo(
  _ctx: LoadContext,
  options: DocusaurusDgmoOptions = {}
): Plugin<void> {
  // Re-rendering a moved diagram in the browser means shipping the renderer, so
  // it stays opt-in. Before 0.8.3 this option was accepted and then ignored:
  // the site was told it had turned re-rendering on and got the "This diagram
  // has been updated" link forever.
  const reRenders = options.liveLink?.refresh === 'render';

  return {
    name: 'docusaurus-plugin-dgmo',
    getClientModules() {
      return [
        // remark-dgmo owns these files. We resolve through the host's
        // module graph so the paths land at the actual on-disk locations
        // inside node_modules/.
        require.resolve('remark-dgmo/client.css'),
        // Neutralizes the chrome Docusaurus's MDXComponents mapping paints
        // onto the raw <details>/<pre> of the source panel in
        // `markdown.format: 'md'` mode (alert box, summary arrow,
        // unwrapped <pre>). No-ops in mdx mode.
        require.resolve('docusaurus-plugin-dgmo/styles/docusaurus.css'),
        // The Docusaurus-aware client wrapper lives in THIS package so we
        // don't leak Docusaurus's `onRouteDidUpdate` symbol into the
        // framework-agnostic remark-dgmo core.
        require.resolve('docusaurus-plugin-dgmo/client'),
        ...(reRenders
          ? [require.resolve('docusaurus-plugin-dgmo/client-render')]
          : []),
      ];
    },
    configureWebpack(_config, isServer) {
      // dgmo's render path dynamic-imports jsdom for Node-side DOM
      // emulation. The runtime-spec construction in dgmo/src/render.ts
      // keeps it out of the client bundle for Vite/esbuild/webpack 5;
      // this fallback is belt-and-suspenders for the rare case where
      // webpack still tries to resolve `jsdom` (and its `fs` / `canvas`
      // transitive nags).
      if (isServer) return {};
      return {
        resolve: { fallback: { jsdom: false, fs: false, canvas: false } },
      };
    },
  };
}
