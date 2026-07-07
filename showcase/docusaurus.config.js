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
        // sidebars.js derives anchor links from docs/intro.md's h2/h3
        // headings at config-load time (single-page site — see sidebars.js).
        docs: { routeBasePath: '/', sidebarPath: './sidebars.js' },
        blog: false,
        pages: false,
        // Shared Nord page theme: imports remark-dgmo/theme-nord.css and aliases
        // Infima's variables to its --dgmo-* tokens (see src/css/custom.css).
        theme: { customCss: './src/css/custom.css' },
      },
    ],
  ],
  themeConfig: {
    navbar: { title: 'Diagrammo × Docusaurus' },
  },
});
