---
name: visual-review
description: Verifies the live UI as a visitor sees it — runs the screenshot harness, dispatches a fresh reviewer.
---

# Visual Review

## Overview

Packages `docs/OWNER-DIRECTIVES.md` row R-6 — "one agent verifies the live UI image by image, as
a user sees it" — into a single invokable skill. Before this skill, the contract
(`docs/skills/visual-review.md`) and the harness (`tests/visual-walkthrough.mjs`) both existed
and worked, but a human had to remember to run the harness, then manually spawn a fresh-context
subagent with the contract file. This skill does both steps as one action.

**Announce at start:** "I'm using the visual-review skill to capture and judge the live UI."

**The contract lives at `docs/skills/visual-review.md` — read it, do not restate it.** This file
only covers the two mechanical steps: capture, then dispatch. Every rule about what the reviewer
may look at, what it must report, and what makes it fail belongs in that file, not here.

## Step 1: capture

Build the site if `dist/` is stale or missing, then run the harness:

```bash
npm run build            # only if dist/ is stale or missing
node tests/visual-walkthrough.mjs
```

This serves `dist/` on a local port, walks the site step by step (first paint, each plate at
desktop and mobile, a hovered caption, tab focus, JS disabled, reduced motion, the opposite color
scheme, 2x and 0.5x text zoom), and writes one PNG per step to `tests/shots/`, plus a manifest of
`{ image, step, why }` for each one.

Confirm the harness actually produced images before moving to step 2 — a run that captures zero
images is a broken run, not a clean pass (the contract's own denominator rule). Count the files:

```bash
ls tests/shots/*.png | wc -l
```

If this is zero, or far fewer than the harness's own step list implies, stop and fix the harness
run before dispatching a reviewer — there is nothing yet for it to judge.

## Step 2: dispatch a fresh-context reviewer

Spawn a new subagent with **no prior conversation context** — it must not have seen the source
that produced these images, so it cannot cheat by reading the component that was supposed to
render correctly and confirming the token it expects rather than what actually painted. This is
also why this skill does not restate the contract inline: an agent that read the contract
paraphrased in this file, rather than fetched fresh, is closer to sharing context with whoever
paraphrased it.

The dispatch prompt must:

1. Point the subagent at `docs/skills/visual-review.md` and instruct it to follow that contract
   exactly — what it may look at (images, step labels, `PRODUCT.md`), what it must never do (read
   `.astro`/`.css`/`.js` source, query the DOM, inspect computed styles, read `DESIGN.md` token
   values, consult the test suite).
2. Point it at `tests/shots/` for the images and their step manifest.
3. Ask it to report, per the contract's required format: OK or a named defect per image, using
   the six required judgements (legibility, overlap, clipping, focal point, first-image
   comprehension, state-matches-label), and the denominator statement (images examined out of
   images produced).
4. NOT hand it any summary of what the change was supposed to do beyond `PRODUCT.md` — that
   summary is exactly the assumption the contract exists to keep out.

## Step 3: treat the report as a finding, not a verdict

Per `AGENTS.md`'s review rules, findings are refuted before they are acted on — the contract
itself notes quorum-ai's five-lens fan raised 32 findings, 23 refuted. If the visual reviewer's
report will sit alongside other reviewers' reports (a role fan, an adversarial pass), run all of
them through `.agents/skills/review-synthesizer/` before deciding what to fix — do not act on the
pixel reviewer's report in isolation just because it is the only one with images attached.

## What this skill does not do

- It does not fix anything it finds. A defect report goes back to whoever is driving the change;
  this skill's job ends at producing a trustworthy report.
- It does not judge taste — "this could be bolder" belongs to `impeccable`, not here, per the
  contract's own scope line.
- It does not run when nothing visual changed. If a change is docs/skills/config only and did not
  touch anything a visitor sees, this skill is not needed — confirm that first rather than
  capturing screenshots of an unchanged page for no reason.
