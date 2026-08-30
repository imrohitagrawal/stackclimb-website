---
version: 1
slug: "src-pages-experience-astro"
primary_target: "src/pages/experience.astro"
related_targets: []
---

# Career evolution — surface brief

**VISITOR MODE CONFIRMED by the owner, 2026-08-30** (D159, P-30). Was a P5 draft. He confirmed the
MODE only — the audience, job, action and proof lines below remain this brief's own inference and
are not owner-pinned. D153 named the absence of these briefs as "the root cause of most
of what follows" (its P1–P6 findings) — the page was built to a design system and never measured against a
stated purpose.

Scope: `/experience` (src/pages/experience.astro). Visitor mode: **Prove**, not Persuade — the
home page already made the pitch; a visitor who clicks through here wants evidence the fourteen-
year arc is real and coherent, not to be sold again.

Audience & job: the same recruiter/hiring-manager/engineer as the home page, one click deeper —
specifically someone checking "does the career story hold together" before forwarding the CV or
scheduling a call. Job: confirm the arc (Oracle → the AI pivot) reads as deliberate, not
opportunistic.

Action: same terminal actions as home (Career evolution / Email me CTAs already present) — this
page's job is to remove doubt, not to generate a new action.

Proof: six employers named plainly, dates as a distinct row (P3 fixed this — no longer orphaning
at narrow widths), a closing sentence stating the throughline explicitly.

Chosen direction: same portrait-plate world as the rest of the site (one-col layout, now
correctly imported per P3 — was rendering at 48% width before that fix).

## Open defect this brief exists to catch

Measured live 2026-08-30, and **worse than D153's number** because P3's `.era-org` fix
legitimately added a line to plate 1's height:

- Plate 1 (`#evolution`) is **1,122.3px** tall in an **844px** viewport at 390×844.
- The fold falls **through the Oracle entry** — the current role.
- The closing sentence sits at **y = 914.6px**, **70.6px below the fold**.

So a phone reader gets six employers as a bare list, with the sentence supplying the point of the
list one scroll away. That directly contradicts this brief's **Prove** mode: the proof arrives
before the thing it proves.

**Owner's ruling, 2026-08-30:** lift the closing sentence above the era list **at mobile widths
only**. Trimming the era list was offered and not chosen; he gave no reason. The rationale often
attached to it — that the one-line descriptions are what make the arc read as deliberate rather
than a job list — is this brief's own, not his. Fix scoped in `docs/rca/RCA-015-p5-composition-and-the-fold.md`.
