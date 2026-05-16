import type { Config } from '@docusaurus/types';

// Docusaurus 3 supports an async-function default export for cases (like
// this one) that need to dynamically `import()` an ESM-only module. A
// top-level `await` inside a sync default export fails under the jiti
// loader Docusaurus uses to read the config.
export default async function createConfig(): Promise<Config> {
  const remarkDgmo = (await import('docusaurus-plugin-dgmo/remark')).default;

  return {
    title: 'dgmo fixture',
    url: 'https://example.test',
    baseUrl: '/',
    organizationName: 'diagrammo',
    projectName: 'docusaurus-plugin-dgmo-fixture',
    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',
    trailingSlash: true,

    // Force pure-markdown (CommonMark) parsing so our remark plugin's raw
    // `html`-node output is accepted. Docusaurus 3's default is to route
    // every .md/.mdx file through MDX, which rejects raw HTML nodes with
    // "Cannot handle unknown node `raw`". Users wanting to mix dgmo with
    // MDX-specific syntax in the same file would need a rehype-raw setup
    // — out of scope for the v0.1 fixture smoke test.
    markdown: {
      format: 'md',
    },

    // Toggle Rspack-backed builds via @docusaurus/faster. CI runs the
    // fixture build twice — once with this off (Webpack) and once with
    // it on (Rspack) — to satisfy AC-DC4.
    // Renamed from `experimental_faster` to `faster` in Docusaurus 3.10.
    future: {
      faster: process.env.USE_RSPACK === '1',
    },

    plugins: ['docusaurus-plugin-dgmo'],

    presets: [
      [
        'classic',
        {
          docs: {
            path: 'docs',
            routeBasePath: 'docs',
            remarkPlugins: [remarkDgmo],
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
}
