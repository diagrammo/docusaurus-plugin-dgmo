import type { Config } from '@docusaurus/types';

const remarkDgmo = async () =>
  (await import('docusaurus-plugin-dgmo/remark')).default;

const config: Config = {
  title: 'dgmo fixture',
  url: 'https://example.test',
  baseUrl: '/',
  organizationName: 'diagrammo',
  projectName: 'docusaurus-plugin-dgmo-fixture',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  trailingSlash: true,

  // Toggle Rspack-backed builds via @docusaurus/faster. CI runs the fixture
  // build twice — once with this off (Webpack) and once with it on (Rspack)
  // to satisfy AC-DC4.
  future: {
    experimental_faster: process.env.USE_RSPACK === '1',
  },

  plugins: ['docusaurus-plugin-dgmo'],

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: 'docs',
          remarkPlugins: [await remarkDgmo()],
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
};

export default config;
