# Handoff — for the next session

Written 2026-08-31, superseding the earlier 2026-08-31 (run-record) handoff. That one is in git
history; this file is replaced each session by convention.

**D163's autonomous run ran, both packages were QUEUED, and then each was SPLIT at its risk
boundary and its safe half shipped.** On `main`: the run record (D164, DEF-77), the citation sweep
(D165, DEF-78), the `painted()` alpha fix (D166, DEF-79), the owner-queue clearance (D167) and the
em-dash pass (D168). **Two halves remain queued, and each is blocked on a written contract, not on
more code. Nothing is pending on the owner.** Full account in `docs/STATUS.md`; do not re-derive it.

**The sharpest lesson of the run, and it landed on the orchestrator.** D168's copy change was
measured as geometry-neutral on darwin at 1440 and 390 — paragraph height, plate height and link
position all byte-identical — and CI still caught a **23px reflow at 768px on linux**, because the
same self-hosted fonts rasterize to different advance widths and the text wraps elsewhere. *A local
green cannot clear the geometry gate* is the warning this repo already carried, and it caught the
very session that kept repeating it. Recovery is CI-dispatched only, then diffed programmatically
by flattened key path: 3,096 keys compared, exactly 2 changed.

## What went wrong, because that is what you can act on

- **One defect class ran through the whole session: a claim whose scope is wider than the
  measurement behind it.** Package A measured `painted()` on leaf-shaped fixtures and stated it of
  all call sites. Package B measured citations under one regex form and stated the population under
  another. It then caught the orchestrator **five** times: a single-line `grep` that "proved" a
  phrase did not exist when it wrapped across a line; `grep -c PASS` counting a summary line as an
  assertion; a mutation probe seeded outside the gate's scan roots; a grep for the JS property
  `webkitTextFillColor` that missed the CSS property `-webkit-text-fill-color`; and a `color-mix`
  figure describing 15 stylesheets when only 8 set a text colour.
  **Every one was caught by something disagreeing — a reviewer, a control run, a second grep —
  and none by reading.**
- **Plans planned the FIX, not the CONTRACT.** That single omission produced every blocker. Nothing
  stated what each thing promises over what input space, so reviewers discovered the contract by
  counterexample, one shape at a time, and each new shape read as a new bug.
- **A gate's self-test can certify a property the gate does not have.** Package B's 18 assertions
  all printed `SELF-TEST PASS — the scanner bites` while a one-character typo
  (`breaches.length` → `breaches.lenght`) made the gate print green with a live breach present.
  Nothing drove the executable's own exit decision. **Ask of every gate: which assertion fails if
  the gate becomes incapable of failing?**
- **A fixture set one shape deep cannot see a scope weakening.** It bit twice: package A's
  `querySelectorAll('*')` → `':scope > *'` left all 38 fixtures green, and the D166 self-test had
  the same flaw until review caught it. The fix both times is a fixture **pair** differing on the
  axis the guard uses.
- **Worktree isolation does not prevent ledger-ID collision.** Both packages independently claimed
  D164, D165 and DEF-77 for different things. DEF-77.

## The rule that replaces "find a bug, fix a bug"

When a reviewer produces a counterexample, ask which of three it is:

1. **Fits an enumerated shape, and a fixture covers it** → not a finding. Close it.
2. **Fits an enumerated shape, no fixture** → one missing fixture. Add it, keep going.
3. **Fits no enumerated shape** → the *enumeration* is wrong. **That is the stop.** Fix the
   enumeration once; the fixtures regenerate from it.

Neither package had an enumeration, so every counterexample was case 3 and the loop looked
endless. Both merged slices got through because their scope was small enough to enumerate.

## The state, in commands

```
git status -sb                                # main, clean, level with origin/main
git branch --list harden-painted cite-audit   # both exist, LOCAL ONLY, never pushed
git log --oneline main..harden-painted        # 4 commits, ends 9b9eecb
git log --oneline main..cite-audit            # 4 commits, ends fc7d84a
git worktree list                             # one entry
```

**Renumber both branches' ledger ids before merging either.** `main` now uses **D164–D168** and
**DEF-77–DEF-79**; both queued branches claim overlapping ids for different things.

## The two queued halves, and the question each is blocked on

Neither is blocked on code. Patching either without answering its question reproduces the shape.

- **`harden-painted` — what does `painted()` promise?** Is it about an element's *text* or its
  *paint*? A sized empty `<div>` and a `::before`-only element cannot both correctly return `true`,
  and no amount of patching that line decides it. Open blockers, all reproduced: a container whose
  only text is off-screen is certified painted; a real weakening of the descendant walk leaves all
  38 fixtures green; the empty-node branch returns `true` unconditionally. Write the contract and a
  failure matrix, get **that** reviewed, then derive the fixtures from it.
- **`cite-audit` — what uniquely identifies a citation for exemption purposes,** given the scanner
  normalises the path away? And **what makes the gate capable of failing,** with a partner proving
  it? Until both are answered `main` has the sweep but no gate, so **nothing stops the citation form
  coming back.** That is the known, accepted cost of shipping the sweep alone.

## What is already on `main` and must not be rebuilt

- **The sweep (D165).** 49 citations gone from code, comments only, proved by a comment-region state
  machine that was mutation-proved first. Four remain by design: two in `src/data/projects.js`
  (invariant 3 forbids touching it) and two pointing at untracked Playwright internals.
- **The alpha fix (D166).** `painted()`'s transparency guard was dead code against `color-mix`; a
  1×1 canvas read replaces it. Restoring the old parse flips 6 of 8 holes. Two keepers are receipts,
  not coverage: `11px type [THE REFUSED FLOOR]` proves the owner's reserved type-floor ruling was
  not enacted, and `opaque rgb() black` guards a historical false-red.
- **Container blindness is still open and unchanged from before the run.** D166 is strictly better,
  not a regression, and its header says so.

## Known-open, filed and deliberately not fixed

- **DEF-79** — three `content-model.spec.js` calls do `await painted(x);` and discard the result, so
  they assert nothing while reading as coverage. Fix by wrapping each in `expect(...)` **and**
  confirming each turns red under a hard-wired-false `painted()`.
- **DEF-78** — `global.css` described as 451 lines when it is 500; `print-floor` claiming the "same
  numbers" as `type-floor` when they differ on `/404`.
- **DEF-77** — ledger-id allocation collides across parallel packages.
- **DEF-76** — the `hero-motion` flake, still uninvestigated, load-dependent.

## Local machine state — FIXED 2026-08-31, nothing outstanding

`node tests/hook-binding-selftest.mjs` used to fail on `main` on this laptop: *"this checkout is not
bound to an absolute path — core.hooksPath = /Users/.../.githooks"*, DEF-62's exact defect living in
this checkout's `.git/config`. **The owner ran `npm run prepare` on 2026-08-31 and it is fixed.**
Verified after: `core.hooksPath` is now the relative `.githooks`, and the self-test passes **29 of
29** — *"every clone and every worktree binds the hook"* — where it previously failed 1 of 29.
That also proves DEF-62's remedy works on a real machine, not only on a runner.

## Traps that cost real time

- A fresh worktree has none of the gitignored darwin baselines, so its first full suite reports
  **51 phantom failures**. Copy `tests/geometry-baseline.darwin.json` in from the main checkout.
- `codex exec` backgrounded without `< /dev/null` stalls forever reading stdin.
- Codex's read-only sandbox cannot launch Chromium or run `npx playwright` — genuinely
  static-analysis-only. It still found the CRITICAL_BLOCKERs the same-model lenses missed on both
  packages and both slices. It is the highest-value reviewer in this setup; keep it.
- Port 4321 is effectively single-instance. Poll before a suite run.
- A local green cannot clear the geometry gate. 48 of the 51 skips ARE the geometry comparisons.

## The rendered-text boundary

It held every time it ran — 7 routes, 24,578 characters, byte-identical, on both queued packages,
both merged slices, and against the **live** site after each deploy. It never blocked anything,
which is correct: nothing shipped changed a character a visitor can read.

**The harness is still not committed.** It lives in the session scratchpad, so those figures cannot
be reproduced from this repository. Promoting it to a real script is the obvious next package, and
it should ship with the three-direction self-test it was given here: identical → exit 0; one
reworded string → exit 1 naming route and line; a vacuous capture → **REFUSED**, not "identical".

## The run doc needs four edits, and they are the real fix

`docs/practices/autonomous-run.md` was followed literally and is where the process defects live.
Not edited during the run, because rewriting the contract you are being judged against is marking
your own homework.

1. **Add a contract phase before build.** Phase 1 converges on "the smallest correct fix"; it must
   first produce what the thing promises, over what input space, with the shapes enumerated — and
   **that** gets reviewed. Fixtures derive from the enumeration.
2. **Every gate ships a partner that fails if the gate becomes incapable of failing.**
3. **The orchestrator pre-allocates ledger-id blocks.** DEF-77.
4. **Line 242's "Delete every branch and worktree" needs the word *merged*.** As written it destroys
   queued work and contradicts its own "a queued package is a success".

Its package-A row also still says "20 spec files import it" — five do; twenty is the call count, of
which seventeen assert. Corrected in D164 and D166, left standing there on purpose.

## Still open, still the owner's — do not build these

**P-32** (the 52ch measure cap), **D30** (light/dark), **the home hero's height** (D27), **the 11px
type floor**. Untouched by this run; all four were refused to the machine by design.
