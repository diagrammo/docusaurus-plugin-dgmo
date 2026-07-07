// Derived sidebar for the single-page showcase.
//
// The showcase is one huge doc (docs/intro.md, served at route '/'). In CI the
// Pages workflow overwrites intro.md's body with dgmo-content's
// all-chart-types.md, where each section is an h2 and each chart type an h3.
// This module runs at config-load time: it parses intro.md, extracts h2/h3
// headings that sit OUTSIDE fenced code blocks, and emits anchor links so the
// sidebar becomes a table of contents for the page. No chart names or counts
// are hardcoded — it works for both the committed placeholder intro.md (no
// h2/h3 → just the doc link) and the CI-composed full page.
//
// Slugs must match Docusaurus's heading anchors. Docusaurus generates them via
// github-slugger (lowercased, duplicate headings get -1/-2 suffixes), so we use
// the same library with a fresh slugger per parse.
const fs = require('fs');
const path = require('path');
const GithubSlugger = require('github-slugger');

/**
 * Strip inline markdown that Docusaurus would render away before slugging:
 * links → text, inline code/emphasis markers removed.
 */
function plainText(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images → alt
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/`([^`]*)`/g, '$1') // inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/__([^_]+)__/g, '$1') // bold
    .replace(/_([^_]+)_/g, '$1') // italic
    .trim();
}

/**
 * Extract h2/h3 headings outside fenced code blocks.
 * Returns [{ level: 2|3, label, slug }].
 */
function extractHeadings(markdown) {
  const slugger = new GithubSlugger();
  const headings = [];
  let fence = null; // { char, length } while inside a fenced code block

  for (const line of markdown.split('\n')) {
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fenceMatch) {
      const char = fenceMatch[1][0];
      const length = fenceMatch[1].length;
      if (!fence) {
        fence = { char, length };
      } else if (
        char === fence.char &&
        length >= fence.length &&
        fenceMatch[2].trim() === ''
      ) {
        fence = null; // closing fence
      }
      continue;
    }
    if (fence) continue;

    const headingMatch = line.match(/^(#{2,3}) +(.+?)\s*$/);
    if (!headingMatch) continue;

    let text = headingMatch[2];
    // Explicit heading id: "### Title {#custom-id}"
    const explicitId = text.match(/\{#([^}]+)\}\s*$/);
    let slug;
    if (explicitId) {
      text = text.slice(0, explicitId.index).trim();
      slug = explicitId[1];
    }
    const label = plainText(text);
    if (!slug) slug = slugger.slug(label);
    headings.push({ level: headingMatch[1].length, label, slug });
  }
  return headings;
}

/** Build sidebar items from the doc's headings. */
function buildSidebar() {
  const docPath = path.join(__dirname, 'docs', 'intro.md');
  const headings = extractHeadings(fs.readFileSync(docPath, 'utf8'));

  // The doc itself must appear in the sidebar or Docusaurus won't display a
  // sidebar on its page. Label falls back to the doc's frontmatter title.
  const items = [{ type: 'doc', id: 'intro' }];

  const anchorLink = (h) => ({
    type: 'link',
    // baseUrl-relative; Docusaurus prepends baseUrl (autoAddBaseUrl) and
    // treats it as internal, so clicks are SPA hash-jumps, not full reloads.
    href: `/#${h.slug}`,
    label: h.label,
  });

  let category = null;
  for (const h of headings) {
    if (h.level === 2) {
      category = {
        type: 'category',
        label: h.label,
        collapsed: false,
        collapsible: true,
        items: [],
        // Remembered so an empty section can degrade to an anchor link below;
        // stripped before returning (not part of Docusaurus's schema).
        _slug: h.slug,
      };
      items.push(category);
    } else if (category) {
      category.items.push(anchorLink(h));
    } else {
      items.push(anchorLink(h)); // orphan h3 before any h2
    }
  }

  // Docusaurus rejects empty categories — degrade a section with no chart
  // entries to a plain anchor link to the section heading itself.
  return items.map((item) => {
    if (item.type !== 'category') return item;
    const { _slug, ...cat } = item;
    return cat.items.length === 0
      ? anchorLink({ label: cat.label, slug: _slug })
      : cat;
  });
}

module.exports = {
  showcaseSidebar: buildSidebar(),
};
