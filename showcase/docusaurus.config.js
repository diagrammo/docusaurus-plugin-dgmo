// Minimal Docusaurus config for the GitHub Pages chart-type showcase.
// `defineConfig` (from docusaurus-plugin-dgmo) injects the remark plugin and
// registers the client module. `baseUrl` is env-gated so the Pages workflow can
// serve it under github.io/<repo>/ while local dev stays at root.
const { defineConfig } = require('docusaurus-plugin-dgmo/config');

module.exports = defineConfig({
  title: 'Diagrammo × Docusaurus',
  tagline: 'Every dgmo chart type, rendered at build time',
  url: 'https://diagrammo.github.io',
  baseUrl: process.env.PAGES_BASE || '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  presets: [
    [
      'classic',
      {
        docs: { routeBasePath: '/', sidebarPath: undefined },
        blog: false,
        pages: false,
      },
    ],
  ],
  themeConfig: {
    navbar: { title: 'Diagrammo × Docusaurus' },
  },
});
