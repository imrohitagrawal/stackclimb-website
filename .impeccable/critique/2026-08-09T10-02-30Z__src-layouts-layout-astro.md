---
timestamp: 2026-08-09T10-02-30Z
slug: src-layouts-layout-astro
---
# Critique — full site + nav lockup (pre-merge of PR #19)

Run 2026-08-09. Dual-agent, four isolated assessments: A (nav lockup design review),
B (nav mechanical evidence), A2 (full-page design review), B2 (detector + performance
+ colour/type evidence). No degradation. Parent verified two contested findings
independently (CV measure confirmed at ~150ch; mobile-menu "untested" claim refuted —
A and B both exercised the menu; A2's locator looked for a button, the control is a summary).

## Scores and evidence
- Lighthouse: mobile 100/100, desktop 100/100 (LCP 1.6s/0.4s, CLS 0.005/0.003, TBT 0). No regression.
- Page weight: / = 195,560B over 8 requests; /cv = 149,033B. Zero JS bytes on load.
- Detector: 1 advisory finding total (em-dash density, Layout.astro). Console: zero errors.
- Nielsen (A2): 1:3 · 2:4 · 3:3 · 4:4 · 6:4 · 7:3 · 8:4 · others n/a.
- Nav lockup (A): monogram scale correct, gap correct, mobile balanced; mark verified centered
  within 0.8px, zero residual background (composite diff ≤1/255), asset hashed at 6,825B.

## Priority issues, ranked (page level)
1. CV desktop measure ~150ch (measured 1312px at 17px) — the page recruiters read longest. Fix: cap text column ~72–80ch.
2. Hero plate 1,107px at 900px viewport — credential ledger cut mid-row at the fold. (One-Plate-One-Viewport, same class as DEF-43.)
3. Plates 00→01 share an identical ground (distance 0.0) — the first page-turn does not turn. quorum→saafsaans also close (9.9).
4. Hierarchy inversion: hero thesis 59px vs project names 77.76px; DESIGN.md says the display step (→96px) is "hero h1 only."
5. Artefact provenance footnotes at 9.9px/~84ch — most engineer-persuasive text, least legible. Caption strips 9.6px are the site floor.
6. Mobile mid-plate dead zones (~150px) inflating an 11,800px scroll.

## Nav lockup issues (in PR scope)
1. Mark strokes are pure #ffffff beside bone #f2ebdd type — reads placed, not native. Recolour needs owner nod (D48: "colours exactly his files").
2. Mark sits ~0.9px low — translateY(-1px).
3. Raster softens at 200% zoom beside vector-crisp Bodoni — SVG redraw eventually.
4. width="23" attribute vs 23.33 rendered — set intrinsic 70/84.

## Strengths
1. The artefact panel is the true signature — real recorded output, dated, hashed. Build the identity on it.
2. Status honesty as design material (DEPLOYED — NOT ANSWERING, NO-GO) — the memorable thing.
3. The overview contact sheet — best 30-second artifact for the actual audience.

## Drift the pixels created (decisions, not defects)
- DESIGN.md canonizes figures + leader lines; six of seven plates ship none. The artefact panel replaced the figure. Doc or pixels — one must yield.
- The GO/NO-GO chips reuse plate grounds as semantic ink (bordeaux stop / viridian go) — elegant, works, and violates the written One Thread Rule. Codify or revert.

## Persona verdicts
- Recruiter 60s: lands at "plausibly yes — I should call" — peak at the REFUSED card (~5s), stumbles at the cut hero ledger and the navy→navy first scroll; exits via CV, where the 150ch measure spends goodwill.
- Engineer: convinced by provenance footnotes and the SaafSaans down-in-public plate; wants them bigger than 9.9px.
