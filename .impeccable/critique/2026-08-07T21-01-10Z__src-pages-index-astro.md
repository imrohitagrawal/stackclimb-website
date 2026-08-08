---
target: the home page
total_score: 21
max_score: 32
na_heuristics: 9,10
p0_count: 3
p1_count: 2
timestamp: 2026-08-07T21-01-10Z
slug: src-pages-index-astro
---
Method: dual-agent (A: ade7da2a30e64c626 · B: a5409afe762b60707)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | Nav never marks the active plate. `PLATE Nº 03` never says "of 06" |
| 2 | Match system / real world | 3 | `JACKET · CITEVYN` tells a hiring manager the garment, never the system |
| 3 | User control and freedom | 3 | Smooth scroll over 6,638px on top of 0.8s crossfades. Unskippable |
| 4 | Consistency and standards | 3 | Interactive caption cells styled identically to dead ones |
| 5 | Error prevention | 4 | `Deployment (down)` labelled before you click. Best thing on the page |
| 6 | Recognition over recall | 2 | `50/50 GOLDEN`, `5 FIELDS` compressed to fit the cell, not to be understood |
| 7 | Flexibility and efficiency | 2 | Nav exposes 3 of 7 plates |
| 8 | Aesthetic and minimalist | 2 | 21 lines of type describing the site's own paint |
| 9 | Error recovery | n/a | Static page, no input |
| 10 | Help and documentation | n/a | Landing page |
| **Total** | | **21/32** | **Acceptable (66%)** |

## Design Specificity Verdict

Authored at the level of concept. Generic at the level of craft. No unrelated product could lift this unchanged, but the specificity lives entirely in the conceit. Underneath: 1px rectangle borders, centred columns in oversized frames, flat vector clip-art, grey placeholder bars. The idea is bespoke; the drawing is stock.

**Deterministic scan.** CLI detector clean on all `.astro` sources — and that result is meaningless. All 11 `.astro` files contain zero `<style>` blocks; every rule lives in `global.css`, which the source scan cannot reach. Proven by bite test: a file with `#777` on `#888`, 9px text and `outline:none` also returned clean. Against `dist/index.html`: 2 advisory. Injected into the live page: 49.

## Answering the charge

"Too dark" is the wrong diagnosis. "Too dull" is wrong as stated — measured saturation is 41–47%. But the conclusion is right. Three measured causes.

### Cause 1 — no light in the page

Six of seven grounds sit between L18% and L32%. 66.6% of rendered pixels fall inside a 20-point lightness band. Every plate is the same brightness in a different tint. Scrolling 6,638px changes hue and nothing else.

A dark interface reads as advanced when it has a value ladder. This page has one step. It looks printed, not lit. Brightening the hues produces a lighter dull page.

### Cause 2 — nothing moves

Zero `@keyframes`. Zero elements with an animation. Zero scroll-timelines. Four transitions total, two ignoring `prefers-reduced-motion`. A 2026 interface reads as advanced because it responds. This is a static document that repaints.

### Cause 3 — the figures are literally 1990s

Hero draws a cartoon man (`HeroFigure.astro:103`), violating `DESIGN.md:258` "Don't draw people". Project figures use grey placeholder bars — the universal signal for wireframe. At 1024px NarraTwin collapses to an empty rectangle.

### The 1990s tells

Double hairline frames. Tracked micro-caps (82.6% of text below 14px, smallest 8.5px). Flat fills with no material, forbidden gradients/shadows by doctrine at `DESIGN.md:254`. Centred columns in oversized frames — contact is a 1240×564 frame holding 704px.

## What's Working

1. **The disclosure copy.** `Deployment (down)`. `PHASE 1 — NO-GO` styled like every other fact. A disclosed failure proves discipline where a fabricated metric proves nothing.
2. **Display typography.** Bodoni Moda 640 at 96px, line-height 0.94, one ochre word. Current and correct.
3. **Performance.** Lighthouse desktop 100/96/100/92, mobile 94/96/100/92. TBT 0ms. 257KB, 6 requests.

## Priority Issues

### [P0] Content invisible at every plate boundary — live now

94.1% of desktop scroll positions show two plates at once. Only one ground is painted, so one plate renders on the other's ground.

- private → contact: **1.04:1**, top 468px invisible (EVALAXIS, AEGIS CONTRACTS)
- narratwin → private: **1.89:1**, top 474px washed out (PHASE 1 — NO-GO)

Confirmed by screenshot. Exists only with JavaScript on.

### [P0] No value range

Six of seven grounds L18–32%. Fix by building a four-step ladder: ground to L8–12%, second surface L16–22%, one near-white surface per plate holding real content as the light source. Hue identity survives.

### [P0] Figures are ~40% of every plate and the weakest artefact on it

Delete the human figure. Replace all six with real artefacts at legible size. Never a grey bar where text should be.

### [P1] Nothing moves

Scroll-linked entry, ~60ms stagger, gated on the existing `prefers-reduced-motion` block at `global.css:465`. Fix the leader line, which draws a raw diagonal through the artwork.

### [P1] Compositions are not composed

Contact frame uses 57% of its width. CiteVyn's caption strip is twice the width of what it captions and unaligned. Caption strips wrap ragged (3+3+1, 4+2). All 7 plates are 918–982px in a 900px viewport, violating `DESIGN.md:191`.

### [P2] Contrast fails on 4 of 7 plates; focus ring on 2

22 desktop / 16 mobile real failures, all `.cap .t` at 9.6px and `.swatches li span` at 9.92px. Worst 3.52:1. Focus ring measures 2.97:1 on SaafSaans, 1.13:1 on Private — fails WCAG 1.4.11.

**Correction:** the prior finding "`footer > p` 1.51:1, `em` 2.79:1" is wrong as located. Both are in `#top`. The real footer has 0 violations.

### [P2] Every URL returns the home page with HTTP 200

`robots.txt`, `sitemap.xml` and any nonexistent path all return byte-identical homepage HTML. No robots, no sitemap, no 404.

### [P3] `paint-grain.png` is 166KB — 63% of page weight

Decorative overlay at `opacity:.5`. Lighthouse estimates 148KB savings. Mobile LCP driver.

## Persona Red Flags

**Hiring manager, 20 seconds, 12 tabs**
- Name never at display size. "Rohit Agrawal" is 18.24px inside body copy.
- `Seeking` row names five job titles in one four-line run-on.
- Nothing in the first viewport says what the systems do.
- No CV or résumé link anywhere. Verified by grep.

**Casey — mobile**
- Page is 10,127px. Twelve phone screens.
- The hero figure is entirely below the fold.
- SaafSaans puts 19 lines of paragraph before the first link.
- Contact CTAs wrap 2+1, GITHUB alone on its own row.

**Sam — accessibility**
- Caption labels fail AA on four of six grounds.
- Focus ring 1.13:1 on linen.
- Interactive caption cells visually identical to dead ones.
- Five `<a>` carry `role="listitem"`.
- Credit: focus lands on 42/42 focusable elements, skip link works, reduced-motion handled.

## Minor Observations

- `AEGIS-CONTRACTS` tag has zero side padding; `EVALAXIS` beside it has generous padding.
- `.cap .d` truncates silently with `nowrap` + ellipsis.
- `Quorum‑AI` uses a non-breaking hyphen in the h2, plain hyphen in the nav.
- The `stackclimb` wordmark is `display: none` below 900px. Mobile has no domain identity.
- Colophon is 123 characters on one line at 10.56px, uppercase.
- `.site-nav .brand` is the only interactive element with no hover style.
- Contact plate has no graphic and 86.6% empty ground. The page ends by going blank.
- The private plate's two olive slabs read as headstones.

## Questions to Consider

1. If you deleted every figure tomorrow, would the page be worse? Right now the answer is no.
2. The most persuasive sentence on the site is buried at 18px on plate 3. What if that is the hero?
3. What if the site actually ran — a live CiteVyn query box that cites or refuses in front of you?
4. `DESIGN.md:254` forbids gradients, shadows and texture. If "advanced" means an interface lit by a light, doctrine and brief are in direct conflict. Which loses?
5. The design forbids drawing people, then draws one and puts it in the hero. What else is written down but not enforced?
