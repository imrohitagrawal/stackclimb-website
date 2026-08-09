# Handoff — for the next session

Written 2026-08-09, end of the second autonomous session. Paste the fenced block
into a fresh Claude Code session in `/Users/rohitagrawal/Projects/designing-website`.

**3 PRs merged and deployed (#15 mobile nav + budget gate, #16 Phase 5 repairs,
#17 assets).** Tests 42 → 64. The seven tests that cannot fail: closed as a class.
Page weight roughly halved. Production verified by hash, route table, and both
pixel gates run twice.

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
  docs/STATUS.md                 the ledger: D1-D47, DEF-1 to DEF-48, corrections
  docs/ACTION-PLAN.md            the phases. 0, 1, 5 and most of 4b/4c are DONE
  docs/positioning-decisions.md  SECTION 8 IS A SKILL-TO-TASK MAPPING. USE IT
  docs/positioning-phase0.md     the tested copy, and two corrections about method

PROVE THE STATE BEFORE TRUSTING ANY OF IT
  git log --oneline -3
  git rev-list --count origin/main..main            # must be 0
  npx playwright test                # 64 pass, 0 fail, 2 by-design skips.
                                     # The suite BUILDS FIRST and refuses a
                                     # stale server: if port 4321 is busy it
                                     # errors loudly. Kill the server; that is
                                     # the DEF-11 fix working, not a bug.
  node tests/file-budget.mjs --self-test   # D8 budget, population derived
  node tests/no-pii.mjs --self-test
  # standalone pixel gates want their own server on a spare port:
  npm run build && (npx astro preview --port 4322 &) && sleep 3
  node tests/boundary-check.mjs http://localhost:4322   # exit 1 below AA
  node tests/nav-contrast.mjs  http://localhost:4322    # ~60s; sweeps the OPEN
                                                        # menu panel too now
  kill %1

  # production is a SEPARATE question — NOTHING deploys on push
  npx wrangler pages deployment list --project-name stackclimb | head -5
  curl -sS https://stackclimb.com/ | grep -o '_astro/cv[^"]*css'  # compare dist/

THE ACCEPTANCE TEST, unchanged: within 30-60 seconds a recruiter should feel
"I should call this person." Not a heuristic score.

USE THE SKILLS. docs/positioning-decisions.md:164 maps skills to phases.
Check the mapping at the START of a task. This session used emil-design-eng
before building the menu and systematic-debugging's discipline throughout;
the failure mode last time was using zero until asked.

CODEX WORKS, and it out-found same-context review again. SHORT BOUNDED prompt:
  codex exec --sandbox read-only "<read these files. find the TOP 5 ways X.
  one line each. ranked. no preamble.>"
This session it found 3 real holes in new tests (D47). The same-context round
then found a CI-blocking regression Codex did not. Run BOTH, always, and run
EVERY gate the surface touches before calling a branch done — the regression
was in the one gate I had not re-run.

WHAT IS LEFT, in priority order

1. PHASE 2 — MOTION. Untouched. document.getAnimations() returns 0.
   Owner wants animation ON by default with a footer toggle persisted in
   localStorage. GATE: Lighthouse mobile no worse than 100 (measured 09 Aug,
   Performance 100 / Accessibility 100). Use improve-animations. plates.js
   has no IntersectionObserver any more; Phase 2 brings its own.
   The menu already carries the one new animation (160ms ease-out enter,
   instant exit) — match its restraint.

2. PHASE 3 — THE APPROACH PAGE. Lifecycle SVGs exist at
   imrohitagrawal/assets/engineering-lifecycle-*.svg and render correctly.
   PRODUCT.md's claim they are "responsive and theme-aware" is HALF WRONG —
   check before designing around it. Routing, canonicals, per-page coverage
   all ready. D28's nav rework (WORK · APPROACH · CONTACT) unblocks when the
   page exists — the NAV array in Layout.astro is the single place to edit.

3. PHASE 4 — the critique's remaining findings. DERIVE the live list from
   docs/plan/* against the ledger; two recorded items were already fixed last
   time anyone counted. Known live: O-HERO (the refusal card does not state
   its own conclusion — owner's challenge, two candidate fixes recorded),
   micro-type share, no active-plate marker.

4. DEF-8 — six of seven plates still print blank (fixed for /cv only).
   DEF-2 — ?at= deep links are JS-only. DEF-29 — location stated twice.
   All three are recorded, none started.

5. RESIDUALS FROM D47, written down not hidden: focus-ring CONTRAST (vs
   pixel-change) is asserted only on the nav; the tap gate's inline-display
   carve-out is dodgeable by styling a control display:inline.

WHAT NOT TO REDO
  - DEF-12 is REFUTED (MIN_PLATES already held; floor now 8). DEF-13..17 are
    FIXED with mutation-proved gates. Do not re-investigate; re-run the
    mutations if you doubt them — each ledger row names its mutation.
  - DEF-48 (palette #work) is fixed and gated. DEF-43 fits 900px exactly.
  - DEF-23/35 are done: grain is WebP 37,650B, og.png is a real-hero
    screenshot at 71,977B. DEF-24 narrowed to og.png + favicon.svg.
  - The brand marks comparison stands; adoption is the owner's call.
  - global.css is 433 of 500. The budget is a GATE now (file-budget.mjs in
    CI). New files: 250 lines / 32,000 bytes / 120 chars. Exceptions are
    shrink-only, in the gate file itself.

TRAPS, ALL PAID FOR ALREADY (new ones first)
  - A closed <details>' absolutely-positioned children KEEP THEIR LAYOUT BOX
    in Chromium. Playwright calls them visible; pixel gates score them as
    "no glyph". Display-gate closed panels: .menu:not([open]) > nav.
  - isVisible() reads boxes, not paint or pointer-events. opacity:0 and
    pointer-events:none both pass it. Paint questions go to
    tests/lib/rendered-contrast.mjs; hit questions to elementFromPoint
    (tests/lib/read-links.mjs).
  - A derived gate population SHRINKS WITH THE MUTILATION it should catch.
    Pin the must-exist members as partner literals (/cv, /#contact) and keep
    the rest derived. Same class: deriving an expected COUNT from the same
    artifact a mutation edits (palette-ladder's first version).
  - element.focus() does not trigger :focus-visible. A real Tab press does.
  - Contrast floors REWARD flattening — the seam gate got GREENER when five
    grounds went black. Distinctness assertions catch what floors cannot.
  - `git checkout <file>` to restore a mutation also reverts YOUR uncommitted
    work in that file. Back up to /tmp and cp back, never checkout.
  - The suite refuses a busy port 4321 by design (DEF-11). Standalone gates
    get their own server on 4322.
  - A FIXED element has no fixed backdrop; render, never geometry (DEF-46).
  - A gate that PRINTS a failure is not a gate that FAILS. Check exit codes;
    in zsh a pipeline's exit is the LAST command's — use pipestatus.
  - Verifying straight after a deploy measures a half-propagated CDN.
    Settle, measure, measure again. This session: poll for the new asset
    hash first, then run gates twice.
  - The PII gate does not scan .pdf or .docx (DEF-37 — still true). The
    phone number is in both resume PDFs in the untracked inbox.
  - Cloudflare Pages has NO git integration. Nothing deploys on push.
  - Known cosmetic: /paint-grain.png still returns 200 from CDN cache after
    deletion. Nothing references it; it ages out. Do not chase it.

DEPLOY, and it is manual
  npm run build
  npx wrangler pages deploy dist --project-name stackclimb --branch main --commit-dirty=true
  Poll until the new CSS hash serves, then verify by route table and by
  running both pixel gates against https://stackclimb.com — twice.

APPROACH C (deploy through CI) — the exit table in AGENTS.md now reads:
  tests repaired DONE · build-before-test DONE · contrast DONE · CI green DONE
  · branch protection OPEN (needs the repo public or Pro — owner's call, O2).
  When the owner flips visibility, wire branch protection and move the deploy
  into gates.yml. Remember the post-deploy gate needs a settle wait and an
  N-of-M rule stated up front, never a bare retry.

BLOCKED ON THE OWNER — one item
  - O2: repo visibility. Everything else for approach C is done.
  RESOLVED since this handoff was written: SaafSaans was redeployed by the
  owner 09 Aug (machine v9, checks passing, scale-to-zero restored) and the
  site's outage copy replaced; the brand mark was adopted the same day (D48,
  amended by critique). The ledger has both.
```

---

## What changed this session, in one table

| | |
|---|---|
| On a phone the nav reached nothing (DEF-42, HIGH, open since launch) | Fixed: native `<details>` menu, works without JS, RCA-004, held by a gate that ACTIVATES every destination |
| The seven tests that cannot fail (DEF-11..17) | Closed as a class: 1 refuted, 6 fixed, every fix mutation-proved. An audit re-verified each BEFORE fixing |
| CiteVyn plate silently on the wrong ground since DEF-34's rename (DEF-48) | Found by the audit, fixed, held by the palette-ladder gate |
| `global.css` at 505 over its 500 ceiling; handoff said 498 (DEF-47) | Nav extracted (433); the D8 budget is now a CI gate nothing can opt out of |
| touch.css allowlist silently narrowing (third instance of the shape) | tap-targets gate measures every element at a coarse pointer |
| Overview plate 1152px in a 900px viewport (DEF-43) | Exactly 900px; chrome cuts only |
| paint-grain 166KB, og.png 337KB showing a deleted design (DEF-23/35) | 38KB WebP (0-pixel render diff) and a 72KB real-hero screenshot |
| Focus visibility asserted from styles | Asserted from PIXELS, focused vs blurred, via real Tab presses |
| Two-round adversarial review of the new gates (D47) | 8 real holes closed incl. a CI blocker; residuals recorded, cap honoured |

**Process notes carried forward:** the review round that found the CI blocker
found it because it RAN the gates — the builder had run the seam gate and not
the nav gate. Run every gate the surface touches. And the mutation-restore
`git checkout` erased uncommitted work once; back up files, never checkout.
