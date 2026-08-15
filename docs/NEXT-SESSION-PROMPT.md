# Next session — the standing autonomous prompt (package 5, then the open register)

ultracode

You are continuing work on stackclimb.com, the owner's personal site.
`/Users/rohitagrawal/Projects/designing-website`. Astro, static, Cloudflare Pages.
DEPLOYMENT IS APPROACH C: a merge to main deploys automatically through CI and verifies
production itself (gates.yml deploy job). Never run manual wrangler unless the CI deploy
job fails — break-glass only. **W-24 (owner, 2026-08-15): merge each PR autonomously once
it is verified and green — the merge is delegated, owner-reserved judgment calls are not.**

READ FIRST, IN THIS ORDER, AND DO NOT SKIP:
  AGENTS.md · docs/STATUS.md rows D87, D86, D85, D84, D57, D62 · docs/OWNER-DIRECTIVES.md
  (P-15 through P-21 and W-24 govern all copy and all merges) ·
  docs/rca/RCA-005-career-ledger-scope.md (the freshest precedent: an owner instruction
  RAISED before complying, then honoured deeper than its words) ·
  docs/plan/career-ledger.md (both amendment sections) · docs/evidence/README.md

THEN STOP TRUSTING THEM. Verify by running a command before acting on any row. The ledger
outranks this file. EVERY suite read uses `set -o pipefail` + exit code, never `tail` —
and never pipe a Codex report through `tail -N` either: one pass's first five findings
were truncated exactly that way and had to be re-run (D87).

THE RULE THAT MATTERS MOST (D79, extended by RCA-002 and RCA-005): a plan quotes every
governing decision CLAUSE BY CLAUSE, BY ROW ID, each clause mapped to a named acceptance
test or a written refusal — the register's copy-governing `P-` rows are plan inputs, AND
the plan fan asks THE SCOPE QUESTION per surface: does this surface deliver the purpose
D57 assigns it, not merely accurate words (4B shipped one tenure standing in for fourteen
years; no lens owned that question; the owner caught it on production).

== RESOLVED BY THE OWNER THIS SESSION (do not re-open) ==
  - P-20 footer row: SHIPPED and live (D86). 79.19px one-row at 1440 · 207.94px at 390.
  - P-21 career ledger: SHIPPED and live (D87). The act's employer ledger depicts the
    OVERALL CAREER: heading `Employer outcomes` exactly; qualifier `Approximate ·
    Fourteen years, six employers` (facts derived from cv.js, month-granular gates); five
    rows across Oracle/LimeRoad/Mobileum; NO employer name renders anywhere in the act —
    attribution by name is performed on /cv, derived per row, machine-checked.
  - P-16 amended by P-21 (register row): approximate marking and no-per-row-naming stand;
    ledger-level naming is GONE from the act by the owner's ruling.
  - W-24: autonomous merges of verified-green PRs, standing.

== SUPERSEDED — three clauses earlier handoffs carried, now false (D87 enumerates) ==
  - "Oracle-tenure only on the act" — dead. The act is career-scoped.
  - "attribution at ledger level" — dead. The act carries no attribution; /cv performs it.
  - Package-5 premise "the home act is Oracle-tenure only, P-16's ledger-level attribution
    model is the precedent" — dead. /experience carries the per-employer story; the act
    already spans the career. Design /experience against D57 clause 8 and D87, not that line.

== THE QUEUE, IN ORDER. ONE PACKAGE = ONE PR = MERGED BEFORE THE NEXT. ==

PACKAGE 5 — /experience and /how-i-build (D57 clauses 8 and 9):
  - /experience: bird's-eye career evolution, complete CV downloadable from inside it
    (D57 overrules D32). Amazon/Mobileum/LimeRoad/Snapdeal/Subex rows live here in full.
  - /how-i-build: the engineering model, including the published-skills band
    (project-doc-skills, dot-github; recorded threshold: at three public skill repos it
    graduates to its own home act).
  - ONLY AFTER both routes are live and linked: nav becomes
    PROJECTS · EXPERIENCE · HOW I BUILD · CONTACT (D57); hero CTAs What I built · Career
    evolution · Email me. Nav visual baselines move for the FIRST time — here and only here.
  - Bump every floor and route list in the same change: contact.spec MIN_PLATES (9),
    print.spec PLATES (8 ids), plate-height ROUTES, links gates, proof-act's footer check,
    colophon.spec's three-route painted loop (new routes inherit the footer — Colophon is
    global).
  - HARD CONSTRAINTS from D84–D87: #proof 900px zero slack at 1440 (met exactly, again) ·
    1441.84/1477 at 390 · index.astro shrink-only · Layout.astro 228/250 · palette ladder
    zero slack — new plates need novel grounds · copy binds at 390 · measure with real
    MIME types.

THEN THE OPEN REGISTER, IN ORDER (owner-scheduled 2026-08-14): I-3 (alignment regression
testing — small, first; note tests/colophon.spec.js and the plate-copy alignment assertion
are its seeds) · W-20 (watermark skill — APPROVED, register row stale, fix dated
2026-08-12 in the same PR; built cross-repo in ~/Projects/project-doc-skills, applied here
as og.png + footer-presence check) · P-9 (interactive résumé) · P-10 (comments, Giscus,
low) · P-11 (NarraTwin avatar — heaviest, last) · I-4 (memory/dreaming — plan, then STOP).
For P-9/P-10/P-11: plan autonomously, STOP at genuinely-owner decisions.

== HOW TO WORK (all learned the expensive way; this session's additions in caps) ==

  - ONE WRITER. Fan reviews, never construction. NEVER edit the tree while a fan runs.
  - COMMIT BEFORE MUTATION-TESTING — ABSOLUTE. Mutations only against a sealed commit;
    record mutation→red pairs with EXACT MESSAGES in the STATUS row. A MUTATION THAT
    SURVIVES IS ACTED ON, NOT WAVED OFF: dead code gets REMOVED (D86's justify-content),
    a wrong red-switch claim gets CORRECTED IN EVERY FILE THAT STATES IT (D87 found one
    false claim written in a correction commit itself — one round later).
  - PIPEFAIL + EXIT CODE on every suite read.
  - Review fans: 7 lenses on PLAN and BUILT RESULT; verifiers refute before adoption.
    Session score: plan fans 12+6 material CONFIRMED, 0 refuted — findings are cheap to
    confirm here, keep the verify pass. Fixes get their own reviewer; two rounds, then
    residuals into docs/STATUS.md.
  - CODEX (R-7 carve-out): one 5-minute `codex exec --sandbox read-only` pass on TEST-FILE
    changes. Paid SIX times now. CAPTURE ITS FULL OUTPUT TO A FILE — `| tail -70` cost a
    re-run. Its claims are recollection until executed: two were refuted by measurement
    this session (the 960px stack, the remains-right-flush prediction).
  - STACKED PRs AUTO-CLOSE when the base branch merges and deletes — GitHub closes the
    child; reopen is impossible against a deleted base. Rebase `--onto main` and open a
    FRESH PR (D87). Prefer not stacking unless the queue forces it.
  - PIL TRAP: `ImageChops.difference(...).getbbox()` on RGBA images ignores RGB deltas
    where the alpha delta is 0 — compare in RGB mode. And a `cmp` loop run from the wrong
    cwd reports every file changed; the D87 baseline diagnosis hit both.
  - Baselines: CI ONLY (workflow_dispatch update_visual_baselines), artifact download,
    commit ONLY really-changed files (pixel-compare in RGB; the runner's PNG encoder
    changed and byte-diffs 26 identical files). Nav stays pixel-identical UNTIL package
    5's nav change. Downstream 390/768 diffs after an upstream height change are the
    fixed paint-grain re-alignment class (D82/D87) — expected, not a defect.
  - THE STASH TRAP (DEF-11): playwright runs rebuild dist; rebuild before measuring.
  - Read every commit's file list before pushing. Deploy: THE MERGE IS THE DEPLOY — watch
    the deploy job RUN green; post-deploy expects a NEW css hash ONLY when the package
    changed CSS (a content-only package keeps the hash — prove the moved build by its
    live claims, D87); every route directly (get the slug from dist/, a guessed slug
    404'd honestly); the barred sweep Cf-folded on live pages; run ids in a follow-up PR.
  - W-1: read origin/<default-branch> of sibling repos, never the checkout.
  - STOP and declare if a circuit breaker fires. Stop for genuinely-owner decisions.
  - Close the session properly: summary with numbers, main level with origin, branches
    deleted both sides, ports free, tree clean, fresh handoff here.

== CLAIMS THAT MUST NEVER SHIP ==

Everything in the standing live sweep (D85/D87), plus: never "self-reported" (P-16, any
folded spelling) · never "product studio" (D62) · never "No-Go"/"not deployed" on the
#proof act (P-17) · never "Oracle tenure" on the act (P-21 — the career scoping) · never
an employer name ANYWHERE in the act (gated, derived from cv.js orgs) · never a dated
span the rows cannot evidence (the qualifier says fourteen years, six employers — its
gates are month-granular and distinct-org) · never "cross-model critique" (quorum's
evidence prescribes "moderated critique") · never "pre-1.0" for EvalAxis ("private, in
progress") · SaafSaans labels are "live, cached, or no reading" · employer figures ONLY
from cv.js, captured per bullet INSIDE THE ROW'S OWN JOB, label words bound to the
bullet, % units pinned, direction allowlisted · the thesis says FOUR · the mockup's
"−30% test execution" and "MTTD" never ship. Nothing except VERIFIED-in-evidence or
labelled REPORTED.

== HOW TO WRITE TO THE OWNER ==

Plain English. Lead with the answer; if it is no, the first word is no. Short sentences,
bullets, a concrete example. No jargon, no AI filler. Never re-explain what he has acted
on. Disagree out loud BEFORE complying when evidence contradicts an instruction —
conflict, evidence, your position, an everyday analogy. This session's proof it works:
the "remove Oracle tenure" instruction was raised, his second message revealed the real
intent (career scope), and the fix went deeper than the words — RCA-005 records it.
