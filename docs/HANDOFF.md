# Handoff — for the next session

Written 2026-09-01, superseding the 2026-08-31 handoff (that one is in git history).

**ULTRACODE v3 ran to completion. All three eligible packages from the D163 autonomous run are
now on `main`, deployed, and independently re-verified in production: `harden-painted` (D171,
merged before this session), `cite-audit-v2` (D173, PR #139), and the `hero-motion-flake`
diagnosis (D174, PR #141). A small ledger-hygiene fix also merged (PR #140). Nothing is pending
on the owner from this run. Full detail in `docs/STATUS.md`; do not re-derive it here.**

## What went wrong, because that is what you can act on

- **A spawned subagent backgrounding a long command and stopping to "wait for a notification" is
  not a one-off — it happened TWICE in this exact session, to two different agents, despite an
  explicit, capitalized instruction against it in both prompts.** The first agent (package B,
  `cite-audit-v2`) backgrounded `codex exec` and a full Playwright run, then ended its turn citing
  "monitors set up." The second agent (package C, `hero-motion-flake`) was told about the FIRST
  agent's exact failure by name in its own brief — and did the same thing anyway, ending its turn
  saying "I'll stop polling and wait for the Monitor task's notification." Neither was
  auto-resumed; both had to be manually restarted by the orchestrator via `SendMessage`, costing
  real wall-clock time each time. **This is not fixed by writing the warning more emphatically —
  it was already in capitals and named the prior incident by ID.** Filed as product/model-behavior
  feedback this session (queued locally, not sent — the owner can review via `/feedback`). Until
  the harness or model behavior changes, budget for this: after dispatching ANY agent whose brief
  includes a long foreground command, read its final report for phrases like "waiting for",
  "monitor", or "will notify me" before assuming it actually finished, and be ready to resume it.
- **The orchestrator made one process slip of its own, caught immediately.** After the first
  agent's premature stop, the correct recovery is `SendMessage` to the SAME agent ID to resume it
  with its context intact. Instead, a fresh `Agent` call was made by mistake — a new agent with no
  memory of the worktree, the commits, or what had run. Caught before the stray agent did any
  work (killed via `TaskStop` in the same turn), then the correct `SendMessage` resume was issued.
  No damage done, but it is exactly the trap `docs/practices/autonomous-run.md`'s "known agent
  failure modes" section exists to prevent for the AGENTS it spawns — worth remembering it applies
  to the orchestrator's own tool choice too.
- **`Agent`'s `isolation: "worktree"` param silently creates its OWN worktree, ignoring a path
  named in the prompt text.** The orchestrator manually pre-created a worktree at
  `../scw-cite-audit-b` on a branch named exactly as the prompt instructed, then passed
  `isolation: "worktree"` on the same call — the tool created a second, different worktree at
  `.claude/worktrees/agent-<id>` and the agent worked there instead, never touching the one
  pre-built for it. Wasted one worktree-creation and had to be cleaned up as unused residue after
  the fact (it was — confirmed identical to `main`, zero commits, deleted). **Fix for next time:
  either let `isolation: "worktree"` provision the worktree itself and reference
  `<worktree>.worktreePath` in the report back, or skip the `isolation` param and manually `cd` the
  agent into a pre-built worktree via the prompt — never both.** The second package (`hero-motion-
  flake`) used the manual-`cd`-only approach and it worked as instructed.

## What went right, worth repeating

- **The orchestrator independently re-verified every package before merging, not just trusted the
  agent's report.** For `cite-audit-v2`: re-ran the self-test, re-ran the gate, and personally
  reproduced the mutation proof (flipped `breaches.length` → `breaches.lenght` in the actual file,
  confirmed the self-test genuinely failed, reverted). For `hero-motion-flake`: read the actual
  diff, re-ran the fixed spec file 5x under repeat, confirmed 60/60 clean. Neither verification was
  rubber-stamped from the subagent's own claim.
- **Real CI was watched to completion every time**, not assumed from a queued run — three separate
  pushes to `main` (PR #139, #140, #141), each confirmed with `gh run watch --exit-status` and a
  per-job status check that the **deploy job specifically ran and succeeded**, not skipped.
- **Production was independently re-verified with `npm run post-deploy` after every single
  merge** (three times), not just once at the end.
- **The ledger was updated in the same commit as the code every time** (D173, D174), and a
  pre-existing staleness in `STATUS.md`'s own top-of-file summary line (still read D164 after
  D165-D173 had landed) was caught and fixed as its own small PR rather than left for the next
  reader to trip over.
- **Every merged branch and worktree was deleted, both local and remote, confirmed by command**
  (`git worktree list`, `git branch -a`, `git ls-remote --heads origin`) after each package — not
  claimed, checked. The old superseded `cite-audit` branch (replaced by the from-scratch rebuild in
  `cite-audit-v2`, never pushed) was also cleaned up once its replacement had merged.
- **A new defect found mid-package (DEF-82, `nav-reach.spec.js:92` reproducing unstressed) was
  filed and QUEUED rather than chased** — it was out of the package's authorized scope
  (`docs/practices/autonomous-run.md`'s eligible list named only A/B/C), and scope discipline held.

## The state, in commands

```
git status -sb                     # main, clean, level with origin/main
git worktree list                  # one entry — no stray worktrees
git branch -a                      # main only, local and remote
gh pr list --state merged --limit 5   # #141, #140, #139 (this session), #138, #137 (prior)
npm run post-deploy                # green, independently re-verified 2026-09-01
```

## What is open, not done by this run

- **DEF-82 (LOW), filed this run, not investigated.** `nav-reach.spec.js:92` reproduced its own
  failure with no synthetic stress at all, during `hero-motion-flake`'s verification — different
  mechanism from DEF-76's race, different file. D168's "one cause, three specs" theory is not
  fully closed by this run: two of the three named specs (`hero-motion.spec.js:95`, `nav-
  reach.spec.js:92`) have real, distinct root causes; `hero-motion.spec.js:20` itself, the
  original citation, never reproduced under any load tested.
- **`docs/contracts/cite-audit.md`'s own prose is stale against what actually shipped** — flagged
  as a DUPLICATE finding in `cite-audit-v2`'s round-2 review, not fixed in that PR (a separately-
  reviewed D170 artifact; correcting it was deliberately left for a future pass rather than folded
  into an unrelated diff). It still describes the old `(file,line,hit)` exemption identity and
  claims the self-test never calls `audit()` — both wrong as of D173.
- **The four HARD REFUSALS remain untouched, correctly**: P-32 (52ch measure cap), D30
  (light/dark), the home hero's height (D27), the 11px type floor. None came up in this run's
  scope; none were built, drafted, or prepared.
- **Model-behavior feedback about the repeated background-and-stop failure is drafted and queued
  locally** (not sent) — see the first "went wrong" item above. The owner can send it via
  `/feedback` if they want to.

## Traps that cost real time this session (add to the existing list)

- A subagent's final report saying it is "waiting for a notification" or has "monitors set up" on
  a backgrounded long command means it has actually STOPPED, not paused — resume it explicitly with
  `SendMessage` to the SAME agent id/name, never assume it will wake on its own.
- When resuming a stalled agent, double-check you are calling `SendMessage` to its existing
  id/name, not accidentally calling `Agent` fresh — a fresh call has no memory of the worktree or
  prior work and will need to be manually killed and redone.
- `isolation: "worktree"` on the `Agent` tool provisions its OWN worktree at
  `.claude/worktrees/agent-<id>` regardless of any path named in the prompt text — don't
  pre-build a worktree AND pass `isolation: "worktree"` on the same call; pick one mechanism.

## Traps carried forward from the previous handoff, still true

- A fresh worktree has none of the gitignored darwin geometry baselines, so its first full suite
  reports phantom failures until seeded (`UPDATE_GEOMETRY=1 npx playwright test
  tests/geometry.spec.js --workers=1` — gitignored, non-destructive, doesn't touch `git status`).
- `codex exec` backgrounded without `< /dev/null` or otherwise abandoned stalls or gets lost — run
  it foreground, blocking, budget over an hour.
- Codex's read-only sandbox cannot launch Chromium — genuinely static-analysis-only, and still the
  highest-value reviewer measured in this repo's history; keep using it.
- A local green cannot clear the geometry gate on an unseeded darwin machine.

## Still open, still the owner's — do not build these

**P-32** (the 52ch measure cap), **D30** (light/dark), **the home hero's height** (D27), **the
11px type floor**. Untouched by this run; all four remain refused to the machine by design.
