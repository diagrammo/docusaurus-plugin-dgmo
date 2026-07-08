import React, { useEffect } from 'react';

// Force the exact "Diagrammo × Docusaurus" browser-tab title. Docusaurus always
// renders `<docTitle> | <siteTitle>` and offers no per-page override for the
// suffix, so this single-page showcase pins the title on the client. Runs after
// react-helmet's own title effect (parent effects fire after child effects), so
// it wins for the visible tab.
export default function Root({ children }) {
  useEffect(() => {
    document.title = 'Diagrammo × Docusaurus';
  });
  return <>{children}</>;
}
