# Handoff — for the next session

Written 2026-09-02, superseding the 2026-09-01 handoff (that one is in git history).

**ULTRACODE v4 ran to completion. Every buildable item in the backlog is merged, deployed, and
independently re-verified in production. The two owner-question items are ruled and closed.
DEF-82 remains open by design — a real, honest diagnosis without a provable fix, not an
unfinished package. Nothing is pending on the owner from this run.** Full detail in
`docs/STATUS.md`; do not re-derive it here.

## What went wrong, because that is what you can act on

- **The known "backgrounds a long command, then stops to wait for a notification" failure hit
  again — third session in a row it's been recorded.** The DEF-82 package-lead ran a real
  reproduction command, then ended its turn reporting "Standing by for the reproduction runs to
  complete." It was not auto-resumed; the orchestrator caught it from the phrasing and sent a
  `SendMessage` to the SAME agent id telling it explicitly nothing was running for it and to
  re-run synchronously. It resumed correctly and finished the diagnosis properly on the next
  turn. **This is not a new lesson — v3's handoff already recorded this exact failure mode twice
  in one session** — but it recurred anyway, on a fresh package-lead that had the warning in
  its own dispatch prompt, in capitals, naming the failure mode by name. Writing the warning
  more emphatically has now failed to prevent this three times running. Budget for it: read
  every agent's final report for "standing by" / "waiting for" / "monitor" before treating it as
  a real stopping point.
- **One genuine judgment call surfaced correctly instead of being silently resolved either way.**
  The `cite-audit.md` staleness package (D178) changes existing prose in an internal engineering
  contract doc — condition 2 of the autonomy invariant reads literally as blocking any package
  that changes existing doc claims, with no carve-out for internal-vs-product docs. The
  package-lead flagged this explicitly rather than assuming either reading, the orchestrator put
  it to the owner with an everyday analogy (a maintenance manual's wiring diagram being corrected
  after the electrician already rewired the panel), and he ruled: self-merge it. Recorded so the
  next run doesn't have to re-litigate whether condition 2 reaches internal contract docs — it
  does, literally, but the owner has now said that class of correction clears anyway. Worth
  writing into `docs/practices/autonomous-run.md` as an explicit carve-out rather than leaving it
  a one-off ruling buried in a PR description.

## What went right, worth repeating

- **Both owner-question items (DEF-71's prose-citation scope, DEF-75's unprovenanced entries)
  were asked with an everyday analogy each, before any file was touched for them, and both
  answers were recorded as new `OWNER-DIRECTIVES.md` rows (P-33, P-34) in the same ledger-only PR
  that closed the two defect rows** — not left as chat that would evaporate at the next
  compaction.
- **DEF-82's package-lead did real, expensive diagnostic work (~230+ test executions, five full
  suites, a constructed probe that demonstrated the actual race mechanism) and then queued
  honestly rather than shipping an unproven test-hardening fix** — exactly the discipline
  `docs/practices/autonomous-run.md` asks for ("if the cause stays genuinely unclear, do not
  guess a fix"). The investigation record (RCA-022) still landed on `main` as its own small PR,
  so the next attempt starts from a real mechanism and three concrete next steps instead of from
  scratch.
- **Every merge was independently re-verified by the orchestrator, not trusted from the
  package-lead's report** — for DEF-77 specifically, the orchestrator's first mutation-proof
  attempt was itself wrong (a naive string replace hit the row's own prose text describing the
  mutation technique, not the actual row it was targeting) and was caught and corrected before
  being reported as verified, rather than accepted on the first try.
- **Real CI was watched to completion every time** (five separate pushes to `main`: PRs #143–147),
  each confirmed job-by-job that `deploy to production, then verify production` specifically
  succeeded (not skipped), never inferred from the PR's own check summary (which correctly shows
  `skipping` there, since deploy only runs on `main`).
- **Production was independently re-verified with `npm run post-deploy` after every single
  merge** (five times), not just once at the end.
- **The ledger was updated in the same commit as the fix every time**, and every correction to a
  stale existing claim was written as an inline annotation (`**Corrected D178, against what
  shipped in D173:**`) rather than a silent rewrite, per AGENTS.md's "corrections stay" rule.
- **Every merged branch and worktree was deleted, both local and remote, confirmed by command**
  (`git worktree list`, `git branch -a`, `git ls-remote --heads origin`) after each of the five
  merges — one cleanup needed a `git worktree remove --force` plus a manual `rm -rf` after a
  "directory not empty" error, caught and re-verified rather than left half-done.
- **Package sequencing mostly held**, with one disclosed deviation: DEF-78's package-lead was
  dispatched while DEF-77's push-to-main CI run was still finishing (the PR itself was already
  merged). Low-risk in practice — disjoint files, ledger ids pre-reserved and re-checked against
  `main` by each package-lead before writing — but a stricter reading of "one merges before the
  next package's lead is dispatched" would have waited for the full close-out (CI + post-deploy +
  cleanup) before dispatching. No collision resulted; recorded so it isn't repeated by assumption.

## The state, in commands

```
git status -sb                        # main, clean, level with origin/main
git worktree list                     # one entry — no stray worktrees
git branch -a                         # main only, local and remote
gh pr list --state merged --limit 6   # #147, #146, #145, #144, #143 (this run), #142 (prior)
npm run post-deploy                   # green, independently re-verified 2026-09-02, five times over the run
```

## What is open, not done by this run

- **DEF-82 (LOW), diagnosed but not fixed.** `docs/rca/RCA-022-nav-reach-cv-click-race.md` has
  the full investigation: a real mechanism was demonstrated (Playwright's element-stability check
  can pass mid-animation under `global.css`'s global `scroll-behavior: smooth` plus `motion.css`'s
  420ms reveal transition, landing a click at a stale coordinate), but it could not be reproduced
  through Playwright's actual `.click()` API under ~230+ test executions across varied stress
  levels, so no fix is mutation-provable. Three concrete next steps are named in the RCA for
  whoever picks this up next — read it before attempting a fix, don't re-derive the mechanism
  from scratch.
- **DEF-86 (LOW), filed this run, not investigated.** `tests/lib/cite-audit-core.mjs`'s `NAMED`
  array proves per-`ROOTS` scan coverage but not per-`SCANNED`-extension coverage — no `.cjs`,
  `.ts`, or `.html` file is named, so a future narrowing of `SCANNED` to drop one of those three
  extensions would not be caught. Needs a `NAMED` addition plus its own mutation proof (narrow
  `SCANNED`, confirm `NAMED` goes red for each dropped extension).
- **The four HARD REFUSALS remain untouched, correctly**: P-32 (52ch measure cap — already
  delegated to the machine per his 2026-08-31 ruling, but still a real package nobody has built
  yet), D30 (light/dark), the home hero's height (D27), the 11px type floor. None came up in this
  run's scope; none were built, drafted, or prepared.
- **The dispatch-timing deviation noted above** (DEF-78 dispatched before DEF-77's full close-out)
  is worth tightening in `docs/practices/autonomous-run.md`'s own text if a future run wants
  stricter sequencing — not urgent, no collision resulted.

## Traps that cost real time this session (add to the existing list)

- A subagent's final report saying it is "standing by" for something to complete means it has
  actually STOPPED, not paused — this is the third session running this exact phrasing pattern
  has appeared. Resume explicitly with `SendMessage` to the SAME agent id/name, and tell it
  plainly that nothing is running for it — don't assume it understands its own stall from a
  generic nudge.
- A mutation-proof "revert and confirm red" step needs the SAME care as building the gate itself:
  a naive text replace can land inside a row's own PROSE describing the mutation (which
  legitimately contains strings like `| D173 |` as illustrative text) rather than the row's actual
  leading id — use an anchored, line-start regex, not a bare string replace, and verify the diff
  landed where intended before trusting the exit code.
- `git worktree remove --force` can still fail with "Directory not empty" even after
  unregistering the worktree from git's own bookkeeping — check `git worktree list` (not just the
  remove command's exit code) and follow with a plain `rm -rf` on the now-orphaned path if needed.

## Traps carried forward from prior handoffs, still true

- A fresh worktree has none of the gitignored darwin geometry/visual baselines, so its first full
  suite reports phantom failures until seeded (`UPDATE_GEOMETRY=1 npx playwright test
  tests/geometry.spec.js --workers=1`, and similarly for visual-baselines — gitignored,
  non-destructive, doesn't touch `git status`).
- `codex exec` backgrounded without care stalls or gets lost — run it foreground, blocking,
  budget over an hour.
- A local green cannot clear the geometry gate on an unseeded darwin machine.
- `isolation: "worktree"` on the `Agent` tool provisions its OWN worktree regardless of any path
  named in the prompt text — don't pre-build a worktree AND pass `isolation: "worktree"` on the
  same call.

## Still open, still the owner's — do not build these without a fresh ruling

**P-32** (the 52ch measure cap's freed-space composition — delegated to the machine 2026-08-31 but
not yet built as a real package), **D30** (light/dark), **the home hero's height** (D27), **the
11px type floor**. Untouched by this run; all four remain refused to the machine by design.
