/* The walker behind tests/type-floor.spec.js. Extracted when the round-one
   review pushed that file past D8's 250 lines — modularized, never trimmed.
   One concern: read the rendered size of every piece of text on the page.

   It is passed to `page.evaluate`, so it must be self-contained: no imports,
   no closure over anything outside itself. Same contract as
   lib/geometry-measure.mjs. */

/* EMPTY, and it stays empty. This held the two private-figure labels while
   DEF-63 was open; the figure was redrawn on 2026-08-25 and both labels now
   clear the floor, so nothing on this site is exempt from it. The mechanism is
   kept rather than deleted because a blanket namespace pass — which is what
   this replaced — let `<svg><text style="font-size:1px">` through in a
   cross-model reviewer's mutation, and this repo has DEF-10 and DEF-44 on
   record for a hand-typed list quietly widening. Anything added here is a
   named string that a reader can weigh, not a whole namespace. */
export const SVG_EXEMPT = [];

export function measureTypeFloor({ floorPx, svgExempt }) {
  const out = { measured: 0, under: [], svgSeen: [], details: 0 };

  /* Open every closed disclosure first. A `<details>` that is shut has no
     client rects inside it, so its text was invisible to this gate: a reviewer
     showed `.cv-gate-k { font-size: 0.5rem }` staying green while a real reader
     opening a project on /cv would meet an 8px label. `details` is counted and
     the spec asserts the count on /cv, so this step cannot silently no-op. */
  for (const d of document.querySelectorAll('details')) {
    if (!d.open) { d.open = true; out.details++; }
  }

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

    /* OWN text only. Counting every ancestor of a text node would report <body>
       and <html> as text-owners and make the population meaningless. */
    const nodes = [];
    let ownText = '';
    for (const n of el.childNodes) {
      if (n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()) { nodes.push(n); ownText += n.nodeValue; }
    }
    if (!ownText.trim()) continue;

    const cs = getComputedStyle(el);

    /* `visibility` is an INHERITED property, so reading the computed value on
       this element alone is already ancestor-aware — no walk needed. It is
       checked separately from painting because a Range inside a
       `visibility: hidden` subtree still returns geometry. */
    if (cs.visibility !== 'visible') continue;

    /* Painting is decided by the TEXT's own rects, never by the element's box.
       `checkVisibility()` was used here first and it is WRONG for this job: it
       returns false for `display: contents`, which has no box while its text
       paints normally, so an 8px label survived a reviewer's mutation. Measured
       on that mutation: checkVisibility false, element rects 0, Range rects
       119x9. A Range answers the question actually being asked — does this text
       paint anywhere — and gives `display: none`, a closed <details> and a
       zero-size box the right answer too.
       OPACITY IS DELIBERATELY NOT CONSULTED: the plate reveal starts every
       below-the-fold plate at `opacity: 0`, and an opacity-aware filter
       reported 28 violations on the home page where the real number is 71. A
       label is 9px whether or not it has faded in yet. */
    let painted = false;
    for (const n of nodes) {
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) if (r.width > 0 && r.height > 0) painted = true;
      range.detach?.();
    }
    if (!painted) continue;

    const px = parseFloat(cs.fontSize);
    if (!Number.isFinite(px)) continue;

    /* SVG text reports USER UNITS, not rendered pixels — a `viewBox` scales
       them. Before DEF-63 was fixed the private figure declared 9 and rendered
       4.76px at 320, 6.26px at 390 and 7.13px at 901 — and 901 is the worst
       DESKTOP case, not 1024: the two-column breakpoint sits just under it, so
       the figure is at its narrowest there, and a 60-width sweep from 901 to
       1500 in 10px steps rises monotonically from that minimum. An earlier
       version of this comment said 1024 (8.11px), which is simply a wider
       figure. Neither width this gate samples sees either. Multiply by the
       screen CTM so the number is the one a reader meets, then gate it like any
       other text. */
    let rendered = px;
    if (el.namespaceURI === 'http://www.w3.org/2000/svg') {
      const ctm = typeof el.getScreenCTM === 'function' ? el.getScreenCTM() : null;
      if (ctm) rendered = px * Math.hypot(ctm.a, ctm.b);
      out.svgSeen.push({ sel: describe(el), px: Math.round(rendered * 100) / 100, text: ownText.trim() });
      if (svgExempt.includes(ownText.trim())) continue;
    }

    out.measured++;
    /* A strict `<` on the raw value. Rounding to 2dp first granted a 0.005px
       pass band — `font-size: 10.999px` rounded to 11 and cleared the floor,
       a reviewer's finding. The epsilon only absorbs float noise in an em or
       clamp chain landing on 10.999999999999998 for a value that IS 11. */
    if (rendered < floorPx - 1e-6) {
      out.under.push({ sel: describe(el), px: Math.round(rendered * 100) / 100, text: ownText.trim().slice(0, 40) });
    }
  }
  return out;
}
