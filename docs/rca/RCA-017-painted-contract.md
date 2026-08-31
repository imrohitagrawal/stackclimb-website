# RCA-017 — `painted()` had no written contract

## What happened

`tests/lib/painted.mjs` accreted one guard per idiom, in order, as each was found by a
reviewer: opacity, then filter/clip-path, then transparent colour, then size, then
containers. Each round the *fixture set* defined what "painted" meant, retroactively, after
the code was already written. Nobody had written down, before the code, what the function
promises and over what input space. So every review round found a shape the existing guards
did not cover, and every fix that closed one shape left another open — the two-walk
container rewrite fixed six container-shaped holes and, in the same review pass, was found
to still pass white-on-white text, a 1px-tall padded box, and an off-screen-positive
element, because those shapes were never enumerated either.

## Where introduced

The pattern started with the original extraction of `painted()` from `proof-act.spec.js`
(RCA-005's rescope) and repeated at every subsequent hardening pass. `harden-painted` was
the round that got stopped before merging, specifically because the fixture-defines-the-code
order was recognised as the actual defect, not any single missed idiom.

## Where caught

Two adversarial review rounds on the queued `harden-painted` branch, recorded in
`docs/STATUS.md` D164: round 1 of `codex exec --sandbox read-only` found the
transparency-guard dead-code regression (container holes one level below `el`); round 2,
run after that fix, found the container rewrite still passing three more shapes (font-size
floor, `content-visibility`, off-screen-positive). Circuit-breaker rule 3 fired — two fixes
in a row each introducing a defect — and the package stopped rather than pushing a third
patch through. D164 records the diagnosis plainly: *"Root cause, and it is not coding:
`painted()` has no written contract."*

## Cost

A queued, unmerged package sitting since 2026-08-31, blocking the container-hardening
coverage improvement it contains from reaching any of the 5 spec files that import
`painted()`. Every further patch attempt on the branch risked repeating the pattern — fix a
shape, leave a new one uncovered, discover it in the next review round — for as long as
nobody wrote down the input space the function is meant to cover.

## Evidence

- `docs/contracts/painted.md`'s own "why this file exists" note (D164): the guards
  accreted idiom by idiom and every reviewer found a shape they didn't cover.
- `docs/STATUS.md` D164: `harden-painted` stopped by breaker rule 3 (two fixes in a row
  each introducing a defect), rule 2 having already fired in round 1. Measured:
  `painted()` certified 22 of 24 invisibility idioms before the D166 fix; the transparency
  guard was dead code against `color-mix()` (used in 15 stylesheets).
- The companion package `cite-audit` was stopped by a *different* breaker rule (a new class
  of finding in round 2) in the same run, for the same underlying reason — no written
  contract before the fix — corroborating that the lesson generalises rather than being a
  one-off.
- `docs/contracts/painted.md` itself: 63 matrix rows (numbered 1-62, plus 43b), 7 rounds of
  `codex exec --sandbox read-only`, run foreground and blocking each time, converged —
  rounds 5, 6 and 7 each produced exactly one finding, and each was a restatement of an
  already-declared root cause rather than a new one.

## Proposed fix, and what was actually done

Verify `tests/lib/painted.mjs` against `docs/contracts/painted.md`'s converged matrix,
row by row — not against a hand-picked fixture set, and not against the next idiom a
reviewer happens to think of. **CORRECTED 2026-09-01, review round on #137:** the first
draft of this section claimed the self-test "verified directly... every row with a concrete
verdict." That overreached. A different-model-family review (`codex exec`) found the
self-test's 27 fixtures did not map one-to-one against every concrete-verdict row — several,
including `filter`/`clip-path` on `el`, off-screen-negative, `display:none`,
`visibility:collapse`, and one restated multi-layer-backdrop case, had no dedicated fixture
at all. Fixed by adding fixtures for each (now 33 HOLES, 16 KEEPERS, self-test still green),
restoring three regression-protection fixtures the branch's old self-test carried and this
one had dropped (`lab(0 0 0 / 0)`, opaque `rgb(0,0,0)`, near-zero fill alpha), and by not
repeating the overclaim: this row now states what was actually run, not what a matrix
implies should have been. The existing two-walk implementation (at-least-one semantics,
container-aware, canvas-alpha colour read) satisfies every row in the matrix that carries a
concrete `true`/`false` verdict that this expanded self-test actually exercises; verified by
running the self-test (`tests/painted-selftest.spec.js`, 3 tests, all green) and by two
independent mutation checks run in this session:

1. Narrowing the descendant walk from `el.querySelectorAll('*')` to `:scope > *` (the exact
   regression DEF-80 warns a future narrowing could ship) turned exactly 1 of the then-27
   HOLES red — the new **GRANDCHILD** fixture this package adds, closing the gap the
   contract's row 5 named as missing from the branch's fixture set. Run against the 27/12
   population, before the round-2 review expanded the table to 33/16; the mechanism it
   exercises (the descendant walk) is untouched by that expansion, so the result still
   stands as evidence for the GRANDCHILD fixture specifically.
2. Deleting the abandon guard (`if (backgroundImage !== 'none' || mixBlendMode !== 'normal')
   return true`) false-redded exactly 1 of the then-12 KEEPERS — the background-image
   gradient case, matching DEF-46's lesson. Same population caveat as above.

Both mutations were restored immediately after, confirmed by `git diff --stat` clean and a
fresh green run of the full self-test.

**DEF-80 is closed by this package**: the HOLES table previously had no fixture with text a
full grandchild below the located element (only direct-child CONTAINER shapes), so a future
narrowing regression one level deeper than the existing fixtures could have shipped
invisible again undetected. The new fixture closes that.

## What will bite — stated plainly, not by oversight

The contract declares roughly half its 63 rows `UNDEFINED` on purpose, not as an omission.
These remain true after this package, by design, and this package does not attempt to close
them:

- **No contrast ratio, ever.** Identity-only colour check, zero threshold. `#fefefe` on
  `#ffffff` passes. Real contrast is `tests/lib/rendered-contrast.mjs`'s job.
- **No font-size floor above exactly zero.** `opacity: 0.01` and a near-zero fill alpha both
  pass. A minimum-size ruling is `DESIGN.md`'s, under P-18 — this function does not make it.
- **The abandon guard is a real, ever-widening exemption on the backdrop-identity check**
  (DEF-78), not an unconditional override: it fires only for a node that has already passed
  its own font-size, visibility and fill-alpha checks — `color: transparent` over a
  background-image still correctly returns `false`, never reaching the guard. Past that
  point, one `background-image` or `mix-blend-mode` anywhere up a text node's chain does
  drop colour-identity checking for that node. Filed as a known accepted risk, not reopened
  here. (Corrected 2026-09-01 — the first draft of this bullet said "unconditionally," which
  a review round found and disproved by reading `inked()`'s actual check order.)
- **Off-screen-positive elements pass**: `left: 99999px` expands `scrollWidth` to contain
  itself, so the bounds check never rejects it. A real fix needs a viewport-relative check
  (`tests/lib/viewport-clip.mjs`), a different tool, not wired in here.
- **No occlusion / hit-testing**: an opaque unrelated overlay, or the element's own
  `::before`/`::after`, can cover real text and `painted()` still returns `true`.
  `tests/lib/read-links.mjs` owns hit-testing, not this function.
- **No pseudo-element (`::before`/`::after`) content is ever seen**: the function walks real
  DOM text nodes only, so an element whose only content is generated is vacuously `true`
  either way.
- **No per-descendant position or clip check strictly below `el`** — a `filter`/
  `clip-path`/`content-visibility`/`contain` on an inner wrapper, or a `transform`/
  `position`-shifted descendant, is invisible to both walks, which only ever examine `el`'s
  own ancestor chain and each text node's backdrop chain. This is the single largest
  declared root cause in the contract (rows 42, 43, 43b, 44, 54, 56, 57 all reduce to it)
  and it is not fixed by this package.
- **Legacy hiding idioms are not read**: `text-indent: -9999px` and the deprecated
  `clip: rect(0,0,0,0)` property both pass.
- **Zero-width text characters and SVG `fill`** are not read; `.trim()` does not strip
  U+200B, and `webkitTextFillColor || color` never checks SVG's `fill` property.
- **Timing is a caller responsibility, not enforced**: a bare `page.goto` with live motion,
  an unloaded webfont, or a delayed DOM insertion can all make `checkVisibility()` read
  `false` mid-reveal. Every current importer neutralises motion before calling `painted()`;
  a new call site that doesn't is out of contract, not a bug in the function.

None of these are silently missed. They are declared, in the contract, with a name for what
covers them instead where one exists. This package does not change that list — it makes the
code's behaviour match what the contract already states for the rows that DO have a
concrete verdict, and closes the one fixture gap (DEF-80) the contract identified as
missing.
