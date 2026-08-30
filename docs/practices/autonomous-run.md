# The autonomous run — main orchestrator prompt

Written 2026-08-31 at the owner's request: a self-directing ultracode run that spawns a
sub-orchestrator per pending package, plans before it builds, parallelises where the file sets
are genuinely disjoint, and **merges without manual intervention**.

## The conflict this document resolves, stated before the prompt

Three standing rules forbid unconditional autonomous merge, and pretending otherwise would be
the exact failure this repo bars.

| Rule | What it says |
|---|---|
| **W-25** | *"the RCA approval itself (step 3's STOP is a hard gate, per package, no exceptions)"* — scoped to the completed D153 run, so supersedable, but only deliberately |
| **AGENTS.md**, document-before-changing, step 4 | *"Get approval — Wait for it. **Not allowed:** Assuming silence is approval."* Not run-scoped |
| **P-18** | Decisions altering facts, self-descriptions or claims are the owner's. Standing, unconditional |

**The resolution is not to weaken them. It is to make the boundary mechanical.**

A package may merge itself only if it can PROVE it changed nothing a human must judge. That
proof is the rendered-text invariant below. Judgment work does not get a better reviewer under
this design — it gets refused and queued.

## The autonomy invariant

A package self-merges **only if every one of these holds.** Any failure stops that package,
writes its state, and queues it for the owner. No exceptions, no overrides, no "probably fine".

1. **Rendered text is byte-identical.** Build `main`, extract the visible text of every route in
   `siteRoutes()`; build the candidate, extract again; the two must match exactly. One changed
   character a visitor can read means P-18 is engaged and a human must rule.
2. **No file under `docs/evidence/` changed**, and no existing claim or number in any doc changed
   — appended records only.
3. **No `src/data/` file changed.** That is where the CV, projects and figures live.
4. **CI green on the PR**, including the deploy job actually RUNNING (not `skipped`) and
   `post-deploy` passing against the live origin.
5. **Every new or changed gate is mutation-proved RED** — the exact change that turns it red is
   executed and recorded, not asserted.
6. **Two adversarial reviews, at least one from a different model family** (`codex exec
   --sandbox read-only`, labelled static-analysis-only). Every CRITICAL_BLOCKER and
   REQUIRED_CONTRACT reproduced and fixed, or the package stops.
7. **The circuit breaker has not tripped** — see below.

Why (1) is the crown jewel: gate hardening, citation checks and flake fixes change no rendered
copy at all, so they pass by construction. Copy, claims and composition cannot pass, ever. The
boundary needs no judgment and cannot be argued with.

## The circuit breaker — stop, do not push through

Straight from AGENTS.md. Any one of these ends the package and queues it:

1. A new CLASS of blocking finding in a second consecutive review round.
2. The same defect class in two different files.
3. Two fixes in a row that each introduce a defect.
4. Three or more amended heads after review starts.
5. A gate misses behaviour an official source documents.

Finding new bugs every round is not thoroughness; it means something upstream is wrong.
Diagnose which — requirements, planning, understanding, or coding — and say so in the queue note.

## What is in scope, and what is refused

Classified from `docs/STATUS.md` and `docs/OWNER-DIRECTIVES.md` on 2026-08-31.

**ELIGIBLE — mechanical, verifiable by execution, changes no rendered text:**

| # | Package | Touches | Why eligible |
|---|---|---|---|
| A | Harden `painted()` — font-size floor, `content-visibility`, ancestor-overflow clipping, contrast against the resolved backdrop | `tests/lib/painted.mjs` (+ importers only if assertions tighten) | 20 spec files import it; today's reviewers proved white-on-white and a 1px-tall element both pass it |
| B | DEF-71 — a gate that resolves every `file.ext:NN` citation in a comment and fails when the target moved | new spec file; read-only over the repo | 21 known-wrong citations, and this session added dozens more, ungated |
| C | DEF-76 — diagnose the `hero-motion.spec.js:20` flake under full-suite load | `tests/hero-motion.spec.js`, `playwright.config.js` | seen 3×, passes 3/3 isolated; `retries: 0` makes a load-dependent gate broken by the repo's own standard |

**REFUSED — the owner's, under P-18. Do not plan, build, or "prepare" these:**

- **P-32** — the 52ch measure cap leaving ~45% of two pages empty. A composition decision.
- **D30** — light/dark. Explicitly *"do not build it either way."*
- **The home hero's height** — 2.94 viewports at 390×844. D27 lets it run long deliberately.
- **The 11px type floor** — how small this site is willing to set a fact. A `DESIGN.md` claim.

An orchestrator that "helpfully" drafts one of these has failed, not helped.

## Parallelism — measured, not assumed

Collision map, verified 2026-08-31 by `grep`:

- **A** touches `tests/lib/painted.mjs`; 20 spec files import it.
- **B** adds a new spec file and writes nothing else.
- **C** touches `tests/hero-motion.spec.js`, which does **not** import `painted()`.

So A, B and C are disjoint **on writes** and may develop in parallel — each in its own git
worktree (`isolation: "worktree"`), because subagents otherwise share one tree and parallel
writers corrupt each other.

**Merges serialise.** One work package, one pull request, merged before the next starts —
rebase each remaining branch onto `main` after every merge and re-run its full suite. A green
branch built on a stale base is not evidence.

**Recommended scale: two concurrent streams, not three.** A + B are the valuable ones. The
workflow size guideline here is medium (under 15 agents); three streams at a 3-lens planning fan
plus 2 reviewers each reaches ~21 and blows it. Run C after A merges, or fold its diagnosis into
B as a read-only task.

## Known agent failure modes — encode these or repeat them

Every one was paid for in a previous session.

- **A forked subagent can silently do nothing** — returned in 17 seconds having made zero tool
  calls. Verify by `git`/`gh` that artifacts exist; never trust a narration.
- **A subagent that backgrounds a long command and stops to "wait for a notification" is not
  resumed.** Tell every agent to poll its own long work inside its own tool calls.
- **A mutation test that mutates the wrong file reports a false GREEN.** `grep -rln … | head -1`
  picked the wrong page this session. Name the target file explicitly and assert the mutation
  landed before running the gate.
- **A local suite green cannot clear the geometry gate.** 48 of 51 skips ARE the geometry
  comparisons, skipped under D140 on darwin. Only CI runs them.
- **BSD `sed`'s GNU-only range address silently no-ops on macOS.** Use Python; grep after.
- **A geometry baseline regenerates on a runner only** — `gh workflow run gates.yml -f
  update_geometry_baseline=true`, then diff it PROGRAMMATICALLY by flattened key paths. DEF-60's
  structural floor fires even in update mode; a breach there means fix the markup, not the
  baseline.

---

## The prompt

Paste the fenced block into a fresh Claude Code session in the repo root.

```
ULTRACODE. Autonomous multi-package run. You are the MAIN ORCHESTRATOR.
Use the Workflow tool and forked sub-orchestrators throughout. This is an
explicit ultracode opt-in, not a suggestion to ask about first.

READ FIRST, IN THIS ORDER, THEN STOP TRUSTING THEM AND VERIFY BY RUNNING:
  AGENTS.md
  docs/practices/autonomous-run.md   <- your operating contract. The autonomy
                                        invariant, the circuit breaker, the
                                        eligible/refused split, the collision
                                        map, and the known agent failure modes
                                        are all there. Follow it literally.
  docs/OWNER-DIRECTIVES.md
  docs/STATUS.md   (read the tail)
  docs/HANDOFF.md

YOUR JOB
  1. Re-verify the eligible list in autonomous-run.md still matches STATUS.md.
     If an item was fixed since 2026-08-31, drop it. If a NEW defect appears,
     you may add it ONLY if it passes the autonomy invariant's tests 1-3 by
     inspection. When unsure, refuse and queue it. Refusing is cheap; a wrong
     autonomous merge to a personal site is not.
  2. Run packages A and B as PARALLEL sub-orchestrators, each in its own git
     worktree (isolation: "worktree"). Run C after A merges, or fold its
     diagnosis into B read-only. Never let two agents write one tree.
  3. Merge serially. After each merge, rebase the other branch onto main and
     re-run its full suite before its own merge.

EACH SUB-ORCHESTRATOR RUNS THESE PHASES IN ORDER. No phase may be skipped,
reordered, or run "in parallel with" the one before it.

  PHASE 1 — PLAN (read-only fan, 2-3 lenses, parallel)
    Lenses: (a) what is the actual defect, reproduced by execution;
            (b) what is the smallest correct fix and what does it touch;
            (c) adversarial — how would this fix be wrong, and what does the
                proposed gate FAIL to catch.
    Converge to ONE plan carrying: the reproduction command and its output,
    the file list, the gate design, and the exact RED-WHEN line for every gate
    it adds. A plan without a RED-WHEN is not a plan; send it back once, then
    stop the package.

  PHASE 2 — RCA, written BEFORE any code
    docs/rca/RCA-0NN-<slug>.md: what happened, where introduced, where caught,
    the cost, the evidence, the proposed fix, and what will bite. AGENTS.md
    fixes this order and it is not negotiable. In this run the RCA is NOT
    gated on the owner -- the autonomy invariant replaces that approval -- but
    it is still written first, because a document written after the fix has
    already forgotten what was tried and rejected.

  PHASE 3 — BUILD, test-first
    Write the gate RED against the current build. Record the failure output.
    Then fix. One tree-writer at a time inside the package.

  PHASE 4 — PROVE
    Mutation-prove every new gate bites: revert the fix, show it RED, restore.
    Name the mutated file EXPLICITLY -- a mutation harness that mutates the
    wrong file reports a false green, which happened here on 2026-08-30.
    Every check that counts something needs a partner proving the counted
    thing exists. Definition-of-Done item 2 (seen rendering, desktop AND
    mobile) applies to anything visual.

  PHASE 5 — REVIEW (2 rounds maximum, then the circuit breaker fires)
    Two adversarial reviewers, at least one a DIFFERENT MODEL FAMILY via
    `codex exec --sandbox read-only`, labelled static-analysis-only because it
    cannot run tests. Tell every reviewer IN CAPITALS not to write, edit,
    checkout, stash, or sed -i. REPRODUCE each finding before acting on it --
    reviewers are wrong often; on 2026-08-30 two reviewer claims were refuted
    by measurement and one reviewer had to be corrected. Classify each finding
    CRITICAL_BLOCKER / REQUIRED_CONTRACT / ADVISORY_DEBT / DUPLICATE /
    OUT_OF_SCOPE. Only reproduced CRITICAL and REQUIRED block.
    REVIEW THE PROSE, NOT ONLY THE ASSERTIONS. A test comment or an excuse
    string that claims coverage it does not have is a defect of the same class
    as a wrong assertion -- one shipped here and passed two reviewers.

  PHASE 6 — VERIFY BY EXECUTION
    npm run build; npx playwright test (expect the 2 known D140 darwin
    geometry refusals, and know that a local green CANNOT clear the geometry
    gate); node tests/file-budget.mjs; node tests/no-pii.mjs. If the change
    touches rendering, dispatch the runner-side geometry baseline regeneration
    and diff it programmatically by flattened key paths.

  PHASE 7 — THE AUTONOMY INVARIANT, then merge
    Evaluate all seven conditions in docs/practices/autonomous-run.md. Record
    each with its evidence. If ALL hold: open the PR, wait for CI, merge,
    confirm the deploy job RAN (not skipped), and re-verify the change live
    against https://stackclimb.com yourself. If ANY fails: DO NOT MERGE. Write
    the package's state and its blocking condition into docs/STATUS.md and
    stop that package. A queued package is a success, not a failure.

  PHASE 8 — LEDGER, same change
    A docs/STATUS.md row in the SAME commit as the fix. Rejected options carry
    their reason. Corrections stay -- if you got something wrong on the way,
    the wrong version stays visible next to the right one.

HARD REFUSALS -- do not plan, build, draft, or "prepare" any of these. They
are the owner's under P-18 and an orchestrator that touches them has failed:
  P-32 (the 52ch measure cap), D30 (light/dark), the home hero's height
  (D27), the 11px type floor. Queue them; do not work them.

TELL EVERY AGENT YOU SPAWN:
  - Do NOT spawn nested Agent calls.
  - Do NOT background a long command and stop to wait for a notification --
    you will not be resumed. Poll inside your own tool calls.
  - Reviewers and planners are READ-ONLY and share one working tree.
  - Report what you RAN and its output, never what you expect.

WHEN EVERYTHING IS DONE OR QUEUED
  Rewrite docs/HANDOFF.md. Lead with what went WRONG, because that is the part
  the next session can act on. Delete every branch and worktree both sides,
  kill orphaned processes, remove scratch files BY NAME (never `git clean`),
  and close with: what is Done, what you Verified yourself with its output,
  what was Cleaned up, what is Pending, and the Next action.
```
