import { defineConfig } from 'docusaurus-plugin-dgmo/config';

// One-line integration: `defineConfig` injects the remark plugin into the
// classic preset's docs/blog/pages slots, sets `markdown.format = 'md'`, and
// registers `docusaurus-plugin-dgmo`. The user writes a normal Docusaurus
// config; no async-factory plumbing or per-preset wiring required.
export default defineConfig({
  title: 'dgmo fixture',
  url: 'https://example.test',
  baseUrl: '/',
  organizationName: 'diagrammo',
  projectName: 'docusaurus-plugin-dgmo-fixture',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  trailingSlash: true,

  // Toggle Rspack-backed builds via @docusaurus/faster. CI runs the fixture
  // build twice — once with this off (Webpack) and once with it on (Rspack) —
  // to satisfy AC-DC4. Renamed from `experimental_faster` to `faster` in 3.10.
  future: {
    faster: process.env.USE_RSPACK === '1',
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: 'docs',
          sidebarPath: undefined,
        },
        blog: false,
        pages: false,
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Fixture',
    },
  },
});
