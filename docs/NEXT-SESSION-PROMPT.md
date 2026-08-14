# Next session — the standing autonomous prompt (package 5, then the open register)

ultracode

You are continuing work on stackclimb.com, the owner's personal site.
`/Users/rohitagrawal/Projects/designing-website`. Astro, static, Cloudflare Pages.
DEPLOYMENT IS APPROACH C: a merge to main deploys automatically through CI and verifies
production itself (gates.yml deploy job; D81; package 4B's run `31794992352`). Never run
manual wrangler unless the CI deploy job fails — break-glass only.

READ FIRST, IN THIS ORDER, AND DO NOT SKIP:
  AGENTS.md · docs/STATUS.md rows D85, D84, D83, D80, D57, D62 · docs/OWNER-DIRECTIVES.md
  (P-15 through P-19 are new and govern all copy) · docs/rca/RCA-002-proof-language.md ·
  docs/plan/package-4b-proof-language.md (the freshest planning precedent — read both
  amendment sections and the corrections in D85) · docs/evidence/README.md

THEN STOP TRUSTING THEM. Verify by running a command before acting on any row. The ledger
outranks this file (D62 vs the stale queue proved it). D85's correction block is required
reading: it records a hardening commit that broke two gates while the suite reads said
green — EVERY suite read uses `set -o pipefail` + exit code, never `tail`, and playwright's
failed-lines print ABOVE the passed line.

THE RULE THAT MATTERS MOST (D79, extended by RCA-002): a plan quotes every governing
decision CLAUSE BY CLAUSE, BY LINE NUMBER (cite row IDs, not line numbers — the file
grows), each clause mapped to a named acceptance test or a written refusal — AND the
directives register's copy-governing `P-` rows are plan inputs (P-15 skipped once cost a
full remedial package).

== RESOLVED BY THE OWNER THIS SESSION (do not re-open) ==
  - Thesis count: FOUR ("Four systems you can check yourself") — confirmed, gated exact.
  - Footer: D62's FULL definition, tail included, on every page's footer; D60's old second
    sentence dropped there as redundant. Gated as the bar-partner string.
  - P-16: "approximate", never "self-reported" (barred, Cf-folded). P-17: no No-Go on the
    act. P-18: presentation delegated, he reviews renders. P-19: hero animates, guarded.

== THE QUEUE, IN ORDER. ONE PACKAGE = ONE PR = MERGED BEFORE THE NEXT. ==

FIRST, SMALL — the footer row (owner's instruction 2026-08-14, deferred from 4B at his
word: "add this as part of the next action item, let Package 4B be delivered"):
  - The footer is too tall (measured 210px at 1440, 250 at 390). Owner-agreed direction:
    ONE ROW at desktop — the definition left at reading alignment, © + the animation
    toggle grouped right; stacked with tightened spacing at 390. Colophon.astro +
    global.css colophon block; footer renders on every page, so eyeball all of them.
    proof-act's footer assertions are text-based and survive; record the directive in the
    register (P-20) in the same PR. Measure before/after heights into the STATUS row.

PACKAGE 5 — /experience and /how-i-build (D57 clauses 8 and 9; open package-4's D57 map):
  - /experience: bird's-eye career evolution, complete CV downloadable from inside it
    (D57 overrules D32). Amazon/Mobileum/LimeRoad rows live here in full (the home act is
    Oracle-tenure only, P-16's ledger-level attribution model is the precedent).
  - /how-i-build: the engineering model, including the published-skills band
    (project-doc-skills, dot-github; recorded threshold: at three public skill repos it
    graduates to its own home act).
  - ONLY AFTER both routes are live and linked: nav becomes
    PROJECTS · EXPERIENCE · HOW I BUILD · CONTACT (D57); hero CTAs What I built · Career
    evolution · Email me. Nav visual baselines move for the FIRST time — here and only here.
  - Bump every floor and route list in the same change: contact.spec MIN_PLATES (9),
    print.spec PLATES (8 ids), plate-height ROUTES, links gates, proof-act's footer check
    runs on '/' + one project page (new routes inherit the footer automatically — Colophon
    is global).
  - HARD CONSTRAINTS from D84/D85: #proof 900px zero slack at 1440 and 1443/1477 at 390;
    index.astro 259/260 shrink-only; Layout.astro 227/250 (Colophon extracted); palette
    ladder zero slack (7 declared + navy) — new plates need novel grounds; copy binds at
    390, not 1440; measure with real MIME types (a scratch server without text/css gives
    unstyled garbage).

THEN THE OPEN REGISTER, IN ORDER (owner-scheduled 2026-08-14): I-3 (alignment regression
testing — small, first) · W-20 (watermark skill — APPROVED, register row stale, fix dated
2026-08-12 in the same PR; built cross-repo in ~/Projects/project-doc-skills, applied here
as og.png + footer-presence check) · P-9 (interactive résumé) · P-10 (comments, Giscus,
low) · P-11 (NarraTwin avatar — heaviest, last) · I-4 (memory/dreaming — plan, then STOP).
For P-9/P-10/P-11: plan autonomously, STOP at genuinely-owner decisions.

== HOW TO WORK (all learned the expensive way; additions from 4B in caps) ==

  - ONE WRITER. Fan reviews, never construction. NEVER edit the tree while a fan runs.
  - COMMIT BEFORE MUTATION-TESTING — ABSOLUTE. 4B ran one batch against a dirty tree and
    its `git checkout` restores DESTROYED three uncommitted fixes, twice. Mutations only
    ever against a sealed commit; record mutation→red pairs in the STATUS row.
  - PIPEFAIL + EXIT CODE on every suite read. `tail` hid a red suite twice in one day.
  - Review fans: 7 lenses on PLAN and BUILT RESULT (Architect, Manager, Recruiter, Peer,
    UI/UX, Test Check, ui-ux-pro-max). Reviewers execute; verifiers refute before adoption
    (4B plan fan: 45→17 confirmed 0 refuted; built fan: 24→19 confirmed 0 refuted — the
    0-refuted streak means findings are cheap to confirm here, keep the verify pass).
    Fixes get their own reviewer. Two rounds, then residuals into docs/STATUS.md.
  - CODEX (R-7 carve-out): one 5-minute `codex exec --sandbox read-only` pass on TEST-FILE
    changes. Paid FOUR times now (14 + 15 holes in 4/4B). Box with the Bash tool timeout.
  - ASSERT PAINTED AND EXACT: checkVisibility is ancestor-aware for opacity/visibility,
    NOT filter/clip-path — walk ancestors; role queries are the only aria-hidden-aware
    assertions; Cf-strip (U+00AD, U+200B-2060, FEFF) BEFORE any barred-string regex;
    decode numeric entities in raw-HTML scans; token-bound figures; bind a figure to ITS
    OWN source bullet by capture, set-equality when one row merges two bullets; scope /cv
    partners per .cv-job (the awards line satisfied a page-wide match); exact cell values
    (60/40/20 passed a substring 6/4/2 check); full-string equality for labels (negation
    passed substring). CI-only tap-target reds at '44px': device-pixel rounding — the gate
    carries a half-pixel tolerance, diagnosed and proved both directions in D85.
  - FILE BUDGET: new files ≤250 lines, 120 chars. Modularize, never comment-trim (Colophon
    and proof-data/hero-motion splits are the precedent). `node tests/file-budget.mjs`
    before every push.
  - Visual baselines: CI ONLY, artifact download, nav cmp byte-identical (UNTIL package
    5's nav change), stale plate -darwin PNGs deleted (nav -darwin are current, leave).
  - THE STASH TRAP (DEF-11): playwright runs rebuild dist; rebuild before measuring.
  - Read every commit's file list before pushing. Deploy: THE MERGE IS THE DEPLOY — watch
    the deploy job RUN green, post-deploy expects a NEW css hash, every route directly,
    the barred sweep Cf-folded on live pages, run id in a follow-up PR (D81–D85 style).
  - W-1: read origin/<default-branch> of sibling repos, never the checkout.
  - STOP and declare if a circuit breaker fires. Stop for genuinely-owner decisions.
  - Close the session properly: summary with numbers, main level with origin, branches
    deleted both sides, ports free, tree clean, fresh handoff here.

== CLAIMS THAT MUST NEVER SHIP ==

Everything in the 29-string live sweep D85 records, plus: never "self-reported" (P-16,
any folded spelling) · never "product studio" (D62) · never "No-Go"/"not deployed" on the
#proof act (P-17 — it stays on the overview/plates/project pages) · never "cross-model
critique" (quorum's evidence prescribes "moderated critique"; the four never read each
other) · never "pre-1.0" for EvalAxis (its evidence bars 1.0-status; "private, in
progress") · SaafSaans labels are "live, cached, or no reading" · employer figures ONLY
from cv.js, captured per bullet, attribution at ledger level, `~`-marked, Oracle-tenure
only on the act · the thesis says FOUR · the mockup's "−30% test execution" and "MTTD"
never ship. Nothing except VERIFIED-in-evidence or labelled REPORTED.

== HOW TO WRITE TO THE OWNER ==

Plain English. Lead with the answer; if it is no, the first word is no. Short sentences,
bullets, a concrete example. No jargon, no AI filler. Never re-explain what he has acted
on. Disagree out loud BEFORE complying when evidence contradicts an instruction —
conflict, evidence, your position, an everyday analogy.
