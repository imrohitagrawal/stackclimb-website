# RCA-015 — the honest half of the evidence is the half that falls below the fold

**Status: written before the fix, per AGENTS.md's order, on 2026-08-30.**
**APPROVED by the owner 2026-08-30** ("RCA-015: Go build it!"), after a five-lens read-only review
of the first draft found its `/experience` mechanism inert. This document is the REVISED version;
the approval covers the `/how-i-build` hoist and the gate. The `/experience` MECHANISM is reserved
back to him — see "The open question this RCA cannot settle" — because review established no
mechanism satisfies all three of his stated conditions at once.

D153 (the three-page critique) flagged this as P5 ("composition, and the missing surface
briefs") and marked it, alone among the six packages, as **"Needs the owner's input, not just
approval."** That working session happened on 2026-08-30 and all four reserved items were ruled
on. This RCA covers the two that produce code changes.

Every number below was re-measured against **the live site** on 2026-08-30, not copied from
D153. P1–P4 shipped in between and moved them.

## What happened

### 1. `/how-i-build` — the fold cuts the quote at its most important word

The artefact panel holds the single most convincing thing on the page: a real workflow comment
from `deploy-drift-watchdog.yml`. It arrives **fourth**, after the title and three claim bands.

Measured live, `.artefact` bounding box:

| Viewport | Panel top | Panel bottom | Panel height |
|---|---|---|---|
| 1440×768 | 560.8px | **852.9px** | 292.1px |
| 1280×720 | 547.9px | **840.0px** | 292.1px |
| 390×844 | 586.8px | **1088.1px** | 501.3px |

**The bounding box alone would have produced the wrong conclusion, and nearly did.** Read as
"the panel is below the fold" it is false — the panel *opens* above the fold at all three
viewports (560.8 < 768, 547.9 < 720, 586.8 < 844). Measuring the individual text blocks, then
looking at the render, gives the real finding, which is worse and much more specific:

```
1440×768   ABOVE  578.4-659.0   p: "It fixes the failure mode we hit on #54: main got a new commit…"
           CUT    671.8-806.2   p: "WHAT IT CHECKS (honest scope) […] This is a PROXY […] 34m31s…"
           BELOW  817.3-835.3   footer: deploy-drift-watchdog.yml, quorum-ai
390×844    ABOVE  606.0-767.2   p: "It fixes the failure mode…"
           CUT    780.0-1021.9  p: "WHAT IT CHECKS […] This is a PROXY […]"
           BELOW  1033.1-1068.9 footer: deploy-drift-watchdog.yml, quorum-ai
```

**`CUT`, not `BELOW`, and the correction matters more than the label.** A first draft of this
block wrote `BELOW` for the two middle rows. Both blocks OPEN above the fold — 671.8 < 768 and
780.0 < 844 — so `BELOW` commits the exact error this RCA exists to warn about, inside the
evidence meant to demonstrate the point. Found by a reviewer re-measuring rather than reading.
Corrected here, and the correction stays.

Measuring the individual GLYPH RANGES, not the blocks, gives the finding at full resolution:

| String | 1440×768 (fold 768) | 390×844 (fold 844) |
|---|---|---|
| `This is a PROXY` | 702.7–719.7 — **fully visible** | 837.8–854.8 — **CUT, 36% visible** |
| `34m31s` | 756.4–773.4 — **CUT, 68% visible** | 945.3–962.3 — below |
| citation link | 819.3–831.3 — below | 1035.1–1047.1 — below |

Confirmed by screenshot at each viewport with the fold drawn on, per Definition-of-Done item 2
("never report a visual change without looking at the render"):

- **On a phone the fold lands directly on the words "This is a PROXY."** The reader sees the
  watchdog's claim and none of its stated limit.
- On desktop the PROXY sentence survives in full. The `34m31s` figure is cut through its line box
  with 68% still readable, and the clause it sits in finishes below the fold (783.3–800.3); the
  citation link is fully below. So the desktop loss is the clause's completion and its proof,
  not the whole clause — stated at that precision deliberately.

The site's whole subject is systems that disclose their own limits. On this page, at the default
phone size, the disclosure is the part that gets cut.

### 2. Where it was introduced, and by what

**By P2 (D156), deliberately, and P2 was right.** The quote used to be a paraphrase: two
non-adjacent lines fused, 12 words dropped with no ellipsis. P2 made it genuinely verbatim, which
**added** the PROXY sentence, the `34m31s` clause and the citation footer. More honest, and
taller — D153 measured the panel bottom at 772px/1440×768; it is now 852.9px.

This is the uncomfortable shape of it: **the accuracy fix is what pushed its own most important
line under the fold.** Nothing here argues P2 should be reversed.

### 3. `/experience` — the argument's conclusion is below the fold on a phone

At 390×844, plate one (`#evolution`) is **1,122.3px** tall against an 844px screen.

- The fold falls **immediately below the Oracle title** — the current role. Re-measured: no glyph
  is bisected. The title's two lines end at 842.6 and the date range starts at 852.1, so the fold
  lands in the 9.5px gap between them; the dates (852.1–866.1) and the role line (877.3–893.3) are
  entirely below it. An earlier draft said "cut"; that was imprecise and is corrected.
- The closing sentence sits at **y = 914.6px**, **70.6px** below the fold:
  *"The thread through all six: deciding whether software was safe to release — now applied to AI
  systems deciding that…"*

So a phone reader gets six employers as a bare list, with the sentence that supplies the point of
the list one scroll away. D153 cited 1,075px for the plate; it is now 1,122.3px, because P3's
`.era-org` fix legitimately added a line. Same pattern as above: a correct fix made the fold
problem slightly worse.

### 4. Where it was caught, and why nothing caught it earlier

Caught by D153's critique — **the first critique these three routes have ever had.** Nothing
mechanical was ever going to catch it:

- `geometry.spec.js` asserts boxes against a committed baseline, and both pages currently MATCH
  it — verified by execution, CI run `33276724427` on this branch's merge base, whose
  "build, test, and scan the build" job concluded `success`. A correctly-positioned element that
  happens to sit below the fold is not a geometry failure.
- The horizontal-overflow gate (`tests/dod.spec.js:129`, widened to 320/360/390/768/1440 by D157)
  compares `scrollWidth` with `clientWidth` — horizontal only. An earlier draft of this line called
  it "the 390px overflow gate (DEF-*)": stale on the widths, wrong on the property, and `DEF-*` is
  a wildcard that resolves to nothing. Corrected.
- axe runs and reports **0 violations** — same run `33276724427`. Note the two Playwright projects
  are desktop **1440×900** and mobile **Pixel 7, 412×839**; neither is 1440×768, 1280×720 or
  390×844, so axe has not seen the exact folds this RCA argues about. Reading order below the fold
  is not an accessibility violation in any case.
- **No gate ASSERTS a fold position.** Stated carefully, because a first draft overstated it as
  "this repo has no gate that can express a fold-position claim" and a different-model reviewer
  refuted that: the idiom exists — `tests/boundary-check.mjs:97` evaluates
  `r.bottom < window.innerHeight`, and it is a blocking CI step at `gates.yml:288`. But it uses the
  relation as a *filter* to find a visible node inside a seam-contrast probe; it enforces nothing
  about where content sits. The capability is present, the policy is absent.

**The root cause is the one D153 named:** none of the three routes had a surface brief. The pages
were built to a documented design system and then never measured against a stated purpose, so
"what must the reader see first" was never a question anything could fail.

### 5. `/cv` Independent Systems — raised, checked, no change

D153's fourth P5 item asked whether `/cv`'s Independent Systems should stay a disclosure. Checked
live: six entries, three shipped (CiteVyn, Quorum-AI, SaafSaans) and three not (NarraTwin
`Phase 1 — No-Go`, EvalAxis and Aegis Contracts both `In progress — closed`). P1 already fixed
the specific complaint — the NarraTwin card now carries its full context, not a bare failure
line. Ruled by the owner on 2026-08-30: **keep all six as they are.** Closed the way P-24 closed
— raised, checked, kept. No code change.

## The cost

The two most persuasive sentences on the site are the ones a default phone screen hides:
a watchdog admitting what it cannot see, and a fourteen-year career stating its own throughline.
Both are the site's thesis in one line, and both are one scroll past where a reader decides
whether to keep reading.

## The owner's rulings, 2026-08-30

| Item | Ruling |
|---|---|
| `/cv` Independent Systems | **Keep all six as-is.** No change. |
| `/how-i-build` quote | **Keep verbatim, hoist the artefact.** Shortening refused — it would reverse P2's accuracy fix. |
| `/experience` fold | **Lift the closing sentence above the era list, mobile only.** Trimming the era list refused. |
| Surface briefs | **All three visitor modes confirmed** — `/experience` Prove, `/how-i-build` Prove the practice, `/cv` Take away. |

## The proposed fix — REVISED after review, 2026-08-30

**The first draft of this section specified a mechanism that does not work.** Five reviewers ran
against it; two independently proved the `/experience` fix inert, and I reproduced both myself
before rewriting. The original text is superseded, not deleted — what it said and why it was
wrong is recorded in "Rejected mechanisms" below, so it is not re-proposed.

### 1. `/how-i-build` — hoist the artefact. APPROVED and verified reachable.

Move `.artefact` above the three `.model-band` blocks in `src/pages/how-i-build.astro`. Quote text
untouched, byte for byte.

Measured by hoisting the node in-page against the current build, motion neutralised and
`document.fonts.ready` awaited, at 390×844:

| | now | after the hoist |
|---|---|---|
| `.artefact` | 586.8 → 1088.1 | **175.5 → 676.8** |
| "This is a PROXY" line | 837.8 → 854.8 (cut) | **426.5 → 443.5** |
| citation footer | 1033.1 → 1068.9 | ~621.8 → 657.6 |

The whole panel clears the 844px fold with **167.2px** of headroom — more than the target asked
for. It also clears at 412×839, the real Playwright mobile project.

**The trade this creates, measured, because the ruling did not name it.** The claim bands move
down. At 390×844: band 1 lands 696.0 → 825.2 — **still above the fold**; band 2 straddles at
839.6 → 984.2; band 3 is entirely below at 998.6 → 1088.1. So a phone reader trades "three claims
and a cut quote" for "the whole quote, its limit, its citation, and one claim." A reviewer
reported all three bands going below; re-measured, that is wrong — band 1 stays visible.
The plate grows 1176.2 → 1190.6px (+14.4px), because `.artefact` has no bottom margin for band 3's
trailing 0.9rem to collapse into.

### 2. `/experience` — mechanism RULED 2026-08-30 (P-31). BUILT.

The trade was put to him and he chose to keep mobile-only and desktop-unchanged, accepting that
below 700px the visual order differs from the DOM order. Built as a `max-width: 700px` block in
`experience.css` making `#evolution .plate-copy` a column flex container with explicit orders on
all three children, scoped to `#evolution` so no other route's geometry row population moves. The
divergence is disclosed in that file's own comment rather than left silent — his ruling, and the
site's thesis applied to itself.

### 3. The three surface briefs — ALREADY DONE, not gated on this RCA.

Recorded under P-30 / D159 in the same change that recorded the rulings. Listing it as pending
work was an error in the first draft: recording a ruling is not building a fix. What IS still
stale is `docs/HANDOFF.md:95`, which still calls the briefs DRAFT.

### 4. The gate — specified properly this time.

The first draft said only "the named element's bottom must sit above the viewport height." That is
under-specified in six ways a reviewer demonstrated, all now closed:

- **Name the element and the viewport.** `/how-i-build`: `.artefact`, whole panel, bottom < 844 at
  390×844 (headroom 167.2px, so the assertion is satisfiable — checked, because an assertion that
  can never pass is worse than none).
- **Do not call it "fold".** `tests/lib/fold.mjs` is the repo's Unicode case-folding helper, and
  `content-model.spec.js` already uses "above the fold" to mean DOM containment. A third meaning is
  the name-that-lies class DEF-64 and DEF-67 are both about. Name it for what it asserts —
  `viewport-reach.spec.js` / `mustReachAbove` — and say in the header why it is not called "fold".
- **Neutralise motion.** `src/styles/motion.css:81` leaves every non-hero plate child at a resting
  `transform: translateY(16px)` until an IntersectionObserver adds `.in-view`, and
  `getBoundingClientRect()` includes transforms. Reuse `NEUTRALIZE_MOTION` from
  `tests/lib/geometry-measure.mjs`.
- **Await fonts.** `geometry.spec.js:166` calls `document.fonts.ready` and its own comment names it
  "the single most load-bearing wait in the file" — 14 baselines were once stale by 1px without it.
  Reuse `waitForFonts` from `tests/lib/viewport-clip.mjs`.
- **Ship the vacuity partner.** `boundingBox()` returns `null` for a missing or hidden element, so
  a naive null-guard would certify a DELETED element as above the fold. Assert existence and
  paintedness first via `tests/lib/painted.mjs`. This is AGENTS.md's "a check that counts nothing
  needs a partner proving the thing counted exists."
- **Audit the route→selector map.** A hand-typed map has failed twice here (`routes.mjs:1-5`,
  `geometry-floor.mjs:77-81`). A route under test with no entry is a BREACH, not a skip, in the
  `floorAudit` mould, with a self-test driving an empty map, a missing selector and a hidden node.

Today's headroom (167.2px) means a 16px transform cannot currently flip the result — so this is not
a live flake. It becomes a coin flip the moment content grows to within 16px of the fold, which is
exactly when the gate matters. `playwright.config.js:18` sets `retries: 0`: "a flaky gate is a
broken gate."

## Rejected mechanisms — recorded so they are not re-proposed

**CSS `order` alone on `.era-closing`.** Inert. `.plate-copy` is `display: block`
(`src/styles/global.css:146` sets only `max-width` and `min-width`), and `order` applies only to
flex/grid children. Verified by injecting `@media (max-width:900px){.plate-copy .era-closing{order:-1}}`
at 390×844: the sentence stayed at 914.6 → 1034.3, byte-identical to the baseline. The failure is
worse than doing nothing — the CSS lands, the gate stays red, and the next session reads a red gate
as "the fix regressed" rather than "the fix never applied."

**`display: flex` on `.plate-copy` with `order: -1`, unscoped.** Two defects. (a) `order: -1`
places the sentence before EVERY sibling including the `<h1>`, measured: `.era-closing` 914.6 →
136.2 and the title 121.8 → 255.9, so a phone visitor meets the conclusion before the page title —
a different page from the one approved. (b) Unscoped, it changes the geometry row population on
other routes: `/` goes 7 → 8 rows and 26 → 29 row-children at 390 and 768 but not 1440, and
`/how-i-build` 2 → 3. That makes row population WIDTH-DEPENDENT, contradicting
`tests/lib/geometry-floor.mjs:33-38` ("no media query moves a row in or out of the predicate") and
`geometry-measure.mjs:160-161`. Any flex approach must be scoped to `#evolution .plate-copy` and
give all three children explicit orders.

**A `max-width: 900px` breakpoint.** Wrong number. At 768×900 the closing sentence is ALREADY above
the fold — measured bottom 793.8 < 900 — so a 900px breakpoint would restyle a viewport that has no
problem. The breakpoint must be justified from a measurement, not inherited from `global.css:468`.

## The open question this RCA cannot settle — mechanism for `/experience`

The ruling was "lift the sentence, mobile only, desktop unchanged." Review established that no
mechanism delivers all three of *mobile-only*, *desktop-unchanged* and *DOM-order-safe*:

- **Scoped flex + explicit orders** delivers mobile-only and desktop-unchanged, but makes the
  visual order (conclusion, then list) differ from the DOM order (list, then conclusion) on phones.
  That divergence is the WCAG 2.1 SC 1.3.2 / 2.4.3 risk area, and axe has no rule for it — so
  `dod.spec.js`'s 0-violations would stay green while the divergence shipped. On a site whose
  subject is disclosed limits, choosing the option the gate cannot see needs to be a decision, not
  a default.
- **A DOM reorder** keeps sighted and screen-reader order identical, and the first draft's stated
  reason against it was simply wrong: `geometry.spec.js` does not depend on that order — the
  complete row population on `/experience` is `["evolution-record/ctas"]`, and neither `.era-list`
  nor `.era-closing` produces a geometry key. But it changes desktop too, which the ruling excluded.

Owner's call. Recorded here rather than settled.

## What the build then hit, which this RCA did not predict

**A plate-height ceiling breach, caught by the existing suite.** The hoist left the last
`.model-band`'s 14.4px bottom margin as the final thing in `.plate-copy` with nothing to collapse
into, taking `#how-i-build` to 999.8px = 1.11 viewports against `plate-height.spec.js`'s 1.1
desktop ceiling. A reviewer predicted the +14.4px growth; neither the reviewer nor this RCA
predicted it would cross a ceiling. Fixed at the cause — `.model-band:last-of-type { margin-bottom: 0 }`,
returning the plate to 985.5px = 1.095 — not by raising the ceiling, which was available and
refused. A trailing margin at the end of a container is dead space, not rhythm.

## What will bite

- **A geometry baseline regeneration is likely for `/experience`, and probably NOT for
  `/how-i-build`.** Corrected from the first draft, which promised both. `/how-i-build`'s baseline
  holds only the outer first-plate key (`geometry-baseline.linux.json:94`), no artefact or band
  positions, and the hoist preserves child counts — but the plate height moves +14.4px, so the plate
  box key will move. Regenerate only what actually moves; confirm programmatically, never by eye.
- **DEF-59 does not bar local regeneration**, contrary to the first draft. `baseline-write-guard.mjs:16-22`
  keys on whether the bytes are TRACKED, not on platform: it blocks writing the committed linux
  file. `tests/geometry-baseline.darwin.json` is gitignored, so a darwin dev can and MUST regenerate
  it locally, or `GEOMETRY_TRUST.state === 'stale'` makes `geometry.spec.js` REFUSE (not skip) until
  they do.
- **DEF-60's structural floor fires even in update mode** — `geometry.spec.js:202` calls
  `rowFloorBreaches` before the `if (UPDATING)` early-return at `:218`. Verified, and the first
  draft aimed this warning at the wrong proposal: the hoist cannot trip it (`.plate-copy` and
  `.artefact` are both block, and `#how-i-build` contributes zero rows), but an unscoped flex change
  would.
- Two adversarial reviewers on the gate change, at least one from a different model family. Codex is
  static-analysis-only under `--sandbox read-only` and must be labelled so.

## Still open, and NOT covered by the four rulings

`docs/plan/critique-three-pages.md:143-145` assigns a FIFTH decision to P5 that was never put to the
owner: the composition of the freed space. P3 restored full frame width, but `global.css:171` caps
the measure at 52ch, so the right ~45% of both pages stays empty. The plan says "That is a separate
decision — P5." It is unruled. Recorded here so "all four reserved items ruled" is not read as
"P5's owner input is complete."

## The check that would falsify this RCA

Reverting the hoist must turn the new gate RED at 390×844 on `/how-i-build`. If it stays green with
the reorder removed, the gate asserts nothing and the finding above is not the finding. That check
alone is necessary but NOT sufficient: it proves sensitivity in one direction only, so the gate also
ships the vacuity partner in item 4 — a selector typo, a hidden element and a blank page must each
turn it red too.
