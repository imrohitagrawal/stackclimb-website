# Handoff prompt — DEF-54 geometry gate

Paste the block below as the first message of a fresh session. It is written to be
standalone: it points at files rather than restating them, and carries the commands that
prove the current state instead of claims about it.

---

## The prompt

You are the **main orchestrator** for one work package: DEF-54, replacing the pixel gate's
blocking role with a geometry gate on `stackclimb.com`.

Read first, in this order, and do not restate them back to me:
`AGENTS.md` · `docs/STATUS.md` (DEF-54 and D112) · `docs/OWNER-DIRECTIVES.md` ·
`docs/plan/geometry-gate.md` (the approved plan, including its rejected options).

Prove the starting state before doing anything, and paste the output:

```bash
git rev-parse --abbrev-ref HEAD && git rev-list --left-right --count origin/main...main
node tests/file-budget.mjs && node tests/no-pii.mjs
gh run list --branch main --limit 1
grep -n "MAX_DIFF_PIXEL_RATIO" tests/visual-baselines.spec.js
```

### Your responsibilities as MAIN orchestrator

You do not write implementation code. You:

1. **Confirm the plan is still approved and current.** If `docs/plan/geometry-gate.md`
   conflicts with what the code now shows, raise it before starting — AGENTS.md's
   disagree-before-you-comply rule applies to plans too.
2. **Check skills currency NOW, in planning, never later.** `npx skills update`, verify
   against `skills-lock.json`, record versions in `docs/STATUS.md`. If anything updates,
   **end the session and restart** — skills load at session start and cannot be refreshed
   mid-run. Do not skip this because it is inconvenient.
3. **Spawn ONE sub-orchestrator** to execute phases A-D below in its own context.
4. **Independently re-verify** what it returns. Do not accept its summary. Run the suite
   yourself, read the diff yourself, look at the PR yourself.
5. **Stop and hand the merge decision to the owner.** You do not merge. Report the PR,
   green or not, with what you verified and how.

### The sub-orchestrator's brief

Deliver a **green PR on a branch**. Do NOT merge it. Do NOT push to `main`. Return the PR
number, what was verified, and every residual finding written down.

Merge `main` into your branch BEFORE starting, not after.

**Phase A — Plan (FAN OUT, read-only).**
3-4 parallel agents, each on a different lens: (i) what exactly should be measured and at
what tolerance, (ii) how the repo's existing numeric gates do it — `plate-height.spec.js`,
`tap-targets.spec.js`, `file-budget.mjs` — so this extends a proven pattern rather than
inventing one, (iii) how the baseline should be stored and reviewed, (iv) how the gate is
made to bite, including replaying D112's button.
Tell every agent IN CAPITALS: **READ-ONLY. Do not write, edit, `git checkout`, `git stash`,
or `sed -i`.** They share one working tree.
Then **adversarially verify the findings before acting on any of them** — this repo
measured a five-lens fan producing 32 findings of which 23 were refuted. Converge to a
single written design.

**Phase B — Build (DO NOT FAN OUT).**
ONE sole tree-writer. Subagents share one working tree and parallel writers corrupt each
other. The gate and its self-test are a tightly coupled unit — keep them one builder. If
you genuinely need parallelism, use `isolation: "worktree"` across strictly disjoint files,
and say so.
TDD is the default here because there is a harness: write the assertion first, watch it go
RED, make it GREEN, then prove it bites by mutation. A test that passes when the feature is
absent is worthless.

**Phase C — Review (FAN OUT, bounded at TWO rounds).**
Parallel reviewers, and per AGENTS.md this is a test change, so:
**at least one reviewer MUST be a different model family** — `codex exec --sandbox
read-only "<prompt>"`. A subagent from your own session is context isolation, not
model-weight decorrelation; say so plainly in the verdict and never claim independence you
did not have.
At least one reviewer must RUN the gate and report output, not read it and opine.
Two rounds maximum. Then stop and escalate with the residuals written down. Honour the
circuit breakers in the plan — if a new class of blocking finding appears in a second
round, or two fixes in a row each add a defect, STOP and report rather than iterating.

**Phase D — Green PR.**
Open the PR. Update `docs/STATUS.md` in the SAME change — DEF-54's status, a new `D` row,
and the rejected options with their reasons. Get CI green. **Then stop and return.**

### Standards that bind every phase

- **Verify before asserting.** Run the cheapest command that settles a question before
  answering it. If you cannot verify, say `UNVERIFIED`, name the exact check, and offer it.
  Never let a guess wear the clothes of a fact.
- **Report faithfully.** If tests fail, say so with the output. If a step was skipped, say
  so. "It builds" is not done.
- **Never hand-generate Playwright baselines locally** — different OS, different pixels.
  Use `gates.yml`'s `workflow_dispatch update_visual_baselines`, which now runs
  `--update-snapshots=all`; commit only files whose PIXELS changed, checked, not assumed.
- **File budget is shrink-only.** New modules: 250 lines / 32,000 bytes / 120 chars.
  `src/pages/index.astro` sits at exactly 260/260 with zero headroom — anything added there
  must modularize first.
- **Definition of done** is `AGENTS.md`'s list, and done means merged AND verified running
  in production. A green branch is not done; say which one you mean, every time.

### What NOT to do

- Do not merge to `main` (sub-orchestrator) — that is the owner's call, via the main one.
- Do not fan out the build phase.
- Do not tune `MAX_DIFF_PIXEL_RATIO` as the fix. It is a rejected option, refuted by
  measurement in the plan. Read the reason before proposing it again.
- Do not repair unrelated drift as a side effect.
