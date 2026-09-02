# RCA-023 — `docs/contracts/cite-audit.md` describes an identity model the shipped code no longer has

## What happened

`docs/contracts/cite-audit.md` (D170, five `codex exec` rounds, ~40 matrix cells) was written to
describe the `cite-audit` gate's promise BEFORE the gate existed. D173 (`cite-audit-v2`) then
built the gate — and, in its own round-1 review, changed the exemption identity model partway
through the build, from "the set of stripped `hit` strings on a line" to "the raw, full line
text, byte-for-byte." That second change fixed CRITICAL_BLOCKER C1 (a path swap or a column
suffix at a fixed `(file, line)` could hide a new, unreviewed citation behind an old exemption),
but the contract was never updated to match — it still describes the pre-C1-fix model as if it
were current, in several places, not just the one D173 itself flagged.

## Where this was first found and deliberately deferred

D173's own row in `docs/STATUS.md` (round 2 of its adversarial review) already named this as a
`DUPLICATE` finding and dispositioned it explicitly: *"`docs/contracts/cite-audit.md` itself
still describes the OLD `(file,line,hit)` identity in a couple of places and claims the self-test
never calls `audit()`; both are now stale against what shipped, but the contract is a
separately-reviewed D170 artifact and correcting its prose is left for a future pass rather than
folded into this package's diff."* This package is that future pass.

## Cost

None to production — `docs/contracts/*` is not shipped, not gated, and not read by any test. The
cost is to a future reader (human or agent) who trusts the contract's prose over the code and
either re-introduces the C1 identity model on the belief it was never fixed, or wastes time
"discovering" a bug that was already closed. AGENTS.md's execution-is-truth rule exists exactly
for this gap: the contract is a claim, the code is the evidence, and they had drifted.

## Full pass: every stale claim found, current vs. corrected

Read `docs/contracts/cite-audit.md` fully against `tests/lib/cite-audit-core.mjs` and
`tests/cite-audit.mjs` as shipped by D173. Six stale claims found (the two D173 named, plus four
more from a full pass):

1. **Section (a), "The promise."** Said exemption requires "an exact matching `hit` string, in
   the hand-written `EXEMPT` table." Shipped: `audit()` (`cite-audit-core.mjs:110-123`) finds an
   `EXEMPT` row by `(file, line)` alone, then requires `entry.text === lines[i]` — the FULL raw
   line, not any `hit` string. Corrected to state the byte-identical-line-text identity.

2. **(b), dimension 10** ("Exemption re-target after a text edit at the SAME `(file, line)`").
   Said `isExempt()` cannot distinguish the old, reviewed citation from a new, unreviewed one at
   the same location — true when written, false now: `audit()`'s exact-line-text requirement
   means ANY edit at that location, including a re-target, drops exemption. Corrected with a
   pointer to the D173 fix.

3. **(d), cell 16.** Verdict was `UNDEFINED — false EXEMPT`, describing the literal C1
   CRITICAL_BLOCKER as still open. It is fixed — `tests/lib/cite-audit-fixtures.mjs`'s `d16`
   EXEMPT_CASE seeds exactly this scenario (a same-basename path swap at a fixed `(file, line)`)
   and asserts `wantBreaches: 1`. Corrected to `FIXED (D173) — FIRES`, with the mechanism.

4. **(d-cont-2), cell 37.** Said a column suffix appended to an already-exempted span "does not
   change the `hit` string at all — `isExempt()` still matches, so the exemption silently
   survives an edit." Also fixed by the same raw-line-text change — `cite-audit-fixtures.mjs`'s
   `d16/cell37` case seeds exactly this and asserts `wantBreaches: 1`. The FORM-level observation
   in this cell (that `SPAN` has no right-hand boundary and the match truncates) is still true and
   is kept; only the exemption-survival claim is corrected.

5. **Section (f), opening paragraph.** Said "None of them [partners 1-3] ever call `audit()`" —
   false as shipped: the self-test's `EXEMPT_CASES` partner (`tests/cite-audit.mjs:91-95`) calls
   `audit()` directly for 11 fixtures, and the `endToEnd()` partner (`tests/cite-audit.mjs:51-83`)
   drives the real script as a subprocess, exercising the actual `process.exit` path C2 was
   written to guard. Corrected, with the "Design, not implemented here" framing for Partner 4
   updated to say it was built (as the shared `hasBreach()` predicate plus the end-to-end
   subprocess partner), the original design text kept below it as the record of what was designed
   and why.

6. **(g-cont), the fixture-obligations list.** Header said "not yet built." All five bullets are
   now built: the end-to-end exit-code fixture (`endToEnd()`), the identity truth table (`d16`,
   the two "identity truth table" `EXEMPT_CASES`, `dcont-21` duplicate-hit cases), the two-citation
   per-line fixture (`d3`, `dcont2-32`), the string-literal-only fixture (`d19`), and Partner 3's
   liveness check now calling `citationsIn()` on the recorded text (`tests/cite-audit.mjs:105-111`,
   the `citesOk` check), not `String.includes()`. The bullet about `FLOOR = 120` also had a stale
   number — shipped `FLOOR` is `140` (`cite-audit-core.mjs:10`). Corrected the header and each
   bullet to note built status and file:function pointers; kept the original prose as the record
   of what was missing when D170 wrote it.

## A real gap found in the same pass, NOT folded into this fix

(f-cont) item 7's obligation — "one file per extension in `SCANNED`, not just per root" — is only
PARTLY built. Shipped `NAMED` (`cite-audit-core.mjs:11-15`) names one file for every entry in
`ROOTS` (closing item 6 fully), but its files' extensions are `.js`, `.css`, `.astro`, `.mjs`
only — `SCANNED`'s `cjs`, `ts`, and `html` alternatives have no `NAMED` file proving they are
still scanned. A narrowing of `SCANNED` to drop `cjs|ts|html` would not be caught by `NAMED`
today, and `FLOOR` (140) is not tight enough to guarantee it either. This is a real, live
coverage gap against a contract obligation, not stale prose — filed forward as `DEF-86` rather
than fixed here, since this package is doc-only per its dispatch and a code change to `NAMED`
needs its own mutation proof.

## What will bite if this isn't done

Nothing new — this is a corrective pass, not a new mechanism. What was already biting: a future
reader (agent or human) proposing to "fix" the C1 identity model a second time because the
contract said it was still broken, or trusting the contract's "self-test never calls audit()"
line to justify skipping the `EXEMPT_CASES`/`endToEnd()` partners as untested.
