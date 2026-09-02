# RCA-020 — no gate stops two rows from claiming the same ledger id

## What happened

Two packages developed in parallel git worktrees during ULTRACODE v3 (`harden-painted` and
`cite-audit`) both branched `main` at the same point (max `D163` / max `DEF-76`), both computed
"next free id" independently from that shared base, and both claimed **D164**, **D165**, and
**DEF-77** for entirely unrelated content. Filed as `docs/STATUS.md` row `DEF-77`. Neither branch
had merged when the collision was found, so nothing corrupted — but the collision map in
`docs/practices/autonomous-run.md` did not model it, because `isolation: "worktree"` prevents
concurrent *file* corruption, not a value (a ledger id) independently derived from a shared base.

## Where introduced

`docs/practices/autonomous-run.md`'s original collision map covered file writes only. Ledger-id
allocation was an unstated shared resource: every package could read and write `docs/STATUS.md`,
but nothing enforced that the *id column values* it wrote were globally unique.

## Where caught

Manually, by the orchestrator, via `git diff main...HEAD -- docs/STATUS.md` filtered to added row
ids, after both branches already existed. Not caught by any automated check — none existed.

## Cost

Not yet realized (neither branch had merged), but the failure mode is real: had both merged, `main`
would carry two rows both titled `D164`, and a rebase conflict in `docs/STATUS.md` could resolve
into a silently duplicated id rather than a forced renumber. `docs/practices/autonomous-run.md`
Phase 0 now pre-allocates id ranges by convention (this run reserved D175/DEF-83 for this
package), but convention is not a gate — nothing fails a push that violates it.

## Contract for the fix (Phase 1a)

What the gate promises, and its exact input space:

- **Population**: every table row in `docs/STATUS.md` whose FIRST cell is a ledger id. Matched at
  the start of a physical line: `^\| *(id-token) *\|`. An id mentioned anywhere else in the file
  (a row's prose citing `D164`, an evidence-column cross-reference, a "see the row above") is
  **not** in the population — verified: `D164` appears 9 times in the file total but only once as
  a row's own leading cell; `DEF-77` appears 5 times, once as a row's own leading cell.
- **id-token shape**: `D[0-9]+` or `DEF-[0-9]+`, optionally wrapped in `~~...~~` (Markdown
  strikethrough, this file's own convention for "closed/superseded"). No other shape exists in the
  file today — verified by extracting every first-cell token and diffing against this pattern:
  empty diff.
- **Duplicate definition**: the SAME id-token (after stripping `~~`) appears as the first cell of
  two or more rows, UNLESS every one of those rows is struck through.
- **Why the exemption is "all struck", not "any struck", and why that correction matters**:
  `main` already carries a genuine pre-existing duplicate today — `~~DEF-8~~` is the first cell of
  TWO separate rows (line 633 and line 664). This is a deliberate split: the second row states
  "FIXED 08-10 for the rest of the site — see the row above." It is not a collision, it is the
  file's own convention for a two-part closure, and a gate that checked struck-through rows too
  would be RED on today's clean `main`, on arrival, for a non-defect. **Round-1 review (codex,
  different model family) found the first cut of this contract too permissive**: excluding ANY
  struck-through occurrence from the count meant `| ~~D42~~ |` followed later by `| D42 |` for
  unrelated new work reported no breach — reusing a closed id is exactly the collision class
  DEF-77 exists to catch, not a case to exempt. Corrected to "all struck": a closed/closed pair is
  exempt, any struck/active mix on the same id is a breach.
- **Out of scope**: `docs/OWNER-DIRECTIVES.md`'s own id scheme (`I-N`, `W-N`, `P-N`), any file
  other than `docs/STATUS.md`, any id-range notation (`D170-D174`, seen only in prose, never as a
  row's own first cell — verified absent from the file), and **a pipe-shaped line inside a fenced
  (```) code block**. Round 1 raised the fenced-block case as `ADVISORY_DEBT` and a first pass
  added fence tracking to close it; round 2 review found the naive open/close toggle itself a
  `CRITICAL_BLOCKER` — a fence-content line that itself starts with three backticks but is not a
  valid CommonMark closing delimiter desyncs the toggle and can hide a REAL duplicate past it.
  Per the review-triage rule *"do not expand scope solely to satisfy advisory feedback"*, the fence
  handling was **reverted, not patched again** — a correct fix needs a real CommonMark-aware
  parser, disproportionate to a population where, verified today, `docs/STATUS.md`'s one fenced
  block (the D12 install list) never contains a line matching the row-id shape. Named residual: if
  a future fence ever holds a genuine id-shaped line, this gate does not see inside it.

## Proposed fix

`tests/status-ledger.mjs`, matching the existing `tests/file-budget.mjs` / `tests/no-pii.mjs`
pattern: a `--self-test` mode that proves both directions against virtual fixtures (an active
duplicate is caught; the real `~~DEF-8~~` split is NOT flagged; a clean tree passes), and a plain
mode that runs the real check against `docs/STATUS.md` and exits 1 on any breach. Wired into
`.github/workflows/gates.yml` as its own `run:` step beside `file-budget.mjs` and `no-pii.mjs`.
**Correction, round-1 review**: a first draft of this RCA said no pre-commit hook exists — false.
`.githooks/pre-commit` exists and is bound by `package.json`'s `prepare` script. It runs only
staged-file checks (`no-pii.mjs --staged`, the `.env`/inbox checks, `gitleaks`), never a full-tree
scan — `file-budget.mjs` and `cite-audit.mjs` are CI-only for the same reason. This gate follows
that precedent: CI-only, not added to the pre-commit hook.

**RED-WHEN**: change any active row's leading id to match another active row's leading id (e.g.
retarget `| D173 |` to `| D174 |` — two different rows now claim `D174`).

**Failability partner** (autonomous-run.md's requirement — a check that has never gone red proves
nothing about its own ability to fail): mutate the gate's own exit condition (`if (breaches.length)`
to `if (breaches.length > 999)`, so a real duplicate — `breaches.length === 1` — never trips the
check) and show the mutated gate prints green against a fixture carrying a real, live duplicate.
Reproduced twice: once as a standalone mutation against `docs/STATUS.md` (proves the shipped
script), and once against the corrected self-test's own subprocess check (proves `--self-test`
itself now goes red under the same mutation, closing round 1's `REQUIRED_CONTRACT` finding that
the self-test never drove the real exit branch). Then restore both.

## Round 2 review — one new class found, resolved by reverting scope, not by patching

Codex's second pass (still `--sandbox read-only`, same different-model-family reviewer) found:

- `CRITICAL_BLOCKER` — the fence-tracking toggle added in round 1 desyncs on a nested
  triple-backtick line, hiding a real duplicate past it. Root cause: this was scope creep — an
  `ADVISORY_DEBT` finding from round 1 that should not have expanded the fix. **Corrected by
  reverting the fence-tracking code entirely**, not by patching the toggle logic again — the
  global triage rule is explicit that advisory feedback does not license scope expansion, and
  removing the feature removes the bug it introduced. Verified the real file carries zero risk
  from the removal (no fenced block in `docs/STATUS.md` contains a row-id-shaped line today).
- `REQUIRED_CONTRACT` — the self-test's temp fixture files used fixed names with no `finally`,
  so a thrown assertion could leave them behind or let them collide with a real file. **Fixed**:
  a unique `mkdtempSync` directory under the OS temp dir, cleaned up in a `finally` block.
- `ADVISORY_DEBT` — this RCA's failability-partner section named a nonexistent `dupes.length`
  variable; the code uses `breaches`. **Fixed above.**

This is the run's bounded second review round. No third `codex exec` pass was run — re-verification
after these two fixes was done by direct execution (mutation proofs, self-test, real-tree run),
which is stronger evidence for a change this size than a third reviewer pass would add, and keeps
the circuit breaker's two-round cap intact.

## What will bite if this is not fixed

The next time two packages branch in parallel and both compute "next free id" from the same base,
nothing stops the collision from reaching `main`. Convention (Phase 0 pre-allocation) is currently
the only defense and depends on every future orchestrator remembering to follow it.
