---
target: src/pages/experience.astro
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-27T19-35-09Z
slug: src-pages-experience-astro
---
Method: dual-agent (A: design-review subagent · B: detector/browser + content-integrity subagents). Never critiqued before; no surface brief exists.

## Design Health Score — 23/40 (Poor–Acceptable, 58%)

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Zero `aria-current` site-wide; nothing marks the current page |
| 2 | Match System / Real World | 2 | Eras run oldest→newest against CV convention, unexplained |
| 3 | User Control and Freedom | 3 | No route to /cv until the whole list is scrolled |
| 4 | Consistency and Standards | 2 | `one-col`/`wide` are dead classes; h1 and h2 both 59.04px |
| 5 | Error Prevention | 3 | Only misread available is the chronology |
| 6 | Recognition Rather Than Recall | 2 | Amazon/Oracle at identical weight to Snapdeal/Mobileum |
| 7 | Flexibility and Efficiency | 2 | CV-seeker traverses a full viewport plus six rows |
| 8 | Aesthetic and Minimalist Design | 2 | 48% grid fill; plate 2 is 6.4% painted / 93.6% empty |
| 9 | Error Recovery | 3 | No failure states exist |
| 10 | Help and Documentation | 2 | The deliberate reversed chronology gets no explanation |

## Priority Issues

**[P1] `.plate-grid.one-col` and `.plate-copy.wide` are dead classes.** Defined only in `src/styles/project.css`, never imported here. Measured 1440: `grid-template-columns: 551.672px 499.125px`; copy 544px in a 1123px frame = 48% fill, both plates. Works on /projects/* where the rule ships inline (1122.81px). `project.css`'s own comment records this exact regression shipping once before, "caught by looking at the render rather than by any gate" — the gate was never written. `geometry-baseline.darwin.json` records the defective 544px width, so the baseline certifies the bug and a fix needs runner-side regeneration. Injecting the two rules fixes headline wrap and viewport fit but NOT the emptiness — `global.css:171` caps `.plate-copy p` at 52ch. Two problems, not one.

**[P1] The page sells /cv on a property /cv deliberately dropped.** "every approximate figure marked as such" — removed from /cv by P-25 on 2026-08-27, and `proof-cv.spec.js` now enforces the absence. No gate ties the sentence to /cv's content.

**[P2] The page does not answer "is the AI pivot real?"** One of six era lines touches AI — "then AI-assisted", four words, last row, same weight, no link, no date for when the AI work began.

**[P2] `#evolution-record` declares no ground.** `palette.css` hues only `#evolution`; plate 2 falls back to base `#0e1322`. Three Colour Livery unapplied.

**[P3] Date orphans.** `.era-org` carries role and dates in one `<p>` under the 52ch cap, orphaning "September 2015" and "2026".

**[P3] The thread is drawn as six broken bone ticks.** A page arguing continuity renders it as disconnected stubs; ochre appears once, on a button.

## Measured
No horizontal scroll 320–1920. Plate 1 is 1075px at 390x844 (1.27x svh), 1188px at 320x568 (2.09x) — One-Plate-One-Viewport breached at mobile, closing sentence below fold. axe 0 violations, contrast 0 failures, focus order clean, min type 11px, 0 tap targets under 24px. No-JS identical.
