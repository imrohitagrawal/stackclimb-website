/* The pseudo-element walker behind tests/print-floor.spec.js. One concern: the
   rendered font-size of every ::before and ::after that carries text.

   Why a second walker exists at all: tests/lib/type-floor-measure.mjs walks
   ELEMENTS, and a pseudo-element is not in the DOM tree — createTreeWalker
   never visits it, and neither does any Range. On screen that gap is
   measured empty (six pseudo types swept by hand, 2026-08-25). On paper it is
   the whole defect: print.css reveals every link's href in an ::after, and
   that is where the sub-floor text lived (DEF-69).

   Passed to `page.evaluate`, so it must be self-contained: no imports, no
   closure over anything outside itself. Same contract as
   type-floor-measure.mjs and geometry-measure.mjs. */

export function measurePseudoFloor({ floorPx }) {
  const out = { pseudos: 0, under: [], transformed: [] };

  const describe = (el) => {
    const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean);
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls.length ? '.' + cls.join('.') : ''}`;
  };

  const SKIP = new Set(['SCRIPT', 'STYLE', 'TITLE', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'META', 'LINK']);

  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT);
  const all = [document.documentElement];
  while (walker.nextNode()) all.push(walker.currentNode);

  for (const el of all) {
    if (SKIP.has(el.tagName.toUpperCase())) continue;

    /* A pseudo-element paints only if its host does. `display: none` is NOT
       inherited, so reading the host's own computed display misses an
       ancestor that is hidden — print.css hides `.site-nav`, and every link
       inside it still computes `display: inline`. Zero client rects is the
       ancestor-aware answer: a host with no box anywhere up the chain has
       none. `visibility` IS inherited, so the host's own value suffices. */
    const host = getComputedStyle(el);
    if (host.visibility !== 'visible') continue;
    if (el.getClientRects().length === 0) continue;

    for (const pseudo of ['::before', '::after']) {
      const cs = getComputedStyle(el, pseudo);
      const content = cs.content;
      /* `none` and `normal` mean no pseudo-element is generated. A generated
         one with `display: none` paints nothing. `content: ''` is a box with
         no text — global.css draws the external-link arrow that way — and
         has no font-size a reader could meet. Chromium returns the COMPUTED
         string, so `' (' attr(href) ')'` arrives here as `" (/cv)"`. */
      if (content === 'none' || content === 'normal' || cs.display === 'none') continue;
      const text = content.replace(/^"|"$/g, '');
      if (!/\S/.test(text)) continue;

      out.pseudos++;
      const px = parseFloat(cs.fontSize);
      if (!Number.isFinite(px)) continue;
      /* Strict `<` on the raw value, epsilon for float noise only — the same
         reasoning type-floor-measure.mjs records for its element check. */
      if (px < floorPx - 1e-6) {
        out.under.push({ sel: describe(el) + pseudo, px: Math.round(px * 100) / 100, text: text.slice(0, 60) });
      }
      /* A URL printed in a different case than its href is a different URL
         on a case-sensitive host — GitHub paths are. Recorded for every
         revealed href so the spec can assert it on the population that
         matters, without deciding here which pseudo is a URL. */
      if (el.tagName === 'A' && cs.textTransform !== 'none') {
        out.transformed.push({ sel: describe(el) + pseudo, transform: cs.textTransform, text: text.slice(0, 60) });
      }
    }
  }
  return out;
}
