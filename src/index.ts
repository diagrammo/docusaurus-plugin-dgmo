import { fileURLToPath } from 'node:url';
import type { LoadContext, Plugin } from '@docusaurus/types';
import type { DgmoOptions } from 'remark-dgmo';

/**
 * Options accepted by `docusaurus-plugin-dgmo`. Currently a re-export of
 * `remark-dgmo`'s `DgmoOptions` — the plugin doesn't add its own option
 * surface, it just wires asset registration.
 */
export type DocusaurusDgmoOptions = DgmoOptions;

/**
 * Docusaurus plugin that registers `remark-dgmo`'s shared CSS and client
 * script via `getClientModules()`. Does NOT auto-inject the remark plugin
 * into preset configs — Docusaurus's plugin API has no hook for mutating
 * sibling preset options, so users wire `remarkPlugins` manually per
 * preset slot (see README + ADR-3).
 *
 * The `_options` parameter is reserved for forward compatibility. Today it
 * is not used because the remark plugin is wired by the user; per-block
 * fence-meta options + integration defaults are passed through there.
 */
export default function pluginDgmo(
  _ctx: LoadContext,
  _options: DocusaurusDgmoOptions = {}
): Plugin<void> {
  return {
    name: 'docusaurus-plugin-dgmo',
    getClientModules() {
      return [
        // remark-dgmo owns these files. We use the SAME subpath strings as
        // the remark-dgmo `exports` map so Node's resolver accepts them.
        // import.meta.resolve returns a file: URL; fileURLToPath gives the
        // absolute path Docusaurus expects.
        fileURLToPath(import.meta.resolve('remark-dgmo/client.css')),
        // The Docusaurus-aware client wrapper lives in THIS package so we
        // don't leak Docusaurus's `onRouteDidUpdate` symbol into the
        // framework-agnostic remark-dgmo core.
        fileURLToPath(import.meta.resolve('docusaurus-plugin-dgmo/client')),
      ];
    },
    configureWebpack(_config, isServer) {
      // dgmo's render path dynamic-imports jsdom for Node-side DOM emulation.
      // The runtime-spec construction in dgmo/src/render.ts:51-56 keeps it
      // out of the client bundle for Vite/esbuild/webpack 5; this fallback
      // is belt-and-suspenders for the rare case where webpack still tries
      // to resolve `jsdom` (and its `fs` / `canvas` transitive nags).
      if (isServer) return {};
      return {
        resolve: { fallback: { jsdom: false, fs: false, canvas: false } },
      };
    },
  };
}
