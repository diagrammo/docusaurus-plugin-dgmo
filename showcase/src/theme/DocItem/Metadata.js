import React from 'react';
import Head from '@docusaurus/Head';

// Force the exact "Diagrammo × Docusaurus" browser-tab title. The stock doc
// metadata renders `<docTitle> | <siteTitle>` through the global titleTemplate,
// and Docusaurus offers no per-page suffix override. Overriding titleTemplate
// to "%s" on this innermost <Head> (last declaration wins in react-helmet)
// pins the title with no site-name suffix — SSR-correct, no client flash.
export default function DocItemMetadata() {
  return (
    <Head titleTemplate="%s">
      <title>Diagrammo × Docusaurus</title>
    </Head>
  );
}
