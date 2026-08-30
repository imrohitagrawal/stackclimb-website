# Handoff — for the next session

Written 2026-08-31, superseding the 2026-08-31 (D153-complete) handoff. That one is in git
history; this file is replaced each session by convention, which is the one place this run
departed from append-only, and it did so on `docs/practices/autonomous-run.md`'s own instruction.

**D163's autonomous run RAN. Both packages were built, reviewed twice, and BOTH QUEUED.
Nothing was merged. `main` is unchanged except this record.** Full account: `docs/STATUS.md`
D164 and DEF-77. Do not re-derive it.

## What went wrong, because that is what you can act on

- **The same defect class appeared in BOTH packages: a claim whose scope is wider
  than the measurement backing it.** Package A measured `painted()` on leaf-shaped fixtures and
  stated it of all call sites. Package B measured citations under one regex form and stated the
  population under another, and restated an inherited figure as freshly measured. Two unrelated
  packages, one class. The two builders were subagents sharing this session's model family —
  **context isolation, not model-weight decorrelation** — so I am not entitled to call them
  independent, and AGENTS.md says so in terms. What IS a different model family is the
  codex exec pass, and it is what found the CRITICAL_BLOCKERs both same-model lenses missed on
  both packages. The evidence points upstream of coding; it does not prove coding was never a
  factor.
- **It caught the orchestrator three times too.** A single-line `grep` concluded a phrase existed
  nowhere when it was wrapped across a line break — package B refuted that, correctly, having
  nearly written the wrong diagnosis into a comment first. `grep -c PASS` counted a summary line
  and reported 19 assertions where there are 18 — B refuted that too. And a mutation probe was
  seeded OUTSIDE the gate's scan roots, giving an invalid control, caught only because the control
  disagreed with itself. **Every one was found by something disagreeing, never by reading.**
- **A gate's self-test can certify a property the gate does not have.** Package B's 18 assertions
  all printed `SELF-TEST PASS — the scanner bites` while a one-character typo (`breaches.length` →
  `breaches.lenght`) made the gate print green with a live breach present. The partners tested what
  `audit()` finds; nothing drove the executable's own exit decision. **Ask of every gate: which
  assertion fails if the gate becomes incapable of failing?**
- **A fixture set one level too shallow hides a real weakening.** Package A added fixtures
  specifically to close a scope-narrowing miss, and the fixtures it added were themselves one level
  too shallow: changing `querySelectorAll('*')` to `querySelectorAll(':scope > *')` opens a genuine
  hole on nested text and leaves all 26 HOLES and 12 KEEPERS green.
- **Two fixes at the same boundary can both leave the hole open.** B's exemption went from
  `(file,line)` to `(file,line,basename+span)` and a new breach still hid behind an exempted one,
  because the scanner normalises the path away before the table ever sees it.
- **Worktree isolation does not prevent ledger-ID collision.** Both packages claimed D164, D165 and
  DEF-77 for different things, because both computed "next free" from the same base. DEF-77.

## The state, in commands

```
git status -sb                                 # main, clean, level with origin/main
git branch --list harden-painted cite-audit    # both exist, LOCAL ONLY, never pushed
git log --oneline main..harden-painted         # 4 commits, package A, ends 9b9eecb
git log --oneline main..cite-audit             # 4 commits, package B, ends fc7d84a
git worktree list                              # one entry - session worktrees were removed
```

The two agent worktrees were deleted as session residue; **the branches were deliberately
kept, because they are the queued deliverable.** The run doc's closing instruction says to
delete every branch and worktree, which contradicts its own rule that a queued package is a
success - deleting a queued branch destroys the work. AGENTS.md scopes deletion to *merged*
branches; the run doc is missing that word.

Both branches are complete, self-documenting work with their own RCAs (RCA-017, RCA-018) and
their own ledger rows. **Neither has ever been through CI.**

## If you pick either package up, the contract question comes FIRST

Both stopped for the same reason: a missing written contract, not a coding error. Patching either
one further without answering its question will reproduce the same shape.

- **Package A (`harden-painted`) — what does `painted()` promise?** Concretely: is it about an
  element's *text* or an element's *paint*? A sized empty `<div>` and a `::before`-only element
  cannot both correctly return `true`, and no amount of patching that line decides it. Write the
  contract and a failure matrix, get THAT reviewed, then derive the fixtures from it — the current
  fixtures define the meaning retroactively, which is why every review round finds a new shape.
- **Package B (`cite-audit`) — what uniquely identifies a citation for exemption purposes,** given
  that the scanner throws the path away? And **what makes this gate capable of failing,** with a
  partner that proves it?

**Renumber both branches' ledger ids before merging either** - once this record is merged,
`main` uses D164 and DEF-77, and both branches currently claim those same ids for other things.

## What is worth keeping from each, so you do not rebuild it

- **A:** the container fix and its at-least-one semantics (independently verified: six container
  idioms now false, a hidden or zero-sized sibling beside visible text correctly stays true); the
  executable receipt G8 that reds only `11px type [THE REFUSED FLOOR]` when the refused floor is
  enacted; the finding that the old transparency guard was dead code against `color-mix`.
- **B:** the 47-citation sweep across 25 files; the three rewrites that avoided leaving false
  sentences (especially the RED-WHEN instruction that pointed at a blank line); the scan-set floor
  and named-file partners; the corrected population numbers (53 code, 451 docs, 309 distinct,
  80 files) and the 303 figure attributed to DEF-71 rather than restated as current.

## The boundary itself worked, and is the one thing to trust

`tests/lib/rendered-text.mjs` was driven over a built `main` and a built candidate for both
packages at every head: **7 routes, 24,578 characters, byte-identical every time.** It never
blocked anything, which is correct — neither package changed a character a visitor can read, and
B proved it the hard way by editing comments in eleven `src/` files. The comparison harness lives
in the session scratchpad and is **not committed**. That is a real limitation, not a footnote:
the 7-route / 24,578-character figures, the 557/51/2 suite result and the 102 importer tests
were executed in-session and **cannot be reproduced from this repository as it stands**.
Promoting the harness to a real script is therefore the obvious
next package, and it should ship with the three-direction self-test it was given here (identical →
exit 0; one reworded string → exit 1 naming route and line; a vacuous capture → REFUSED, not
"identical").

## Traps that cost real time this run

- A fresh worktree has none of the gitignored darwin baselines, so its first full suite reports
  **51 phantom failures**. Copy `tests/geometry-baseline.darwin.json` in from the main checkout.
- `codex exec` backgrounded without `< /dev/null` stalls forever reading stdin.
- Codex's read-only sandbox cannot launch Chromium or run `npx playwright`. It is genuinely
  static-analysis-only — label it so. It still found two CRITICAL_BLOCKERs per package that the
  same-model lenses missed, which is the argument for keeping it.
- Both packages contend for port 4321; Astro preview is effectively single-instance. Poll
  `until ! lsof -ti tcp:4321 >/dev/null 2>&1; do sleep 10; done` before a suite run.
- A local green cannot clear the geometry gate. 48 of the 51 skips ARE the geometry comparisons.

## Still open, still the owner's — do not build these

**P-32** (the 52ch measure cap), **D30** (light/dark), **the home hero's height** (D27), **the
11px type floor**. Unchanged by this run; all four were refused to the machine by design and none
was touched. **DEF-76** (`hero-motion` flake) reproduced once more under full-suite load and passed
in isolation, consistent with being load-dependent; still uninvestigated.
