/* The pseudo-element walker behind tests/print-floor.spec.js. One concern: the
   rendered font-size of every ::before, ::after and ::marker that carries text.

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
  const out = { pseudos: 0, reveals: 0, under: [], transformed: [] };

  const describe = (el) => {
    const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean);
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls.length ? '.' + cls.join('.') : ''}`;
  };

  const SKIP = new Set(['SCRIPT', 'STYLE', 'TITLE', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'META', 'LINK']);

  /* A pseudo-element paints only if its host does. `display: none` is NOT
     inherited, so the host's own computed display misses a hidden ancestor —
     print.css hides `.site-nav`, and every link inside it still computes
     `display: inline`. The first draft used "zero client rects" as the
     ancestor-aware answer, and two reviewers broke it the same way: a
     `display: contents` host has no box of its own while its ::after still
     generates one — the exact hole type-floor-measure.mjs records hitting
     with `checkVisibility()`. So: walk the ancestors for `display: none`,
     memoised, and let a box-less host through. */
  const hiddenMemo = new Map();
  const hidden = (el) => {
    if (!el) return false;
    if (hiddenMemo.has(el)) return hiddenMemo.get(el);
    const v = getComputedStyle(el).display === 'none' || hidden(el.parentElement);
    hiddenMemo.set(el, v);
    return v;
  };

  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT);
  const all = [document.documentElement];
  while (walker.nextNode()) all.push(walker.currentNode);

  for (const el of all) {
    if (SKIP.has(el.tagName.toUpperCase())) continue;
    const host = getComputedStyle(el);
    if (host.visibility !== 'visible' || hidden(el)) continue;

    for (const pseudo of ['::before', '::after', '::marker']) {
      const cs = getComputedStyle(el, pseudo);
      const content = cs.content;
      if (cs.display === 'none') continue;
      /* `none` means no pseudo-element. `normal` means none too — EXCEPT for
         ::marker, where `normal` is the default bullet or number on a
         list-item (`inline list-item` too — round 2), which is text a reader meets: project.css sizes it at
         0.85em, and a reviewer measured it clearing the floor by 0.42px.
         `content: ''` is a box with no text (global.css draws the
         external-link arrow that way) and has no font-size a reader could
         meet. Chromium returns the COMPUTED string, so `' (' attr(href) ')'`
         arrives here as `" (/cv)"`. */
      const isMarker = pseudo === '::marker';
      if (content === 'none') continue;
      const defaultMarker = isMarker && host.display.includes('list-item') && host.listStyleType !== 'none';
      if (content === 'normal' && !defaultMarker) continue;
      if (content === '""') continue;

      out.pseudos++;
      const text = content.replace(/^"|"$/g, '');
      const px = parseFloat(cs.fontSize);
      if (!Number.isFinite(px)) continue;
      /* Strict `<` on the raw value, epsilon for float noise only — the same
         reasoning type-floor-measure.mjs records for its element check. */
      if (px < floorPx - 1e-6) {
        out.under.push({ sel: describe(el) + pseudo, px: Math.round(px * 100) / 100, text: text.slice(0, 60) });
      }

      /* The population the partner assertion protects: an ::after on a link
         whose text carries that link's href in the reveal's own `(href)` form —
         a bare substring let `/cv-broken` pass for `/cv` (round-2 finding). Counting ANY text-bearing
         pseudo let a `url()` or `counter()` pseudo stand in for a deleted
         reveal (a cross-model finding). This count cannot be satisfied by
         anything but a revealed destination. */
      const href = el.tagName === 'A' ? el.getAttribute('href') : null;
      if (pseudo === '::after' && href && text.includes('(' + href + ')')) {
        out.reveals++;
        /* Verbatim means verbatim. DESIGN.md's rule says no uppercase and no
           tracking; the first draft read `text-transform` only, and both
           reviewers printed a tracked or small-caps URL past it. `0` computes
           to `0px`, not `normal`, and is untracked — a round-2 false red. */
        const bad = [];
        if (cs.textTransform !== 'none') bad.push(`text-transform: ${cs.textTransform}`);
        const tracked = cs.letterSpacing !== 'normal' && parseFloat(cs.letterSpacing) !== 0;
        if (tracked) bad.push(`letter-spacing: ${cs.letterSpacing}`);
        if (cs.fontVariantCaps !== 'normal') bad.push(`font-variant-caps: ${cs.fontVariantCaps}`);
        if (bad.length) {
          out.transformed.push({ sel: describe(el) + pseudo, why: bad.join(', '), text: text.slice(0, 60) });
        }
      }
    }
  }
  return out;
}
