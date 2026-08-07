# The five definitions — every step of work passes all five, in order

A step that skips one is not faster. It has moved the cost to whoever finds the gap later.

| # | Definition | The question it answers | Who decides |
|---|---|---|---|
| 1 | **Ready** | May work start? | Owner or the plan |
| 2 | **Developed** | Is the change written? | Builder |
| 3 | **Tested** | Is it proven, not assumed? | The gates |
| 4 | **Done** | Does it meet what was asked? | Reviewer |
| 5 | **Complete** | Is it live, clean, and recorded? | Session close |

---

## 1. Definition of Ready

Work may not start until all are true:

- The problem is written down, with an **RCA** — what happened, why, what it cost.
- The intended behaviour after the change is stated in plain English.
- Acceptance is stated as something observable, not "works properly".
- The gate that will prove it is named. If none exists, building it is part of the work.
- Everything it depends on is done, or explicitly stubbed with the stub recorded.
- The owner has approved it, or the plan already covers it.

**Not ready:** "fix the contrast." **Ready:** "22 nodes on 4 plates fail 4.5:1 because the
opacity ramp was tuned on the darkest ground. After: per-plate axe green on all 7. Gate: the
existing per-plate scan in `tests/dod.spec.js`."

## 2. Definition of Developed

- The change is written and builds clean, with no new warnings.
- It does one thing. A change needing "and" to describe it is two changes.
- Under the file budget: 250 lines, 32,000 bytes, 120 chars per line.
- Every non-obvious line carries **why**, not what.
- Nothing unrelated was touched.

## 3. Definition of Tested

- A test exists that **fails without the change**. Proven by reverting and watching it go red.
- The test states its denominator and fails on zero.
- Both states checked where a state exists — JS on and off, both themes, mobile and desktop.
- Anything visual has been **looked at**, not just asserted.
- No existing test was weakened, skipped, or had its threshold lowered to pass.

## 4. Definition of Done

- Acceptance from the Definition of Ready is met, and demonstrated.
- Reviewed by a lens from a **different lineage** than the one that built it.
- Every review finding is resolved or explicitly deferred with a reason.
- Every new claim traces to `docs/evidence/` at `VERIFIED` or labelled `REPORTED`.
- The PR describes the behaviour before and after in plain English.
- `docs/STATUS.md` is updated in the same change.

## 5. Definition of Complete

- Merged to `main`; `main` and `origin/main` verified level by command.
- Deployed, verified by the deploy **job** running — not by a health check returning 200.
- Branch deleted both sides; worktree removed.
- Processes, containers, images, and temp files from the session cleaned up.
- Learnings filed under the phase that **introduced** the problem.
- Handoff written.

**Merged is not complete. Deployed is not complete. Verified and cleaned up is complete.**
