/**
 * Docusaurus-shaped client module. Wraps `remark-dgmo`'s framework-neutral
 * `bindDgmo()` and re-exports it as `onRouteDidUpdate` — the symbol
 * Docusaurus looks for in client modules to fire on every SPA route change.
 *
 * This keeps Docusaurus's plugin-API vocabulary out of the framework-
 * agnostic `remark-dgmo` core. A Vitepress/Hugo/Astro wrapper using a
 * differently-named navigation hook re-exports `bindDgmo` under a name of
 * its own.
 */
import { bindDgmo } from 'remark-dgmo/client.js';

export const onRouteDidUpdate = bindDgmo;
