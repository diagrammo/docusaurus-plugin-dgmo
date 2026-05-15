/**
 * Re-export `remark-dgmo` so users have a single dependency to install
 * (`docusaurus-plugin-dgmo`) and a single import path for the remark plugin:
 *
 *   remarkPlugins: [(await import('docusaurus-plugin-dgmo/remark')).default]
 *
 * Equivalent to importing `remark-dgmo` directly — the package is one of
 * our runtime dependencies.
 */
export { default } from 'remark-dgmo';
export * from 'remark-dgmo';
