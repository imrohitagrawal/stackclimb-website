---
version: 1
slug: "src-pages-how-i-build-astro"
primary_target: "src/pages/how-i-build.astro"
related_targets: []
---

# How I build — surface brief

**CONFIRMED by the owner, 2026-08-30** (D159). Was a P5 draft; the visitor mode below is now a
pinned decision, not a proposal.

Scope: `/how-i-build` (src/pages/how-i-build.astro). Visitor mode: **Prove**, specifically
proving engineering PRACTICE (process, discipline, real artifacts) rather than project outcomes —
the complement to `/experience` (career arc) and `/` (product outcomes).

Audience & job: a technical evaluator — an engineering manager or senior engineer deciding
whether the practice behind the projects is real or performative. Job: find one real, citable
artifact (the deploy-watchdog quote) that could not have been written for show.

Action: same terminal actions (Career evolution / Email me) — this page's own job is credibility,
not conversion.

Proof: the artefact quote (genuinely verbatim after P2's fix, cited to the real workflow file),
113 authored skills (P2-corrected), the two-systems OTel/Prometheus claim (P2-corrected).

Chosen direction: same portrait-plate world, three plates each carrying a distinct ground
(P4-fixed — the second and third plates used to render on the identical fallback color).

## Open defect this brief exists to catch

Measured live 2026-08-30. The bounding box alone gives the **wrong** conclusion — the artefact
panel opens *above* the fold at every viewport (560.8px at 1440×768, 547.9px at 1280×720,
586.8px at 390×844). Measuring the text blocks inside it, and looking at the render, gives the
real finding:

- **On a phone (390×844) the fold lands directly on the words "This is a PROXY."** The reader
  sees the watchdog's claim and none of its stated limit.
- On desktop the PROXY sentence survives, but the `34m31s` incident clause and the citation link
  (`deploy-drift-watchdog.yml, quorum-ai`) — the two things that make the quote checkable — do
  not.

The panel also arrives **fourth**, after the title and three claim bands, so the page asserts
three times before showing the artifact any of it rests on. That contradicts this brief's
**Prove the practice** mode.

**Why it got worse, not better:** P2 (D156) made the quote genuinely verbatim, which *added* the
PROXY sentence, the `34m31s` clause and the citation. More honest, and taller — D153 measured the
panel bottom at 772px/1440×768; it is now 852.9px. The accuracy fix is what pushed its own most
important line under the fold.

**Owner's ruling, 2026-08-30:** keep the quote verbatim, byte for byte, and hoist the artefact
above the claim bands. Shortening was rejected — it would reverse P2's own accuracy fix, and the
words that would go are the self-limiting ones. Fix scoped in
`docs/rca/RCA-015-p5-composition-and-the-fold.md`.
