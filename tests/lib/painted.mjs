/* painted() — the repo's standard is-it-actually-visible check, extracted
   from proof-act.spec.js when the RCA-005 rescope pushed that file to
   255/250 (D8: modularize, never trim).

   TWO WALKS, NOT ONE, AND THEY ANSWER DIFFERENT QUESTIONS.
     1. Over the ELEMENT's ancestors: what rectangle survives to the screen?
        filter, clip-path, content-visibility and every clipping ancestor
        collapse into one clipped rect, tested once against 4px.
     2. Over EACH TEXT-BEARING NODE, up its own chain: is that node's ink
        actually painted? size, per-node visibility, fill alpha, and whether
        the fill resolves byte-identical to its own composited backdrop.
   An earlier version of this comment claimed "one ancestor walk". That was
   false — measured, there were three — and the sentence is corrected rather
   than the count fudged.

   AT LEAST ONE, NEVER ALL. painted(el) is TRUE when AT LEAST ONE text-bearing
   node under el is really painted, and FALSE only when NONE is. This is the
   correct rule for CONTAINERS, which is what most call sites actually pass:
   #proof is a whole plate section, .era-list is a list. A paragraph whose
   trailing span is zero-sized is still painted to any reader, and an
   "every node must paint" rule false-reds it. That defect was live in the
   first version of this file and is now a KEEPER in the self-test.

   HARDENED 2026-08-31 (RCA-017), then CORRECTED THE SAME DAY after review.
   Round 1 measured: 22 of 24 invisibility idioms passed. Round 2 measured
   that the round-1 fix was written, tested and documented at LEAF shape while
   the real call sites are CONTAINERS, so all six colour and visibility holes
   came straight back one level down:
     painted()=true  <div id="t"><p class="inner" style="color:transparent">
   Every check below now runs over the node set, not over the located element.

   THIS FILE IS BUILT AGAINST docs/contracts/painted.md, not against the next
   idiom a reviewer happens to think of. That contract's promise, dimensions,
   and 62-row matrix were written and adversarially converged (7 rounds,
   codex exec --sandbox read-only) BEFORE this file was verified against it,
   per docs/practices/autonomous-run.md's Phase 1a. Roughly half the matrix's
   rows are declared UNDEFINED on purpose — a real, accepted limitation with a
   name for what covers it instead where one exists — and this file does not
   attempt to close every one of them. What follows below is the SAME list of
   limitations the contract already states; read the contract for the full
   dimension-by-dimension reasoning, not just the summary here.

   DEF-80's fixture gap is closed here: the self-test's HOLES table previously
   had no case for text sitting a full GRANDCHILD below the located element
   (only direct-child CONTAINER shapes), so a future narrowing of the
   descendant walk to `:scope > *` could have shipped invisible again without
   any fixture catching it. See "GRANDCHILD, text two levels deep,
   transparent" in tests/painted-selftest.spec.js.

   WHAT IT DOES NOT DO. Every one of these is measured, not assumed:

     1. NO CONTRAST RATIO. The colour check is IDENTITY ONLY — byte-identical
        fill and composited backdrop — with zero threshold. `#fefefe` on
        `#ffffff` passes. A ratio here would be DEF-46 attempt five: the proven
        method needs three page.screenshot() renders and this function has no
        page handle, so it could only use the architecture that file's header
        records as refuted. Real contrast is measured by pixels in
        tests/lib/rendered-contrast.mjs and gated at AA in tests/nav-contrast.mjs
        and tests/boundary-check.mjs. This is not a substitute for either.
     2. NO FONT-SIZE FLOOR ABOVE ZERO. Exactly 0px is unpaintable; every other
        size is a DESIGN.md decision and the owner's under P-18. Measured
        against the live build: a 11.5px floor reds 38 of 100 real call-site
        instances, a 12px floor reds 54. The site's type sits at 11px. The
        site's type rulings live in tests/type-floor.spec.js, not here.
     3. THE ABANDON GUARD IS AN EVER-WIDENING SILENT EXEMPTION. One
        background-image or mix-blend-mode anywhere up a text node's ancestor
        chain drops the colour check for that node and nothing goes red.
        Add one to a wrapper high in the tree and the check quietly stops
        covering the subtree under it. It is DORMANT today — the grain is
        painted on body::before, a pseudo-element, which is not in the
        parentElement walk, confirmed by measurement — but it is a real
        weakening surface. Recorded as DEF-78 rather than guarded here, and
        the guard itself is not optional: without it, white text over a dark
        gradient FALSE-REDS, which is DEF-46's lesson in miniature.
     4. It composites background-COLOUR only, so it never sees ::before or
        ::after. The error direction is safe: a wrong backdrop makes the check
        MISS, never false-red.
     5. NO OCCLUSION OR HIT-TESTING. elementFromPoint needs the element inside
        the viewport and most call sites are below the fold. An element covered
        by an opaque overlay passes. tests/lib/read-links.mjs hit-tests where
        that belongs.
     6. The bounds checks reject the NEGATIVE direction only. They do NOT
        "reject off-screen painted elements", which is what this comment used
        to claim: `left: 99999px` and `top: 99999px` both pass, because an
        off-screen element expands documentElement.scrollWidth/scrollHeight to
        contain itself. Measured.
     7. Near-zero alpha passes. `opacity: 0.01` and a 1/255 fill are painted as
        far as this function is concerned; it reads zero, not faint.
     8. The clipped rect reads box intersection, so it cannot tell a legitimate
        scroll container from a clip — an element scrolled out of view inside an
        `overflow: auto` ancestor still intersects that ancestor's box.
     9. It reads `overflow`, not the deprecated `clip` property, and not
        `text-indent`. `clip: rect(0,0,0,0)` on a full-size box passes, as does
        `text-indent: -9999px`.
    10. Hiding SOME of a container's text is invisible here, by design — see
        AT LEAST ONE above. Use a tighter selector when a specific string must
        be proved visible.
    11. THE 4px FLOOR IS ON THE BOX, NOT ON THE TEXT, and padding defeats it.
        Measured on the real .artefact at 390x844: `height: 1px` still measures
        38.4px because of its own vertical padding and PASSES; `font-size: 1px`
        changes nothing at all because its children are explicitly rem-sized
        (.artefact p at 0.82rem, .artefact footer at 0.7rem) and it stays at
        501.3px; `transform: scale(0.02)` lands at 10.0px and clears the floor.
        Only `content-visibility: hidden` is rejected. Anything asserting that
        an element was not SHRUNK needs its own height floor — this function
        will not give you one.

   TIME-DEPENDENT, AND NOT FIXED HERE. On a bare page.goto with motion live,
   checkVisibility() returns false mid-reveal — reproduced at 5 failures in 6
   trials on /how-i-build. Every current caller uses reducedMotion or motion
   neutralisation. See DEF-77 in docs/STATUS.md before adding a call site on a
   bare goto. */
export const painted = (loc) =>
  loc.evaluate((el) => {
    /* The renderer parses the colour, not us: rgb, rgba, color(srgb), oklch,
       lab and whatever color-mix resolves to. Returns [r,g,b,a] bytes. */
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = 1;
    const ctx = cvs.getContext('2d', { willReadFrequently: true });
    const ink = (c) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data];
    };
    const seen = (n) => n.checkVisibility({ opacityProperty: true, visibilityProperty: true });

    /* WALK 1 — the element's own ancestors decide the surviving rectangle.
       checkVisibility is ancestor-aware for opacity/visibility but NOT for
       filter/clip-path (D85's built-fan hardening), and it is blind to
       content-visibility and to an ancestor clipping the box away. */
    const r = el.getBoundingClientRect();
    const doc = document.documentElement;
    let x1 = r.left;
    let y1 = r.top;
    let x2 = r.right;
    let y2 = r.bottom;
    for (let a = el; a; a = a.parentElement) {
      const c = getComputedStyle(a);
      if (c.filter !== 'none' || c.clipPath !== 'none') return false;
      if (c.contentVisibility === 'hidden') return false;
      if (a !== el && (c.overflowX !== 'visible' || c.overflowY !== 'visible')) {
        const ar = a.getBoundingClientRect();
        x1 = Math.max(x1, ar.left);
        y1 = Math.max(y1, ar.top);
        x2 = Math.min(x2, ar.right);
        y2 = Math.min(y2, ar.bottom);
      }
    }
    if (!seen(el)) return false;
    /* 4px is the repo's own floor — tests/content-model.spec.js already ships
       it — and the site's smallest real element measures 30.8 x 18.4px, so it
       sits 4.6x below the site's own minimum. See limitation 11: this is a
       floor on PAINT, and padding defeats it. */
    if (x2 - x1 < 4 || y2 - y1 < 4) return false;
    if (r.right <= 0 || r.left < 0 || r.left >= doc.scrollWidth) return false;
    if (r.bottom <= 0 || r.top >= doc.scrollHeight) return false;

    /* The node set every text check runs over: the element plus every
       descendant carrying its own text node. Reading only `el` is what let
       all six colour and visibility holes through one level down, and reading
       only `el`'s fontSize measures the wrong node for the 38 of 100 real
       call-site instances that are containers with no text of their own. */
    const textNodes = [el, ...el.querySelectorAll('*')].filter((n) =>
      [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()),
    );
    if (!textNodes.length) return true;

    const over = (f, b) => {
      const a = f[3] / 255;
      return [0, 1, 2].map((i) => f[i] * a + b[i] * (1 - a)).concat(255);
    };
    /* WALK 2 — per text node, up its own chain. -webkit-text-fill-color, not
       color: it is what actually paints the glyph interior. */
    const inked = (n) => {
      const c = getComputedStyle(n);
      if (parseFloat(c.fontSize) === 0) return false;
      if (!seen(n)) return false;
      const fill = ink(c.webkitTextFillColor || c.color);
      if (fill[3] === 0) return false;
      const layers = [];
      for (let a = n; a; a = a.parentElement) {
        const ac = getComputedStyle(a);
        if (ac.backgroundImage !== 'none' || ac.mixBlendMode !== 'normal') return true;
        const p = ink(ac.backgroundColor);
        if (p[3] > 0) layers.push(p);
        if (p[3] === 255) break;
      }
      if (!layers.length || layers[layers.length - 1][3] !== 255) return true;
      const bg = layers.reverse().reduce((acc, l) => over(l, acc), [255, 255, 255, 255]);
      const fg = over(fill, bg);
      return ![0, 1, 2].every((i) => Math.round(fg[i]) === Math.round(bg[i]));
    };
    return textNodes.some(inked);
  });
