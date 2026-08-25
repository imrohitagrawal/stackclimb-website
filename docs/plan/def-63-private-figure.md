# DEF-63 — the two labels inside the private figure

Status: **PLAN / RCA.** Written before any file changed, per AGENTS.md's
document-and-get-approval rule. The design below was chosen by the owner-side
prototype at 1440 and 390 and is a presentation decision under directive P-18.

## The problem, in one line

The two name tags drawn inside `src/components/figures/PrivateFigure.astro` are the
smallest text on the site — 4.76px at 320 and 6.26px at 390 — and no value in any
stylesheet can reach them, because they are SVG user units scaled by a `viewBox`.
One of the two also overflows its own tag at every width.

## Two defects, not one

1. **Illegible type.** `font-size="9.5"` (EVALAXIS) and `font-size="9"`
   (AEGIS-CONTRACTS) are user units inside `viewBox="0 0 420 340"`. What a reader
   meets is `declared x (figureWidthPx / 420)`.
2. **Overflow.** `AEGIS-CONTRACTS` has an advance of 102.47 user units inside a
   `<rect width="96">`. The text spills out of its own name tag at every width.
   Confirmed by looking at the render, not inferred: at 1440 the rect spans
   x 242-338 and the text's own bounding box spans 238.77-341.2.

## Ground truth, measured on the real build

Read with `getScreenCTM()` on the shipped `dist/`, served by `astro preview`,
driven by Playwright. Not read off the source.

| viewport | figure px | scale | EVALAXIS | AEGIS-CONTRACTS |
|---|---|---|---|---|
| 320 | 222.0 | 0.5285 | 5.02 | **4.76** |
| 360 | 262.0 | 0.6238 | 5.93 | 5.61 |
| 390 | 292.0 | 0.6952 | 6.60 | 6.26 |
| 768 | 635.5 | 1.5130 | 14.37 | 13.62 |
| 901 | 332.9 | 0.7925 | **7.53** | **7.13** |
| 1024 | 378.4 | 0.9010 | 8.56 | 8.11 |
| 1361 | 503.3 | 1.1984 | 11.38 | 10.79 |
| 1440 | 499.1 | 1.1884 | 11.29 | 10.70 |
| 1920 | 493.0 | 1.1739 | 11.15 | 10.56 |

768 is large because the layout is still single-column there; the two-column
breakpoint sits just under 901, which is why 901 is the narrowest desktop figure.

## Three corrections to the ledger, each measured

1. **DEF-63's recorded fix option (a), "about 12.2 user units", is WRONG.** 12.2 is
   `11 / 0.9010` — the 1024 case — rounded DOWN below a strict `<`. It renders
   6.45px at 320, 8.48px at 390, **10.99px at 1024** and 14.50px at 1440: it fails
   the floor at three of the four widths, including the one it was derived from.
   The real requirement at 390 is `11 / 0.6952` = **15.82 units**.
2. **"1024 is the worst DESKTOP case" is WRONG.** A 60-width sweep from 901 to 1500
   in 10px steps puts the minimum at **901px** (EVALAXIS 7.53px, AEGIS 7.13px), and
   the numbers rise monotonically from there. The wrong claim appears in the DEF-63
   row and in the comment at `tests/lib/type-floor-measure.mjs:87`. Both fixed.
3. **`AEGIS-CONTRACTS` never reaches 11px at any desktop width.** Across the same
   60-width sweep its maximum is **10.79px at 1361**, and zero samples reach 11.

## The font arithmetic, measured inside the real SVG

`advance = fontSize * k + charCount * letterSpacing`. Letter-spacing applies after
every character, the last one included. Archivo 700, measured:

| string | k | chars |
|---|---|---|
| EVALAXIS | 4.9254 | 8 |
| AEGIS | 3.1109 | 5 |
| CONTRACTS | 6.2757 | 9 |
| AEGIS-CONTRACTS | 9.7193 | 15 |

At `font-size="16"` and `letter-spacing="0.45"`: EVALAXIS 82.41u, AEGIS 52.02u,
CONTRACTS **104.46u** — the longest line, which is what sets the tag width.

## The chosen design

- **`viewBox` stays exactly `0 0 420 340`.** Non-negotiable: it is what keeps the
  figure's rendered box identical, so plate heights and the geometry baseline do
  not move. The figure is width-bound at every width, aspect 420/340 = 1.235.
- **Both bags widen from 104 to 128 user units**, rescaled horizontally about their
  own centres by 128/104 = 1.2308 with `y` untouched. New centres x=94 and x=326,
  giving 30 units of margin each side and a 104-unit gap.
- **Type: `font-size="16"`, `letter-spacing="0.45"`, `font-weight="700"`**, same
  family and fill.
- **`AEGIS-CONTRACTS` becomes two lines, `AEGIS` over `CONTRACTS`.** This also
  corrects a real error: the hyphenated form is invented by this SVG and appears
  nowhere else. The canonical name is `Aegis Contracts`
  (`src/data/private-systems.js:31`), which is not edited.
- **`EVALAXIS` stays one line**, vertically centred in a tag box of the same size.
- **Both tag rects equal, 115.4 x 46 user units.** Width is 104.46 plus 0.34 x 16
  of padding each side. The longest advance is 104.46 against 115.4, so nothing
  overflows.
- Existing rotations (-6 and +5 degrees) kept, re-centred on the new tag centres.
- `role="img"`, `aria-labelledby="pv-title"` and the `<title id="pv-title">` kept
  byte-identical.

Target: **11.12px at 390 and 19.01px at 1440, with zero overflow.**

**320 and 360 stay under 11px — about 8.46px and 9.98px — and that is accepted, not
hidden.** Both are below the Definition-of-Done's 390px bar and below both widths
the gate samples, and `/` already overflows horizontally at 320 on `main`.

## The gate, which is the point of the package

The labels move from EXEMPT to GATED. `SVG_EXEMPT` becomes `[]`, the
`expect(exempt).toEqual([...SVG_EXEMPT].sort())` block is deleted because with an
empty list it asserts `[] toEqual []` forever, and a partner assertion takes its
place: on `/`, `svgSeen.length` must be greater than 0, so `strayLow ... toEqual([])`
cannot pass vacuously the day someone deletes the `<text>` elements.

## Rejected, with reasons, so they are not re-proposed

| Option | Why not |
|---|---|
| Narrow the `viewBox` | A no-op. Only `declared / viewBoxWidth` matters, so cropping the empty margins raises the scale and lowers the required font-size by the identical factor. |
| A media-query `font-size` | Hits the gate's two sampled widths and leaves the defect alive between 901 and ~1230px (7.34px at 901). A gate-shaped fix, not a defect fix. |
| Stack the bags vertically | Breaches the mobile plate ceiling. Measured by rewriting the viewBox live at 390: `260x520` gives a 1610.5px plate against a 1477px ceiling. |
| Mobile full-bleed | Works (14.08px desktop overshoot) but is a layout-system change beyond this package. |
| Delete the two `<text>` elements | DEF-63 reserves this to the owner. Also not content-free: Chromium's pruned ARIA snapshot DOES expose the label text as content of the `img` node. The ARIA spec's presentational-children rule for `role=img` points the other way, so which assistive technologies would notice is UNVERIFIED. |
| `vector-effect: non-scaling-size` | Chromium computes it to `none`. Not supported. |

## How this is proved

1. Gate first, alone: the labels fail the floor at 390 and AEGIS fails at 1440.
   Red output kept.
2. Redraw the figure. Green.
3. Mutations, run rather than reasoned about: `font-size` back to `9` on one label
   must go red at 390; deleting both `<text>` elements must turn the new partner
   assertion red.

---

## Outcome, measured after the build

Written after the work, marked as such. The predictions above were confirmed rather than
adjusted:

| Check | Predicted | Measured |
|---|---|---|
| EVALAXIS and both AEGIS lines at 390 | 11.12px | **11.12px** |
| Same at 1440 | 19.01px | **19.01px** |
| At 320 / 360 | 8.46 / 9.98px, accepted | **8.46 / 9.98px** |
| Tag clearance each side of the longest line | 5.47u | **5.46u** |
| Figure box at 1440 | unchanged | **499.11 x 404.05, unchanged** |

Overflow was checked twice, and the second way is the one that counts: first from the SVG
bounding boxes, then by DECODING the rendered PNG and scanning rows of pixels. At 1440 the
tag's rightmost painted pixel sits at 383.4 user units against a bag edge at 389.3, and its
leftmost at 35.4 against 29.9 — inside on both sides, measured on the picture rather than on
the geometry.

The gate went red before the figure was touched (32 passed, 4 failed) and green after (36
passed, 0 failed). Both mutations were run: `font-size="9"` back on one label goes red at 390
and 1440; deleting both `<text>` elements turns the new partner red with `Expected: > 0,
Received: 0`.

## One thing raised rather than changed

The rail is `x="40" width="340"`, so it spans 40 to 380 — and the bags now span 30 to 390. The
rail therefore ends 10 units INSIDE each bag, where before the redraw it ran 38 units past
them. Nothing overlaps, nothing is cut, and the rail sits above the bags at `y=34`, so this is
a question of how the drawing reads and not a defect. The rail was not part of the decided
design, so it is recorded here for the owner instead of being adjusted. The one-attribute fix,
if it is wanted, is `x="20" width="380"`.
