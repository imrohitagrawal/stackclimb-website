/* The recomposition stylesheet for the share card.
 *
 * Extracted from scripts/og-card.mjs at D8's 250-line ceiling. It lives apart
 * because it is the one part a designer would touch, and because every rule in
 * it is load-bearing for a reason recorded inline — this is not a place to
 * tidy.
 */
/* Recomposition only: hide chrome, fit the hero to 1.9:1. No text is added,
   moved between elements, or reworded here. */
export const compose = (H) => `
  header, nav, .skip, .plate-index, footer { display: none !important; }
  /* FAST-FORWARD animations; do NOT kill them. Setting animation to none froze
     the practice panel in its PENDING state, so the card read "CHECKING" beside
     three rows stamped "ENFORCED" — a self-contradictory state the live page
     never rests in. Measured: on the plain page .chip-pending is not visible
     and the resolved chip is; with animation:none that inverts exactly.
     A generator built to stop the card claiming what the site does not was
     itself making the card claim what the site does not. Found by review,
     reproduced, and fixed here. A negative delay with a ~0 duration lands
     every animation on its final frame instead. */
  *, *::before, *::after {
    animation-delay: -10s !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    animation-fill-mode: forwards !important;
    transition: none !important;
  }
  html, body { overflow: hidden !important; }
  #top { min-height: ${H}px !important; height: ${H}px !important; padding: 0 !important; }
  /* The top band is NOT decorative slack. apply_watermark.py refuses to place
     the credit line if no corner is quiet enough — it will not overlap content
     by guessing — so the card must leave it somewhere to land. The card that
     shipped in 2026-08 carried its credit in exactly this strip; an 18px
     margin all round was refused, and so was 42px. The number is derived, not
     guessed: the skill sizes its font at min(w,h)//28 = 22px here and probes a
     corner box of text_h + 2*MARGIN, about 50px tall, so the quiet band must
     exceed that. 62px clears it. Shrink this and the watermark step fails
     LOUDLY rather than stamping over content — which is the behaviour we
     want, and is why this comment records the arithmetic. */
  #top .plate-frame { margin: 62px 18px 18px !important; height: ${H - 80}px !important; overflow: hidden !important; }
  #top .plate-grid { padding: 18px 32px !important; gap: 22px !important; align-items: start !important; }
  #top h1 { font-size: 39px !important; line-height: 1.02 !important; margin-bottom: 10px !important; }
  #top .plate-copy p { font-size: 14.5px !important; line-height: 1.48 !important; }
  #top .ctas { margin-top: 14px !important; gap: 9px !important; }
  #top .ctas .btn { font-size: 10.5px !important; padding: 8px 13px !important; }
  #top .hero-ledger { margin-top: 14px !important; padding-top: 10px !important; }

  /* The practice table is the hero's evidence device and belongs on the card,
     but it has six rows and the card has room for three. Trim by WHOLE rows —
     a half-row reads as a rendering fault, and this card is the site's first
     impression. Hiding rows removes no claim: every row is still on the page
     the card links to, and the gate asserts the card says nothing the site
     does not. */
  #top [data-og-hide] { display: none !important; }
  #top .practice-foot { display: none !important; }
  #top .practice-panel { overflow: hidden !important; }
  /* .caps sits below the panel and does not fit; the hero-ledger below the
     copy carries the same kind of credential line and does fit. */
  #top .caps { display: none !important; }
  #top .hero-ledger .ledger { font-size: 10.5px !important; line-height: 1.45 !important; }
  /* Rows past the third of each list are marked [data-og-hide] in JS before
     this runs — see markOverflowRows() in scripts/og-card.mjs. A first version
     used :nth-of-type(n+4), which counts DIV SIBLINGS, not class matches:
     insert one non-matching <div> into either container and the card silently
     loses a row. An earlier attempt before that used dt:nth-of-type and
     matched nothing at all, because the rows are div.row wrappers.
     Keeping THREE, and the cut is deliberate rather than a fit decision: row 5
     is "Seeking — Senior / Principal ...". The site is allowed to state
     availability as plain fact, but a share card that leads with what he wants
     rather than what he has done reads as a campaign, which AGENTS.md's voice
     rule bars. The card carries the record; the page carries the ask. */

`;
