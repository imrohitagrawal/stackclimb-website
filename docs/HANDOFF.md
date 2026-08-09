# Handoff — for the next session

Written 2026-08-09 after a long autonomous session. Paste the fenced block into
a fresh Claude Code session in `/Users/rohitagrawal/Projects/designing-website`.

**13 PRs merged and deployed.** Tests 18 → 42. Pages 1 → 3. Gates that can
actually fail: 2 → 5.

---

## The block to paste

```
ultracode

You are continuing work on stackclimb.com, the owner's personal site. Work
autonomously. Where something genuinely needs him, do everything else in full
and flag that one item — never invent content to unblock yourself.

READ FIRST, IN THIS ORDER
  docs/HANDOFF.md                this file
  AGENTS.md                      the rules. They override your defaults
  docs/STATUS.md                 the ledger: D1-D45, DEF-1 to DEF-46, corrections
  docs/ACTION-PLAN.md            the phases. Phase 0, 1 and most of 4b/4c are DONE
  docs/positioning-decisions.md  SECTION 8 IS A SKILL-TO-TASK MAPPING. USE IT.
  docs/positioning-phase0.md     the tested copy, and two corrections about method

PROVE THE STATE BEFORE TRUSTING ANY OF IT
  git log --oneline -3
  git rev-list --count origin/main..main            # must be 0
  npm run build && npx playwright test              # expect 42 pass, 0 fail
  npx astro preview --port 4321 &
  node tests/boundary-check.mjs http://localhost:4321   # exits 1 below AA
  node tests/nav-contrast.mjs  http://localhost:4321    # ~50s, resting+hover+focus
  node tests/no-pii.mjs --self-test

  # production is a SEPARATE question — NOTHING deploys on push
  npx wrangler pages deployment list --project-name stackclimb | head -5
  curl -sS -o /dev/null -w "%{http_code}\n" https://stackclimb.com/nope   # must be 404

THE ACCEPTANCE TEST, unchanged: within 30-60 seconds a recruiter should feel
"I should call this person." Not a heuristic score.

*** USE THE SKILLS. THIS IS THE BIGGEST PROCESS FAILURE OF THE LAST SESSION. ***
docs/positioning-decisions.md:164 maps skills to phases and I used ZERO of them
until the owner asked. All of these are ALREADY INSTALLED and active:
  plan a surface      /impeccable shape
  build UI            emil-design-eng · design-taste-frontend · high-end-visual-design
  evaluate            /impeccable critique  (MUST be dual-agent — it is a hard
                      invariant of the command AND D7: the builder is never the
                      auditor) + codex
  motion              improve-animations · review-animations · animation-vocabulary
  CV work             tech-resume-optimizer · resume-quantifier ·
                      executive-resume-writer · portfolio-case-study-writer
  copy                brand-voice · brand-messaging · grilling
  debugging           systematic-debugging   (its Phase 4.5 saved DEF-46)
  before done         verification-before-completion
Installing a skill is not using it. Check the mapping at the START of a task.

CODEX WORKS. The trick is a SHORT, BOUNDED prompt:
  codex exec --sandbox read-only "<read these files. find the TOP 5 ways X.
  one line each. ranked. no preamble.>"
Two earlier attempts hung for hours because the prompt was long with ten
enumerated categories at reasoning effort high. Bounded prompts return in
minutes. It found 5 real holes that same-context subagents missed entirely (D44).

WHAT IS LEFT, in priority order

1. DEF-42 (HIGH) — ON A PHONE THE NAV REACHES NOTHING.
   global.css:490 hides every link but the email chip below 900px. Home is
   ~12,000px = 14 phone screens; from screen 2 onward there is no navigation at
   all. Mitigated by hero and contact CV buttons, NOT fixed. Needs a real menu.
   Highest-value open item.

2. PHASE 2 — MOTION. Untouched. document.getAnimations() returns 0.
   Owner wants animation ON by default with a footer toggle persisted in
   localStorage. GATE: Lighthouse mobile no worse than 100 — MEASURED 09 Aug,
   Performance 100 / Accessibility 100. The plan used to say 98 and called it
   measured; it was inherited. Do not regress it.
   NOTE: plates.js no longer has an IntersectionObserver — the old one was dead
   code (it read data-hue, which exists on zero elements) and was deleted.
   Phase 2 brings its own, with a purpose. Use improve-animations.

3. PHASE 5 — THE SEVEN TESTS THAT CANNOT FAIL (DEF-11..17), untouched.
   DEF-44 found an EIGHTH last session and fixed it, so the class is not
   exhausted. START BY RE-CHECKING the other seven are still real: two of four
   HIGH defects investigated last session turned out refuted or stale.

4. ASSETS. og.png is 337,549 bytes — the LARGEST file in the build, twice
   paint-grain, and DEF-35 says it still shows the pre-redesign palette and a
   deleted mannequin. paint-grain.png is 166,280 bytes, ~53% of page weight,
   with ~125KB recoverable (DEF-23/24). Both are cheap wins.

5. PHASE 3 — THE APPROACH PAGE. The lifecycle SVGs EXIST at
   imrohitagrawal/assets/engineering-lifecycle-*.svg and render correctly
   (screenshotted). PRODUCT.md's claim that they are "responsive and
   theme-aware" is HALF WRONG — check before designing around it. Routing,
   canonicals and per-page test coverage are all ready for a new page.

6. PHASE 4 — 24 of the critique's 42 findings still open. Phase 4's own list of
   13 is wrong: two are already fixed, so Phase 4 proper has 9 live items and
   the rest live in other phases. DERIVE the list, do not inherit the count.

7. DEF-43 — the overview plate is 1149px in a 900px viewport. The rows are only
   699px; the overflow is block padding. Cheap fix, no content lost.

8. A COARSE-POINTER TAP-TARGET GATE. touch.css is a hand-maintained selector
   allowlist and BOTH surfaces built last session silently opted out. Third
   instance of that shape after DEF-10 and DEF-44. Written up, not built.

WHAT NOT TO REDO
  - DEF-6 is REFUTED. .js-ground gated zero CSS rules. RCA-002 is superseded and
    its one-line fix is a literal no-op.
  - DEF-19 is LATENT, not HIGH. No CSP exists anywhere.
  - "MTTD -35%" is NOT in the authoritative CV. It says root-cause-analysis time
    -35% and release VALIDATION time -25%. Do not restate metrics.
  - Do NOT add to src/styles/global.css. It is at 498 of a grandfathered 500.
    Extract to a new file. Do not trim comments to make room.
  - The brand marks were compared (docs/brand/comparison-2026-08-09.md).
    Nothing adopted; that is the owner's call, not a task.

TRAPS, ALL PAID FOR ALREADY
  - A FIXED element has no fixed backdrop, so no DOM-reading tool can score it.
  - DO NOT locate a backdrop by GEOMETRY. Four attempts, four false positives.
    tests/lib/rendered-contrast.mjs renders three times instead. Reuse it for
    ANY new contrast gate.
  - A gate that PRINTS a failure is not a gate that FAILS. Check the exit code.
    boundary-check.mjs exited 0 for weeks while printing "below AA".
  - Hand-maintained lists silently narrow gates: DEF-10 (routes), DEF-44 (plate
    ids), touch.css (selectors). Derive, never type.
  - count() proves existence, href proves intent, NEITHER proves behaviour.
    Activate the thing.
  - Verifying straight after a deploy measures a half-propagated CDN. Three
    spurious reds in one session. Settle, measure, measure again.
  - The PII gate does not scan .pdf or .docx (DEF-37). The phone number is in
    both resume PDFs, NOT in the .md the ledger used to name.
  - Cloudflare Pages has NO git integration. Nothing deploys on push.
  - No backticks inside a JS template literal. Cost two syntax breaks.

DEPLOY, and it is manual
  npm run build
  npx wrangler pages deploy dist --project-name stackclimb --branch main --commit-dirty=true
  Then WAIT ~25s and verify by asset hash and route table, never by a 200.

BLOCKED ON THE OWNER — one item
  SaafSaans is down. The Fly app has ZERO machines (suspended, deployed:false),
  so auto_start has nothing to wake. Not a cold start, not DNS, not billing,
  not the custom domain — each ruled out with a command. It crash-looped eight
  times in 15s on 21 July on the SAME image that had run fine for 70 minutes.
  Crash cause UNVERIFIED, log retention expired. Leads: memory 256mb where both
  working apps are 512mb, and all three secrets are staged-never-deployed.
  Reviving it is a production change to a DIFFERENT repo whose tree is 35
  commits ahead of origin. His call. The site discloses the outage honestly.
```

---

## What changed last session, in one table

| | |
|---|---|
| Nav was invisible on 46% of the page, live, with every gate green | Fixed, RCA-003, pixel gate |
| Site does not auto-deploy and never has — `AGENTS.md` said it did in 3 places | Corrected; prod had drifted 6 commits |
| Two gates could not fail (seam gate exited 0; CI never ran on a PR) | Both fixed, DEF-39/DEF-44 |
| Every URL returned the home page with 200 | Fixed, DEF-40 |
| `/cv` built from the authoritative CV, prints cleanly, no phone number | Shipped |
| The contact-sheet plate — D1, decided 07 Aug, never built | Shipped |
| D23's headline never shipped; contact plate never got the owner's sentence | Both shipped |
| H-1B stated as work authorisation, never as intent, always after "worldwide" | D42 |
| Codex found 5 real holes in gates I called strong | 5 of 5 closed, D44 |
| DEF-46 fixed by changing approach after 4 failed geometry patches | D45 |

**Two process failures worth carrying forward:** `positioning-phase0.md` twice
asserted its own execution and was wrong (the `grilling` provenance line, and
"everything else is applied"). And the skill-to-task mapping in the repo went
unused until the owner asked. Both are recorded in the ledger's Corrections.
