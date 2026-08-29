---
version: 1
slug: "src-pages-experience-astro"
primary_target: "src/pages/experience.astro"
related_targets: []
---

# Career evolution — surface brief

**DRAFT — P5 groundwork, not owner-approved.** Visitor mode below is a proposal, not a
pinned decision — this is exactly the thing D153/P5 flagged as missing.

Scope: `/experience` (src/pages/experience.astro). Visitor mode (proposed): **Prove**, not
Persuade — the home page already made the pitch; a visitor who clicks through here wants
evidence the fourteen-year arc is real and coherent, not to be sold again.

Audience & job (proposed): the same recruiter/hiring-manager/engineer as the home page, one
click deeper — specifically someone checking "does the career story hold together" before
forwarding the CV or scheduling a call. Job: confirm the arc (Oracle → the AI pivot) reads as
deliberate, not opportunistic.

Action (proposed): same terminal actions as home (Career evolution / Email me CTAs already
present) — this page's job is to remove doubt, not to generate a new action.

Proof: six employers named plainly, dates as a distinct row (P3 fixed this — no longer
orphaning at narrow widths), a closing sentence stating the throughline explicitly.

Chosen direction: same portrait-plate world as the rest of the site (one-col layout, now
correctly imported per P3 — was rendering at 48% width before that fix).

**Open, needs the owner:**
- Confirm or correct the "Prove" mode above.
- P5's own flagged defect, re-measured fresh 2026-08-30 (worse than D153's original number,
  because P3's `.era-org` fix added a line to plate 1's height): the closing sentence sits at
  y≈914.6px in an 844px mobile viewport (plate 1 total height 1122.3px) — below the fold,
  meaning the argument's own conclusion is not visible without scrolling on a phone. D153 cited
  1075px/844px; the real number after P1-P4 is 1122.3px/844px, further below the fold, not
  closer to it.
- Whether "lift the closing sentence above the era list at mobile" (P5's proposed fix) is
  still the right shape, given the fold has gotten worse, or whether the era list itself needs
  trimming instead.
