# Contract: `painted()`

**Why this file exists (D164).** `painted()` accreted one guard per idiom as each was found by a
reviewer — opacity, then filter/clip-path, then transparent colour, then size, then containers —
and every round the fixture set defined its meaning retroactively rather than the other way
round. Nobody had written what the function promises, over what input space, so every reviewer
found a shape the guards did not cover and every fix opened a new edge (D165). This document is
that promise, written and reviewed before any further code change, per
`docs/practices/autonomous-run.md` Phase 1a.

Source read: `tests/lib/painted.mjs` on `main` (canvas-alpha fix only, no container hardening) and
on branch `harden-painted` (two-walk, at-least-one, container-aware version — this contract is
written against the branch version, since that is the code under review). Importers read:
`tests/viewport-reach.spec.js`, `tests/how-i-build.spec.js`, `tests/proof-cv.spec.js`,
`tests/proof-act.spec.js`, `tests/experience.spec.js`, `tests/painted-selftest.spec.js` (5
files import it; the earlier "20 spec files" figure was a call-site count, corrected in D169).
Renamed from `tests/painted-alpha-selftest.spec.js` during Phase 3/4 build (this package) to drop
the now-inaccurate "alpha" qualifier — the file covers far more than the alpha/transparency guard.
Note `tests/content-model.spec.js` does **not** import this file — it defines its own local
`painted` helper with different, narrower semantics (leaf-shaped, `expect()`-internal). This
contract governs `tests/lib/painted.mjs` only.

## (a) The promise

> `painted(el)` is **true** when at least one text-bearing node in `el`'s own subtree (`el`
> itself, or a descendant that owns a non-empty text child) is **inked**: it survives every
> ancestor's clip/filter/`content-visibility` to occupy at least a 4×4px on-screen rectangle,
> `checkVisibility()` passes on it, its resolved `font-size` is non-zero, and its fill colour
> (`-webkit-text-fill-color` or `color`) has non-zero alpha and is not byte-identical to its own
> fully-opaque composited backdrop. `painted(el)` is **false** when no such node exists among
> `el`'s text-bearing descendants, or when `el`'s own ancestor chain proves nothing of `el`'s
> rectangle can reach the screen at all (a `filter`/`clip-path` anywhere above it, or an ancestor
> with `content-visibility: hidden`). It is **vacuously true** — by declared convention, see (d) —
> when `el` has no text-bearing descendant node at all.

This does not fit in one sentence, and that failure to compress is itself a finding: the function
answers two different questions (does `el`'s own rectangle survive to the screen at all; is at
least one of its text nodes actually inked) and conflates them into one boolean. The two-walk
structure in the code already reflects this; the contract keeps them separate on purpose (D1/D3
below) rather than pretending it is one check.

## (b) The dimensions

1. **Node shape** — where the text-bearing node sits relative to `el`.
2. **Per-node ink status** — is the resolved fill colour visually distinct from its backdrop.
3. **Per-node visibility** — `checkVisibility`, `opacity`, `visibility`, `font-size`.
4. **Ancestor rectangle survival** — what reaches the screen at all, walking from `el` up.
5. **Element box size** — the clipped rectangle's dimensions.
6. **Off-screen direction** — which side of the viewport/document `el`'s box falls outside.
7. **Occlusion** — whether another element opaquely covers `el`'s box (hit-testing).
8. **Contrast magnitude** — how different the fill is from the backdrop, not just whether.
9. **Timing** — whether the page/animation has settled before the check runs.
10. **Legacy hiding idioms** — `text-indent`, the deprecated `clip` property.
11. **Text existence** — whether `el` has any text-bearing descendant node at all.
12. **Generated content** — text that exists only as `::before`/`::after` `content`, never as a DOM
    text node.
13. **Abandon-guard trigger** — a `background-image` or `mix-blend-mode` anywhere up a text node's
    own ancestor chain (distinct from `el`'s own ancestor chain in dimension 4).

## (c) The values

| # | Dimension | Values |
|---|---|---|
| 1 | Node shape | `el` is itself the text-bearing node · text is `el`'s direct child · text is a grandchild or deeper · text exists in two siblings at different depths (one shallow, one deep) |
| 2 | Ink status | opaque fill, distinct from backdrop (inked) · opaque fill, byte-identical to backdrop (invisible-by-identity) · zero-alpha fill (`transparent`, `color-mix` resolving to alpha 0, `oklch(0 0 0 / 0)`) · near-zero alpha (`0.01`) |
| 3 | Visibility | `checkVisibility` true · `opacity: 0` · `visibility: hidden` (own or ancestor) · `font-size: 0` |
| 4 | Ancestor survival | no clipping ancestor · `overflow: hidden` ancestor, box fully clipped to 0 · `overflow: hidden` ancestor, box clipped but still ≥4×4px · `filter` on `el` or any ancestor · `clip-path` on `el` or any ancestor · `content-visibility: hidden` on `el` or any ancestor · `content-visibility: auto` on an off-screen ancestor (skips layout, computed style still reads `auto` not `hidden`) |
| 5 | Box size | ≥4×4px · sub-4px on one axis · 0×0 · normal box but defeated by padding around a `height:1px`/`font-size:1px` core (branch's own limitation 11) |
| 6 | Off-screen direction | on-screen · negative (`left < 0`, `top` above document) · positive (`left`/`top` beyond `scrollWidth`/`scrollHeight`, e.g. `left: 99999px`) |
| 7 | Occlusion | unoccluded · covered by an opaque, unrelated overlay |
| 8 | Contrast magnitude | identical (`Δ=0`) · off-by-one channel (`#fefefe` vs `#ffffff`) · clearly distinct |
| 9 | Timing | settled (no live motion) · mid-reveal animation on a bare `page.goto` |
| 10 | Legacy hiding | none · `text-indent: -9999px` · `clip: rect(0,0,0,0)` on a full-size box |
| 11 | Text existence | ≥1 text-bearing descendant · none at all (e.g. a sized empty `<div>`) |
| 12 | Generated content | none · `::before`/`::after` with visible, styled `content` and no real text node · `::before`/`::after` `content` styled invisible (e.g. `color: transparent`) |
| 13 | Abandon guard | no `background-image`/`mix-blend-mode` up the text node's chain · present somewhere up the chain |

## (d) The matrix

Cross-referencing every dimension exhaustively is combinatorial; the matrix below enumerates every
cell a real call site, a past reviewer, or the two open `codex` rounds actually produced, plus the
cells needed to state each declared-undefined boundary precisely. Verdict is `painted(el)` as
specified for the branch code, or **UNDEFINED, declared** with the reason it is declared that way
rather than fixed.

| # | Shape | Verdict | Reason / evidence |
|---|---|---|---|
| 1 | Leaf: `el` itself is inked, opaque, on-screen, ≥4×4px | **true** | The base case every call site assumes |
| 2 | Leaf: `el` itself, `color: transparent` | **false** | Ink-status check, zero alpha |
| 3 | Leaf: `el` itself, `color-mix()` resolving to alpha 0 | **false** | Canvas-alpha read, D166 |
| 4 | Container: text is `el`'s direct child, that child transparent | **false** | Container hardening, D164 round 2 |
| 5 | Container: text is a **grandchild**, transparent | **false** | DEF-80 — code already walks all descendants (`querySelectorAll('*')`, not `:scope > *`); this cell exists so a future narrowing regression has a fixture that catches it. Missing from the branch's 38-fixture set before this contract; must be added in Phase 3 |
| 6 | Container: one shallow child transparent, one deep grandchild inked | **true** | At-least-one semantics (d) — the shallow hole must not suppress the real deep signal |
| 7 | Container: every descendant transparent, at every depth | **false** | At-least-one over an empty true-set |
| 8 | `el` fully empty, zero text-bearing descendants, no generated content | **UNDEFINED, declared vacuously true** | `painted()` answers "is text painted", not "does text exist". A caller needing existence must assert it separately (e.g. `expect(locator).not.toBeEmpty()` or a `textContent` check) alongside `painted()`. This is DEF-81's first half, resolved by scope rather than by a code branch: painted() is not the existence check |
| 9 | `el`'s only content is `::before`/`::after`, styled visibly | **UNDEFINED, declared out of scope** | Generated content has no DOM text node; the `childNodes` walk cannot see it by construction. Same vacuous-true path as #8 — safe-directioned (never false-reds real generated text) but blind to whether that generated content is itself painted. A caller needing pseudo-element visibility uses a dedicated walker (`tests/print-floor.spec.js`'s pattern), not `painted()`. This is DEF-81's second half |
| 10 | `el`'s only content is `::before`, styled `color: transparent` | **UNDEFINED, same as #9** | `painted()` returns vacuously true here too (no real text node to fail on) — the blind spot is symmetric: it cannot confirm OR deny pseudo-element paint |
| 11 | `filter` on `el` | **false** | Ancestor walk 1, dead-code-proof unrelated to colour |
| 12 | `filter` on an ancestor several levels up, `el` itself clean | **false** | Ancestor walk runs `for (a = el; a; a = a.parentElement)` — covers the whole chain, not just `el` |
| 13 | `clip-path` anywhere in the chain | **false** | Same walk, `clipPath !== 'none'` |
| 14 | `content-visibility: hidden` on `el` | **false** | Explicit check in walk 1 |
| 15 | `content-visibility: hidden` on an ancestor | **false** | Walk 1 covers the chain |
| 16 | `content-visibility: auto` on an off-screen ancestor | **UNDEFINED, declared out of scope** | Computed style still reads `auto`, never `hidden`, while the browser may have skipped layout for the box; the function cannot distinguish a laid-out-and-clipped box from a `content-visibility: auto` box mid-skip without forcing layout. Not guarded; a call site relying on `painted()` across such an ancestor gets an unreliable answer. Flagged rather than silently trusted |
| 17 | `overflow: hidden` ancestor, fully clips `el`'s box to 0 | **false** | Walk 1's intersection math collapses to `x2-x1 < 4` |
| 18 | `overflow: hidden` ancestor, clips but ≥4×4px survives | **true** (if the surviving node is otherwise inked) | Same intersection math, non-zero survivor |
| 19 | Box sub-4px on one axis (e.g. `height: 3px`) | **false** | The 4px floor, walk 1 |
| 20 | Box normal-looking but `height:1px` with padding pushing rendered box to 38px | **true** | Branch's documented limitation 11 — the floor is on the box, not the text; padding defeats intent. Declared limitation, not fixed here — flagged as **out of scope for this contract's fix**, belongs to a "is this element SHRUNK" check this function does not offer |
| 21 | Off-screen negative (`left: -9999px`, or above the document top) | **false** | `r.left < 0` / equivalent, rejected |
| 22 | Off-screen positive (`left: 99999px`, expands `scrollWidth` to contain itself) | **UNDEFINED, declared limitation** | Measured on branch: passes. The bounds checks reject the negative direction only; an off-screen-positive element expands the document to contain itself, so it is never actually "outside" `scrollWidth`/`scrollHeight` by this check's own math. This is limitation 6 in the code's own header comment, kept as a declared gap rather than silently fixed, because fixing it needs a real viewport-relative check (see `tests/lib/viewport-clip.mjs`), which is a different tool for a different job |
| 23 | Opaque, unrelated overlay covers `el`'s box (occlusion) | **UNDEFINED, declared out of scope** | No `elementFromPoint` hit-test. `tests/lib/read-links.mjs` owns occlusion/hit-testing; `painted()` does not duplicate it (limitation 5 in the branch header) |
| 24 | Fill `#fefefe` on backdrop `#ffffff` (near-identical, not identical) | **true** | Identity-only check, zero threshold (limitation 1). Real contrast ratios are `tests/lib/rendered-contrast.mjs`'s job, gated at AA in `tests/nav-contrast.mjs`/`tests/boundary-check.mjs`. `painted()` is explicitly NOT a contrast check |
| 25 | Fill byte-identical to backdrop (`Δ=0`) | **false** | The one case the identity check does catch — this is the whole point of the canvas-alpha rewrite (D166) |
| 26 | `opacity: 0.01` (near-zero, not zero) | **true** | Limitation 7, declared: reads zero only, not faint. Out of scope — a "how faint counts as invisible" threshold is a design/legibility call (P-18's territory), not this function's |
| 27 | Mid-reveal animation, bare `page.goto`, motion live | **UNDEFINED, declared caller responsibility** | `checkVisibility()` measured false mid-reveal, 5 of 6 trials on `/how-i-build`. Every current importer uses `reducedMotion` or motion neutralisation before calling `painted()`. A new call site on a bare `goto` with live motion is out of contract until it neutralises motion first — this is a call-site discipline requirement, stated so it is not rediscovered as a flake |
| 28 | `text-indent: -9999px` on a full-size, opaque-fill box | **UNDEFINED, declared limitation** | Not read at all (limitation 9). A real, common hiding idiom this function is blind to. Declared rather than silently missed — a caller needing this coverage cannot rely on `painted()` alone |
| 29 | `clip: rect(0,0,0,0)` (deprecated property) on a full-size box | **UNDEFINED, declared limitation** | Same as #28 — not read. `clip-path` is covered (#13); the legacy `clip` property is not |
| 30 | `background-image` or `mix-blend-mode` anywhere up a text node's own chain | **true, unconditionally** | The "abandon guard" — walk 2 stops compositing and returns `true` the moment it sees either property, to avoid false-redding legitimate white-on-dark-gradient text (DEF-46's lesson). **This is a real, ever-widening exemption**: one such property high in the tree silently drops colour checking for the whole subtree under it. Filed as DEF-78 rather than guarded here — declared as a known, accepted risk, not a contract gap, because removing it would reintroduce DEF-46 |
| 31 | Multiple stacked semi-transparent backdrops, ending in a fully opaque one | **true/false per composited result** | Walk 2's `over()` compositing folds every non-transparent ancestor background into one, in top-down order, stopping at the first fully opaque layer |
| 32 | Stack of only semi-transparent backdrops, none reaching alpha 255 (page background never explicitly set) | **true** | `if (!layers.length \|\| layers[layers.length-1][3] !== 255) return true;` — an incomplete opaque stack cannot be resolved to a real backdrop colour, so the function fails open (assumes painted) rather than guessing. Declared, matches the "fails OPEN" statement in the code's own header for unparseable colours |

## (d-2) Matrix additions — round 1 adversarial findings

`codex exec --sandbox read-only` round 1 (run in foreground, blocking, per
`docs/practices/autonomous-run.md`'s "poll inline, never background-and-stop" rule) named 34
candidate gaps against the matrix above. Each is triaged below by the run's own three-way rule:
(1) fits an enumerated cell, no fixture yet needed beyond what's written → closed; (2) fits an
enumerated dimension but had no explicit row → row added; (3) fits no enumerated dimension → the
enumeration was wrong, a new dimension is added.

**New dimensions found (case 3 — the enumeration was wrong):**

14. **Per-text-node intervening ancestors** — `filter`/`clip-path`/`content-visibility` on a
    wrapper strictly *between* a text node and `el`, which neither walk checks. Walk 1 only walks
    `el`'s own ancestors; Walk 2's chain-walk (`for (a = n; a; a = a.parentElement)`) only reads
    `backgroundImage`/`mixBlendMode`/`backgroundColor` on that chain, never `filter`/`clip-path`/
    `content-visibility`. **Confirmed by reading the code, not a reviewer error.**
15. **Per-text-node own position** — no walk ever reads a descendant text node's own
    `getBoundingClientRect()`. Bounds/off-screen checks (dimension 6) run once, on `el`'s own rect.
    A `position:absolute`/`transform`-shifted descendant pushed off-screen inside an on-screen `el`
    is invisible to both walks. **Confirmed by reading the code.**
16. **Exotic paint-hiding CSS** — `mask`/`-webkit-mask-image`, `backface-visibility: hidden` after
    a 3D rotation. Neither is read anywhere in either walk.
17. **Shadow DOM / slotted content** — `el.querySelectorAll('*')` does not pierce open shadow
    roots. Declared out of scope rather than fixed: the site uses no custom elements or shadow
    roots today (`grep -rl "attachShadow\|shadowRoot" src/` → 0 hits), so this is a latent
    architectural blind spot, not a live one.
18. **Text-content edge cases** — a text node containing only zero-width characters (e.g. U+200B)
    passes the `.trim()` truthiness filter (trim strips whitespace, not zero-width characters), so
    it enters the node set and `inked()` would certify it painted even though it renders no visible
    glyph. Separately, SVG `<text>`'s actual paint comes from the `fill`/`stroke` CSS properties,
    which can diverge from `color` in ways `webkitTextFillColor || color` does not resolve.
19. **Occlusion by the element's own generated content, and partial (glyph-level) occlusion** — an
    opaque `el::before`/`::after` covering the real text is a different case from cell 23's
    "unrelated overlay," and an overlay covering only *some* glyphs (not the whole box) is a
    different case again. Both are real, both out of scope for the same reason as cell 23.
20. **Backdrop sourced from something other than an ancestor's `background-color`** — a positioned
    sibling, a pseudo-element, a `<canvas>`, or a `<video>` rendered behind the text. Walk 2's
    compositing (the `layers`/`over()` math) only reads `getComputedStyle(a).backgroundColor` up
    the ancestor chain; none of these other real-world backdrop sources are read.
21. **Settling timing beyond motion** — row 27 already declares live-animation timing a caller
    responsibility. Codex correctly generalised this: an unloaded webfont (FOIT), a not-yet-applied
    stylesheet, or a delayed DOM insertion are the same "checked before settled" class, not covered
    by "neutralise motion" alone.

**Rows added for dimensions that existed but had no explicit cell (case 2):**

| # | Shape | Verdict | Reason / evidence |
|---|---|---|---|
| 33 | Leaf `el`, `opacity: 0` on `el` itself | **false** | `checkVisibility({opacityProperty:true})` |
| 34 | Leaf `el`, `visibility: hidden` on `el` itself | **false** | `checkVisibility({visibilityProperty:true})` |
| 35 | Leaf, visible size, but an **ancestor** has `visibility: hidden` | **false** | `checkVisibility` is spec'd ancestor-aware for `visibilityProperty` — confirmed by reading the code, not by assumption; this is why cell 35 differs from the filter/clip-path cells (11-13), which needed an explicit manual ancestor walk because `checkVisibility` is NOT ancestor-aware for those |
| 36 | Leaf, `font-size: 0` | **false** | `parseFloat(c.fontSize) === 0` explicit check in `inked()` |
| 37 | Leaf, fill alpha exactly `0.01` (e.g. `rgba(0,0,0,0.01)`) via the **text colour itself**, not element `opacity` | **UNDEFINED, declared limitation** | Distinct from row 26 (element `opacity: 0.01`, which is a separate CSS property this function never reads at all — only `checkVisibility`'s binary opacity check applies). A near-zero *fill* alpha canvas-quantizes to a small non-zero byte (`0.01 * 255 ≈ 3`), so `fill[3] === 0` never fires and this is certified painted. Same "reads zero only, not faint" limitation as row 26, now stated for the axis codex actually meant |
| 38 | Leaf, opaque `color` but `-webkit-text-fill-color: transparent` | **false** | `webkitTextFillColor \|\| color` reads the fill-color first — already correct, this row exists as a keeper, not a gap |
| 39 | Container, only text-bearing node is an **inked** grandchild (positive counterpart to row 5) | **true** | Same full-descendant walk as row 5, opposite ink outcome |
| 40 | Container with 3 descendants, each invisible by a **different** mechanism (one `color:transparent`, one `visibility:hidden`, one `font-size:0`) | **false** | Generalizes row 7 across heterogeneous failure modes, not just one repeated mechanism — worth its own row since `inked()` runs each check independently per node |
| 41 | Container with one `opacity:0` descendant and one inked descendant | **true** | At-least-one semantics exercised against `checkVisibility`'s opacity path specifically, not just colour (contrast with row 6, which is colour-only) |

**Rows added for the new, real dimensions (14-21) — case 3, genuinely undeclared before this round:**

| # | Shape | Verdict | Reason / evidence |
|---|---|---|---|
| 42 | `filter`/`clip-path`/`content-visibility:hidden` on a wrapper between a text node and `el` (not on `el`'s own ancestor chain) | **UNDEFINED, declared gap — false negative direction** | Neither walk checks this. A container whose only text sits inside a blurred or `content-visibility:hidden` inner wrapper is certified painted when a reader would not see it. Not guarded on the branch; recorded here rather than silently missed |
| 43 | `overflow:hidden` on a wrapper between a text node and `el`, clipping only that inner wrapper's own text while `el`'s own box stays fully visible | **UNDEFINED, declared gap, same class as 42** | Walk 1's clip math only intersects `el`'s own ancestor chain; an inner clipping wrapper below `el` is invisible to it |
| 43b | (round 7) `filter`/`clip-path`/`content-visibility` applied directly **on the text-bearing descendant node itself** (not on an intervening wrapper — row 42 — nor on `el`'s own ancestor chain — row 13) | **UNDEFINED, declared gap, same root cause as 42** | Same missing mechanism restated for the node itself rather than a wrapper between it and `el`. By round 7 this is the third variant of the identical declared gap (rows 42, 43, 43b all reduce to "nothing below `el` in the tree is ever checked for clip/filter/content-visibility, whether on the node, a wrapper, or `el`-as-clipper") — treated as one root cause, not three, for any future fix |
| 44 | A text-bearing descendant `position:absolute`/`transform`-shifted off both viewport and document extent, inside an `el` whose own box is on-screen. **Includes the sub-case (round 5) where `el` itself has `overflow:hidden` and the descendant is positioned to escape `el`'s own box while staying inside the viewport** — `el` is excluded from clipping its own rect in Walk 1's loop (`a !== el` guard), and Walk 2 never checks a descendant's own rect against any clipper, so `el`-as-its-own-clipper is the same missing mechanism, not a separate one | **UNDEFINED, declared gap** | No walk reads a descendant's own `getBoundingClientRect()`. The single bounds check in Walk 1 runs on `el`'s rect only |
| 45 | Text hidden by `mask`/`-webkit-mask-image` | **UNDEFINED, declared limitation** | Not read anywhere |
| 46 | Text hidden by `backface-visibility: hidden` after a 3D flip | **UNDEFINED, declared limitation** | Not read anywhere |
| 47 | Text inside an open shadow root under `el` | **UNDEFINED, declared out of scope** | `querySelectorAll('*')` does not pierce shadow roots; the site has zero shadow roots today (`grep -rl attachShadow src/` → 0), so this is latent, not live |
| 48 | A text node containing only zero-width characters (e.g. U+200B), otherwise opaque and on-screen | **UNDEFINED, declared gap** | `.trim()` does not strip zero-width characters, so the node enters the set and is certified painted with no visible glyph |
| 49 | SVG `<text>` whose `fill` is transparent while `color` remains opaque | **UNDEFINED, declared limitation** | `webkitTextFillColor \|\| color` never reads `fill`. **Verified live, not hypothetical:** `grep -rn "<text" src/` finds it in `src/components/figures/PrivateFigure.astro:37,59` (two `<text>`/`<tspan>` labels, "EVALAXIS" and "AEGIS CONTRACTS"). **Verified no current gap in practice:** no spec file that imports `tests/lib/painted.mjs` or references `PrivateFigure`/`private` calls `painted()` against it (`grep -rln "PrivateFigure\|private" tests/*.spec.js \| xargs grep -l "painted("` → no matches) — so this is a real, confirmed blind spot in the function, with zero live call sites exercising it today |
| 50 | Real text covered by the element's own opaque `::before`/`::after` (self-occlusion, distinct from row 23's unrelated overlay) | **UNDEFINED, declared out of scope** | Same "no hit-testing" limitation as row 23, now stated for the self-occlusion case specifically |
| 51 | An overlay covering some but not all glyphs in `el` | **UNDEFINED, declared out of scope** | Same limitation, partial-coverage case |
| 52 | Backdrop actually supplied by a positioned sibling, pseudo-element, `<canvas>`, or `<video>` rather than an ancestor's `background-color` | **UNDEFINED, declared limitation** | Walk 2's compositing reads `getComputedStyle(a).backgroundColor` up the ancestor chain only; none of these other real backdrop sources are read. The identity check (row 24-25) can therefore both false-pass and false-fail against a backdrop it never actually saw |
| 53 | Checked before a webfont finishes loading (FOIT), before a stylesheet applies, or immediately after a delayed DOM insertion | **UNDEFINED, declared caller responsibility, generalizing row 27** | Same class as the motion-timing gap; every current importer happens to wait for the page to settle before calling `painted()`, but nothing in the function enforces it |

**Findings disposed as already covered (no new row needed) — recorded so they are not silently dropped:**

- *"An ancestor that leaves ≥4×4px of `el` visible, while the surviving region contains no text and every glyph lies in the clipped region"* — real in principle, but Walk 1's clip rectangle is computed once for `el`'s whole box and the `inked()` per-node check runs independently per text node with its own `checkVisibility()`; a node whose glyphs are entirely in a clipped-away sub-region would still need to be a **specific text node**, which brings this back to gap #43 above (an inner clipping wrapper) rather than a new case.
- *"Multiple clipping ancestors whose combined intersection is below 4×4px although each individual intersection is at least 4×4px"* — **checked against the code and found NOT to be a gap.** Walk 1's loop intersects cumulatively (`x1 = Math.max(x1, ar.left)` etc., updated on every iteration, not reset), so a sequence of ancestors each individually leaving ≥4×4px but jointly leaving less is already caught by the running intersection. This looks like a reviewer error rather than a real gap — recorded rather than silently dropped, per this run's own rule that a refuted finding still gets written down.
- *"Text outside an ancestor's `overflow:auto`/`overflow:scroll` scrollport"* and *"text clipped by `overflow:clip`"* — both already fall under the existing `overflowX !== 'visible' || overflowY !== 'visible'` condition, which fires on any non-`visible` value (`hidden`, `auto`, `scroll`, `clip` all qualify), so both are already covered by rows 17-18's mechanism. This conflates "scrolled out of the current view" with "permanently clipped," which is exactly the branch's own declared limitation 8 — not a new gap, an existing declared one.
- *"An element below or to the right of the current viewport but still inside the document's scroll extent"* — same case as row 22 (off-screen positive), already covered.

## Round 2

Second `codex exec --sandbox read-only` pass, run foreground and blocking, against this updated
file (52 rows across the original matrix, the case-2 additions, and the case-3 new dimensions).
Its one job, same as round 1: name an input shape that fits no cell, including the
"UNDEFINED, declared" rows as covered.

## (d-3) Round 2 findings

Five more, smaller gaps. Triaged the same way.

| # | Shape | Verdict | Disposition |
|---|---|---|---|
| 54 | On-screen container whose sole text-bearing descendant has `transform: scale(0)` | **UNDEFINED, declared gap — same root cause as row 44** | `getBoundingClientRect()` does reflect a `scale(0)` transform (collapsing the box near-zero at its own position), but nothing ever reads a descendant's own rect — only `el`'s. Same missing per-node position check as row 44, different geometric outcome (collapsed-in-place vs moved off-screen); folded into that gap rather than treated as separate, since the fix is the same missing check |
| 55 | Container whose sole text-bearing descendant has `display: none` | **false — already covered, case 2** | `checkVisibility()`'s baseline behaviour (independent of the `opacityProperty`/`visibilityProperty` options passed) already returns `false` for a `display: none` element or ancestor. Codex correctly noted the mechanism is covered but no explicit row named it — added here as the row that was missing, not as a new dimension |
| 56 | Text clipped by a `contain: paint` or `contain: strict` ancestor | **UNDEFINED, declared gap** | Genuinely unread — Walk 1 checks `filter`/`clip-path`/`content-visibility`/`overflow` only, never `contain`. A real, distinct CSS containment mechanism |
| 57 | Text wholly inside a corner removed by `overflow:hidden` + `border-radius`, while the rectangular bounding-box intersection still measures ≥4×4px | **UNDEFINED, declared limitation** | Walk 1's clip math is rectangular intersection only; it has no notion of a rounded corner cutting into that rectangle. A geometrically real but narrow edge case |
| 58 | Container whose only text-bearing descendant has `opacity: 0` (single descendant, not paired with a second inked one) | **false — already covered, case 2** | `inked()`'s `seen(n)` call catches this per-node via `checkVisibility({opacityProperty:true})`, and with only one (non-inked) descendant the `.some()` over the node set is empty, so `false`. Row 41 tested the *paired* case (one hidden + one inked); this row is its unpaired counterpart, added for completeness rather than because the mechanism was actually missing |

## (d-4) Round 3 findings

Three candidates, run foreground/blocking against the round-2-updated file. One real gap; one
already covered (confirmed against the code's own header comment); one folds into an existing row.

| # | Shape | Verdict | Disposition |
|---|---|---|---|
| 59 | A text-bearing descendant wrapped in `display: contents` — the wrapper renders no box of its own (so its own `checkVisibility()` can read `false`), but its children render in normal flow and are genuinely visible | **UNDEFINED, declared gap** | If the `display: contents` element itself directly owns the text child, it enters the node set as a "text-bearing node," and `inked()` calls `seen()` on it — a call whose result for `display: contents` is not verified here (codex's own attempt to check this empirically via a headless browser was blocked by its read-only sandbox, `EPERM` on launch — genuinely static-analysis-only, could not execute). Recorded as declared-undefined rather than asserted either way, since neither this contract nor codex could verify the actual `checkVisibility()` behaviour for `display: contents` without running a real browser |
| — | *"A sole text-bearing descendant beneath an `opacity: 0` wrapper strictly below `el`"* | **Already covered — not a gap** | `checkVisibility({opacityProperty:true})` is ancestor-aware for opacity by spec, and the branch code's own header comment already states this explicitly: *"checkVisibility is ancestor-aware for opacity/visibility but NOT for filter/clip-path."* A wrapper's `opacity:0` anywhere between the text node and `el` is caught by `seen(n)` regardless of position. Contrast with gap 42, which is specifically about `filter`/`clip-path`/`content-visibility` — properties the code's own comment states are NOT ancestor-aware through `checkVisibility` |
| — | *"A skipped `content-visibility: auto` wrapper strictly below `el`, containing the sole text descendant"* | **Folded into gap 42/16** | Same underlying gap as 42 (intervening wrapper between text node and `el` is never walked for `content-visibility`), with the `auto`-skip wrinkle already named in dimension/row 16 for the `el`-ancestor case. Not a structurally new gap — the fix for 42 covers this too |

## (d-5) Round 4 findings

Two candidates. Both already covered by the code's general logic — neither needed a new
dimension, both needed an explicit row so the coverage is stated rather than assumed.

| # | Shape | Verdict | Disposition |
|---|---|---|---|
| 60 | Leaf fill `rgba(255,255,255,0.5)` over an opaque white backdrop (partial alpha, neither opaque nor near-zero) | **false — already covered, case 2** | `inked()`'s `over(fill, bg)` composites the fill at its *actual* alpha (not just 0 or 255) onto the resolved backdrop before comparing to `bg`; white at 0.5 alpha over white composites to white, matching `bg`, so `false` — correctly invisible. This is the general case rows 24-25 only stated for opaque fills; the compositing math itself handles any alpha, this row makes that explicit |
| 61 | Text under `visibility: collapse` (distinct from `hidden`, mainly used on table rows/columns) | **false — already covered, case 2** | `checkVisibility({visibilityProperty:true})` fails for any computed `visibility` other than `visible`, which includes `collapse` as well as `hidden` — same mechanism as rows 33/35, stated here for the value codex specifically named since it was missing its own row |

## (d-6) Round 5-6 findings

| # | Shape | Verdict | Disposition |
|---|---|---|---|
| — | *(round 5, folded into row 44 above rather than a new row — see its updated text)* | — | `el` acting as its own clipper via `overflow:hidden` on a descendant positioned to escape its box |
| 62 | Leaf with opaque computed `color`, but the actual glyphs styled invisible via `::first-line { color: transparent; }` (or `::first-letter`) | **UNDEFINED, declared limitation** | `getComputedStyle(el).color` reads the element's base style, not what a `::first-line`/`::first-letter` rule overrides on the rendered glyphs. Real, narrow CSS-pseudo-selector gap, same family as the existing `::before`/`::after` generated-content blind spot (rows 9-10, 50) but for styling-only pseudo-selectors on real text rather than pseudo-generated text |

## (e) Out of scope, and what covers it instead

- **Contrast ratio / WCAG AA** — `tests/lib/rendered-contrast.mjs`, gated in `tests/nav-contrast.mjs` and `tests/boundary-check.mjs`. `painted()` is identity-only, zero threshold (cells 24, 26).
- **Font-size-as-legibility above zero** — `tests/type-floor.spec.js` and `DESIGN.md`'s floor ruling (P-18, owner's). `painted()` only rejects exactly `font-size: 0`.
- **Occlusion / hit-testing** — `tests/lib/read-links.mjs` (cell 23).
- **Pseudo-element (`::before`/`::after`) visibility** — no current owner; `tests/print-floor.spec.js` has a pseudo-element walker for the print context specifically, not a general-purpose one (cells 9, 10). Recorded as a gap, not assigned here.
- **Element-is-shrunk detection** (padding defeating the 4px floor, cell 20) — no current owner; out of scope for this function by design (limitation 11).
- **Legacy `text-indent`/`clip` hiding idioms** (cells 28, 29) — no current owner. Declared blind spot.
- **Off-screen-positive rejection** (cell 22) — `tests/lib/viewport-clip.mjs` exists in the repo and may already do viewport-relative clipping for a different purpose; not wired into `painted()`. Declared blind spot, not silently fixed here.
- **The abandon-guard's exemption breadth** (cell 30) — tracked as DEF-78, a known accepted risk, not reopened by this contract.

## Adversarial review record

7 rounds of `codex exec --sandbox read-only`, every one run as a **foreground, blocking** call
(no backgrounding) against the file as it stood after the prior round's edits. Labelled
static-analysis-only throughout — it cannot launch Chromium or run Playwright, and one round's own
attempt to empirically check `checkVisibility()` behaviour under `display: contents` via a headless
browser was blocked by its own sandbox (`EPERM` on launch), confirming the label rather than
contradicting it.

| Round | Real gaps found | Disposition |
|---|---|---|
| 1 | 34 named | 8 new dimensions (14-21), 9 rows for existing-but-unrepresented cells (33-41), 15 rows for the new dimensions (42-53), 3 disposed as already covered or reviewer error |
| 2 | 5 named | 2 real gaps (56-57), 2 already covered (55, 58 — added as rows anyway for explicitness), 1 folded into row 44 |
| 3 | 3 named | 1 real gap (59), 1 already covered (confirmed against the code's own header comment), 1 folded into row 42 |
| 4 | 2 named | 2 already covered (60-61), added as explicit rows |
| 5 | 1 named | folded into row 44 as a named sub-case |
| 6 | 1 named | 1 real gap (62), same family as the existing `::before`/`::after` blind spot |
| 7 | 1 named | folded into row 42/43 as the same root cause restated a third way |

**Convergence, not exhaustion.** Findings did not stop because Codex ran out of ideas — round 7
still produced a real, correctly-reasoned observation. They converged because, from round 5
onward, every new finding reduced to a **sub-case of an already-declared root cause** (no
per-descendant position check; no per-descendant clip/filter/content-visibility check between a
text node and `el`) rather than a **new root cause**. That is the run's own three-way rule doing
its job: round 1 was almost entirely case 3 (enumeration wrong, 8 new dimensions); by round 5-7
every finding was case 1/2 (fits an already-declared cell's root cause, just under a different CSS
property name). 62 matrix rows total, plus the disposed-findings notes. This contract is not
claimed exhaustive over the full CSS specification — it is claimed **converged**: three
consecutive rounds (5, 6, 7) each produced exactly one finding, and each was a restatement of an
existing declared gap rather than a new one, which is the stopping condition this run's own
process defines, not an arbitrary round cap.
