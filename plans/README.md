# Animation plans

Scoped strictly to the three Phase 2 items in `resilient-hatching-peacock.md` — nothing here was
invented beyond what that plan already decided.

| # | Title | Severity | Status |
|---|---|---|---|
| 001 | Scroll-linked plate entry (60ms stagger) | MEDIUM | SHIPPED (D55, 08-11) |
| 002 | Artefact card hover/focus light | MEDIUM | SHIPPED (D55, 08-11) |
| 003 | `.site-nav .brand` hover style | LOW | SHIPPED (D55, 08-11) |

## Order

No dependency between 001/002/003 — they touch disjoint files (`motion.css`+`reveal.js`,
`Artefact.astro`, `nav.css`). Implemented together in one pass since all three ship in the same
PR (`hero-animations-wordmark`). 001 must land before the footer motion toggle (separate,
non-animation work in the same PR) because the toggle's `[data-motion='off']` selector is
consumed by 001's CSS.
