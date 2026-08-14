# Career ledger — the employer ledger depicts the career, not one tenure

Implements RCA-005 (read it whole — the owner's 2026-08-15 ruling and its three
consequences govern this package). The heading loses "— Oracle tenure"; for the career
label to be TRUE, the rows and the qualifier line must span the career.

## Ground truth, verified by command

| Fact | Command | Result |
|---|---|---|
| Career span | `src/data/cv.js` experience | Subex from **July 2011** → Oracle to **April 2026** (six employers) |
| Non-Oracle figures available | same | Amazon: coverage +25%, regression time −20%, leakage −10% · LimeRoad: coverage +30%, regression −25%, **payment production defects −25%** · Mobileum: **manual release-validation effort ~35%** |
| Rows today | `src/data/proof.js:35-48` | five, all Oracle-bound by capture regex |
| Heading + meta today | `ProofPlate.astro:32-33` | `Employer outcomes — Oracle tenure` · `Approximate · April 2019 – April 2026` |
| Gates that move | grep | `proof-act.spec.js:160` (heading contains "oracle") · `:137` (meta full-string) · `proof-data.spec.js:33-56` (Oracle-only binding) |
| Gates that stay | grep | `/cv` partners (Amazon+Mobileum stay with figures, approximate note painted) · footer/defn · thesis · capability traces |
| `#proof` slack | D84/D85 | 900px at 1440 zero slack · 1467/1477 at 390 (10px!) — re-measure both |

## Clause maps (row IDs, per D79 + RCA-002's extension; every copy-governing P- row)

- **P-21 (new, this PR)** — the ledger depicts the overall career (owner, 2026-08-15).
  Acceptance: heading exactly `Employer outcomes`; qualifier `Approximate · July 2011 –
  April 2026`; rows bind to ≥3 distinct cv.js jobs including one starting 2015 or earlier.
- **P-16** — held as written: no employer name inside any row; now no employer name
  anywhere in the act (the heading's name leaves). Attribution by name performed on `/cv`
  (its partner gate stays) and machine-checked per row by the per-job binding. The footer
  promise is site-true one click deep — flagged in conversation, the owner's intent stood.
- **P-15** — row labels stay plain outcome words a recruiter can finish (`Payment defects
  in production`, `Release validation`); no new jargon. The fan's recruiter lens re-asks
  the yardstick question per surface.
- **P-17** — untouched: no status words enter the act.
- **P-18** — row SELECTION among validated figures is composition, delegated; the owner
  reviews the render on the PR (named there explicitly).
- **P-2/P-4/P-6/P-13** — swept: none touches the act's employer column; no other
  copy-governing row applies.
- **D62 / D85 footer ruling** — definition and footer untouched; their gates must stay
  green unchanged.
- **D82** — hero strip untouched.
- **D57** — the act's purpose (60–90-second career proof) is the RULE this package serves;
  the fan gains the scope question (RCA-005's process fix).
- **RCA-002 ruling 4** — every shipped figure validated against cv.js by the drift gate.
- **D8** — no new file needed; proof-data/proof-act stay under their ceilings.

## What ships

**`src/data/proof.js`** — employerRows becomes five CAREER rows, each with a `job` field
(binding only — never rendered):
1. `Manual test design` · `~40% less effort` · Oracle
2. `Automation coverage` · `65% → 95%` · Oracle
3. `Production incidents` · `~20% fewer` · Oracle
4. `Payment defects in production` · `~25% fewer` · LimeRoad (`payment-related production
   defects by (25)%`)
5. `Release validation` · `~35% less manual effort` · Mobileum (`release-validation effort
   by roughly (35)%`)
Dropped to `/cv` only: Regression execution ~25% and Root-cause analysis ~35% (both remain
in cv.js; recorded). Selection rationale (P-18): with names unrendered, rows are chosen for
OUTCOME distinctness — payments and release-validation add career breadth; Amazon's
coverage/regression figures duplicate topics already present.

**`ProofPlate.astro`** — h3 `Employer outcomes`; meta `Approximate · July 2011 – April 2026`.

**`tests/proof-data.spec.js`** — binding test becomes per-job (find `r.job` in experience,
capture within that job's points); partner asserts ≥3 distinct jobs and one job with
`from` year ≤2015 (the career claim's denominator); row-level employer bar unchanged.

**`tests/proof-act.spec.js`** — meta full-string moves to the career span; the
heading-contains-oracle assertion INVERTS: no employer name anywhere in `#proof`
(heading included — the old test excluded the heading from the bar; the new act has no
excuse zone). Painted APPROXIMATE partner unchanged.

**Mutations (committed before, watched red, exact messages):** heading suffix restored →
no-employer-in-act red · meta reverted to Oracle dates → full-string red · row 4 rebound to
an Oracle point (`job: 'Oracle'`) → per-job binding red · figures swapped 25↔35 between
rows 4/5 → capture red · `job` set to only-Oracle across rows → distinct-jobs partner red ·
`~25% fewer` → `~25% more` → polarity red.

**Records** — RCA-005 (written first, in this PR) · register P-21 + P-16 note · STATUS D87
(before/after heights, mutation ledger, fan numbers) · NEXT-SESSION-PROMPT's "Oracle-tenure
only on the act" line superseded at session close.

## Amendments — the seven-lens fan (round 1), 2026-08-15

19 findings: 12 material, ALL CONFIRMED by independent execution (0 refuted — the streak
holds), deduping to six defects; 7 minors. Every change supersedes the section above.

**The polarity mutation was false (4 lenses independently).** `~25% more` matches nothing
in `/slower|more effort|worse|higher/` — the promised red was a green. The bar WIDENS to
catch bare `\bmore\b` (no legitimate row value uses the word); the mutation is then watched
red for real, and `~35% more manual effort` (row 5's flip, where "manual" breaks the old
adjacency) is watched red with it.

**The qualifier's dated span overclaimed (uiux + peer, verifier three-legged).** cv.js
holds no outcome figure before April 2015 — a `July 2011` label over 2015-2026 rows is the
RCA's own defect class recurring. The qualifier becomes
`Approximate · Fourteen years, six employers` — the career depicted in the hero's own
words, both facts DERIVED and gated in proof-data: `experience.length === 6`, span from
earliest `from` to latest `to` ≥ 14 years. This also closes the fan's hardcoded-dates
minor: the meta now binds to cv.js instead of restating it.

**The heading lost its only positive gate (testcheck).** The inverted bar is absence-only;
`Career numbers` would pass it. proof-act gains the exact-string assertion
`employer outcomes` (folded) on `#proof-a` — P-21's acceptance clause, gated.

**LimeRoad's /cv attribution partner was missing (3 lenses).** The "one click deep"
argument gated only Amazon+Mobileum (4B's cut pair). The partner is REBUILT DERIVED: for
every employer row, `/cv` must render its `job`'s name and the row's figure inside that
job's own `.cv-job` block — every act figure attributable by name on `/cv`, by machine,
including every future row.

**Numbering depends on the footer package landing first (manager).** P-20/D86 live on
unmerged PR #33. This branch REBASES ONTO `footer-row` so the records stack; the PR is
opened stacked and waits for #33 to merge (the queue's own order: one package merged
before the next). Stated here so the dependency is a decision, not an accident.

**R-7 was unstated (manager).** The mandatory 5-minute Codex pass on the two rewritten
test files is part of this package's process, as it was for the footer's.

**Minors folded:** the handoff supersession list is THREE spots, not one
(`NEXT-SESSION-PROMPT.md` barred-claims line, its package-5 premise "the home act is
Oracle-tenure only", and the "attribution at ledger level" fragment — after this package
the act carries no attribution and `/cv` performs it); P-3 and P-19 named refusals (hero
untouched, D82 mapped); the meta gate cite is proof-act "meta full-string equality"
by NAME, not line number; the PR names LimeRoad as new-to-act copy for the owner's render
review. The uiux lens measured the planned copy IN BROWSER: act unchanged at 900px/1440
and 18px SHORTER at 390 — the 10px-slack risk resolves in the safe direction.

## Not in this package

The hero, strip, footer, capability column, overview, `/cv` content, nav (package 5) ·
`cv.js` (read-only source of truth).
