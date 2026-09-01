# RCA-018 — citation-rot gate (DEF-71), rebuilt against the converged contract

Package `cite-audit-v2`, run under `docs/practices/autonomous-run.md`'s autonomy invariant —
the RCA is written first, per AGENTS.md's document-before-changing order, but is not gated on
the owner's live sign-off; the seven-condition invariant stands in for that approval.

## What happened

Branch `cite-audit` (old, still present locally, not merged) built `tests/cite-audit.mjs`: a
gate that bans `file.ext:NN`-style line citations in code comments, after sweeping 47 stale
ones out. Two review rounds (`codex exec --sandbox read-only`) found it QUEUED rather than
merged (D164's row, and the branch's own `fc7d84a`), on two findings:

- **C1 CRITICAL_BLOCKER** — the exemption table matched on `(citing file, citing line,
  stripped hit)`. The scanner's own `NAME` regex (`[A-Za-z0-9_.-]+`, no `/`) strips any
  directory before a hit is compared, so `src/expect.js:12486` and the exempted
  `expect.js:12486` (pointing into `node_modules`) reduce to the identical hit string.
  Reproduced on the fixed code: appending a citation of a different file to an already-exempt
  line went undetected, exit 0.
- **C2 new-class CRITICAL_BLOCKER, second round** — the 18-assertion self-test called
  `citationsIn()`, `scanFiles()`, `readFileSync()` — never `audit()`, and never touched the
  script's own `if (breaches.length) { process.exit(1) }` branch, which only runs on the
  non-`--self-test` path. Proof: `breaches.length` → `breaches.lenght` (one-character typo)
  left every self-test assertion printing PASS while a live, unexempted breach passed through
  the real script with exit 0.

Both fired the circuit breaker (a new class in round 2), so the package queued itself rather
than force a merge — the correct outcome under this repo's rules, not a failure.

## Where introduced

Both gaps are enumeration gaps, not coding slips — the branch wrote the fix before writing the
contract (D164's row states this explicitly). Nobody had enumerated "what uniquely identifies a
citation for exemption purposes" before choosing `(file, line, hit)` as the key, and nobody had
asked "what actually drives the gate's own exit decision" before writing partners that all sit
one level removed from it.

## Where caught

Round 1 review caught a related but narrower defect (B1: keying on `file+line` alone exempted
the whole line). The fix for B1 — per-citation keying — left C1 open because per-citation keying
still throws away the path. Round 2 review, run against the B1 fix, found C1 unresolved (same
root cause, same class, not double-counted) and found C2 fresh.

## Cost

A merged version of the old branch would have let two classes of citation drift back in
silently: a basename-colliding citation hiding behind an unrelated exemption (C1), and the gate
itself going permanently green under a one-character typo with no code path that could ever
observe it (C2). Both are exactly the failure DEF-71 exists to close — citation rot nobody sees
because the edit that breaks it happens somewhere else.

## Evidence

- `git log --oneline cite-audit -5` — `fc7d84a` is the queue commit, with the reproduction
  steps for C1 and C2 in its own message.
- `docs/contracts/cite-audit.md` — converged 2026-08-31 (D170), 5 rounds of
  `codex exec --sandbox read-only`, ~40 matrix cells across `(d)`, `(d-cont)`, `(d-cont-2)`, and
  a written failability-partner design in `(f)`/`(f-cont)` that names the exact end-to-end
  seam C2 needs and eleven further ways the exit decision could still go silently green.
- Running the OLD branch's scanner against current `main` (150 files, `git show
  cite-audit:tests/cite-audit.mjs`): zero live breaches today. This package adds no sweep — the
  47-citation cleanup already landed and holds.

## The fix, built in this package (not this document)

Contract cell 15/16 supplies the answer C1 needed: the exemption identity has to cover **every
citation on the line, not one hit in isolation** — an entry now records the full, ordered set of
hits a reviewer expects on that exact line. If the live set on that line differs at all (a new
citation appended, one removed, one changed), none of that line's citations are exempt, and the
maintainer has to touch the table on purpose. That closes the exact C1 reproduction: appending a
different-file citation to an exempted line now changes the set and the line fires.

Contract `(f)`/`(f-cont)` supplies the C2 answer: extract the exit predicate into one exported
`hasBreach()` both the self-test and the real run call, and add an end-to-end partner that
spawns the real script as a **subprocess**, seeded with one untracked fixture file carrying an
unexempted citation unique to the test, and asserts the child process's own exit code — not a
call into an exported function standing in for it.

## What will still bite, disclosed rather than hidden

The contract's own matrix declares several cells `UNDEFINED` or "declared residual, not fixed
here" (same-line duplicate hits collapsing to one identity slot — cell 21/34; a partial subtree
exclusion inside `src/` — finding 10; CI wiring that could still mask the exit code by piping
through `--self-test`-only or `|| true` — finding 11, out of scope for the script itself). This
build does not silently close those; it inherits the contract's disclosure and repeats it in the
gate's own header, and verifies the one wiring item that IS in scope: `gates.yml`'s step runs
the real script with no `--self-test` and no exit-swallowing.
