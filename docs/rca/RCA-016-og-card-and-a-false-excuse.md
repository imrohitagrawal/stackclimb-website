# RCA-016 — the share card advertises a deleted element, and a gate I shipped excuses a page for a false reason

**Status: written before the fix, per AGENTS.md's order, on 2026-08-30.**
**Approval gate: NOT YET APPROVED.** No `src/`, `tests/` or `public/` file has been touched for
this package. W-25 makes the RCA approval a hard stop, per package, no exceptions.

This is P6, the last of D153's six packages. Its scope in the plan is three items; investigation
found a fourth, and it is in code merged earlier today.

## 1. `og.png` renders an element the site deleted

**Verified, not inherited.** `grep -ro "Plate N" dist/` returns **0**. The card renders
`PLATE Nº 00 — THE RECORD` at top right — read off the image directly, not from a claim about it.
So anyone sharing a stackclimb.com link previews a labelled element that exists nowhere on the
site.

`public/og.png` is 1200×630, last written 2026-08-17, 74,348 bytes.

## 2. `docs/brand/README.md:65` is wrong in both directions, not one

The row reads:

> `og.png` | 1200×630, and **not regenerated since the value ladder**. It shows the old palette
> and, almost certainly, the deleted mannequin.

D153 already refuted the mannequin half by looking at the image. Sampling the actual pixels
refines the other half too — the first attempt at this measurement was itself wrong and is
recorded below, because the method matters more than the result.

| Element | `og.png` | live site | verdict |
|---|---|---|---|
| Outer ground | `#0e1322` | `#0e1322` (base plate ground) | **current** |
| Hero plate ground | `#1a233f` | **`#231e0d`** (`palette.css:63`, confirmed live as `rgb(35,30,13)`) | **stale** |
| Lit surface | `#f4efe4` | `--lit: #f4efe4` (`palette.css:29`) | **current** |
| Headline copy | "AI systems that show their work and refuse to fake it" | identical | **current** |
| Portrait | the real photograph | the real photograph | **not a mannequin** |

So "shows the old palette" is too broad: three of four sampled colours are current. **Exactly one
thing is stale — the hero plate's ground, navy where the site is now `#231e0d`** — and one thing
is simply false. The conclusion (regenerate it) survives; both stated reasons need correcting, and
corrections stay rather than get deleted.

**A method failure worth recording.** The first pixel sample was taken with a hand-written PNG
reader that reported `channels=1` and produced `#f5f5f5`, `#d8d8d8`, `#161616` — nonsense, because
the file is palette-indexed and the reader was returning palette *indices* as if they were grey
levels. Caught only because the numbers did not resemble any colour the site uses. Re-measured
through a canvas, which decodes properly. A measurement that disagrees with everything you know is
a bug in the measurement until proved otherwise.

## 3. `tests/viewport-reach.spec.js` excuses `/` with a reason that is false — and I shipped it today

`tests/viewport-reach.spec.js:101`:

```js
'/': 'the home page is a seven-plate scroll; its hero is already gated by plate-height.spec.js',
```

`tests/plate-height.spec.js:40` reads `const EXEMPT = new Set(['top'])`, and line 146 filters that
set out of the population. **`#top` is the hero.** Its own comment (lines 35–37) says so: *"The
hero is exempt and says so: it is the one plate the site deliberately lets run long, and D27
records the decision."*

So the home hero is excused from the reach gate on the ground that a second gate covers it, and
that second gate is the one place it is explicitly exempt. **Nothing measures the home hero's
reach or its height.**

This is the exact defect class the rest of this session spent its time correcting: a sentence that
reads as proof and is not one. It is worse here because it sits inside the file written to enforce
honesty about what a visitor can actually see, and because I wrote it and it passed two adversarial
reviewers — both of whom attacked the assertions and neither of whom read the excuse strings as
claims. Found by the home-page re-critique this package required.

**No visitor is harmed today.** The cost is that the next session planning home-page work reads a
proof that is not one.

**Measured consequence, at 390×844:** the hero is **2,483px = 2.94 viewports**, and
`.practice-panel` — the hero's evidence device — runs y=815 to y=1914, entirely below the fold. At
1440×900 the hero is 1,019px = 1.13 viewports and the panel is above it. That is the same shape as
the defect P5 just fixed on two other pages, on the more important page. **It is a decision, not a
defect to patch:** D27 deliberately lets the hero run long, so changing it is the owner's call and
is NOT proposed here.

## 4. The home-page re-critique the plan required

The plan says re-critique `/` before touching it, because *"inheriting a stale snapshot would plan
against a page that has moved."* It had moved. Measured against production, not `dist/`:

| Prior finding (2026-08-23) | Status now |
|---|---|
| **[P0]** email never rendered as copyable text | **FIXED** (D112). `[data-copy-email]` present and visible; clicking it puts `rohit.ra.agrawal@gmail.com` on the clipboard; it matches `#contact`'s `mailto:` exactly. The address is still printed **0** times as text, so P-13's gate stays green untouched |
| **[P1]** the hero's best sentence ships visibly fractured | **FIXED** (D114 / DEF-55). `.practice-verdict` computes `display: grid`, both spans at `grid-area: 1/1`, one client rect each at 1440 and 390. Prior run measured two rects and a 36px indent |
| **[P1]** the entire factual layer is set below 12px | **HALF FIXED** (D118). The sub-11px tier is gone — smallest text 9.44px → **11.00px**, elements under 11px **66 → 0**. But under-12px moved only **112 → 111** of 240: the floor rose, the population did not. 77 elements sit at exactly 11.00px. Closing it is a `DESIGN.md` decision (11px → 12px on the fact-carrying tier), not a CSS patch |

Clean and needing no action, recorded so it is not re-investigated: axe **0 violations** at both
viewports; **no horizontal overflow** at 320/360/390/1440; keyboard focus paints
`2px solid rgb(201,155,63)` at every one of 20 tab stops at both viewports; and the **no-JS render
is clean** — all 9 plates visible with correct grounds, so the DEF-1/DEF-2 class has not returned.
The one no-JS degradation is the Cloudflare email obfuscation, which is DEF-52, closed as accepted
by the owner (D137) — not a new finding.

## The cost

Low and reputational, not functional. The share card is the first thing anyone sees when a link to
this site is posted anywhere, and it currently shows a label the site does not use. The false
excuse costs a future session an hour and a wrong plan.

## The proposed fix — needs approval before any of it is written

1. **Regenerate `og.png`** without the `PLATE Nº 00 — THE RECORD` label and with the hero plate's
   current `#231e0d` ground. Keep what is already current: the outer ground, the lit REFUSED panel,
   the real photograph, the headline copy.
2. **Correct `docs/brand/README.md:65` in place**, keeping the wrong text visible as a correction:
   the mannequin claim was false, and "the old palette" was true of exactly one colour.
3. **Fix the false excuse** in `tests/viewport-reach.spec.js:101` to state what is actually true —
   that the hero is D27-exempt from `plate-height.spec.js` as well, so nothing gates it, and that
   this is a recorded decision rather than an oversight.
4. **The gate.** `og.png` has no test at all today. Add one asserting the card carries no string
   absent from the built site — which is the general form of this defect, not a hardcoded
   `Plate Nº` check that would miss the next stale label. Written RED against the current
   `og.png` first.

## Explicitly NOT proposed, and why

- **The home hero's 2.94-viewport height and its below-fold evidence panel.** D27 deliberately
  lets the hero run long. Changing it is a composition decision for the owner, and P-32 already
  reserves a related one (the 52ch measure cap). Raised here, not acted on.
- **The 11px → 12px type-floor decision.** It is a `DESIGN.md` change and a self-description
  question about how small this site is willing to set a fact. Owner's call.
- **The `#private` plate's bordered `span.seal`**, which DESIGN.md bans for status. One line,
  low cost, but out of this package's scope — recorded so it is not lost.

## What will bite

- `og.png` is a binary in `public/`. `docs/brand/README.md` records that brand files have carried
  personal contact details as pixels before and that **every text-based secret scanner missed
  them** — so a regenerated card needs looking at, not just scanning. The current card renders the
  LinkedIn URL by design; nothing else personal may appear.
- The new gate must read the built `og.png`, and the repo has no image-text extraction. It will
  need either a rendered-HTML source of truth for the card or an explicit committed manifest of
  the strings the card contains. Design that before writing it.

## The check that would falsify this RCA

Reverting the regenerated card must turn the new gate RED. If a gate written against a card
containing `PLATE Nº 00` passes, it asserts nothing.
