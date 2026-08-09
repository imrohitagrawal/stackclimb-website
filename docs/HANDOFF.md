# Handoff — after the autonomous overnight session, 9 August 2026

Supersedes the previous handoff, which is now spent: everything in its "blocked on the owner"
table except repo visibility has been delivered or answered.

Paste the block below into a fresh Claude Code session in
`/Users/rohitagrawal/Projects/designing-website`.

---

## What happened overnight, in numbers

**Six work packages, six pull requests, all merged, all deployed and verified live.**

| | Before | After |
|---|---|---|
| Tests | 18 | **38** |
| Pages | 1 | **3** (`/`, `/cv`, `404`) |
| Gates that can actually fail | 2 of 3 | **4 of 4** |
| Defects closed | — | **11** |
| Defects newly found and filed | — | **8** |
| Corrections to the ledger | — | **5** |

Full detail is in `docs/STATUS.md`. The three things worth knowing before anything else:

1. **The navigation was invisible on 46% of the page, live, and every gate was green.**
   Fixed and held by a new pixel-sampling gate. `docs/rca/RCA-003-nav-has-no-ground.md`.
2. **The site does not auto-deploy and never has.** `AGENTS.md` said it did, in three places.
   Production had drifted six commits behind `main`.
3. **Two gates could not fail.** The plate-seam gate exited 0 no matter what it measured
   (DEF-44), and the CI secrets job had never once run on a pull request (DEF-39).

---

## PROVE THE STATE BEFORE YOU TRUST ANY OF IT

```bash
git log --oneline -3
git rev-list --count origin/main..main                  # must be 0
npm run build && npx playwright test                    # expect 38 pass, 0 fail
npx astro preview --port 4321 &
node tests/boundary-check.mjs http://localhost:4321     # worst >= 4.5, exits 1 if not
node tests/nav-contrast.mjs  http://localhost:4321      # 0 failing positions
node tests/no-pii.mjs --self-test                       # 2/2 caught, 0 false positives

# production is a SEPARATE question — nothing deploys on push
npx wrangler pages deployment list --project-name stackclimb | head -5
curl -sS -o /dev/null -w "%{http_code}\n" https://stackclimb.com/nope   # must be 404
```

**Wait a minute after any deploy before verifying.** Measured twice last night: immediately
after a deploy the CDN served a half-propagated site — `/cv` returned 404 for one request and
the seam gate reported a failure that did not reproduce in three subsequent runs.

---

## The one thing genuinely blocked on the owner

**SaafSaans is down, and reviving it is his call.** The cause is now known and is not what the
ledger assumed.

The Fly app has **zero machines** — `status: suspended, deployed: false, machine_count: 0`, so
`auto_start_machines` has nothing to wake. Not a cold start, not DNS, not billing, not the custom
domain; each ruled out with a command. It crash-looped eight times in fifteen seconds on 21 July
and the machine was destroyed. **Not a bad build** — the failed release and the working one
before it carry the *same* image ref.

**Crash cause UNVERIFIED**: Fly log retention has expired. Two leads, neither confirmed — memory
is `256mb` where both working apps are `512mb`, and all three secrets are staged, never deployed.

Why it was left: a redeploy is a production change to a **different repository** whose working
tree is 35 commits ahead of its origin, and reviving it blind risks a second crash-loop. The site
already discloses the outage honestly, so nothing is dishonest while it waits.

**Also his to decide, not blocking:** `FINAL-Rohit_Master_Resume` states an approved US **H-1B**;
`Rohit_V3` does not mention it. For someone stating "open to relocation worldwide" that removes
the objection that usually ends a US conversation. **It is not on the site and I did not put it
there** — visa status is personal information.

---

## Paste this into the next session

```
ultracode

You are continuing work on stackclimb.com. Read these first, in this order:
  docs/HANDOFF.md          this file — what changed overnight and what is still open
  AGENTS.md                the rules. They override your defaults
  docs/STATUS.md           the ledger: decisions D1-D41, defects DEF-1 to DEF-44, corrections
  docs/ACTION-PLAN.md      the phases. NOTE: Phase 0, 1 and most of 4b/4c are now done
  docs/positioning-phase0.md  the tested copy. The headline survived; the lede did not

PROVE THE STATE with the commands in the section above before trusting any of it.

THE ACCEPTANCE TEST, unchanged: within 30-60 seconds a recruiter should feel
"I should call this person." Not a heuristic score.

WHAT IS LEFT, in priority order:

1. DEF-42 — ON A PHONE THE NAV REACHES NOTHING. global.css:479 hides every link
   but the email chip below 900px. A mobile recruiter cannot reach /cv from the
   nav. Mitigated by the hero's CV button, not fixed. Needs a real menu.
   This is the highest-value open item: mobile is 10,000+px of scroll with no
   navigation at all.

2. Phase 2 — MOTION. Nothing was done here. document.getAnimations() returns 0.
   Owner wants animation ON by default with a footer toggle persisted in
   localStorage. GATE: Lighthouse mobile NO WORSE THAN 98 — and note that
   number is now UNVERIFIED, because DEF-22's investigation could not
   re-measure it. Measure it BEFORE you start or you have no baseline.
   NOTE: plates.js no longer has an IntersectionObserver — the old one was dead
   code and was deleted. Phase 2 brings its own, with a purpose.

3. Phase 5 — THE SEVEN TESTS THAT CANNOT FAIL (DEF-11 to DEF-17), untouched.
   DEF-44 found an EIGHTH last night and fixed it, which is evidence the class
   is not exhausted. Start by re-checking that the other seven are still real —
   two of the four HIGH defects investigated last night turned out to be
   refuted or stale.

4. Phase 3 — THE APPROACH PAGE. The lifecycle SVGs EXIST at
   imrohitagrawal/assets/engineering-lifecycle-*.svg and render correctly —
   verified by screenshot. But PRODUCT.md's claim that they are "responsive and
   theme-aware" is HALF WRONG; check what the investigation found before
   designing around it. Routing, canonicals and per-page test coverage are all
   ready for a new page now.

5. Phase 4 — 24 of the critique's 42 findings are still open. Phase 4's own
   list of 13 is wrong: two of its items are already fixed, so Phase 4 proper
   has 9 live items and the rest live in other phases. Derive the list, do not
   inherit the count.

WHAT NOT TO REDO:
  - Do NOT re-fix DEF-6. It is REFUTED. .js-ground gated zero CSS rules.
  - Do NOT implement RCA-002's fix. It is a literal no-op. RCA-002 is superseded.
  - Do NOT treat DEF-19 as HIGH. No CSP exists anywhere; it is LATENT.
  - Do NOT trust "MTTD -35%" — the authoritative CV never says MTTD.
  - Do NOT add to src/styles/global.css. It is at 494 of a grandfathered 500.
    Extract to a new file. Do not trim comments to make room.

TRAPS, INCLUDING THREE NEW ONES:
  - A FIXED element has no fixed backdrop, so no DOM-reading tool can score it.
    axe, and this repo's own gates, all read computed styles. Measure in pixels.
  - A gate that prints a failure is not a gate that FAILS. Check the exit code.
  - Verifying straight after a deploy measures a half-propagated CDN.
  - The PII gate does not scan .pdf or .docx (DEF-37). If a CV PDF ever goes in
    public/, the gate reads zero bytes of it and reports green.
  - Cloudflare Pages has NO git integration. Nothing deploys on push. Compare
    the live asset hash against dist/ before claiming anything is live.

THE CROSS-MODEL REVIEW DID NOT HAPPEN. AGENTS.md requires a reviewer from a
different model family on any test change, and five test files changed last
night. `codex exec --sandbox read-only` was launched against tests/nav-contrast.mjs,
produced no output in two and a half hours, and was killed (exit 144). Every new
gate was instead proved by watched mutation, which is stronger evidence than a
review but is NOT the independent lens the rule asks for. Run it first.
```

---

## Session-close checklist, per `AGENTS.md`

| | |
|---|---|
| Merged and synced | `main` level with `origin/main`, verified by `git rev-list --count` = 0 |
| Branches deleted | All six, both sides. `git branch -r` shows only `origin/main` |
| Open PRs | None |
| Processes cleaned | No stray `astro preview`, `wrangler pages dev` or `codex` processes |
| Temp files | None in the repo. Working files went to the session scratchpad |
| Dependencies added | One: `@astrojs/sitemap` (dev), used by `astro.config.mjs` |
| Deployed | Yes, and verified by asset hash and route table, not by a 200 |
