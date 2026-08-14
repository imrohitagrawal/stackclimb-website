# Package 4 — the two-ledger act, planned clause by clause

Implements Sequence item D of the agreed plan
(`~/.claude/plans/1-after-the-first-linear-pearl.md:116-117`: *"Package 4 — two-ledger act,
card model folded in. `index.astro` opened once. Oracle −35% root-cause analysis; Mobileum
−35% release-validation effort."*). Per the D79 process rule, every clause of every recorded
decision this plan touches is quoted **by line number** and mapped to a **named acceptance
test** or a **written refusal**. Sources opened and read whole: D57 (`docs/STATUS.md:56`),
D60 (`docs/STATUS.md:31`), **D62 (`docs/STATUS.md:54`) — found by the plan fan, not by the
queue**, D80 (`docs/STATUS.md:36`), D82 (`docs/STATUS.md:34`), the queue
(`docs/NEXT-SESSION-PROMPT.md:25-38`), and `src/data/cv.js` whole. No summaries as input.

## Conflict raised before work: the queue is stale against D62

The queue (line 29) says the footer ships *"D60's canonical line, owner's words, verbatim"*.
`docs/STATUS.md:54` (D62, same day, later): **"Replaces D60's line at the owner's decision"**
— *"StackClimb is defined as 'where Rohit Agrawal builds independent AI systems — outside any
employer'. 'Product studio' is dropped"*, argued as a hiring risk and an unverifiable claim.
Only D60's **second and third sentences are kept verbatim**. Both cannot hold. The ledger is
the record and postdates the wording the queue remembers; the queue's own header says to
verify every row by command before acting on it. **D62 governs.** Everyday analogy: the queue
is a note taken at the meeting; the ledger is the signed minutes — when they differ, the
minutes win. Recorded here and in the D84 row rather than silently resolved.

## Ground truth, verified by command before this plan was written

| Fact | Command | Result |
|---|---|---|
| `index.astro` is 252 lines | `wc -l src/pages/index.astro` | 252, against the 260 shrink-only ceiling |
| Root-cause analysis −35% is Oracle | read `src/data/cv.js:67` | *"accelerating root-cause analysis by 35%"*, Oracle entry |
| Release-validation effort −35% is Mobileum | read `src/data/cv.js:103` | *"reducing manual release-validation effort by roughly 35%"*, Mobileum |
| No "release validation −25%" exists | `grep -rn "release validation" src/data/` | 0 hits; the only release-validation figure is Mobileum's ~35% |
| No definition line ships anywhere | `grep -rn "product studio" src/` · `grep -o StackClimb dist/index.html` | 0 hits · 1 (the nav wordmark image `alt`); no rendered text defines the word |
| D62 replaced D60's definition | `awk 'NR==54' docs/STATUS.md` | quoted above |
| Declared grounds | read `src/styles/palette.css` | 6 per-plate + navy `:root` `#0e1322`. D80: zero rendered slack |
| Plate ceilings on `/` | read `tests/plate-height.spec.js` | 1.00 at 1440×900 (≤900px) · 1.75 at 390×844 (≤1477px). Hero exempt; `#proof` is not |
| Gate constants | `grep MIN_PLATES tests/contact.spec.js` · `grep PLATES tests/print.spec.js` | `MIN_PLATES = 8` (header: bump in the same change) · `PLATES` lists 7 ids |
| Hero population strip (D82) | read `index.astro:135-139` | `Total systems 6 · Built 4 · In progress 2 · Release gates 4 · 52/52` |
| Quorum evidence stamp | read `docs/evidence/projects/quorum-ai.md:7` | counts measured 2026-08-11 at `d3c860c` (D80's `bb20bdb` stamps a different 08-14 section, not the counts) |

## The clause map — D57 (`docs/STATUS.md:56`)

| # | Clause (quoted) | Disposition |
|---|---|---|
| 1 | *"Acts: 00 hero · 01 professional proof (two ledgers) · 02 what I built · 03 engineering model → `/how-i-build` · 04 career evolution → `/experience` · 05 contact"* | Act 01 is this package: plate `#proof` between the hero and `#systems` (queue line 27). Test `proof-act.spec.js: the act sits between the hero and the systems` — DOM order via `compareDocumentPosition` AND painted: `checkVisibility({opacityProperty: true, visibilityProperty: true})` on the act root plus height > 200px. Mutations red: remove the plate; `#proof { opacity: 0 }`; `display: none` |
| 2 | *"home is the argument, subpages are the evidence"* | The act argues the two-ledger distinction and links to `/cv`; the full employer record stays on `/cv`. Claim map below |
| 3 | *"Nav → `PROJECTS · EXPERIENCE · HOW I BUILD · CONTACT`"* | **REFUSED for this package** — queue lines 45-47 bind the nav change to package 5, after both routes exist; D80 records the same refusal while they 404. Nav untouched; nav baselines byte-identical (cmp-verified) |
| 4 | *"Hero CTAs → `What I built · Career evolution · Email me`"* | **REFUSED for this package** — same reason: `Career evolution` targets `/experience`, which 404s until package 5. Hero untouched |
| 5 | *"Card model: signature proof first — one memorable verifiable fact leads, then what it is, then Works now / In development / Not claimed, then links"* | **Already discharged by packages B/C; nothing to build.** Sequence D's *"card model folded in"* was consumed there: every home system plate renders the proof line, `sys-nc`, and links (verified in `dist/index.html`); the element ORDER (question first, proof third) follows the 8-part content model the owner's agreed plan fixed later for the project pages (`1-after-the-first-linear-pearl.md:66-73`, gated by `tests/content-model.spec.js`), and the home plates mirror it. The later recorded ordering governs the earlier; stated, not silently resolved |
| 6 | *"Grouping: two groups… Use them now / Being built"* | Shipped in package B (`#overview`), untouched. `overview.spec.js` gates it |
| 7 | *"Project depth: two levels — each project becomes `/projects/<name>` built from its existing plate, giving a URL a recruiter can be sent to directly; no middle ecosystem page"* | **Already discharged** by packages 3/B/C: `src/pages/projects/[slug].astro` exists, four routes gated by `plate-height.spec.js`'s ROUTES, `content-model.spec.js`, and the `getStaticPaths` count assertion (D76). Untouched here |
| 8 | *"`/experience` is a real page, overruling D32 — a bird's-eye career evolution with the complete CV as a download from inside it; D32 predates `/how-i-build`…"* | **REFUSED for this package** — queue lines 40-44 assign `/experience` (and D57-overrules-D32, and the CV download) to package 5. Nothing here creates or links the route |
| 9 | *"Published AI skills are a band on `/how-i-build`, not a nav slot and not in the project list — two public repos today… threshold recorded: at three, it graduates to its own home act"* | **REFUSED for this package** — queue lines 41-44: the skills band is package 5. The threshold is a recorded decision, restated here so it is not lost: at three public skill repos it becomes a home act. This package adds no skills content anywhere |

## The clause map — D60 (`docs/STATUS.md:31`) as amended by D62 (`docs/STATUS.md:54`)

| # | Clause (quoted) | Disposition |
|---|---|---|
| 1 | D60: *"StackClimb is defined on the site… because a cold reader can otherwise read it as a former employer"* | The definition ships twice: in the act and in the footer. Both gated by `proof-act.spec.js` |
| 2 | D62: *"StackClimb is defined as 'where Rohit Agrawal builds independent AI systems — outside any employer'. 'Product studio' is dropped"* — *"Replaces D60's line at the owner's decision"* | The definition sentence, everywhere it renders, is **D62's replacement, verbatim**: `StackClimb is where Rohit Agrawal builds independent AI systems — outside any employer.` No "product studio" anywhere; `proof-act.spec.js` adds a **bar**: the string `product studio` appears on no built page (partner: the D62 sentence exists — a bar alone counts nothing) |
| 3 | D62: *"The owner's second and third sentences are kept verbatim — 'Independent projects are built outside any employer. Employer outcomes are attributed to their employer and marked approximate.' — they do real work and state the two-ledger discipline in the footer"* | Footer (`Layout.astro`, global) renders the definition + both kept sentences. **Stated deviation, one clause:** the footer's definition sentence drops D62's `— outside any employer` tail because the kept second sentence states those exact words in the next breath — rendering both is DEF-27's duplicate-statement shape. The act renders D62's full line, tail included. Flagged for the owner in the PR description; if he wants the tail twice, it is one string edit. Test `proof-act.spec.js: the footer defines StackClimb` — exact match on the two kept sentences + the definition head, painted (`checkVisibility`), on `/` and one project page. Mutation red: alter one word of a kept sentence |
| 4 | D60: *"its first clause appears where a cold reader first meets the word"* | Verified: the word's only home occurrence is the wordmark `alt`. The definition renders **inside the act, geometrically adjacent to the independent ledger's heading** (the phrase D60 diagnoses). Test `proof-act.spec.js: the act defines the word where it is first used` — scoped inside `#proof`: the definition element and the Ledger-B heading bounding boxes overlap or sit within 400px vertically, asserted **at 1440 and at 390** (grid can reorder visually against DOM order — `global.css:444` already does; DOM-order alone cannot hold this). Mutations red: delete the definition line; move it outside `#proof` |
| 5 | D60: *"the `Being built` group is ordered Aegis → EvalAxis → NarraTwin"* | Shipped in package B, untouched. `overview.spec.js` gates it |
| 6 | D60: *"inverts the meaning of 'independent' into its exact opposite"* | Employer ledger names an employer in every row; the independent ledger carries the definition beside its heading. Covered by clauses 2/4 plus the attribution tests |

## The queue's own constraints (`docs/NEXT-SESSION-PROMPT.md:25-38`)

| Constraint (quoted) | Disposition |
|---|---|
| *"Employer numbers, exact attribution or nothing: root-cause analysis -35% is ORACLE; manual release-validation effort -35% is MOBILEUM; there is NO 'release validation -25%'"* | Verified true (ground truth). Each outcome renders with its employer's name **in the same row**. Test `proof-act.spec.js: employer outcomes carry exact attribution` — **case-insensitive, with existence partners**: exactly one act row matches `/root-cause analysis/i` and that row contains `Oracle`; exactly one matches `/release[- ]validation/i` and contains `Mobileum`; **bar with both spellings**: no rendered act row matching `/release[- ]validation/i` contains `25`. The live sweep bars the spaced and hyphenated variants. Mutations red: delete the Oracle row (existence partner fires); swap employers; add a fabricated 25% row in either spelling |
| *"Self-reported numbers are labelled self-reported"* | One label at ledger level (`cv.js`'s own precedent). Test `proof-act.spec.js: the self-reported label is painted` — the label is a **rendered heading element**, `checkVisibility({opacityProperty: true, visibilityProperty: true})` (ancestor-aware — own-opacity checks pass under an opacity-0 ancestor), and the ledger it labels contains ≥ 1 row with a `%` (partner). Mutations red: delete the label; `opacity: 0` on the label's container |
| *"HARD CONSTRAINT (D80): the act plate MUST declare its own novel --ground in palette.css (only there)"* | `#proof { --ground: … }` in `palette.css` only, pairwise-distinct from all 6 declared + `#0e1322`, bone/ochre/lit AA contrast measured and recorded in the palette comment. Candidate `#1d0d23`; final value fixed by measured contrast at build. `palette-ladder.spec.js` then enforces rendered ≥ declared + 1 (8) mechanically |
| *"index.astro is frozen shrink-only at 260 lines / 124 chars"* | `ProofPlate.astro` component (package-B pattern). Cost in `index.astro`: 2 lines (import + element) → 254 ≤ 260, no line over 124 |
| *"Bump contact.spec MIN_PLATES and print.spec PLATES in the same change"* | `MIN_PLATES` 8→9 noted in its header; `PLATES` + `'proof'`. Same commit as the plate |

## The act (amended by the fan)

One plate, `id="proof"`, standard `Plate` wrapper (seams, reveal, print, height gates apply
unchanged). Copy column: h2 title, the D62 definition line, a `/cv` link. Then two ledgers,
each a **visible `h3` heading bound to its list with `aria-labelledby`** — NOT
`Ledger.astro`'s aria-label-only pattern, which renders labels invisibly; the two-ledger
contrast must survive a headings-navigation pass (two h3s under the plate's h2), so the
comparison is perceivable without sight. Employer names render at full salience — `proof.css`
does not inherit the standard ledger's dimmed `dt` treatment for the attribution word (the
row's load-bearing element).

- **Ledger A — h3 `Employer record — self-reported, approximate`.** Four rows, employer name
  leading, every figure verbatim-traceable to `cv.js` (D36's authoritative source), all
  `~`-marked as the footer's third sentence promises:
  - `Oracle` — `Root-cause analysis accelerated ~35%` (`cv.js:67`)
  - `Oracle` — `API automation coverage 65% → 95%` (`cv.js:66`)
  - `Amazon` — `UI and API automation coverage up ~25%` (`cv.js:80`; fan finding — the
    second-strongest brand on the CV was absent while a five-month role had a row)
  - `Mobileum` — `Manual release-validation effort down ~35%` (`cv.js:103`)
- **Ledger B — h3 `The four built systems — counted in the code, at recorded versions`.**
  Population scoped in the heading itself: **four rows = the hero's `Built 4`, one scroll
  above** (the D82 class — a heading claiming the whole class over a subset reads as
  concealment; this heading names its own denominator). Plain English replaces "at named
  commits". The D62 definition line renders adjacent (clause 4). Rows are **rendered from
  `src/data/projects.js` / a single shared export — never a second literal copy** (the repo
  has watched these figures move, 771→767; two sources drift): the spec asserts the rendered
  row equals the same import, plus one exact painted assertion (the sha, and NarraTwin's
  No-Go). Row copy uses the evidence files' own nouns, consistent unit vocabulary:
  - `CiteVyn` — `1,036 backend test functions · 125 e2e tests` (@df8cfc3, `citevyn.md`)
  - `Quorum-AI` — `2,095 Python test functions · 358 e2e @d3c860c` (`quorum-ai.md:7`)
  - `SaafSaans` — `767 test functions @10f4213` (`saafsaans.md`)
  - `NarraTwin` — `1,743 tests @a022862 · its own gate says No-Go` (`narratwin.md`)
  The employer ledger is *outcomes he reports*; the independent ledger is *tests anyone can
  count* — the distinction is the row content. Known index-vs-detail repetition with the
  caption strips is accepted (52/52 renders three times today); the act must NOT restate the
  hero's `6 / 4 / 2` population figures (same-viewport-class duplication, D82's territory).
- **No figure panel.** D61: no artefact exists for "attribution"; a placeholder is banned.

Height budget: measured at 1440/1024/390 before the PR; ceilings 900px / — / 1477px. Over
means rows are cut (Amazon row first), never ceilings raised.

## Voice check

Employer figures: self-reported, labelled once, `~`-marked, exactly attributed — the act is
the footer sentence's own proof. Counted figures: single-sourced from data feeding the
strips, traceable to `docs/evidence/projects/` at VERIFIED. NarraTwin states No-Go. No
urgency, no pitch; the one definition sentence is D62's, verbatim. New bars for the live
sweep: `product studio` · `release validation -25%` (both spellings of the 25% pairing).

## What ships

- `src/components/ProofPlate.astro` (new, ≤250 lines) + `src/styles/proof.css` (new)
- `src/data/proof.js` (new, small) — employer rows + the shared counted-row derivation, so
  the act and the strips cannot drift apart
- `src/pages/index.astro` — +4 lines as shipped (import, comment, element, blank), 256/260
  — the plan first said +2/254; corrected by the built-result fan, ceiling still held
- `src/styles/global.css` — `.colophon-defn` sentence-case rule (added to this list by the
  built-result fan; the colophon's all-caps treatment made three sentences shout)
- `src/styles/palette.css` — the one novel `#proof` ground, measured contrast in comment
- `src/layouts/Layout.astro` — the footer definition + kept sentences (map row 3)
- `tests/proof-act.spec.js` (new, ≤250 lines) — the named assertions above, each
  mutation-proved (committed before mutating, watched red, restored)
- `tests/contact.spec.js` `MIN_PLATES` 8→9 · `tests/print.spec.js` `PLATES` + `'proof'`
- Visual baselines: regenerate **in CI only**, nav cmp-verified byte-identical, last commit
  before the PR settles; stale local `-darwin` plate PNGs deleted
- `docs/STATUS.md` row D84 (incl. the D62/queue conflict) + this plan — same PR. Deploy run
  id in the D81/D83-style follow-up PR

## Not in this package

Nav word, hero CTAs, `/experience`, `/how-i-build`, skills band (all package 5, refused
above) · `#overview`, system plates, project pages · `cv.js` (read-only source).

## Amendments — the seven-lens fan (round 1), 2026-08-14

26 findings; 20 verified (17 CONFIRMED, 3 SPLIT — confirmed parts adopted, 0 REFUTED), 6
MINOR unverified folded where sensible. Verdicts: architect BLOCK (three unmapped D57
clauses — rows 7-9 added), uiux BLOCK (**D62 supersedes D60's line** — the decisive find;
the definition, footer, tests and bars all re-mapped), five PASS_WITH_FINDINGS. Also folded:
Ledger-B population scoped to "four built" (recruiter, the D82 class) · Quorum sha `d3c860c`
(three lenses independently) · single-source counted rows (uiux) · `checkVisibility`
ancestor-aware painted checks, case-insensitive attribution with existence partners, the
spaced `release validation` bar (testcheck ×3) · geometric adjacency at both widths
(uiux-pro-max) · visible h3 + `aria-labelledby` ledger headings, headings-navigation
perceivability (uiux-pro-max splits, confirmed parts) · Amazon row (recruiter) · full-salience
attribution `dt` · evidence-noun units. Round-1 refuted: none — the fan's findings all held,
which is itself recorded (the verification pass confirmed rather than culled this time; the
ratio moves, the pass is what holds).

## Amendments — the built-result fan + the R-7 Codex pass (round 1), 2026-08-14

The built-result fan raised 28 findings (18 CONFIRMED, 2 SPLIT, 0 REFUTED; three lens BLOCKs,
all for the then-missing D84 ledger row — added with the fix batch). The time-boxed Codex
pass on the test files found **14 holes two same-family reviews had passed** (token-boundary
76-in-767, U+2011 evading the 25% bar, entity-encoded `product studio`, negation passing a
substring label match, aria-hidden invisible to every paint check, unanchored sha parse,
off-screen/filtered "painted", hidden-row innerText, no four-row denominator, DOM-vs-visual
order, horizontal-blind adjacency, first-use decoys, case-folded dd, print.spec root-only).
All folded into the hardened spec; each new guard's mutation watched red against `70beff9`.
Residuals, written down rather than chased (two-round cap): print.spec's root-only computed
check is the file's pre-existing architecture across all eight plates, not this package's;
the hero→proof gutter is iso-luminant (1.0007:1) by design of a hue-stepped ladder — the
verifier measured the seam sharp and required nothing; NarraTwin's `tests` unit matches its
own strip cell and stays.

## Definition of Done, applied

Build clean · seen rendering at 1440, 1024, 390 (home + footer on one project page) · every
new claim traced (maps above) · AA contrast on the new ground measured and recorded · no
horizontal scroll at 390 · **deployed by the merge** (approach C): deploy job RUNS green,
`npm run post-deploy`, every route directly, barred-claim sweep on the live pages (the 23
standing strings + `product studio` + the release-validation-25 pairing in both spellings),
run id recorded in the follow-up PR.
