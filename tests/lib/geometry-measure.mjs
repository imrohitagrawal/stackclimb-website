/* The DEF-54 geometry gate's measurement. Kept apart from the spec so the
   spec stays inside the D8 budget, the same split post-deploy-selftest.mjs
   and painted.mjs already make.

   `measureGeometry` is handed to page.evaluate(), so it is serialized to
   source and re-parsed inside the browser: it may close over NOTHING. Every
   helper it needs lives inside it. That is why it is one long function
   instead of several small ones.

   WHAT IT RETURNS: a flat { key: value } map for one page at one viewport.
   Flat, because one element must be one line in the pull request. Nested
   objects put the plate's name five lines above the changed number, outside
   the default diff hunk, and a reviewer then has to expand the file to learn
   what he is looking at. */

/* Neutralize the two things that move a rect without changing layout.

   1. Animations and transitions — the same injection visual-baselines.spec.js
      already uses, so a measurement can never land mid-transition.
   2. motion.css gives every `.plate:not(.hero) .plate-grid > *` a resting
      `transform: translateY(16px)`, removed per plate only when reveal.js's
      IntersectionObserver sees it cross 15%. A transform does not change
      layout, so plate boxes never feel it — but getBoundingClientRect() DOES
      include it, so every row inside an unrevealed plate reads 16px low.
      That is sixteen times the tolerance, and which plates are revealed
      depends on scroll history inside the test. Measured both ways: with this
      rule injected, row boxes are identical before and after scrolling
      #contact into view; without it they differ by exactly 16px.

   This records the settled, fully-revealed page — what a visitor sees once
   she has scrolled — not a frame of the entrance.

   JS ON vs JS OFF, measured (moved here from geometry.spec.js's header by
   DEF-58, to sit beside the capture it describes). Plate boxes are IDENTICAL
   either way. The difference is confined to the contact row, and it is not only
   the count: with JS off the painted count drops (5 -> 4), the button's own
   child value becomes "hidden", and the four remaining controls lay out
   differently because the <=900px grid rule still counts five DOM children. An
   earlier version of that comment said only the count differs, which was wrong.
   This file is run with JS ON; contact.spec.js owns the no-JS world. */
export const NEUTRALIZE_MOTION =
  '*,*::before,*::after{animation:none!important;transition:none!important}' +
  '.plate .plate-grid > *{transform:none!important}';

export function measureGeometry() {
  const round = (n) => Math.round(n);
  const out = {};

  /* [x, width, height]. Height alone was not enough: a cross-model review
     pointed out that `.site-nav { transform: translateX(100px); width: calc(100% - 100px) }`
     keeps the height and would have passed. The nav is `position: fixed`, so
     it needs no y. */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const nr = nav.getBoundingClientRect();
    out['nav'] = [round(nr.left), round(nr.width), round(nr.height)];
  }

  /* Population derived from the DOM, never a hand-typed list — DEF-10 (routes)
     and DEF-44 (plate ids) are both on this repo's record for a list that
     quietly narrowed a gate. `.plate[id]` matches visual-baselines.spec.js
     and boundary-check.mjs, so a `<div class="plate" id>` cannot slip past. */
  const plates = [...document.querySelectorAll('.plate[id]')];
  const boxes = plates.map((el) => {
    const r = el.getBoundingClientRect();
    return { el, top: r.top + window.scrollY, left: r.left + window.scrollX, w: r.width, h: r.height };
  });

  boxes.forEach((b, i) => {
    /* [x, width, height, gapAbove]. NOT absolute y — deliberately.
       A 1px height change in the first plate rewrites the y of every plate
       below it: one real change, nine changed lines, at every width, in both
       projects. Storing the SEAM GAP instead makes it one line, and the gap
       is itself one of the three things visual-baselines.spec.js says the
       gate exists to watch. Nothing is lost — absolute position is heights
       plus gaps. Rounded once, AFTER the subtraction: rounding both operands
       first turns two half-pixel errors into a whole one before the tolerance
       has had its say. */
    const prev = boxes[i - 1];
    const gap = prev ? b.top - (prev.top + prev.h) : b.top;
    out[`plate.${b.el.id}`] = [round(b.left), round(b.w), round(b.h), round(gap)];
  });

  /* Structural rows, derived by a PREDICATE rather than a list of class names:
     a flex or grid container inside a plate holding two or more children that
     are, or contain, a link or a button. A new CTA row is under this gate the
     moment it renders. Measured on the home page: 7 rows, 26 children.

     This is the assertion that carries DEF-54's headline case. At 1440 the
     D112 copy button changed the contact plate's box by NOTHING and the row
     container's box by NOTHING — the only signals are the child count, the
     child tag sequence, and the child boxes. A gate that recorded plates,
     nav and seams alone would have passed D112 exactly as the pixel gate did. */
  const seen = Object.create(null);
  /* DEF-60's denominators. Counted here, returned OUTSIDE `out`, and never
     baselined — see the note on the return below. The predicate can silently
     stop matching a row; these two numbers are what geometry-floor.mjs holds it
     to. */
  let rowCount = 0;
  let rowChildCount = 0;
  const rowStems = [];
  for (const plate of plates) {
    for (const el of plate.querySelectorAll('*')) {
      const display = getComputedStyle(el).display;
      if (display !== 'flex' && display !== 'grid') continue;
      const kids = [...el.children];
      const controls = kids.filter((c) => c.matches('a[href],button') || c.querySelector('a[href],button'));
      if (controls.length < 2) continue;

      rowCount += 1;
      rowChildCount += kids.length;

      const cls = [...el.classList].sort().join('.') || el.tagName.toLowerCase();
      const stem = `${plate.id}/${cls}`;
      seen[stem] = (seen[stem] ?? -1) + 1;
      const key = `row.${stem}#${seen[stem]}`;
      /* DEF-60 round two. The two counts above are aggregates, and a
         cross-model review proved an aggregate is substitutable: restyle
         `.contact .ctas` to block and add an unrelated five-link flex row, and
         7 rows / 26 children comes back to 7 / 26 with the contact controls no
         longer measured. Row IDENTITIES are what refuse that. Same string the
         baselined key uses, minus the `row.` prefix, so the two cannot drift. */
      rowStems.push(`${stem}#${seen[stem]}`);

      const pr = plate.getBoundingClientRect();
      const rr = el.getBoundingClientRect();
      const painted = kids.filter((c) => {
        const cr = c.getBoundingClientRect();
        return cr.width > 0 && cr.height > 0;
      });

      /* Two counts, not one. DOM children catch a control being added or
         deleted in the markup. PAINTED children catch a control that ships in
         the markup and never gets drawn — D112 records that
         `.btn[hidden]{display:none}` is load-bearing, because `.btn`'s own
         `display:inline-block` is an author rule that beats the UA [hidden]
         rule, so deleting one line paints a dead button. One number cannot
         see both. */
      out[`${key}.count`] = [kids.length, painted.length];
      out[`${key}.tags`] = kids.map((c) => c.tagName.toLowerCase()).join(',');
      out[`${key}.box`] = [round(rr.left - pr.left), round(rr.top - pr.top), round(rr.width), round(rr.height)];

      kids.forEach((c, i) => {
        const cr = c.getBoundingClientRect();
        /* "hidden" rather than [0,0,0,0]: a child flipping between painted
           and not is then one obvious line in the diff instead of four zeros
           a reviewer skims past. Child boxes are relative to the ROW, so an
           edit elsewhere in the plate does not rewrite every button's number
           and bury the change the row exists to show. */
        out[`${key}.child.${i}`] =
          cr.width > 0 && cr.height > 0
            ? [round(cr.left - rr.left), round(cr.top - rr.top), round(cr.width), round(cr.height)]
            : 'hidden';
      });
    }
  }

  /* Not baselined — returned so the spec can assert floors the baseline cannot
     corrupt. See the spec's anti-poison note. `rowCount` and `rowChildCount`
     are DOM counts, not painted ones, so they do not move with the viewport:
     measured identical at 390, 768 and 1440 in both projects. */
  return {
    keys: out,
    plateCount: plates.length,
    rowCount,
    rowChildCount,
    rowStems,
    docHeight: round(document.documentElement.scrollHeight),
  };
}
