# Next session — the standing autonomous prompt (package 5, then the open register)

ultracode

You are continuing work on stackclimb.com, the owner's personal site.
`/Users/rohitagrawal/Projects/designing-website`. Astro, static, Cloudflare Pages.
DEPLOYMENT IS APPROACH C: a merge to main deploys automatically through CI and verifies
production itself (gates.yml deploy job; D81, C's run `31752881942`, package 4's run
`31775613470`). Never run manual wrangler unless the CI deploy job fails — break-glass only.

READ FIRST, IN THIS ORDER, AND DO NOT SKIP:
  AGENTS.md · docs/STATUS.md rows D84, D83, D80, D57, D62 · docs/OWNER-DIRECTIVES.md
  docs/plan/package-4.md (the freshest planning precedent, including both amendment
  sections and the conflict section) · docs/evidence/README.md

THEN STOP TRUSTING THEM. Every one of these files has been wrong in both directions.
Verify by running a command before acting on any row. Package 4's decisive find was exactly
this: the queue said "ship D60's canonical line verbatim" and the ledger's D62 (STATUS.md:54)
had REPLACED that line at the owner's decision — the fan caught it, the queue had not.
The ledger outranks this file. Always.

THE RULE THAT MATTERS MOST (D79): a plan implementing a recorded decision must quote that
decision CLAUSE BY CLAUSE, BY LINE NUMBER, each clause mapped to a named acceptance test or
a written refusal. SUMMARIES ARE BANNED AS PLAN INPUT. Open the row. Package 4's plan fan
still found three unmapped D57 clauses after the plan claimed compliance — map the WHOLE row.

== PENDING ON THE OWNER (surface these, do not build on them) ==

  - PR #27 flagged one string decision: the FOOTER renders D62's definition without its
    "— outside any employer" tail (the kept second sentence says those words in the next
    breath; DEF-27's shape). The act renders the full line. If he wants the tail twice,
    it is one string edit in Layout.astro. Recorded in D84.

== THE QUEUE, IN ORDER. ONE PACKAGE = ONE PR = MERGED BEFORE THE NEXT. ==

PACKAGE 5 — /experience and /how-i-build (D57 clauses 8 and 9, refused-to-here by
package 4's plan — open docs/plan/package-4.md's D57 map rows 3, 4, 8, 9):
  - /experience: bird's-eye career evolution, complete CV downloadable from inside it
    (D57 overrules D32). /how-i-build: the engineering model, including the published-skills
    band (project-doc-skills, dot-github — the audit's differentiator; recorded threshold:
    at three public skill repos it graduates to its own home act).
  - ONLY AFTER both routes are live and linked: nav becomes
    PROJECTS · EXPERIENCE · HOW I BUILD · CONTACT (D57 — the Systems refusal expires with
    the 404s). Hero CTAs per D57: What I built · Career evolution · Email me. Nav visual
    baselines move for the FIRST time — correct here and only here (they are cmp-verified
    byte-identical through package 4; the gate that holds them is the same cmp discipline).
  - Bump every plate-count floor and route list in the same change: contact.spec MIN_PLATES
    (now 9), print.spec PLATES (now 8 ids incl. 'proof'), plate-height routes, links gates.
  - HARD CONSTRAINTS carried from D84: #proof is 900px at 1440 — ZERO slack, any added line
    on the home page above it that reflows it goes red; index.astro is 256/260 shrink-only;
    the palette ladder passes with zero rendered slack again (7 declared + navy = 8) — any
    NEW plate needs its own novel ground; new routes need footer definition (it is global —
    Layout renders it, so new pages inherit it; proof-act.spec checks / and one project page).

THEN THE OPEN REGISTER, IN THIS ORDER — the owner scheduled these on 2026-08-14; each is
one package, planned with the same clause-by-clause rigour against its register row:

  I-3 — alignment regression testing: a toggle that drifts must fail (plan phase 1.4).
    Small, test-infrastructure shaped; do it first.
  W-20 — the watermark skill. APPROVED BY THE OWNER 2026-08-12 — the approval and his
    answers to all three scope questions are recorded in docs/rca/RCA-001-watermark-skill.md
    (read it whole); the OWNER-DIRECTIVES register row still says "awaiting approval" and is
    STALE — fix that row, dated 2026-08-12, in the same PR that starts the work.
    CROSS-REPO: the skill is BUILT in ~/Projects/project-doc-skills as a ninth skill in
    skills/, built into dist/watermark.skill by build-skills.sh (RCA answer 3). What lands
    in THIS repo is the application: og.png (the whole real case — it ships uncredited) and
    the HTML footer-presence check. Session close then covers both repos.
  P-9 — interactive résumé (plan phase 4.4).
  P-10 — comments facility (Giscus recommended in the register; low priority).
  P-11 — NarraTwin avatar as the site's representative (plan phase 7.3). Heaviest; last.
  I-4 — memory management across projects, using dreaming. Cross-project and underdefined:
    plan it, then STOP and present the plan — do not build it without the owner's answer.

  For P-9, P-10, and P-11: plan autonomously, but STOP at every decision that is genuinely
  the owner's — new self-descriptions, anything visual that stands in for him (the avatar's
  look and voice above all), what a comment section says about the site's character. Present
  the decision with options and a recommendation; build only after his answer.

== HOW TO WORK (all of it learned the expensive way) ==

  - ONE WRITER. Fan reviews, never construction. Do not edit the tree while a review fan
    or reviewer subagent is running — package 4 held its fix batch until the fan returned.
  - Review fans: full 7-lens fan on each package's PLAN and on its BUILT RESULT (Engineering
    Architect, Engineering Manager, Hiring Recruiter, Engineering Peer, UI/UX Expert, Test
    Check, ui-ux-pro-max as the one skill lens). Reviewers execute — at least one must RUN
    the pages. REFUTE FINDINGS BEFORE ACTING (the ratio moves: 23/32 refuted once, 17/21
    confirmed once, package 4 ran 0-refuted twice — the verification pass is what holds).
    Fixes get their own reviewer. Two rounds max, then ship with residuals written into
    docs/STATUS.md.
  - CODEX (R-7, owner-resolved): none anywhere EXCEPT one hard-time-boxed 5-minute
    `codex exec --sandbox read-only` pass on TEST-FILE changes. It has now paid THREE times:
    package 4 found 14 holes in a spec that had just survived nine watched-red mutations
    (token-boundary 76-in-767, U+2011 past a regex bar, entity-encoded barred phrase,
    negation past a substring match, aria-hidden past every paint check, unanchored sha).
    macOS has no `timeout` binary — box it with the Bash tool timeout. Its full output
    survives in ~/.codex/sessions/<date>/rollout-*.jsonl if the console truncates.
  - ASSERT PAINTED AND EXACT, NOT DECLARED. checkVisibility is ancestor-aware for opacity/
    visibility but NOT for filter; assert filter and geometry separately (off-screen passes
    checkVisibility). Role queries (getByRole) are the only assertions that see aria-hidden.
    NFKC-fold and dash-fold text before any barred-string regex. Token-bound every figure
    (a substring is not a token). Compare dt case-folded (CSS uppercase transform), dd exact.
  - COMMIT BEFORE MUTATION-TESTING. Every mutation batch runs against a commit; record
    mutation→red-test pairs in the STATUS row (a header claim without a record reads as
    UNVERIFIED — a fan confirmed exactly that in package 4).
  - FILE BUDGET BITES: new files ≤250 lines — CI failed the hardened spec at 266 before
    the header was compressed. Check `node tests/file-budget.mjs` locally before pushing.
  - THE STASH TRAP: any playwright run REBUILDS dist/ (DEF-11). After git stash pop, run
    npm run build before measuring anything, or you measure the stashed tree.
  - MEASURE WITH REAL MIME TYPES: a scratch static server without a css content-type gives
    unstyled pages and garbage heights (package 4 measured 550px for a 900px plate that way).
  - COPY HEIGHT BINDS AT 390, NOT 1440. Measure copy at 390.
  - Read every commit's file list before pushing (the D78 git add -A lesson).
  - Visual baselines: CI ONLY (gh workflow run gates.yml --ref <branch>
    -f update_visual_baselines=true), download the artifact, commit -linux files unchanged,
    cmp-verify nav baselines byte-identical (UNTIL package 5's nav change — then they move,
    deliberately, once), regenerate as the LAST commit before the PR settles. Plate -darwin
    PNGs are LOCAL-ONLY, never committed — delete stale ones, they regenerate.
  - W-1 has teeth: read origin/<default-branch>, never the checkout. Defaults:
    saaf-saans → master; narratwin-ai, evalaxis → main. Nesting:
    ~/Projects/narratwin/narratwin-ai/narratwin-ai · ~/Projects/evalaxis/evalaxis-ai.
  - Orphaned astro preview: kill by PID from lsof -iTCP:<port>. Never print secret values.
  - docs/STATUS.md updated IN THE SAME PR, never after — a built-result fan BLOCKED package 4
    on exactly this. Deploy run ids land in a small follow-up PR, D81/D83/D84-style.
  - Branch protection is on. Merging a green, twice-reviewed package PR is authorised.
    THE MERGE IS THE DEPLOY: watch the push run's deploy job RUN green (not skip), then
    independently verify — npm run post-deploy (expect a NEW css hash), every route directly
    (post-deploy reads only /), and the barred-claim sweep on the LIVE pages, NFKC-folded.
    Record the run id in the ledger.
  - STOP ENTIRELY and escalate, DECLARING it, if a circuit breaker fires (AGENTS.md's
    list). Stop and ask when a decision is genuinely the owner's: new self-descriptions,
    Seeking/roles copy, killing an unflattering fact (forbidden), a directive conflict.
  - Close the session properly: summary with numbers, main level with origin by command,
    branches deleted both sides, processes killed, ports free, git status clean, fresh
    handoff written to docs/NEXT-SESSION-PROMPT.md.

== CLAIMS THAT MUST NEVER SHIP ==

CiteVyn: never eval_report.json (the stub), never "hit-rate 1.0 over 54", never "zero
refusal leaks" unqualified, the 52-case golden suite is NOT the promotion gate, panel-N for
the 4.63 run is UNVERIFIED. Quorum: the four models never read each other, never "a fifth
model", round 2 skipped on budget is recorded as skipped. SaafSaans: never "live"
unqualified, no sample mode, "21 stations" only with the repo-stated hedge, never "senior
with asthma scores 76" (the adult scores 76; a senior 86), never "three orders apart" (60×),
never 1,414 or 1,372 unlabelled, its merge is "both run, stricter wins" — never "overrides
a generative output". NarraTwin: no real LLM — every grounding guarantee is about the
harness and the live copy SAYS so (keep it); the gap is SHA-absence; the evidence file's
REFUTED table is INVERTED, its correction section governs (0.903/0.75 are the committed
values). EvalAxis: never 13,769 or 426; the two regression tests are ALTERNATIVES — either
fires — never "and". Employer numbers: attribution exact — root-cause analysis ~35% is
ORACLE, manual release-validation effort ~35% is MOBILEUM, the only 25% is AMAZON coverage;
"release validation −25%" exists nowhere and never ships, in any spelling (NFKC-fold before
sweeping). **Never "product studio" — D62 dropped it at the owner's decision.** Nothing
ships except VERIFIED-in-evidence or labelled REPORTED.

== HOW TO WRITE TO THE OWNER ==

Plain English. Lead with the answer; if it is no, the first word is no. Short sentences,
bullets, a concrete example. No jargon, no AI filler. Never re-explain what he has acted
on. Disagree out loud BEFORE complying when evidence contradicts an instruction — conflict,
evidence, your position, an everyday analogy.
