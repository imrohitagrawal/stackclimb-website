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
  Phase 4c  fourteen ledger defects that were in no phase until 09 Aug. TWO ARE URGENT
            AND MUST LAND BEFORE PHASE 3, because new pages inherit both faults:
              DEF-9  canonical and og:url are hard-coded to the home page, so /approach
                     and /cv would each tell Google they are the home page
              DEF-10 ROUTES = ['/'] in dod.spec.js:11 is hand-typed, so a new page gets
                     zero test coverage and nothing says so
  Phase 5   the standing deployment debt

COPY THAT IS LIVE AND WRONG — DEF-36, do this in Phase 0
  Layout.astro:77 reads "Built as a work sample - static Astro, self-hosted type, no trackers,
  no invented claims". Every clause is the site describing itself instead of him. "Built as a
  work sample" is the worst of it: it reframes the whole page as a demo rather than a record.
  Use brand-voice. A colophon may be a colophon -- copyright and location are enough.

SCOPED REVIEWS TO RUN, NOT OPINIONS TO INVENT
  - Colour: run /impeccable colorize against https://stackclimb.com. The value ladder is
    measured and green (bone 13.8-15.6:1, ochre 6.4-7.25:1), so do NOT change hues on taste.
    One concrete lead to test: NarraTwin's ground #17161a is 8% saturation and reads as dark
    grey while every other plate has a clear hue. Confirm or refute by measurement.
  - Positioning: run brand-positioning + brand-strategist + grilling BEFORE writing any hero
    copy. Every copy recommendation on record from 08-09 Aug is unaided judgement (D33) and
    is there to be tested, not implemented on trust.
  - Motion: owner wants animation ON by default with a user toggle to stop it. The mechanism
    already exists -- plates.js sets html.no-anim which forces transition/animation to none.
    Persist it in localStorage. Control goes in the FOOTER, not the nav. prefers-reduced-motion
    is layer one and already works; the toggle is for people who never set the OS preference.

EVERYTHING THE OWNER OWED IS NOW SUPPLIED — assets/inbox/, delivered 09 Aug 01:20-01:29
Read assets/inbox/README.md first. THE WHOLE INBOX IS UNTRACKED, on purpose.

  1. CV -- five files. PRECEDENCE, owner's exact instruction:
       "First preference should be given to the data present in Rohit_V3. If there is any
        conflicting information in FINAL-Rohit_Master_Resume when compared to Rohit_V3, then
        Rohit_V3 should have been considered correct."
     Rohit_V3.pdf / .docx is AUTHORITATIVE and wins every conflict.
     FINAL-Rohit_Master_Resume.md is the easy one to parse. Convenience is not authority --
     use it only to fill gaps Rohit_V3 does not cover, and where the two disagree, record
     both values in docs/STATUS.md so this is not rediscovered.

     *** FINAL-Rohit_Master_Resume.md CONTAINS A PHONE NUMBER. D38 GOVERNS IT. ***
     It does not go on the /cv page, in the HTML, in a commit, or in a build artefact.
     Verified 09 Aug: the number is NOT public anywhere today, so shipping it would be a
     new and irreversible exposure, not a re-exposure. Contact stays email + LinkedIn.

     DO NOT build any of these three -- all are theatre, and D38 bans them by name:
       reveal-on-click JavaScript  scrapers execute JS
       the number as an image      OCR reads it, screen readers cannot
       @media print only           the number stays in the HTML source, so every
                                   scraper gets it and every human does not

     Before every commit:
       grep -oiE "\+?[0-9]{10,}" dist/**/*.html
     This is the third time source material has carried personal contact details into this
     repo. Visiting cards on 08-07, a CV now. Assume the next upload does too.

  2. Photo -- assets/inbox/photo/github_profile_photo.jpeg. Verified by eye: professional
     headshot, plain grey background, no card, no QR. PORTRAIT orientation, so the hero
     avatar needs a SQUARE CENTRE CROP around the face. Optimise it: paint-grain.png at
     166KB is already 63% of page weight.

  3. Brand -- wordmark-light/dark.png, logo-light/dark.png. The protocol is satisfied:
     Claude's own recommendation was written in docs/brand/README.md on 09 Aug BEFORE these
     were opened, so a comparison now is a second opinion, not a reaction. COMPARE, do not
     install: put his marks beside the existing wordmark and the RA plate monogram at 16px
     favicon, at nav height, and on an OG card, and judge what survives each. They are PNG;
     whatever wins needs an SVG before it ships.

NOTHING IS BLOCKED ON HIM ANY MORE. If you find yourself wanting to invent content, you have
misread the inbox -- go back and read it.

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
