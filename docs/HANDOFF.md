# Handoff — autonomous overnight session, 9 August 2026

Paste the block below into a fresh Claude Code session in
`/Users/rohitagrawal/Projects/designing-website`. It is written to be self-contained: it points at
files rather than restating them, and carries the commands that prove state rather than claims
about it.

---

```
ultracode

You are continuing work on stackclimb.com, the owner's personal site. He is asleep. Work
autonomously through the night and do not wait for approval on anything below. Where something
genuinely cannot proceed without him, do every other part in full and leave that one item
clearly flagged — never invent content to unblock yourself.

READ FIRST, IN THIS ORDER
  AGENTS.md                      the rules. They override your defaults
  docs/ACTION-PLAN.md            the six phases. This is your work queue
  docs/STATUS.md                 the ledger: decisions D1-D33, open items, defects, corrections
  docs/positioning-decisions.md  headline, contact framing, photo, the skill search
  .impeccable/critique/*.md      the scored design review (21/32)

PROVE THE STATE BEFORE YOU TRUST ANY OF IT
  git log --oneline -5
  git rev-list --count origin/main..main          # must be 0
  npm run build && npx playwright test            # expect 18 pass, 0 fail
  node tests/boundary-check.mjs http://localhost:4321   # worst seam must be >= 4.5
  curl -sS -o /dev/null -w "%{http_code}\n" --max-time 20 https://saafsaans.stackclimb.com/

THE ACCEPTANCE TEST FOR EVERYTHING
Within 30-60 seconds a recruiter should feel "I should call this person." Not a heuristic score.
If a change does not serve that, it is Phase 4 or later.

ORDER OF WORK
  Phase 0   install the positioning skills, END THE SESSION so they load, then run them
            arnabbagxd/Brand-building-skills -> brand-positioning, brand-messaging,
              brand-story, brand-voice   (MIT). DO NOT take brand-guidelines: it collides
              with borghei's skill of the same name and one would overwrite the other.
            borghei/Claude-Skills -> marketing/brand-strategist ONLY. Its licence is
              Commons Clause + MIT, which restricts SELLING; internal use is fine, but do
              not describe it as MIT and do not redistribute it.
            wonjyou/portfolio-review-skill -> READ IT, DO NOT INSTALL. It is the closest
              match to the 30-second test (reviews a portfolio URL as a hiring manager at a
              stated seniority) but it has 5 stars and NO LICENCE, so it cannot be vendored
              into a repo being prepared to go public. Use its checklist, credit it.
            Paramchoudhary/ResumeSkills (1,477 stars, MIT) -> executive-resume-writer,
              tech-resume-optimizer, resume-quantifier, portfolio-case-study-writer,
              job-description-analyzer. This is the CV work (D31, approach B).
              SKIP career-changer-translator: its worked examples are Teacher->Corporate
              and Military->Corporate. His is a specialisation shift inside tech, and the
              skill would over-apply.
            Verified 09 Aug by set comparison, not assumed: zero collisions between any of
              these repos and the 38 already installed. The ONLY clash is brand-guidelines,
              which exists in both arnabbagxd and borghei -- take it from neither.
  Phase 4b  FIRST among build work — four HIGH defects, one of them live and wrong now
  Phase 1   the 30-second page: overview plate, nav rework, avatar, name at display size
  Phase 2   motion. Gate: Lighthouse mobile NO WORSE THAN 98. It measures 98 today
  Phase 3   the Approach page, the experience band, the lifecycle diagram
  Phase 4   the thirteen remaining critique findings
  Phase 5   the standing deployment debt

BLOCKED ON THE OWNER — DO NOT FABRICATE, DO NOT SKIP SILENTLY
  1. CV content. D31 chose a printable /cv page. He must supply title, years and one line of
     scope for Amazon, LimeRoad, Mobileum, Snapdeal, Subex. PRODUCT.md:101 says résumé content
     is "Undecided - do not invent". BUILD THE PAGE AND ITS PRINT STYLES with the Oracle row
     only, leave the rest as clearly marked empty rows, and list it in the morning report.
  2. The photograph. D27 puts an avatar beside his name in the hero lede. No file exists yet.
     Build the slot, ship it hidden behind a feature check, and say so.
  3. Anything under docs/brand/candidates/. Owner protocol: produce your own wordmark options
     BEFORE opening his folder. Never track those files.

HARD RULES, FROM AGENTS.md
  - One work package, one branch, one PR, merged before the next starts. Six packages went onto
    one branch on 08 Aug with zero PRs. Do not repeat it.
  - Builds are SERIAL. Reviews fan out. Subagents share one working tree and parallel writers
    corrupt each other. Tell every reviewer IN CAPITALS that it is read-only.
  - Review capped at TWO rounds, then ship with the residue written down. At least one reviewer
    from a different model family: codex exec --sandbox read-only "<prompt>" is installed and works.
  - Circuit breaker: stop if a new class of blocking finding appears in a second consecutive
    round, or if two fixes in a row each introduce a defect.
  - New files: 250 lines. Pre-existing oversized files are grandfathered at 500 and may NOT grow.
    src/styles/global.css has hit that ceiling twice already; extract, do not trim comments.
  - RCA before the fix, not after. Investigating is not working.
  - Update docs/STATUS.md in the SAME change that alters any decision, defect or open item.
  - Every claim on the site traces to a named file at a named commit, or it does not ship.
  - Screenshot desktop AND mobile and LOOK at the images before reporting anything as done.
    A successful build is not a correct page.

TRAPS THIS PROJECT HAS ALREADY FALLEN INTO
  - A contrast check that read color(srgb 0.949 0.922 0.867 / 0.88) as 0-255 invented two
    failures that did not exist. Parse both colour syntaxes and composite alpha.
  - Splitting a CSS file silently changed the cascade twice. The later file wins; move the media
    queries with the rules they modify.
  - The ledger has carried a row marked FIXED that had regressed. Re-verify FIXED rows against
    the live site before building on them. DEF-27 already failed that check.
  - quorum-ai/_handoff-s4-golden-draft/golden-cases.json looks like real system output and its
    own metadata says "HAND-AUTHORED... NOT captured production runs". Read metadata before
    quoting anything as real.
  - Every URL on the domain returns the home page with HTTP 200. Fix routing BEFORE adding any
    new URL, or a broken link will never 404.

DEPLOY
  npm run build && npx wrangler pages deploy dist --project-name stackclimb --branch main --commit-dirty=true
  Cloudflare auth is already in ~/Library/Preferences/.wrangler. Production is the `main` branch
  of Pages project `stackclimb`. Verify by fetching the live page and comparing the built CSS
  filename, and by rendering it with Playwright — not by a 200.

MORNING REPORT
  What shipped, what is live, what is blocked on him and why, what you could not verify, and
  the exact commands that prove each claim. Faithful, not flattering: if something failed, say
  so with the output.
```

---

## What is blocked on the owner, in one place

| # | Item | What is needed |
|---|---|---|
| 1 | CV content | Title, years, one line of scope for Amazon, LimeRoad, Mobileum, Snapdeal, Subex |
| 2 | The photograph | One image file. Not a visiting card — those carry a phone number and QR code and have already been swept into a commit once |
| 3 | Wordmark candidates | Only after Claude has produced its own options first |
| 4 | Repo public | His command. Branch protection is blocked until then, or on GitHub Pro |
