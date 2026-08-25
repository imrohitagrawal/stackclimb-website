# Next session — six queue items remain, all LOW or decision-shaped

You are continuing work on stackclimb.com, the owner's personal site.
`/Users/rohitagrawal/Projects/designing-website`. Astro, static, Cloudflare Pages.

**DEPLOYMENT IS APPROACH C:** a merge to `main` deploys through CI and verifies production
itself (`gates.yml` deploy job). Never run manual wrangler unless the CI deploy job fails —
break-glass only.

**W-24 (owner, 2026-08-15):** merge each PR autonomously once it is verified and green. That
delegates the MERGE only. It does NOT cover deciding what the site claims about the owner or
his practice — see P-18.

Read first, do not restate back: `AGENTS.md` · `docs/STATUS.md` · `docs/OWNER-DIRECTIVES.md` ·
`PRODUCT.md` · `DESIGN.md`. The ledger is the record; this file only points at it.

## Why the previous session ended

`npx impeccable install` moved **36 skill files** (1,002 insertions, 656 deletions) across both
`impeccable` trees. Skills load at session start, so per `AGENTS.md`'s currency table that forces
a Restart — the D119 precedent. Nothing was left broken; the session closed green.

## Prove the starting state before anything else, and paste the output

```bash
git rev-parse --abbrev-ref HEAD && git rev-list --left-right --count origin/main...main
git status --porcelain | wc -l
node tests/file-budget.mjs && node tests/no-pii.mjs
node tests/geometry-selftest.mjs && node tests/baseline-guard-selftest.mjs
node tests/post-deploy.mjs --self-test
node tests/hook-binding-selftest.mjs
npm run build && npm run post-deploy
gh run list --branch main --limit 1
```

Expected at `b25f056`: level with origin, clean tree, all self-tests pass, production green.
Full Playwright locally was **492 expected / 0 unexpected / 2 skipped**.

**Do the skills-currency check in PLANNING, not later.** `npx skills update`, then diff
`skills-lock.json`. "Updated N skill(s)" is a per-fetch message, not evidence — only `computedHash`
values moving count. `impeccable` is NOT in the lock file and never will be via that CLI; see below.

## Two traps this repo keeps re-teaching. Do not relearn them the hard way.

1. **Line numbers in the ledger drift, and cited ones are often already wrong.** Last session
   found stale citations in DEF-64's own row (`DESIGN.md:178,223,230,344` — all four wrong, off by
   ~6 after D118) and in three comment cross-references (DEF-67). **Locate every site by CONTENT,
   never by line number**, and re-check any number before you write it into the ledger.
2. **`tail` swallows exit codes and hides failures.** `node tests/file-budget.mjs | tail -2` inside
   an `&&` chain let a builder commit an over-budget file last session. Playwright's list reporter
   prints passes last, so `| tail -3` once showed "42 passed" with 30 tests red. Use
   `--reporter=json` and read `stats`, or read the exit code directly.

## The queue, in order

| # | Item | Notes |
|---|---|---|
| 1 | **P-1** — `PRODUCT.md` still says "self-reported" (retired 2026-08-14, RCA-002) and still describes a SaafSaans state deleted in D74 | A PARTIAL directive older than everything else open. **Find the sites by content, not the cited line numbers.** The built site already honours the fix everywhere (0 occurrences, gated); only `PRODUCT.md` lags. Copy that touches how the owner is described is **P-18 owner-reserved** — raise before writing |
| 2 | **Print stylesheet** — `print.css` prints link URLs at ~8.76px on 23 home-page elements, gated by nothing | Deliberately out of D118's scope, which says "ON SCREEN". Needs its own floor and its own gate. Note `tests/type-floor.spec.js` explicitly excludes print, and `DESIGN.md:24,218` say "HTML text ... on screen" — so this is a new rule, not an existing one being enforced |
| 3 | **Two illegible artefact panels** — `src/data/projects.js` already has a working `homeCrop`; needs 2 new crop assets | Visual, and the mechanism already works on the other two panels. DoD requires SEEING it: Playwright screenshots at desktop AND mobile, never headless-chrome |
| 4 | **`npm i -D htmlparser2`** — the impeccable CLI detector runs degraded and under-reports | One command, then re-run the detector and record what the non-degraded scan finds. Note the skill tree was re-fetched at `b25f056`; re-read its current guidance rather than trusting an older description |
| 5 | **DEF-52** — Cloudflare email obfuscation degrades only for no-JS visitors | Decide explicitly: fix, or close as accepted with the reason. Filed HIGH on 08-12 and downgraded to LOW the same day |
| 6 | **I-4** — whether a memory consolidation pass is worth building | Genuinely undecided. Needs a decision recorded, not code |

Also open, all filed last session and all LOW: **DEF-65** (a regeneration refreshes only the tracked
platform's baselines, so the untracked platform's set goes stale silently — D124 removed the
*symptom* by making sizes fixed, not the cause), **DEF-67** (three stale line-number
cross-references), **DEF-68** (`plate-height.spec.js` does not cover `/cv` and could not measure it
if it did — it queries `section.plate[id]` and `/cv`'s plate is an `<article>`; also needs a ceiling
decision, `/cv` is ~6.9 viewports at 390 against a deepest ceiling of 2.0).

## Settled last session — do not reopen these

- **DEF-61 is REFUTED, not fixed.** The two `impeccable` trees are per-harness builds of one skill,
  not drift. Upstream ships **five** variants (`.agent/`, `.agents/`, `.claude/`, `.cursor/`,
  `.gemini/`). `.claude/skills/impeccable` is the only skill with `user-invocable: true` and
  `allowed-tools`, which is why it is a real directory and not a symlink. Symlinking it to
  `.agents/` breaks `/impeccable` four different ways — recorded with reasons. There is no
  canonical tree to pick.
- **DEF-66 is closed as expected upstream behaviour.** The six drifting lines were verified against
  `pbakaus/impeccable` itself: upstream's own `.agents/craft-floor.md` is 50 lines and its
  `.claude/` copy is 44. A hand-merge would have forked vendored work to "fix" what the author did
  on purpose.
- **`impeccable` provenance is now recorded** (`github.com/pbakaus/impeccable`, via the Claude Code
  plugin marketplace plus `npx impeccable install`, present since the initial commit `93e4bae`).
  It stays UNLOCKED — absent from `skills-lock.json`, so no `computedHash`. **Its `version:` field
  is NOT a currency signal:** the re-fetch moved 1,002 lines while `SKILL.md` stayed at 4.1.1.
  `architecture-and-decisions` and `doc-critic` come from the owner's own
  `imrohitagrawal/project-doc-skills` — evidence of practice, not third-party authority.

## Rules that bind every package

- **Verify before asserting.** Run the cheapest command that settles a question. If you cannot
  verify, say `UNVERIFIED`, name the exact check, and offer it.
- **Done means merged AND verified running in production.** Confirm the deploy JOB ran — not
  `skipped`, not `cancelled`. One caveat learned at `1e509df`: a push webhook can silently fail to
  create any run at all. Check `gh api "repos/:owner/:repo/actions/runs?head_sha=<sha>"` and compare
  the merged tree against the green PR head before concluding anything.
- **Never hand-generate baselines.** Use `gates.yml`'s `workflow_dispatch`
  (`update_visual_baselines`, `update_geometry_baseline`). The guard refuses a laptop write
  mechanically. A dispatch run SKIPS the test suite, so a green dispatch proves nothing — get a
  normal PR run afterwards. Choose committed files by comparing DECODED PIXELS, never bytes.
- **File budgets are shrink-only.** New modules 250 lines / 32,000 bytes / 120 chars.
- **The ledger is updated in the same change.** Corrections stay. Rejected options carry reasons.
- **One work package, one PR, merged before the next starts.** Merge `main` into the branch BEFORE
  starting work on it.

## Close the session properly

`docs/practices/session-close.md` is the protocol. Plain-English summary with NUMBERS · branch
merged and `main` level with origin, proved by command · branch deleted local AND remote ·
everything the session created cleaned up (report "none" rather than skipping the check) · handoff
written. End with `Done` / `Verified myself` / `Cleanup` / `Pending` / `Next action`, and say
explicitly whether work is pushed, merged, and running in production.
