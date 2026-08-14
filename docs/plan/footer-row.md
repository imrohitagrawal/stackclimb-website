# Footer row — the colophon becomes one row at desktop

The owner's instruction of 2026-08-14, deferred from package 4B at his word ("add this as
part of the next action item, let Package 4B be delivered"), registered as P-20 in this same
PR. Layout only: not one rendered word changes.

## Ground truth, verified by command

| Fact | Command | Result |
|---|---|---|
| Footer height before | serve `dist/` via astro preview API, Playwright boundingBox | **210px at 1440 · 250px at 390** |
| Footer content | read `src/components/Colophon.astro` | defn `p` (D62 full line, tail included) · `© 2026 Rohit Agrawal · Bengaluru` · the motion toggle button |
| Footer gates today | grep `colophon` in `tests/` | `proof-act.spec.js` only — text-based (exact defn string + painted, on `/` and `/projects/citevyn`); survives a layout change |
| Footer in visual baselines / seam checks | grep | absent from both — no baseline regeneration needed |
| Toggle tap target | `src/styles/motion.css` | `min-height: 44px` declared; the tap gate carries D85's half-pixel tolerance |
| Reading alignment | `global.css` `.plate` | horizontal padding `clamp(1.25rem, 4.5vw, 4rem)` — the footer row adopts the same inline padding so its left edge sits where plate copy sits |
| Print/CV surfaces | `print.css:24` · `cv.css:204` | both `display: none` the colophon — untouched by a layout change |

## Clause maps (cited by row ID, per the D79 rule and its RCA-002 extension)

- **Owner instruction → P-20 (new row, this PR):** ONE ROW at desktop — the definition left
  at reading alignment, © + the animation toggle grouped right; stacked with tightened
  spacing at 390. Acceptance: `tests/colophon.spec.js` one-row/stacked assertions; heights
  re-measured into the STATUS row.
- **D62 / D85 footer ruling:** the FULL definition, tail included, on every page's footer —
  the exact string is the bar partner on every built page. Mapped: the string is not touched;
  `proof-act.spec.js` footer test carries over unchanged and must stay green.
- **P-15 (copy carries a plain-English example):** mapped as no-new-copy — this package adds
  zero rendered words, so no surface needs the recruiter yardstick re-asked. Written refusal
  to reword anything here.
- **P-16 (approximate, never self-reported):** untouched copy; the 29-string live sweep set
  is unchanged.
- **P-17 (no No-Go on the act):** out of scope — the act is untouched.
- **P-18 (presentation delegated):** this is exactly the delegated class. The owner reviews
  the rendered result: 1440 and 390 screenshots in the PR body.
- **P-19 (hero animates):** out of scope; the motion toggle keeps its id, script binding,
  and `aria-pressed` contract — `motion.spec.js` unchanged and must stay green.
- **D8 file budget:** the new spec ≤250 lines · 120 chars; `global.css` and `motion.css`
  edits stay inside existing files' concerns (colophon block, toggle block).
- **Definition of Done 2/6:** render seen at 1440 AND 390; no horizontal scroll at 390.
- **Tap targets:** the toggle keeps `min-height: 44px` in the row layout.

## What ships

**`Colophon.astro`** — the `©` line and the toggle wrap in `<div class="colophon-legal">`
so they group right. Defn `p` unchanged, first in source (AT reading order: the definition
before the legal line, unchanged from today).

**`global.css` colophon block** — desktop (`min-width: 901px`, the site's existing
breakpoint): flex row, `justify-content: space-between`, `align-items: center`, text-align
left, inline padding `clamp(1.25rem, 4.5vw, 4rem)` (plate alignment), block padding cut from
`2.2rem/2.8rem` to `1.1rem`. Defn keeps `max-width: 46rem`, drops its centering margins at
desktop. Base (≤900px): stacked as today but tightened — block padding `1.4rem/1.6rem`,
defn margin-bottom `0.6rem`. **`motion.css`** — toggle `margin-top` becomes 0 inside the
row (mobile keeps a small gap via the legal group).

**`tests/colophon.spec.js`** (new, small) — which change turns each red is stated in-file:
1. At 1440: defn box and legal-group box overlap vertically (one row) and the defn's left
   edge is left of the group's — red if the flex rule is deleted (stack returns).
2. At 390: defn sits fully above the legal group (stacked) — red if the row layout leaks
   below the breakpoint.
3. Both painted (existence partner for the geometry checks — an empty footer passes no box).
Mutations watched red against a sealed commit, per the COMMIT-BEFORE-MUTATION rule.

**Records** — register: P-20 row (directive, status DONE, this PR) · `docs/STATUS.md` D86:
before/after heights at both widths, mutation record, fan numbers.

## Amendments — the seven-lens fan (round 1), 2026-08-14

13 material findings raised; every verified one CONFIRMED or SPLIT, 0 refuted (the streak
holds). Three change the build; each supersedes the section above where they conflict.

**Reading alignment was measurably wrong (peer + uiux + architect, CONFIRMED by three
independent executions).** The plan said the plate's outer padding `clamp(1.25rem, 4.5vw,
4rem)` is where plate copy sits. It is not: copy sits inside `.plate-frame` —
`width: min(1240px, 100%)`, centered, own padding `clamp(1.75rem, 4vw, 4rem)`, 1px border —
measured left edge **158.6px at 1440** against the plan's 64px, a 94.6px miss. Fix: the
footer content wraps in `.colophon-row`, which replicates the frame's geometry exactly
(same width, centered, inline padding `calc(clamp(1.75rem, 4vw, 4rem) + 1px)` — the +1px
stands in for the frame border). The spec asserts the defn's left edge within 2px of a
plate's `.plate-copy` left edge — the instruction's own words, gated.

**global.css cannot take the new rules (architect BLOCK + peer, CONFIRMED).** 497/500
grandfathered shrink-only; the gate is CI-blocking. Fix: the whole colophon block moves to
a NEW `src/styles/colophon.css` (well under the 250 cap), imported from `Layout.astro`
(+1 line, 228/250). global.css shrinks by the moved block — the D8 direction it is allowed
to move.

**The row jams at 901–1250px (uiux MAJOR, CONFIRMED at six widths).** 46rem defn + ~420px
nowrap legal group exceeds the content width below ~1250px. Fix: defn `flex: 1 1 auto;
min-width: 0` (wraps to more lines mid-width), legal group `flex: 0 0 auto`, row
`gap: 2rem`. The spec adds a 1024px assertion: one row holds AND the defn-to-group gap
stays positive.

**Minors folded:** legal group is an internal flex row (© beside toggle, right-flush —
the unstyled group measured 125px shy of the right edge); a right-edge assertion bites the
`justify-content` mutation the overlap checks survive; measured heights recorded as
fractional (209.59 / 249.53), not rounded integers; expected after-heights stated up front
— **~96px at 1440, ~213px at 390** (uiux measured both by in-browser mutation; at 390 the
remaining height is content the D62 string and the 44px tap floor fix in place, so
spacing-only cannot go materially lower — the owner sees ~213, not a miracle); P-1..P-14
swept — no other copy-governing row touches the footer (P-13's contact links do not render
there); a 901px render joins the PR screenshots (© wraps inside the narrow group there —
acceptable, shown rather than discovered).

## Not in this package

Any copy change · nav · `/experience`, `/how-i-build` (package 5) · a general alignment
regression harness (that is I-3, next in the register queue — this spec gates only the
footer's own layout).
