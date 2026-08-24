# The 11px type floor — raise the label register off the floor

Status: **PLAN.** The owner approved the work item on 2026-08-25. Written before any code,
per AGENTS.md's document-and-get-approval rule. This file is the RCA.

## The problem, in one line

The page's factual layer — the labels, caption cells, ledger terms and status chips that
carry every number the site claims — renders smaller than any other text on the page, and
two consecutive `/impeccable critique` runs raised it without it moving.

## Ground truth, measured 2026-08-25 on the real build

Measured by walking the rendered DOM and reading `getComputedStyle().fontSize` on every
element that owns a text node. Not read off the stylesheet — read off the render.

| Fact | Result |
|---|---|
| Home page elements with own text under 11px | **73** |
| Across all 7 plate routes | **130** |
| Smallest on the page | **9px** |
| The two biggest populations | **34x at 10.56px** (`0.66rem`), **18x at 10.24px** (`0.64rem`) |
| Status chips | **12x at 9.44px** (`0.59rem`) |
| Responsive relief at 390px | **None** — the size list is IDENTICAL at 1440 and 390 |

The critique's figure of 66 is confirmed in substance; the small difference is scope, not
disagreement (this walks the render, the critique read the source).

### The sources, all in the design system

- `DESIGN.md:24` `caption-label: "0.6rem"` · `:25` `swatch: "0.62rem"` · `:68` `fontSize: "0.6rem"`
- `DESIGN.md:206` states the Label register as **0.6–0.78rem**. The floor of that range is
  the problem, not an abuse of it — the system is being followed correctly.
- Seven stylesheets hold `0.66rem`: `systems.css`, `caps.css`, `project.css`, `colophon.css`,
  `proof.css`, `motion.css`, and `global.css` at `0.64rem`/`0.62rem`.

## The constraint that decides whether this is even possible

Bigger text means taller plates, and `plate-height.spec.js` caps every plate at one
viewport (1.00) at desktop and 1.75 at mobile. A first reading of plate heights showed
**0px headroom** — four home plates sitting at exactly 900px against a 900px ceiling.

**That reading was wrong, and checking it is what makes this plan viable.** `.plate` carries
`min-height: 100svh`, so a plate whose content fits reports exactly 900px regardless of how
much room is left inside it. Measuring the real content extent instead:

| Width | Tightest plate | Content | Room before the ceiling |
|---|---|---|---|
| 1440 | `/projects/narratwin` `#narratwin` | 826px | **164px** |
| 390 | `/` `#proof` | 1290px | **187px** |

So there is room, and the binding constraint is 164px at desktop. A 1px rise on a label adds
about 1px per line it occupies; the budget is real but not generous. **It must be re-measured
after the change, not assumed.**

## What changes

One rule: **no text renders below 11px.**

- Raise the label floor from `0.6rem` (9.6px) to at least `0.6875rem` (11px).
- Raise the `0.66rem` population (10.56px) and the `0.64rem`/`0.62rem`/`0.59rem` outliers to
  land at or above 11px.
- Amend `DESIGN.md:206`'s Label range so the system and the render agree. **Leaving DESIGN.md
  saying 0.6rem while the CSS says otherwise is how this drifted in the first place.**
- Exact values are a presentation decision and are delegated under **P-18** — the owner
  reviews the rendered result, not an option list.

## This is the first design change since the geometry gate landed

Both baselines will move and both must be refreshed through the sanctioned path:

- `tests/geometry-baseline.linux.json` — every plate box and CTA row shifts.
- `tests/visual-baselines.spec.js-snapshots/*-linux.png` — every plate repaints.

Regenerate ONLY via `gates.yml`'s `workflow_dispatch`. The DEF-59 guard (D117) now refuses a
laptop write mechanically, so the wrong path fails loudly rather than silently. Commit only
files whose pixels or numbers actually changed — checked, not assumed (D111's trap).

## Acceptance — every item is a command, not a judgement

1. **Zero** elements render below 11px, on every route, at 1440 and 390. Measured by walking
   the render, the same way the 73 and 130 above were produced.
2. A **partner check proves the population is non-empty** — a count of small elements that
   reads 0 against a page that rendered nothing must fail, not pass.
3. `plate-height.spec.js` green. The post-change content headroom is re-measured and recorded;
   if any plate lands within 20px of its ceiling, that is reported, not smoothed over.
4. `tests/geometry.spec.js` green against a CI-regenerated baseline.
5. Visual baselines regenerated through the dispatch path; the drain is done in ONE commit,
   because a 1px height drift fails hard and the gate reveals stale files one per run.
6. Contrast still meets WCAG 2.1 AA where type size and weight changed.
7. No horizontal scroll at 390px.
8. Seen rendering — screenshot at desktop AND mobile, both themes where supported.
9. File budget green. `global.css` has 6 lines of headroom (494/500); `index.astro` (260/260)
   and `hero-practice.css` (250/250) have **none** — new rules go in the component's own
   scoped `<style>`, the `Plate.astro` pattern.

## Rejected, with reasons

- **Bump only the worst offenders (the 9.44px chips).** Leaves 34 elements at 10.56px and the
  DESIGN.md range still saying 0.6rem. The complaint is the whole factual layer, not the tail.
- **Scale the labels down at 390 to buy height.** The measurement shows mobile already has
  MORE room (187px) than desktop (164px), so it buys nothing where the cost actually is.
- **Raise the root font size.** Moves every register at once, including headings that are
  already correct, and would blow the plate-height ceilings for no gain to the labels.
- **Leave DESIGN.md alone and change only the CSS.** The doc is the source the next agent
  reads. Divergence here is exactly what produced DEF-61 in the skills tree this week.
