# Package 4B — proof language: the act rebuilt, the hero made memorable

Implements RCA-002 (read it whole — the owner's seven rulings of 2026-08-14 govern this
package). The governing frame is the site's recorded one: evidence first, the reader's
problem as the lens (AGENTS.md's 2026-08-08 amendment; P-15; D57's 60–90-second purpose).
Per D79, every governing clause is quoted and mapped; per the RCA's process fix, the
directives register is now a plan input.

## Ground truth, verified by command

| Fact | Command | Result |
|---|---|---|
| Oracle figures available | read `src/data/cv.js:64-70` | manual test design −40% · coverage 65→95% · regression execution effort −25% · production incidents −20% · root-cause analysis −35% faster · regression execution time −25% · flaky tests −20% |
| Mockup figures failing validation | same | no −30% anywhere; no "mean time to detect"; `MTTD` is a barred string (D78 sweep list) |
| Public repos (inspectable) | `gh repo list` / links on site | citevyn, quorum-ai, saaf-saans, narratwin-ai public; EvalAxis private; Aegis none — so "check yourself" may claim FOUR, never six |
| Usable today | states in `projects.js` | THREE (CiteVyn, Quorum, SaafSaans); NarraTwin is built, not usable (No-Go) — "4 you can use" would be false |
| `#proof` slack | D84 | 900px at 1440, ZERO slack — the rebuild re-measures from scratch |
| `index.astro` | `wc -l` | 256/260 shrink-only |
| "self-reported" on live pages | sweep | renders on `/` (act label) and `/cv` — both leave under ruling 1 |

## Clause maps

**RCA-002 rulings 1–7** — each is a hard constraint; tests named per ruling:
1 approximate-only → spec: no rendered `self-reported` on `/` or `/cv` (bar + partner: the
APPROXIMATE label exists, painted); `AGENTS.md` voice line amended same PR.
2 attribution at ledger level → spec: no employer name inside any act row; `Oracle` appears
exactly once in the act, in the ledger heading. Amazon/Mobileum leave the act (remain on
`/cv`; `/experience` will carry them — package 5).
3 no No-Go in the act → spec: the act contains neither `No-Go` nor `not deployed`; partner:
the overview row still states `Phase 1 — No-Go` (the disclosure stays on the page — D74/D79
forbid deletion, DEF-27 forbids restating; placement is the resolution, stated).
4 validated figures only → the drift gate: every figure token in an act employer row must
appear in `cv.js`'s Oracle points; every capability phrase traces to a
`docs/evidence/projects/` entry at VERIFIED.
5 presentation delegated → recorded in the register; the owner reviews renders.
6 hero directive backfilled → register row dated 2026-08-14.
7 P-15 as a per-surface review question → the fan's recruiter lens judges each surface by
the reader's decision it must support (D57's stated 60–90-second purpose) — not only by
accuracy.

**D62 (`STATUS.md:54`)** — definition unchanged, verbatim, stays in the act at first use +
footer (proof-act.spec rows carry over unchanged).

**D82 (`STATUS.md:34`)** — the completion principle is KEPT (the whole population renders:
6 · 4 built · 2 in progress; the owner's own fix, not reopened). What changes is vocabulary:
`Release gates 4` and `Golden cases passed 52/52` leave the strip — the two tokens a cold
reader cannot parse (the owner's finding). The population cells stay, reworded readable.

**P-15 (`OWNER-DIRECTIVES.md:78`)** — *"copy aimed at recruiters carries a relatable,
plain-English example, not only a technical descriptor"* — every new row/sentence is checked
against it by the built-result fan, named per finding.

**D57 clauses 3/4 (nav, CTAs)** — still REFUSED to package 5. Untouched.

## What ships (the brand-counsel calls, owner reviews the render)

**The act (`#proof`)** — the reference model, figures validated:
- h2 `Two ledgers, deliberately kept apart.` + stance paragraph carrying the thesis
  ("Employer outcomes belong to the teams and systems where they happened — I report them,
  and I mark them approximate. The independent systems are evidence you can inspect. The
  two are never averaged into a single number.")
- Left: `Employer outcomes — Oracle tenure` · `APPROXIMATE · APR 2019 – APR 2026` · six
  rows, outcome + figure only (the ground-truth list above), no employer inside rows.
- Right: `Independent StackClimb systems` · `INSPECTABLE EVIDENCE · NO ADOPTION CLAIMED` ·
  the definition line (first-use, unchanged) · capability sentences: the GitHub line,
  CiteVyn (grounded retrieval, citations, strict refusal, versioned index promotion),
  Quorum-AI (pre-run cost approval, cross-model critique, degraded-mode disclosure),
  SaafSaans (labelled live/cached/fallback modes, trilingual injection guard), NarraTwin
  (claim-level grounding verification, consent bound to the evaluation checksum), EvalAxis
  (a regression gate that fails a build on measured quality drift — private, pre-1.0).
  Every phrase already VERIFIED in the evidence files (packages B/C); none is new research.
- Closing line: `NOT CLAIMED — users, customers, revenue, production scale, awards or
  partnerships for any independent system.`
**The hero** — lede, CTAs, pull-quote unchanged. The strip label becomes the thesis line
**"Fourteen years I can tell you about. Four systems you can check yourself."** (four, not
six — only four repos are public; the count must survive a fact-check). Strip cells:
population kept per D82 (`Systems of my own 6 · Built 4 · In progress 2`) plus one
reader-meaning cell replacing the two tokens (e.g. `Every figure — counted in code, or
marked approximate`). Exact composition settles at build against seam/height gates.

**Hero motion (owner's instruction 2026-08-14, reversing a recorded exclusion)** —
`motion.css:27` deliberately excluded the hero from entrance animation to protect perceived
load speed. The owner now instructs hero animation; both facts hold with a guard: the
headline, name and lede paint INSTANTLY (no animation on the LCP path — the old decision's
reason survives), then the ledger, pull-quote and strip enter with the site's existing
staggered rise (same `--ease-out`, same toggle/reduced-motion/no-anim gates, DEF-1 no-JS
fallback: everything `opacity:1` without JavaScript). `tests/motion.spec.js` extended in
the same change: hero secondary elements animate, headline does not, no-JS fallback holds —
each watched red. The reversal and its guard are recorded in the D85 row.

**Tests** — `proof-act.spec.js` rewritten in the same change (its own header rule): rulings
1–3 bars with partners, the cv.js drift gate, capability-term evidence trace, definition/
footer assertions carried over, hero thesis-line painted assertion. Mutations watched red
per the repo rule, committed-before, recorded in the ledger row.

**Records** — `docs/STATUS.md` D85 (rulings, this plan, measurements) · directives register:
rulings 5/6/7 as new rows, P-15 note · `AGENTS.md`: voice line amended ("Percentages from
the CV are marked approximate and attributed; counted figures name their version") ·
RCA-002 linked. Baselines: CI-only regeneration (hero + act + downstream seams move); nav
byte-identical (package 5 owns the first nav move).

## Not in this package

Nav, hero CTAs, `/experience`, `/how-i-build` (package 5) · overview, system plates,
project pages, caption strips (counts live there correctly — the ten-minute read) ·
`cv.js` figures (source of truth, read-only) — except its "self-reported" label comment
alignment if `/cv` renders the word (ruling 1 covers rendered output).

## Amendments — the seven-lens fan (round 1), 2026-08-14

45 findings; 20 verified (17 CONFIRMED, 3 SPLIT, 0 REFUTED). Two lens BLOCKs, both adopted.
Every change below supersedes the section above where they conflict.

**Height budget (uiux BLOCK — measured ~1100–1130px at 1440 by in-browser mutation, vs the
900px ceiling).** The composition is cut to budget BEFORE build, not by the gate at build
time (the RCA's own root-cause mechanism, not repeated): employer rows **five** — manual
test design −40% · automation coverage 65→95% · regression execution −25% (ONE row; cv.js
carries effort −25% and time −25% as two near-duplicate claims — merged, recorded) ·
production incidents −20% · root-cause analysis 35% faster. Dropped and recorded: flaky
tests −20%, production defects −20% (near-duplicates of kept rows; they remain on `/cv`).
Capability sentences at `.proof-defn` scale, ONE clause each (~55 chars), five sentences +
the GitHub line. Stance paragraph two sentences. Ordered fallback if still over: trim the
stance to one sentence → drop the GitHub line (the links row carries it) → owner sign-off
before any ceiling change (`plate-height.spec.js`'s own comment requires it).

**Copy corrections (peer, all evidence-file-forced):** EvalAxis tail is `private · in
progress` — the evidence file marks `pre-1.0` UNVERIFIED and bars 1.0-status (the plan's
first draft took it from the mockup — exactly the ruling-4 class, caught by the fan).
Quorum says **moderated critique**, never "cross-model critique" (the four never read each
other). SaafSaans labels are `live, cached, or no reading` — "fallback" is Quorum's word.

**Capability sentences derive from `src/data/overview.js`** (recruiter MAJOR — P-15's test
applied to the plan's own draft): the overview rows already carry owner-approved plain-
English lines (D80/P-15); each act sentence = that line's phrasing + at most one named
mechanism, and the spec traces both to the overview import and the evidence file. Reader
first, term second.

**Eyebrow is strength-only** (recruiter): `INSPECTABLE EVIDENCE · PUBLIC CODE` — the
negative disclosure lives ONCE, in the closing NOT CLAIMED line (`aria-describedby` from
the ledger, painted, bar+partner gated). "NO ADOPTION CLAIMED" as a headline eyebrow is
ruling 1's defect shape recurring.

**Thesis count is the owner's decision, flagged, not folded** (architect + peer + ruling
5's fact carve-out): the RCA's fix text says "Six systems you can check yourself"; only
four repos are public. **Recommendation: Four** ("check yourself" must survive the reader
actually trying). Ships as Four unless he rules otherwise; his answer lands in D85. The
spec asserts the full folded string including the count, so the ruling is locked either way.

**Hero motion mechanism named** (uiux): the thesis line paints INSTANTLY with the headline
and lede — it is the message, not decoration. Only the ledger, pull-quote and strip enter;
they are hidden by the PRE-PAINT inline head script path (the localStorage read in
`Layout.astro` runs before first paint — no flash-then-hide), and every gate carries
hero-scoped selectors: `prefers-reduced-motion`, `[data-motion='off']`, `html.no-anim`,
no-JS (everything `opacity:1` without JavaScript). `motion.spec.js` gains hero-scoped
versions of ALL FOUR suppression tests plus headline-does-not-animate, each watched red by
deleting its selector. Pull-quote vs thesis-line competition: the quote is visually
subordinated (it is the reader's problem; the thesis is the claim) — a render-review item
named for the built-result fan's recruiter lens.

**Thesis line markup** (uiux + uiux-pro-max): a visible `p` (not a heading) with an id;
CapStrip gains a visible-label mode — the strip's `aria-label` is REPLACED by
`aria-labelledby` pointing at the painted line, so visible and accessible names cannot
diverge. Wrap at 390 at the sentence break. The APPROXIMATE·dates metadata line gets an id
chained into the employer ledger's `aria-labelledby` (name = heading + qualifier); the
capability list stays a `dl` (name dt, sentence dd) with the h3 binding assertions carried
over verbatim.

**Test plan enumerated** (testcheck BLOCK + MAJORs): the figure drift gate binds each row's
figure to the ONE cv.js point matching that row's outcome phrase, boundary-anchored
(token-anywhere passes swapped figures — cv.js carries 25 twice and 20 three times);
mutations: swap 25↔20 between rows, 35→30. Ruling-1's `/cv` bar gets partners: `/cv` paints
an "approximate" labelling note AND still renders Amazon and Mobileum with figures
(mutations: delete the note; delete the Amazon entry). Ruling-3's bar gets its partner IN
THE SAME FILE: `Phase 1 — No-Go` painted and AT-exposed in the overview row (mutation:
strip it from `overview.js`). Bars run the repo's fold pipeline with word-gap-tolerant
regexes (`/self[\s-]*reported/i`, `/no[\s-]*go/i` scoped to `#proof`), each evasion (U+2011,
entity, span-split, case) watched red. The strip's three D82 population cells asserted
present and painted; thesis line asserted by full folded string; enumerated rewrite list for
every carried-over proof-act assertion whose row shape changes (lengths, attribution
invariant — the 25%-only-under-Amazon rule dies with the Amazon row and is REPLACED by the
figure-to-point binding).

**Records widened** (manager): register rows for rulings 1–4 as well as 5/6/7 (they are
owner instructions; the register exists because instructions held in context get dropped).
P-2 (availability language — unchanged, mapped), P-4 (private framing — unchanged, EvalAxis
wording stays within it), P-6 (per-project facts differ — the five sentences are per-system
by construction), P-8 (in-progress shown — strip keeps `In progress 2`): each mapped, none
refused. STATUS row citations by row ID, not line number (the file grows; both plan line
cites were already off by one).

## Definition of Done

As package 4's, plus: barred-on-`/` additions `self-reported` (rendered), `No-Go` scoped to
the act only; the recruiter-yardstick question asked and answered per surface in the
built-result fan; renders at 1440/390 shown to the owner in the PR.
