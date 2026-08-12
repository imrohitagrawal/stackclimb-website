# Handoff — for the next session

Written 2026-08-12. Paste the fenced block into a fresh Claude Code session in
`/Users/rohitagrawal/Projects/designing-website`.

**This session shipped two PRs and deployed.** Seven false claims came off the live site
(#11, D74) and a four-agent execution audit recorded what is actually true (#12, D75).
`docs/STATUS.md` is the authority; this file is only the trailhead.

**Two things the next session must not repeat.** First: everything was verified against
`dist/`, `dist/` was clean, and **production was serving the opposite** — one build behind,
with every claim the merge existed to delete. Only `post-deploy.mjs` could see it, because
`playwright.config.js:12` points every other gate at `localhost:4321`. Second: a grep for the
exact phrase on one page missed the same claim, differently worded, on `/cv`. **Grep the
claim, not the phrase. Verify production, not the build.**

---

## The block to paste

```
ultracode

You are continuing work on stackclimb.com, the owner's personal site, in
/Users/rohitagrawal/Projects/designing-website. Astro 7, static, Cloudflare
Pages, manual deploy.

READ FIRST, IN THIS ORDER: AGENTS.md (the rules; CLAUDE.md just imports it),
docs/STATUS.md (decisions D1-D75, defects, open items), docs/OWNER-DIRECTIVES.md.
Then STOP TRUSTING THEM. Every one of those files has been wrong in both
directions, and a four-agent audit on 08-12 found nine ledger rows and four
directive rows wrong. Verify by running a command before you act on any row.

SAY THIS OUT LOUD at the start of any deployment work, per AGENTS.md: deployment
is approach A-prime. `npx wrangler pages project list` reports Git Provider: No.
Nothing deploys on push. Every deploy is a manual `npx wrangler pages deploy dist
--project-name=stackclimb --branch=main` followed by `npm run post-deploy`.

== HOW TO WORK: you are an ORCHESTRATOR ==

Do not implement anything yourself in the main thread. For each work package
below, in order, spawn ONE package-orchestrator subagent. That orchestrator runs
the phases below and reports back. You review its report, then move to the next
package. One package, one PR, merged before the next starts (AGENTS.md).

Each package-orchestrator runs these phases:

  1. PLAN      - fan out 2-3 read-only agents. Diverse lenses. They must READ
                 the real code, not the ledger. Converge on one plan.
  2. RCA/DOC   - if the package fixes a defect, write the RCA BEFORE any code,
                 per AGENTS.md's document-before-changing rule. Investigating is
                 not working; the moment the cause is known, the doc comes first.
  3. BUILD     - ONE WRITER. NEVER fan out this phase. Subagents share one
                 working tree and parallel writers corrupt each other. If two
                 files are genuinely disjoint you may use isolation: "worktree";
                 otherwise serialize. Packages 3, 4 and 5 all edit index.astro,
                 so they are serial no matter what.
  4. TEST      - every behavioural change ships a test, and the test must BITE.
                 Prove it: revert the change and watch it go red, or mutate the
                 assertion. An assertion that passes when the feature is absent
                 is worthless - on 08-12 a self-test compared file BYTES instead
                 of PIXELS and certified a watermarker that drew nothing.
  5. REVIEW    - size the fan to blast radius (AGENTS.md T0-T3), do not use a
                 fixed fan. Docs -> self-verify. One component -> one matched
                 reviewer. Multi-file -> a fan. Two lenses are MANDATORY on any
                 non-trivial package and they are the two that actually paid:
                   (a) one lens must RUN the thing and report real output. A
                       reviewer that only reads source is an opinion.
                   (b) one lens must be a DIFFERENT MODEL FAMILY:
                       codex exec --sandbox read-only "<prompt>"
                       A subagent is context isolation, not model-weight
                       decorrelation. On 08-12 Codex caught a false claim that
                       two same-family agents missed.
                 Add a security lens ONLY on package 6 (headers/CSP) and a
                 performance lens ONLY on package 5 (animations). Elsewhere they
                 find nothing on a static site with no server, no auth and no
                 user input - and this repo measured a five-lens fan raising 32
                 findings of which 23 were refuted.
                 REFUTE FINDINGS BEFORE FIXING THEM. Check the case the reviewer
                 did not mention.
  6. ITERATE   - maximum TWO review rounds. Then ship with the residuals written
                 into docs/STATUS.md. More rounds is not convergence.
                 STOP ENTIRELY and escalate to the owner if any circuit breaker
                 fires: a new class of blocking finding in a second round; the
                 same defect class in two components; two consecutive fixes each
                 adding a defect; three or more amended heads after review starts.
                 Then diagnose WHICH upstream miss it was - requirements,
                 planning, understanding, or coding. Patching cannot fix the
                 first three, and continuing to patch hides which one it was.
  7. PR        - branch protection is on and tested. Both gate jobs required,
                 enforce_admins true, force-push and deletion blocked. Open a PR;
                 you cannot push to main.
  8. PR REVIEW - the two mandatory lenses again, on the diff.
  9. MERGE     - squash, delete the branch, sync main.
 10. LEDGER    - update docs/STATUS.md IN THE SAME PR, never after. Record
                 rejected options with their reason. Corrections stay.

VISUAL BASELINES: if a package changes any rendered pixel, CI goes red until you
regenerate them. Nothing is automatic - gates.yml:147 gates it on a manual run:
  gh workflow run gates.yml --ref <branch> -f update_visual_baselines=true
then download the artifact and commit the 54 -linux files unchanged. Never
generate them on a laptop; toHaveScreenshot names files by process.platform, so
a darwin baseline is not even the file CI looks for. Expected signature: plate
baselines move, nav baselines do NOT. A changed nav baseline means a regression.

DEFINITION OF DONE (AGENTS.md, all seven): build clean; SEEN RENDERING at 1440
and 390 - actually look at the screenshot, this session caught a card in the
wrong section, a duplicate, and a misaligned cap strip by looking and none by a
gate; every claim traced to docs/evidence at VERIFIED or labelled REPORTED;
focus visible and WCAG AA; both themes; no horizontal scroll at 390; and
`npm run post-deploy` green after any deploy.

== THE WORK, IN ORDER ==

Packages 1 and 2 are DONE and merged (D74, D75). Start at 3.

3. PROJECT DEPTH - do this first, so index.astro is edited once not three times.
   Create src/pages/projects/[slug].astro driven by the EXISTING
   src/data/projects.js. Each page carries that system's artefact panel via the
   EXISTING Shot.astro. Home plates shrink to compact cards that link out.
   REUSE, DO NOT REBUILD: Shot.astro, projects.js, shot.css, the 8 images, the
   5 evidence files. Only the wiring in index.astro changes.
   Verified now: /projects/<slug> 404s; only 3 pages exist; home is 7,648px at
   1440 and 11,893px at 390, with 7 of 8 plates over one viewport. Target ~4,000px.
   D62 says panel on the home band, screenshot on the project page. That was
   decided in a world without project pages. RESOLVE IT HERE, do not inherit it.

4. THE TWO-LEDGER ACT - the highest-value content. "Two ledgers, deliberately
   kept apart": employer outcomes beside independent-system evidence. Use the
   CORRECTED wording - root-cause analysis -35%, release validation -25%.
   NEVER MTTD, NEVER cycle time. Add the StackClimb definition (D60/D62) where a
   cold reader first meets the word, and in the footer. Verified: zero
   occurrences of "two ledgers" or the definition anywhere in the output today.

5. /experience THEN /how-i-build - both 404 today. /experience: the career arc
   with the CV as a download. /how-i-build: the lifecycle, the practice band
   (closes P-7), and the published-skills band. Nav and CTAs update ONLY once
   both exist - a nav must not name a destination that 404s.
   Published AI skills live in a /how-i-build band, not a nav slot. Promotion
   threshold on record: at THREE public skill repos it earns its own act. Two
   exist today (project-doc-skills, .github).

6. ANIMATIONS + the two live defects. reveal.js:26 is still threshold 0.15 on a
   full-viewport element, so the 420ms fade completes off-screen. #top never
   receives in-view and the hero has no motion. There are ZERO @keyframes in any
   CSS on the site. Every reveal stays a progressive enhancement -
   html:not(.motion-ready) shows content fully, and tests/motion.spec.js already
   asserts that shape. THIS is the package that gets a performance lens.
   Fold in DEF-53 here (it is a workflow change, small): the deploy job concludes
   "success" while deploying nothing. It emits its ::warning:: but the job is
   green, so the rollup, the PR badge and branch protection all read pass. Make
   it fail, or make the skip unmistakable in the rollup. This is a defect in D73.
   Also add the security lens here for public/_headers - it exists and carries no
   CSP (DEF-19, latent).

7. COLORIZE - live work, never dropped. Plan A made it conditional on the mockup
   choosing a non-editorial world; World A won (D58), so the condition did not
   fire and this is still owed.
   THE PLAN'S STATED DEFECT IS REFUTED - do not go looking for it. Measured on
   the served build 08-12: NO adjacent plate pair is at distance 0.0. Tightest
   adjacent pair is saafsaans->narratwin at 9.9; citevyn->quorum is 33.3. The
   REAL residual is smaller: #top and #contact are the only two plates that do
   not declare their own ground - both inherit the base #0e1322 - so the one true
   0.0 is between them, and they are not adjacent. Decide whether bookending the
   page is deliberate (defensible) or a Three-Color-Livery violation.
   Run it properly: node .claude/skills/impeccable/scripts/context.mjs --target
   src/pages/index.astro, then reference/colorize.md, then reference/craft-floor.md
   immediately before editing.
   Constraints the skill will NOT infer: the One Thread Rule (ochre only - D48
   records orange #f05020 as a second accent BY OWNER DECISION, and colorize will
   reopen that; it is his call to re-make); the Painted Ground Rule (flat hues,
   never gradients); and #private is the paper plate where ochre measures 1.97:1
   and fails 1.4.11, so --accent: #6b4e14 MUST survive.
   Four gates stay green: boundary-check.mjs, nav-contrast.mjs, and above all
   palette-ladder.spec.js - DEF-16 proved that FLATTENING grounds made every
   contrast gate GREENER, so only a distinctness count can hold this.

8. RESIDUALS, each small:
   - M4's tracked Stop hook. It lives only in gitignored settings.local.json.
   - .gitignore:25 asserts ".claude/settings.json is tracked and carries the
     shared gates". That file DOES NOT EXIST. The shared-gate story is fiction,
     not drift. Fix the line or create the file.
   - The MTTD retraction reached PRODUCT.md only. docs/ACTION-PLAN.md:86 and
     docs/positioning-decisions.md:64 still carry the overclaim. Neither reaches
     the site, so this is doc rot, not a live overclaim - but it is the fourth
     appearance, and the owner's declined CI gate has "revisit on a fourth" as
     its stated condition. Raise it with him.
   - Quorum's strip carries NO COMMIT STAMP, unlike NarraTwin's, and two figures
     have drifted since measurement: "2,095 python" is now 2,102 and "32 ADRs" is
     now 34. Add the stamp, then correct or re-measure.
   - DEF-19's evidence line is stale: it says no _headers file exists on disk or
     in history. public/_headers DOES exist (M7 added it) and simply carries no
     CSP. The defect holds; its evidence does not.
   - /cv has never been run through the five installed ResumeSkills.

== PENDING ON THE OWNER - ask once, early, do not block on it ==

  - DEF-52, LOW (filed HIGH 08-12, downgraded same day): Cloudflare Email
    Obfuscation is on for the zone. It
    rewrites all five mailto: links to /cdn-cgi/l/email-protection#... which 404s
    on its own, and /cv renders the literal placeholder instead of the address.
    MEASURED IN A BROWSER BOTH WAYS: with JS ON every link resolves to mailto:
    and /cv prints the address - it works, and that is effectively every visitor.
    With JS OFF it degrades. This was FILED HIGH AND WAS WRONG; the owner refuted
    it with a screenshot of the working case. Do not re-escalate it.
    It is worth turning off on two judgment grounds, not as a fix: the build
    ships ZERO .js files and 1,494 inline bytes, while Cloudflare adds a 1,239-
    byte external script to undo its own change - nearly doubling the site's
    JavaScript on a site whose argument is that it barely uses any; and it
    protects nothing, since the repo is public and the address is plain text in
    PRODUCT.md, src/data/cv.js and src/layouts/Layout.astro.
    NO DEPLOY FIXES IT - it is a zone setting, and wrangler's OAuth token has no
    zone scope (403). Owner's call, in the dashboard.
    Worth doing regardless: nothing in this repo checks production for LINK
    REACHABILITY, only for build identity and asset 200s. That gap is what let
    this reach production unseen, and it is the part an agent can close.
  - P-3 is recorded DONE for a directive the site DELIBERATELY REVERSED. It asked
    for extra Seeking titles; index.astro:71 records cutting to one because five
    "reads as does not know what he wants". A reversal recorded as compliance is
    worse than an open row, because nobody re-opens it. He must choose: keep the
    one-title version (recommended, and what positioning-phase0 argues for) or
    honour P-3 as written.
  - CLOUDFLARE_API_TOKEN. He declined it, and that decision stands. Do not
    re-propose it; just do not mistake the skipped deploy job for a real one.
  - NarraTwin's CI artifacts for 639aa2cf EXPIRE 2026-08-18 - eval-smoke-report
    and stage8-performance-lighthouse-reports are both still live, confirmed
    08-12. Retrieve before they go, or the strongest numbers stay unverifiable.
  - project-doc-skills PR #22 (the watermark skill) is IN DRAFT, not merged. Four
    lenses said do not merge and the repo's own release gates are red on the
    branch while main is green (run-golden 209/218 vs 218/218; 8 of those 9
    failures are gates that STOPPED BITING). The mark is hardcoded white where
    the contract says slate, so on a light export it changes ZERO pixels while
    reporting success. Codex's deeper verdict: nothing invokes it, so it is still
    the passenger the RCA said it was fixing. The next step is a design decision -
    does it belong inside publish-mirror? - not a fix commit.

== CLAIMS THAT MUST NEVER SHIP ==

Read the consolidated list in docs/STATUS.md and docs/evidence/README.md before
writing any copy. The ones that keep coming back:
  - CiteVyn: never quote eval_report.json (the STUB run); only eval_report_pg.json.
    Never claim corpus scale. Never "zero refusal leaks" unqualified - retrieval
    leaks 5 of 19; only the answer layer is clean. And the 52-case golden suite is
    NOT the promotion gate: promotion_eval.py:17 calls wiring it in "wrong, and
    deliberately not taken". The gate is a 15-case retrieval suite on the CANDIDATE
    index at a 0.95 default, and an operator can force past it with an audit entry.
  - Quorum: the four models DO NOT critique each other. ADR-0032 exists to kill
    that claim. Say "a separate moderator pass"; never "a fifth model" - the
    moderator's default id IS answer slot 2's. Round 2 is skipped on budget, so
    "twice" is the happy path, not an invariant. No latency figure, no mutation
    score, and "198 tests" is stale by an order of magnitude.
  - SaafSaans: never "live" unqualified - deployed, sleeps when idle. There is NO
    sample mode; the states are LIVE / CACHED / NO READING.
  - NarraTwin: no Lighthouse score, no throughput claim. Phase 1 - No-Go is
    stated, not hidden.
  - Employer numbers: root-cause analysis -35%, release validation -25%. Never
    MTTD, never cycle time.

== HOW TO WRITE TO THE OWNER ==

Plain English. Lead with the answer; if it is no, the first word is no. Short
sentences. No jargon, no invented shorthand, no AI filler (the banned list is in
AGENTS.md). Bullets over paragraphs. Give a concrete example. Never re-explain
what he has already acted on. And disagree out loud BEFORE complying when the
evidence contradicts an instruction - state the conflict, show the file and the
command output, say which you think is right, and give an everyday analogy. That
rule has already paid twice in his favour and once in the reviewers'.

== CLOSE THE SESSION PROPERLY ==

docs/practices/session-close.md, never skipped: say what happened in plain
English with numbers; merge and sync main, verified by command; delete branches
both sides; clean up orphaned preview servers, temp files and stray dependencies
(this session found an orphan astro preview from an earlier one holding a port,
and a reviewer's __pycache__ making a clean repo look red); and rewrite this
handoff for the next session.
```

---

## Verified state, 2026-08-12

Every line below was produced by running the command, not by reading a document.

| Check | Command | Result |
|---|---|---|
| Production serves `main` | `npm run post-deploy` | ✓ 11 assets 200, stamp matches |
| Suite | `npx playwright test --ignore-snapshots` | 130 passed, 0 failed, 2 skipped |
| Snapshots | `npx playwright test` | 6 fail — gitignored local `-darwin` only; CI uses `-linux` |
| Budget | `node tests/file-budget.mjs` | ✓ 60 files |
| PII | `node tests/no-pii.mjs` | ✓ 113 files |
| Seams | `node tests/boundary-check.mjs` | ✓ worst 7.56:1 AA |
| Nav | `node tests/nav-contrast.mjs` | ✓ worst 6.26:1 |
| Post-deploy bites | `node tests/post-deploy.mjs --self-test` | ✓ 8 assertions |
| Branch protection | `gh api repos/:owner/:repo/branches/main/protection` | both checks required, `enforce_admins` on |
| Deploy secret | `gh secret list` | empty — deploy job skips, and wrongly reports success |

**Packages 3–7 are NOT STARTED, confirmed by execution:** `/projects/<slug>`,
`/experience`, `/how-i-build` all 404. Zero `@keyframes` in any CSS. `reveal.js:26`
still `threshold: 0.15`, and `#top` never receives `in-view`.
