import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    remark: 'src/remark.ts',
    config: 'src/config.ts',
    'docusaurus-client': 'src/docusaurus-client.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node20',
  external: [
    '@diagrammo/dgmo',
    '@docusaurus/core',
    '@docusaurus/types',
    'remark-dgmo',
  ],
});
