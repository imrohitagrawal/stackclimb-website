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

## The fix, built in this package (not this document) — and corrected once by review

Contract cell 15/16 pointed at the answer C1 needed: the exemption identity has to cover more
than one hit in isolation. The FIRST attempt built that as a per-line SET of hits — an entry
records every hit a reviewer expects on that exact line, and any change to the set (an addition,
a removal) drops exemption for the whole line. That closed the append case, but a round-1 `codex
exec --sandbox read-only` review drove `audit()` directly and showed it was NOT the fix C1
actually needed: a real path swapped onto the SAME basename+span, or a column suffix glued onto
the SAME span, does not change the hit COUNT — only a value the regex had already truncated
before the set ever saw it — so both still returned zero breaches. That is the literal C1
reproduction from the old branch's queue, still open.

**Corrected**, same review round: exemption is now keyed on the **raw, full line text**, not on
any extracted hit or set of hits. An entry is live only if the line's current content is
byte-identical to what it excuses. A path swap, a column suffix, a citation added or removed, or
even a cosmetic reword all change the line's text, so all of them now drop exemption until a
maintainer reviews the edit and updates the table on purpose — which is what the EXEMPT table's
own "re-verify by hand" reasons already asked for, made literal.

Contract `(f)`/`(f-cont)` supplies the C2 answer: extract the exit predicate into one exported
`hasBreach()` both the self-test and the real run call, and add an end-to-end partner that
spawns the real script as a **subprocess**, seeded with one untracked fixture file carrying an
unexempted citation unique to the test, and asserts the child process's own exit code — not a
call into an exported function standing in for it. The same review round found this partner
could clobber and delete a pre-existing file of the same name; fixed with exclusive creation
(`wx`) and a `finally`-guarded cleanup, so a mid-run throw only ever removes the file this run
created.

## Round-1 review record (codex exec --sandbox read-only, foreground, full transcript in the PR)

Five findings, all reproduced before being fixed:

1. **CRITICAL_BLOCKER** — C1's set-based identity still false-exempted a changed citation
   (path swap, column suffix, malformed suffix). Reproduced with `audit()` driven directly;
   fixed by switching identity to full raw line text (above).
2. **CRITICAL_BLOCKER** — the end-to-end partner could destroy a pre-existing file. Fixed with
   exclusive creation and `finally`-guarded cleanup (above).
3. **REQUIRED_CONTRACT** — this document's first draft said the new identity was an "ordered
   set" of hits; the code (correctly) compared unordered. The wording was wrong, not the code —
   corrected above to describe what actually shipped: full line text, no ordering concept at all.
4. **REQUIRED_CONTRACT** — no fixture exercised most of `TARGETS`' extensions (`mjs`, `cjs`,
   `ts`, `astro`, `md`, `py`, `json`, `yml`, `html`); removing them from `TARGETS` left every
   existing fixture passing. Fixed: one FINDS fixture added per `TARGETS` extension. `SCANNED`'s
   `cjs`/`ts`/`html` stay an explicitly declared residual — no such file exists anywhere in this
   repo to name, so no fixture can prove coverage without fabricating one, which is out of scope.
5. **REQUIRED_CONTRACT** — the fixture-count check was a `>= 30` floor against 36 fixtures, six
   free to vanish unnoticed; two fixture labels didn't test what they claimed (`d16` used a
   different basename instead of reproducing the path-swap; `d18` was a string literal,
   duplicating `d19`'s cell instead of covering "live code, not a string"). Fixed: an exact,
   hand-maintained `REQUIRED_FIXTURES` count (46), an ID-uniqueness partner, `d16` rebuilt to
   the real path-swap reproduction (finding 1 folded in), and `d18` rebuilt as unquoted code.

Confirmed clean by the same review, no fix needed: C2's exit-decision partner (deletion,
hard-wiring, and an unrelated child failure are all distinguished correctly); all six real
`EXEMPT` entries' `cites` match their lines; `gates.yml`'s new step has no exit-swallowing.

## What will still bite, disclosed rather than hidden

The contract's own matrix declares several cells `UNDEFINED` or "declared residual, not fixed
here" (same-line duplicate hits collapsing to one identity slot — cell 21/34; a partial subtree
exclusion inside `src/` — finding 10; CI wiring that could still mask the exit code by piping
through `--self-test`-only or `|| true` — finding 11, out of scope for the script itself). This
build does not silently close those; it inherits the contract's disclosure and repeats it in the
gate's own header, and verifies the one wiring item that IS in scope: `gates.yml`'s step runs
the real script with no `--self-test` and no exit-swallowing.
