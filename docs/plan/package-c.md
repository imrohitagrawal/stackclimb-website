# Package C — project pages get the content model, planned clause by clause

Implements Sequence item C of the agreed plan (`~/.claude/plans/1-after-the-first-linear-pearl.md:113-114`:
*"Project pages get the content model. The highest-value change in this plan and it is
content, not layout. No restructure required."*) and directive P-14. Per the D79 process rule,
every clause of every recorded decision this plan implements is quoted **by line number** and
mapped to a **named acceptance test** or a **written refusal**. The source rows — the agreed
plan, P-14 (`docs/OWNER-DIRECTIVES.md:77`), D80 (`docs/STATUS.md:36`), D79 (`docs/STATUS.md:37`),
D61 (`docs/STATUS.md:33`) — were opened and read whole. No summaries were used as input.

**Content, not layout.** No new plate, no palette change, no nav change, no route change.
`index.astro` is not opened. The two-plate project-page shape (D76/D80) is kept.

## Ground truth, verified by command before this plan was written

| Fact | Command | Result |
|---|---|---|
| No Aegis repo exists locally | `ls ~/Projects \| grep -i aegis` | exit 1, no match |
| saaf-saans default branch is `master`; checkout is a feature branch | `git remote show origin` | `HEAD branch: master`; branch `gate1a-window-true-at-the-hour` |
| saaf-saans pass sha | `git rev-parse origin/master` | `10f4213`. Corrected by the fan: `667397a` (where site figures were measured) is one **unpushed commit ahead** of `origin/master` (`667397a^ = 10f4213`, proved by `git merge-base --is-ancestor`); W-1 still pins `origin/master`, so figures may move backwards as well as forwards — and did (771 → 767 test functions) |
| narratwin-ai pass sha | `git rev-parse origin/main` | `a022862` (site strip stamped `@639aa2c`, measured on an issue-worktree branch — W-1 says read main) |
| evalaxis pass sha | `git rev-parse origin/main` | `c3233de` — equals the existing evidence audit sha |
| No test hard-codes the moving figures | `grep -rn "639aa2c\|667397a\|25,606\|16,199\|771 functions\|1,668" tests/` | 0 hits |

Lens agents read **git archives of these pinned shas** in the scratchpad — never the
checked-out feature branches, and READ-ONLY by construction.

## The clause map

### The content model (`1-after-the-first-linear-pearl.md:63-74`)

Line 63: *"Per system, in this order. Positives lead; limits are stated, never hidden, never
above the fold."* The unit is the **system**, whose surface is the home plate **plus** the
project page (D57 clause 1: home is the argument, subpages are the evidence). The map below
says where each part lives and what proves it. Line 63's own sub-clauses are mapped too (the
fan found them unmapped): *"positives lead"* → the clause-1 question-first assertion; *"never
above the fold"* → `content-model.spec.js: limits stay on the record plate` — `#<slug>` plate 1
contains no `.record` and none of `record.gaps`' rendered text. Mutation red: move a gaps line
into plate 1.

| # | Clause (lines 66-73) | Disposition |
|---|---|---|
| 1 | `WHAT IT ANSWERS — the question a reader recognises` | Exists: `p.q` renders on the home plate and on project plate 1. Test `content-model.spec.js: every project page opens with the question` — `.q` visible, first text element after the title |
| 2 | `WHAT IT IS + COMPETENCY — named technique, plain English, term once` | CiteVyn and Quorum have their verified competency paragraph (package B). **SaafSaans and NarraTwin gain theirs in this package** — written only from lens findings that survived the skeptic, evidence file updated in the same commit. Test `content-model.spec.js: plate 1 carries the competency term` — stated at its honest mechanical strength (the fan proved "≥1 rendered paragraph" is already asserted by `project-plate1.spec.js:62-64` and cannot bite): the spec carries a **per-slug required-term map** (the load-bearing technique word per system) and asserts the rendered plate-1 text contains it. Mutations red: revert the paragraph; replace the term with a near-miss. The semantic property "verified technique" is carried by the evidence trace + both fans, clause-6-style |
| 3 | `SIGNATURE PROOF — the memorable verified fact` | **REFUSED for project plate 1, kept at the system level.** The proof line renders on the home plate (`p.proof`); restating it verbatim is banned by `project-plate1.spec.js:45` — real title *"repeats neither the home body paragraph nor the proof line"*, whose scope is exactly `body[0]` + the proof line (its own header says the scope is not to be widened). The trade is stated, not silent: a deep-link reader loses the home phrasing but not the fact — each proof's fact already renders on its project page (CiteVyn `1.0 hit-rate · 26 answerable`, SaafSaans `76 vs 64`, NarraTwin `25/25 agree`, Quorum's own-fields sentence in `body[0]`'s meta/desc lineage), verified by the fan's refutation pass |
| 4 | `THE NUMBERS — translated, with denominators` | The caption strip. **Re-stamped at the pass shas in this package**: NarraTwin's `@639aa2c` moves to `@a022862`; SaafSaans figures re-derived at `10f4213` and its Tests cell gains its own `@10f4213` stamp (D75's Quorum lesson: an unstamped true-when-measured number reads as a wrong one). Test `content-model.spec.js: the strip stamp matches the evidence sha` — for narratwin AND saafsaans, the test parses the **evidence file's header `Measured … at` sha (first occurrence — the authoritative line, so the kept superseded sections cannot satisfy it)** and compares it to the rendered strip stamp. Mutations, both red: stale stamp kept while the header moves; header moved while the strip stays. Denominators are not mechanically gateable — named in the built-result fan's checklist: every re-derived figure keeps its denominator |
| 5 | `THE ENGINEERING — the one decision a staff engineer would notice` | Exists: `p.eng` renders as the record's note on plate 2, all four systems — but the fan proved **no existing gate covers it** (deleting `note={p.eng}` builds green; `Record.astro`'s empty-guard covers now/gaps/notClaimed only). Remapped: `content-model.spec.js: the record note renders` — `.proj-note` visible and non-empty on all four record plates. Mutation red: remove `note={p.eng}` from `[slug].astro:126` |
| 6 | `KNOWN LIMITS — MINOR + contained only, containment in the same sentence` | `record.gaps` re-audited line by line against the limits policy below. Stale lines refreshed at the pass sha (candidate: SaafSaans' time-window defect "under repair" — the sibling branch name says a fix was in flight; verify at `10f4213`). Not mechanically gateable; enforced by the evidence trace + both review fans, and recorded here as such |
| 7 | `WHAT IS NOT CLAIMED` | Exists: `sys-nc` on plate 1 (gated by `project-plate1.spec.js`) + the record's third column, derived from one field. Unchanged |
| 8 | `LINKS` | Exists: `.links` on plate 1. Corrected by the fan: `links.spec.js:63` **skips** external `https?` hrefs by design ("external, not ours to guarantee"), so resolution of the repo links is unresolved-by-design; what is gated is affordance (`link-affordance.spec.js`, home) and print output (`print.spec.js`). Unchanged in this package |

### Competency vocabulary (`1-after-the-first-linear-pearl.md:76-84`)

Line 76: *"place where true, never as a keyword list"*. Per the queue instruction (source: the
owner's session brief, carried in the untracked `docs/NEXT-SESSION-PROMPT.md` handoff — chat is
not a record, so the clauses this plan takes from it are restated here in full where used), the
table is **REPORTED until an agent re-verifies each term in code**. Mechanism: workflow
`package-c-repo-passes`, run id `wf_82e15c46-aef` — **a session identifier, not an auditable
record** (the fan flagged its provenance): transcripts live in the session scratchpad and die
with it. The durable, re-derivable artifact is the `docs/evidence/` sections this package
commits, each claim carrying the command that re-derives it at the pass sha. Anything sourced
only from the uncommitted workflow output and not re-stated with its command in a committed
evidence file is REPORTED, per D79's provenance rule. The pass ran two lenses per repo,
READ-ONLY, each term verified by a quoted command, then a per-repo skeptic re-derived every
claim (results: 140 of 141 confirmed; 1 refuted). **Only terms whose verdict survived the
skeptic ship as copy**; REFUTED terms are recorded as REFUTED; UNVERIFIABLE does not ship.
Two phrasing corrections the pass forces: EvalAxis's two regression tests are **alternatives —
either fires** — never "AND"; SaafSaans' merge wording stays "both run, the stricter wins"
(the merge lives on the deterministic path; "overrides a generative output" would overclaim).
**NarraTwin's paragraph carries the harness framing in the same breath** (the audit's
"say it before an interviewer does", quoted in D79): the grounding guarantees are proved
against a mock provider — no real language model has been wired in — and the copy says so
where the technique is named, mirroring the proof line's "against a pinned fixture" pattern.

### Limits policy (`1-after-the-first-linear-pearl.md:86-95`, adopted in D79 at `docs/STATUS.md:37`)

| Clause | Disposition |
|---|---|
| `Classify by residual risk after containment. Publish MINOR and TRIVIAL only.` (87) | Lens output schema forces a residual-severity field per limit; MAJOR/CRITICAL never becomes copy |
| `Every limit states its containment in the same sentence.` (88) | Copy rule for every `record.gaps` line touched; checked by the built-result fan against each sentence |
| `A limit with no containment is a bug to fix, not copy to write.` (89) | Such findings are recorded in the evidence file and excluded from copy |
| `Excluded by this rule: all five CRITICALs the audit found.` (90) | Excluded by rule. The queue restates this; no CRITICAL appears in any deliverable |
| `Available MINORs, all contained: …` (91-95) | Mapped (the fan found this sub-clause unmapped): the six named candidates are REPORTED until the pass re-verifies them. Verified at the pass shas and available as copy: the Cyrillic-confusable bypass (contained: the question is framed to the model as data; already a gaps line), the in-process rate limiter (contained: written down in source), the prompt-only floor on SaafSaans' paid path (contained: production runs with no key — the deterministic path serves). **REFUSED as phrased:** "NAT-bucketed limits sized three orders apart" — the repo's own comment is wrong, the true ratio is 60×; the phrasing never ships. The CiteVyn metering/multi-hop/promotion MINORs belong to a system whose copy this package does not expand — refused for scope |

### P-14 (`docs/OWNER-DIRECTIVES.md:77`)

| Clause | Disposition |
|---|---|
| *"Project pages carry the most-valued outputs from an engineering perspective and an AI perspective"* | The strongest surviving finding per lens becomes plate-1 copy for SaafSaans and NarraTwin, mirroring the CiteVyn/Quorum precedent (B, amendment 2) |
| *"identified and verified by a principal-architect lens and an AI-architect lens per repo"* | The workflow above, per repo: saaf-saans, narratwin-ai, evalaxis |
| Aegis | **REFUSED — no repo exists locally** (verified, table above; `private.md` records it as private and not cloned). Nothing can be verified by command, so nothing ships. The queue's own conditional ("aegis if a repo exists") resolves to no |
| EvalAxis | Has **no project page** (private; D61: no placeholder). Its lens findings land in `docs/evidence/projects/private.md` stamped at `c3233de`. **One site change fires now, and it is a correction, not an option:** the pass proved `13,769 lines` wrong at `c3233de` — the committed tree is **12,978** (the delta was two gitignored scripts); `src/data/private-systems.js:26` (which both the overview row and the `#private` card read) is corrected in this package. The `#private` intro paragraph lives inline in the frozen `index.astro` — **out of reach this package**; a finding that improves only it goes evidence-only |
| Status | P-14 moves PARTIAL → DONE **with the Aegis exception recorded in the register row**, same PR |

### D80 constraints (`docs/STATUS.md:36`)

| Clause | Disposition |
|---|---|
| *"`#narratwin` plate 1 on its project page measures 988px against the 990px deep ceiling — any added line goes red, which package C's content pass must budget for"* | **Budgeted: replace, don't add — with the fan's measured numbers.** NarraTwin's competency paragraph replaces `body[1]` (*"It is shown anyway…"*), absorbing that sentence's job. Measured twice (reviewer + verifier, independent fillers): at 1440 the plate is **figure-column-bound** and holds 988px through a 150-word replacement; the **binding width is 390** (ceiling 2.0×844 = 1688px), red near ~125-130 words. Budget: precedent length (87-95 words) fits at every gated width; cut trigger is **any measured width's ceiling**, not 1440 alone. The plate-2 escape hatch is **deleted — refuted by measurement**: `#narratwin-record` is 900px at 1440 with ~30 words of slack, less than any competency paragraph. If the paragraph cannot fit, it is shortened |
| SaafSaans budget (the fan found none recorded) | Same rule: measured at 1440/1024/390 before the gate. At 390 an **added** paragraph goes red near ~65-90 words (filler-dependent); safe routes are ≤60 added words, or replace/absorb `body[1]` net-length-neutral. Decided by measurement at build time, cut-don't-raise |
| Quorum headroom (fan) | `#quorum` plate 1 is 966px at 1440 — 24px, under one line. Any refreshed CiteVyn/Quorum line replaces at **equal-or-shorter length** |
| *"the CiteVyn panel-size-N of the recorded 4.63 run is labelled UNVERIFIED there and the copy never asserts it"* | No copy states the panel size of the 4.63 run. Acceptance: the barred-claim sweep (below) includes a check that no new copy asserts a panel N for that run |
| Palette-ladder zero slack (D80) | Not triggered: this package adds no plate and declares no ground. `palette.css` is not opened |

### D61 (`docs/STATUS.md:33`) and the voice

*"a system with no artefact yet gets no panel, never a placeholder"* — nothing is added for
Aegis anywhere. Voice rules apply to every new sentence: self-reported labelled, never
"live" for SaafSaans unqualified, NarraTwin's No-Go stated, nothing above VERIFIED/REPORTED.

## What ships

- `src/data/project-pages.js` — SaafSaans + NarraTwin competency paragraphs; `record.gaps`
  lines refreshed where the pass shows them stale; CiteVyn/Quorum touched only if the skeptic
  refutes an existing line, at equal-or-shorter length (Quorum's 24px headroom)
- `src/data/projects.js` — strip figures re-stamped at pass shas; **the SaafSaans proof line's
  factual error fixed** (the 76 belongs to an *adult* with asthma — the entry's own alt text
  already says so; a senior scores 86); `eng` only if strengthened by a surviving finding
- `src/data/private-systems.js` — the EvalAxis figure correction (13,769 → 12,978)
- `docs/evidence/projects/saafsaans.md`, `narratwin.md`, `private.md` — new sections stamped
  with the pass sha, **in the same commit as the copy they support**; REFUTED entries kept;
  narratwin's REFUTED block re-examined — the pass found the regenerated committed
  `EVAL_REPORT.md` now carries the very figures the block marks REFUTED, so the block gains
  its own correction rather than a silent flip
- `tests/content-model.spec.js` (new, ≤250 lines) — five assertions: question-first ·
  per-slug competency term · strip stamp = evidence header sha (narratwin + saafsaans) ·
  record note renders · limits stay on the record plate. Each mutation-proved (named in the
  file header, watched red, restored, committed-before)
- `docs/STATUS.md` row D83 + `docs/OWNER-DIRECTIVES.md` P-14 row — same PR. D83 ships with
  the pre-merge evidence; **one follow-up commit after the merge appends the deploy run id
  and post-deploy result, mirroring D81** (the id cannot exist inside the PR)
- Visual baselines: strip/copy changes move plate baselines for narratwin + saafsaans (home
  plates render the strip) → regenerate **in CI only**, last commit before the PR settles;
  nav baselines byte-identical (cmp-verified); **the touched systems' stale `-darwin` plate
  PNGs are deleted in the same PR** (they regenerate on the next local run — the fan caught
  that CI-only regeneration leaves them mismatching on the owner's Mac)

## Not in this package

Nav word (package 5) · two-ledger act (package 4) · any layout restructure · W-20 ·
`index.astro` (frozen; home renders `body[0]` and the strip by reference, so copy changes
reach it with zero line cost).

## Conflicts raised, not silently resolved

1. **The agreed plan's own corrections line is partly superseded.** `1-after-the-first-linear-pearl.md:97-98`
   says *"EvalAxis is 426 collected, not 388"* — D79 (`docs/STATUS.md:37`) later **retracted**
   this: 388 test definitions and 426 collected-after-parametrisation are different metrics and
   the site does not under-claim. The ledger outranks the plan file (it is the record; the plan
   predates the retraction). The same line's *"SaafSaans ships 1,414 tests, not 1,372"* is
   REPORTED (in-session audit, never committed, per D79's provenance limit) — the lens pass
   re-derives the real count at `10f4213` and that figure wins over both.
2. **The narratwin evidence file's provenance moves.** It was measured at `639aa2c` on an
   issue-worktree branch. W-1 (read main, not what is checked out) means this pass measures
   `origin/main` at `a022862`. Figures that differ are updated with the new command and sha;
   the old section stays, superseded, per the evidence file's own convention.

## Amendments — the seven-lens fan (round 1), 2026-08-14

The fan raised 34 findings; verifiers confirmed 28, refuted 3, split 3. Verdicts: one BLOCK
(Engineering Architect — clause 5 was mapped to a gate that cannot fail for it) and six
PASS_WITH_FINDINGS. Every confirmed finding is folded into the sections above in place.
Refuted, kept so they are not re-proposed:

- *"A precedent-length paragraph fits in neither location"* — refuted twice, including by
  re-running the reviewer's own measurement scripts: plate 1 is figure-column-bound at 1440
  (988px flat through 150 words); the binding width is 390.
- *"The replace-don't-add budget is arithmetically near-certain to fail; plate 2 is the real
  plan"* — same measurement; the copy column has ~445px of slack at 1440.
- *"The deep-link reader never gets the signature proof"* — the proof's **fact** renders on
  every project page (strip cells / body); only the home phrasing is withheld, which is the
  duplication ban working as designed.

## Definition of Done, applied

Build clean · seen rendering at 1440, 1024, 390 (all four project pages + home) · every new
claim traces to `docs/evidence/` at VERIFIED or labelled REPORTED · AA contrast unchanged
(no style change) · no horizontal scroll at 390 · **deployed by the merge** (approach C):
watch the push run's deploy job go green, then `npm run post-deploy`, every route directly,
and the barred-claim sweep on the six live pages — the package-B twelve strings, plus
`1,414` (uncommitted-audit figure, REPORTED only), `426`, `13,769` (refuted at the pass sha),
and any panel-N assertion for the 4.63 run. The `1,372` bar is **conditional** (the fan caught
the contradiction: `10f4213`'s own head commit records 1,372 as the current collected suite
count): barred **unlabelled** — it may ship only stamped with its sha and named as the
collected count, which this package does not do, so in practice it does not ship. Run id
recorded in D83's follow-up commit.
